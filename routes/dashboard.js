
import express from 'express';
import { pool } from '../app.js';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import moment from 'moment';


const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function authenticateToken(req, res, next) {

    let token;
    
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return res.status(401).send('Отсутствует токен');
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log('Декодированный токен:', decoded);
        req.decoded = decoded;
        next();
    } catch (error) {
        return res.status(403).send('Недействительный токен');
    }
}


router.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});


router.get('/sessions/scheduled', authenticateToken, async (req, res) => {
    try {
        const username = req.decoded.username;
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userQuery.rows.length === 0) {
            return res.status(401).send('Пользователь не найден');
        }
        const userId = userQuery.rows[0].id;

        const sessions = await pool.query(
            `SELECT s.* FROM sessions s 
            JOIN user_to_session us ON s.id = us.session_id 
            WHERE us.user_id = $1 AND us.session_status = 'scheduled';`,
            [userId]
        );

        const formattedSessions = sessions.rows.map(session => ({
            ...session,
            date: moment(session.date).format('YYYY-MM-DD')
        }));

        res.json(formattedSessions);
    } catch (err) {
        console.error(err);
        res.status(400).send('Ошибка при получении запланированных сессий.');
    }
});


router.get('/sessions/canceled', authenticateToken, async (req, res) => {
    try {
        const username = req.decoded.username;
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userQuery.rows.length === 0) {
            return res.status(401).send('Пользователь не найден');
        }
        const userId = userQuery.rows[0].id;

        const sessions = await pool.query(
            `SELECT s.* FROM sessions s 
            JOIN user_to_session us ON s.id = us.session_id 
            WHERE us.user_id = $1 AND us.session_status = 'canceled';`,
            [userId]
        );

        const formattedSessions = sessions.rows.map(session => ({
            ...session,
            date: moment(session.date).format('YYYY-MM-DD')
        }));

        res.json(formattedSessions);
    } catch (err) {
        console.error(err);
        res.status(400).send('Ошибка при получении отмененных сессий.');
    }
});


router.post('/sessions/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const username = req.decoded.username;
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userQuery.rows.length === 0) {
            return res.status(401).send('Пользователь не найден');
        }

        const userId = userQuery.rows[0].id;

        const existingRecord = await pool.query(
            'SELECT * FROM user_to_session WHERE user_id = $1 AND session_id = $2;',
            [userId, id]
        );

        if (existingRecord.rows.length > 0) {
            await pool.query(
                'UPDATE user_to_session SET session_status = \'canceled\' WHERE user_id = $1 AND session_id = $2;',
                [userId, id]
            );
        } else {
            await pool.query(
                'INSERT INTO user_to_session (user_id, session_id, session_status) VALUES ($1, $2, \'canceled\');',
                [userId, id]
            );
        }

        res.status(200).send('Сессия успешно отменена.');
    } catch (err) {
        console.error(err);
        res.status(400).send('Ошибка при отмене сессии.');
    }
});


router.post('/sessions/:id/undo-cancel', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const username = req.decoded.username;
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userQuery.rows.length === 0) {
            return res.status(401).send('Пользователь не найден');
        }

        const userId = userQuery.rows[0].id;
        await pool.query(
            'UPDATE user_to_session SET session_status = \'scheduled\' WHERE session_id = $1 AND user_id = $2',
            [id, userId]
        );


        res.status(200).send('Сессия успешно возвращена.');
    } catch (err) {
        console.error(err);
        res.status(400).send('Ошибка при возврате сессии.');
    }
});


export default router;
