import dotenv from 'dotenv';
import pool from '../db_connection.js';
import router from '../utils/router.js';
import verifyToken from '../utils/verify_token.js';
import bcrypt from 'bcrypt';


dotenv.config();


// async function hashPassword(password) {
//     const saltRounds = 10;
//     return await bcrypt.hash(password, saltRounds);
// }


router.get('/users', verifyToken, async (req, res) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав доступа.' });
    }
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
            console.error('Ошибка при получении пользователей:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});



router.get('/users/:id', verifyToken, async (req, res) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав доступа.' });
    }
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [id]);
            if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при получении пользователя:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


router.delete('/users/:id', verifyToken, async (req, res) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав доступа.' });
    }
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
        res.json({ message: 'Пользователь удален' });
    } catch (err) {
        console.error('Ошибка при удалении пользователя:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;
