import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import router from '../utils/router.js';
import pool from '../db_connection.js';
import auth_by_role from '../utils/auth_by_role.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();


const generateToken = (user) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET не задан");
        }

        return jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    } catch (error) {
        console.error("Ошибка генерации токена:", error);
        return null;
    }
};


router.get('/token', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден." });
        }
        const token = generateToken(result.rows[0]);

        if (token) {
            console.log("Сгенерированный токен:", token);
            res.json({ token });
        } else {
            res.status(500).json({ error: "Ошибка генерации токена" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при получении токена.' });
    }
});

router.get('/admin/', (req, res) => {
    res.redirect('/admin/login')
});


router.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin_pages/admin_login.html'));
});


router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user_pages/register.html'));
});


router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user_pages/login.html'));
});


// router.post('/register', async (req, res) => {
//     console.log('Регистрация пользователя');
//     const { username, password } = req.body;
//     try {
//         const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//         if (userCheck.rows.length > 0) {
//             return res.send('Пользователь уже существует.').redirect('/login');
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
//         res.json({ message: 'Пользователь успешно зарегистрирован.' });
//         res.redirect('/login');
//     } catch (err) {
//         console.error(err);
//         res.send('Ошибка при регистрации.');
//     }
// });


router.post('/register', async (req, res) => {
    console.log('Регистрация пользователя');
    const { username, password } = req.body;
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            req.session.errorMessage = 'Пользователь уже существует.';
            return res.redirect('/register');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        req.session.successMessage = 'Пользователь успешно зарегистрирован.';
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.session.errorMessage = 'Ошибка при регистрации.';
        res.redirect('/register');
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Авторизация пользователя');

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        console.log(result);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(isMatch);

            if (isMatch) {
                req.session.user = username;
                console.log("Пользователь в сессии после аторизации:", req.session.user);
                const token = generateToken(user);
                console.log("Сгенерированный токен:", token);
                res.redirect('/dashboard');
                return;
            }
        }

        res.status(401).json({ error: 'Неверное имя пользователя или пароль.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при авторизации.' });
    }
});


router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Вход админа:', username);

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        const user = result.rows[0];
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'У вас нет прав администратора' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = generateToken(user);
            if(token){
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    role: user.role
                };
                return res.redirect('/admin/dashboard');
    
            } else {
                res.status(500).json({ error: 'Ошибка генерации токена' });
            }
        } else {
            res.status(401).json({ error: 'Неправильный пароль' });
        }
    } catch (err) {
        console.error('Ошибка авторизации администратора:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


router.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, '../views/dashboard.html'));
    } else {
        res.redirect('/login');
    }
});

router.get('/admin/dashboard', (req, res) => {
    if (req.session.user && req.session.user.role == 'admin') {
        res.sendFile(path.join(__dirname, '../views/admin_dashboard.html'));
    } else {
        res.redirect('/login');
    }
});

router.get('/therapist/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/therapist_dashboard.html'));res.sendFile(path.join(__dirname, '../views/therapist_dashboard.html'));
});


router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

export default router;
