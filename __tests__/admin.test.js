import request from 'supertest';
import express from 'express';
import { pool } from '../app.js';
import router from '../routes/admin.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import app from '../app.js';
import moment from 'moment';


dotenv.config({ path: '../.env' });
app.use(express.json());
app.use('/', router);
const TOKEN_SECRET = process.env.TOKEN_SECRET;


let sessionId;
const generateToken = (user) => {
    return jwt.sign(user, TOKEN_SECRET);
};


describe('Admin Router', () => {
    let token;

    beforeAll(async () => {
        await pool.query('BEGIN');
        await pool.query("INSERT INTO users (username, password, role) VALUES ('adminuser', 'password', 'admin') RETURNING id;");
        const user = { username: 'adminuser', role: 'admin' };
        token = generateToken(user);
        const sessionQuery = await pool.query(
            "INSERT INTO sessions (date, time, notes) VALUES ('2025-02-08', '12:00:00', 'Test Notes') RETURNING id;"
        );
        sessionId = sessionQuery.rows[0].id;
    });

    afterAll(async () => {
        await pool.query('ROLLBACK');
        await pool.end();
    });

    describe('GET /admin', () => {
        it('should return admin.html for authenticated admin', async () => {
            const res = await request(app)
                .get('/admin')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toMatch(/html/);
        });

        it('should return 403 if user is not admin', async () => {
            const nonAdminToken = generateToken({ username: 'user', role: 'user' });
            const res = await request(app)
                .get('/admin')
                .set('Authorization', `Bearer ${nonAdminToken}`);
            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('Только администратор может просматривать эту страницу.');
        });

        it('should return 401 if token is missing', async () => {
            const res = await request(app).get('/admin');
            expect(res.statusCode).toBe(401);
            expect(res.text).toBe('Отсутствует токен');
        });
    });

    describe('GET /users', () => {
        it('should return a list of users for authenticated admin', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return 403 if user is not admin', async () => {
            const nonAdminToken = generateToken({ username: 'user', role: 'user' });
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${nonAdminToken}`);
            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('Только администратор может просматривать эту страницу.');
        });
    });

    describe('POST /sessions', () => {
        it('should add a new session and return the session data', async () => {
            const newSessionData = {
                date: '2025-02-09',
                time: '15:00:00',
                notes: 'New Test Notes',
                userId: 1,
                session_status: 'scheduled'
            };
            const res = await request(app)
                .post('/sessions')
                .send(newSessionData)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(moment(res.body.date).format('YYYY-MM-DD')).toBe(newSessionData.date);
            expect(res.body).toHaveProperty('time', newSessionData.time);
            expect(res.body).toHaveProperty('notes', newSessionData.notes);
            expect(res.body).toHaveProperty('user_id', newSessionData.userId);
            expect(res.body).toHaveProperty('session_status', newSessionData.session_status);
        });
    });

    describe('PUT /sessions/:id', () => {
        it('should update a session and return the updated session data', async () => {
            const updatedSessionData = { date: '2025-02-08', time: '14:00:00', notes: 'Updated Test Notes', userId: 1, session_status: 'canceled' };
            const res = await request(app)
                .put(`/sessions/${sessionId}`)
                .send(updatedSessionData)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('id', sessionId);
            expect(moment(res.body.date).format('YYYY-MM-DD')).toBe(updatedSessionData.date);
            expect(res.body).toHaveProperty('time', updatedSessionData.time);
            expect(res.body).toHaveProperty('notes', updatedSessionData.notes);
            expect(res.body).toHaveProperty('user_id', updatedSessionData.userId);
            expect(res.body).toHaveProperty('session_status', updatedSessionData.session_status);
        });

        it('should return 400 if there is an error updating a session', async () => {
            const res = await request(app)
                .put(`/sessions/${sessionId}`)
                .send({ date: '', time: '', notes: '' })
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(400);
            expect(res.text).toBe('Недостаточно данных для обновления сессии.');
        });
    });

    describe('DELETE /sessions/:id', () => {
        it('should delete a session and return success message', async () => {
            const res = await request(app)
                .delete(`/sessions/${sessionId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.text).toBe('Сессия успешно удалена');
            const sessionQuery = await pool.query("SELECT * FROM sessions WHERE id=$1", [sessionId]);
            expect(sessionQuery.rows.length).toBe(0);
        });

        it('should return 403 if user is not admin', async () => {
            const nonAdminToken = generateToken({ username: 'user', role: 'user' });
            const res = await request(app)
                .delete(`/sessions/${sessionId}`)
                .set('Authorization', `Bearer ${nonAdminToken}`);
            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('Только администратор может просматривать эту страницу.');
        });

        it('should return 401 if token is missing', async () => {
            const res = await request(app).delete(`/sessions/${sessionId}`);
            expect(res.statusCode).toBe(401);
            expect(res.text).toBe('Отсутствует токен');
        });
    });
});
