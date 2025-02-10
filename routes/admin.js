import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { pool } from '../app.js';
import jwt from 'jsonwebtoken';


const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function authenticateAdminToken(req, res, next) {
    // console.log('Заголовки:', req.headers);

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
        req.decoded = decoded;
        if (decoded.role === 'admin') {
            next();
        } else {
            return res.status(403).send('Только администратор может просматривать эту страницу.');
        }
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        res.status(403).redirect('/login');
    }
}


router.get('/admin', authenticateAdminToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin.html'));
});

router.get('/users', authenticateAdminToken, async (req, res) => {
    try {
        const users = await pool.query('SELECT id, username, role FROM users');
        res.json(users.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении списка пользователей.');
    }
});


router.get('/sessions', authenticateAdminToken, async (req, res) => {
    try {
        const sessions = await pool.query(`
            SELECT 
                s.id, 
                s.date, 
                s.time, 
                s.notes,
                uts.user_id,
                u.username,
                uts.session_status
            FROM sessions s
            LEFT JOIN user_to_session uts ON s.id = uts.session_id
            LEFT JOIN users u ON uts.user_id = u.id;
        `);
        res.json(sessions.rows);
    } catch (err) {
        console.error(err);
        res.status(400).send('Ошибка при получении сессий.');
    }
});

function validateSessionData(data) {
    const requiredFields = ['date', 'time', 'notes'];
    return requiredFields.every(field => data[field] && data[field].trim() !== '');
}

router.post('/sessions', authenticateAdminToken, async (req, res) => {
    console.log('Данные запроса:', req.body);
    const { date, time, notes, userId, session_status } = req.body;

    if (!validateSessionData(req.body)) {
        return res.status(400).send('Недостаточно данных для создания сессии.');
    }

    try {
        const maxIdResult = await pool.query('SELECT MAX(id) FROM sessions');
        const maxId = maxIdResult.rows[0].max || 0;
        const newId = maxId + 1;

        const newSession = await pool.query(
            'INSERT INTO sessions (id, date, time, notes) VALUES ($1, $2, $3, $4) RETURNING *',
            [newId, date, time, notes]
        );

        if (userId) {
            await pool.query(
                'INSERT INTO user_to_session (user_id, session_id, session_status) VALUES ($1, $2, $3)',
                [userId, newId, session_status]
            );
        }

        res.status(201).json({ ...newSession.rows[0], user_id: userId, session_status: session_status });
    } catch (err) {
        console.error('Ошибка при добавлении сессии:', err);
        res.status(400).send('Ошибка при добавлении сессии.');
    }
});


router.put('/sessions/:id', authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { date, time, notes, userId, session_status } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).send('Некорректный ID сессии.');
    }

    if (!validateSessionData(req.body)) {
        return res.status(400).send('Недостаточно данных для обновления сессии.');
    }

    try {
        const updatedSession = await pool.query(
            'UPDATE sessions SET date = $1, time = $2, notes = $3 WHERE id = $4 RETURNING *',
            [date, time, notes, id]
        );

        let userToSessionResult = {};

        if (userId) {
            const existingLink = await pool.query(
                'SELECT * FROM user_to_session WHERE session_id = $1 AND user_id = $2',
                [id, userId]
            );

            if (existingLink.rows.length > 0) {
                userToSessionResult = await pool.query(
                    'UPDATE user_to_session SET session_status = $1 WHERE session_id = $2 AND user_id = $3 RETURNING *',
                    [session_status, id, userId]
                );
            } else {
                userToSessionResult = await pool.query(
                    'INSERT INTO user_to_session (user_id, session_id, session_status) VALUES ($1, $2, $3) RETURNING *',
                    [userId, id, session_status]
                );
            }
        }

        res.status(200).json({...updatedSession.rows[0], user_id: userId, session_status: userToSessionResult?.rows?.[0]?.session_status || session_status});
    } catch (err) {
        console.error(err);
        res.status(400).send('Ошибка при обновлении сессии.');
    }
});


router.delete('/sessions/:id', authenticateAdminToken, async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).send('Некорректный ID сессии.');
    }

    try {
        await pool.query('DELETE FROM user_to_session WHERE session_id = $1', [id]);
        await pool.query('DELETE FROM sessions WHERE id = $1', [id]);
        res.status(200).send('Сессия успешно удалена');
    } catch (err) {
        console.error(err);
        res.status(400).send('Ошибка при удалении сессии.');
    }
});


export default router;
