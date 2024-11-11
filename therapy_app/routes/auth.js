import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

// auth для юзера и админа
// auth для пациента и терапевта

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    user: 'linapush',
    host: 'localhost',
    database: 'therapy',
    password: 'somehardpassword',
    port: 5434,
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.send('Пользователь уже существует.');
        }
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.send('Ошибка при регистрации.');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        if (user.rows.length > 0) {
            req.session.user = username;
            res.redirect('/dashboard');
        } else {
            res.send('Неверное имя пользователя или пароль.');
        }
    } catch (err) {
        console.error(err);
        res.send('Ошибка при авторизации.');
    }
});

router.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, '../views/dashboard.html'));
    } else {
        res.redirect('/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

export default router;
