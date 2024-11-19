import pkg from 'pg';
const { Pool } = pkg;
import express from 'express';

const router = express.Router();

const pool = new Pool({
    user: 'sofia',
    host: 'localhost',
    database: 'js',
    password: '1234',
    port: 5434,
});

function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

router.get('/tasks', checkAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = (SELECT id FROM users WHERE username = $1)', [user]);
        res.json(tasks.rows);
    } catch (err) {
        console.error(err);
        res.send('Ошибка при получении задач.');
    }
});

router.post('/tasks', checkAuth, async (req, res) => {
    const { title, description } = req.body;
    const user = req.session.user;

    try {
        const userIdQuery = await pool.query('SELECT id FROM users WHERE username = $1', [user]);
        const userId = userIdQuery.rows[0].id;
        await pool.query('INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3)', [title, description, userId]);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.send('Ошибка при добавлении задачи.');
    }
});

router.put('/tasks/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;
    try {
        await pool.query('UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4', [title, description, status, id]);
        res.send('Задача обновлена.');
    } catch (err) {
        console.error(err);
        res.send('Ошибка при обновлении задачи.');
    }
});

router.put('/tasks/:id/status', checkAuth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE tasks SET status = $1 WHERE id = $2', [status, id]);
        res.send('Статус задачи обновлен.');
    } catch (err) {
        console.error(err);
        res.send('Ошибка при обновлении статуса задачи.');
    }
});

router.delete('/tasks/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.send('Задача удалена.');
    } catch (err) {
        console.error(err);
        res.send('Ошибка при удалении задачи.');
    }
});

export default router;
