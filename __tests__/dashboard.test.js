import request from 'supertest';
import express from 'express';
import { pool } from '../app.js';
import app from '../app.js';
import router from '../routes/dashboard.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config({ path: '../.env' });
const TOKEN_SECRET = process.env.TOKEN_SECRET;


let sessionId;
let userId;


const generateToken = (user) => {
    return jwt.sign(user, TOKEN_SECRET);
};


describe('Dashboard Router', () => {
    let token;

    beforeAll(async () => {
        const insertUser = await pool.query(
            "INSERT INTO users (username, password, role) VALUES ('testuser', 'password', 'user') RETURNING id;"
        );
        userId = insertUser.rows[0].id;

        const sessionQuery = await pool.query(
            "INSERT INTO sessions (date, time, notes) VALUES ('2025-02-06', '15:00:00', 'Test Notes') RETURNING id;"
        );
        sessionId = sessionQuery.rows[0].id;

        await pool.query(
            "INSERT INTO user_to_session (user_id, session_id, session_status) VALUES ($1, $2, 'scheduled');",
            [userId, sessionId]
        );

        const user = { id: userId, username: 'testuser', role: 'user' };
        token = generateToken(user);
    });

    afterAll(async () => {
        await pool.query('DELETE FROM user_to_session WHERE session_id=$1;', [sessionId]);
        await pool.query('DELETE FROM sessions WHERE id=$1;', [sessionId]);
        await pool.query("DELETE FROM users WHERE username='testuser';");
    });

    describe('GET /dashboard', () => {
        it('should return dashboard.html for any authenticated user', async () => {
            const res = await request(app)
                .get('/dashboard')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toMatch(/html/);
        });

        it('should return 401 if token is missing', async () => {
            const res = await request(app).get('/dashboard');
            expect(res.statusCode).toBe(401);
            expect(res.text).toBe('Отсутствует токен');
        });

        it('should return 403 if token is invalid', async () => {
            const invalidToken = 'invalid-token';
            const res = await request(app)
                .get('/dashboard')
                .set('Authorization', `Bearer ${invalidToken}`);
            expect(res.statusCode).toBe(403);
            expect(res.text).toBe('Недействительный токен');
        });
    });

    describe('GET /sessions/scheduled', () => {
        it('should return scheduled sessions for authenticated user', async () => {
            const res = await request(app)
                .get('/sessions/scheduled')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach((session) => {
                expect(session.date).toBeDefined();
                expect(session.time).toBeDefined();
                expect(session.notes).toBeDefined();
            });
        });

        it('should return 401 if token is missing', async () => {
            const res = await request(app).get('/sessions/scheduled');
            expect(res.statusCode).toBe(401);
            expect(res.text).toBe('Отсутствует токен');
        });
    });

    describe('POST /sessions/:id/cancel', () => {
        it('should mark a session as canceled and return success message', async () => {
            const res = await request(app)
                .post(`/sessions/${sessionId}/cancel`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.text).toBe('Сессия успешно отменена.');

            const sessionStatusQuery = await pool.query(
                'SELECT session_status FROM user_to_session WHERE user_id=$1 AND session_id=$2;',
                [userId, sessionId]
            );
            expect(sessionStatusQuery.rows[0].session_status).toBe('canceled');
        });

        it('should return 401 if token is missing', async () => {
            const res = await request(app).post(`/sessions/${sessionId}/cancel`);
            expect(res.statusCode).toBe(401);
            expect(res.text).toBe('Отсутствует токен');
        });
    });

    describe('POST /sessions/:id/undo-cancel', () => {
        it('should revert a canceled session to scheduled and return success message', async () => {
            await pool.query(
                'UPDATE user_to_session SET session_status = \'canceled\' WHERE user_id=$1 AND session_id=$2;',
                [userId, sessionId]
            );

            const res = await request(app)
                .post(`/sessions/${sessionId}/undo-cancel`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.text).toBe('Сессия успешно возвращена.');

            const sessionStatusQuery = await pool.query(
                'SELECT session_status FROM user_to_session WHERE user_id=$1 AND session_id=$2;',
                [userId, sessionId]
            );
            expect(sessionStatusQuery.rows[0].session_status).toBe('scheduled');
        });

        it('should return 401 if token is missing', async () => {
            const res = await request(app).post(`/sessions/${sessionId}/undo-cancel`);
            expect(res.statusCode).toBe(401);
            expect(res.text).toBe('Отсутствует токен');
        });
    });
});
