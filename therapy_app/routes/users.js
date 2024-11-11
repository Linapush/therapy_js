import router from './router.js'
import pool from '../db.js'

/// закончить со статус кодами ///
// gодумать по моделям и функционалц (где? как?)
// как разделить функционал между пользователем и админом?
// как разделить авторизацию между юзером и админом
// как разделить авторизацию между пациентами и терапевтами (нужна ли отдельная)
// или if user = patient - выполняем то-то и то-то?


function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

router.get('/users', async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM users');
        res.status(200).json(users.rows);
    } catch (err) {
        console.error("Не удалось получить пользователей", err);
        res.status(500).json({ error: err.message });
    }
});


router.get('/users', checkAuth, async (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});


router.post('/users', async(req, res) => {
    const { username, password } = req.body;
    const user = req.session.user;

    try {
        const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error: 'Ошибка при добавлении пользователя'})
    }
});


router.put('/users/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    try {
        const result = await pool.query('UPDATE users SET username = $1, password = $2 WHERE id = $4', [username, password])

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        res.status(200).json({ message: "Пользователь обновлен", user: result.rows[0] })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка в обновлении пользователя" }); 
    }
});


router.delete('/users/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        res.status(200).json({ message: "Пользователь удален" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении пользователя" });
    }
});


export default router;