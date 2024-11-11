import router from './router.js'
import pool from '../db.js'

TODO // закончить со статус кодами

function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

router.get('/sessions', async (req, res) => {
    try {
        const patients = await pool.query('SELECT * FROM sessions');
        res.status(200).json(patients.rows)
    } catch (err) {
        console.error("Не удалось получить сессию", err);
        res.status(500).json({error: err.message})
    }
});

router.post('/sessions', checkAuth, async(req, res) => {
    const { first_name, last_name, phone, email } = req.body;
    const client = req.session.client;

    try {
        const userId = userIdQuery.rows[0].id;
        const result = await pool.query('INSERT INTO sessions (first_name, last_name, phone, email, userId) VALUES ($1, $2, $3, $4, $5)', [first_name, last_name, phone, email, userId]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error: 'Ошибка при добавлении сессии'})
    }
});

router.put('/sessions/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone, email } = req.body;
    try {
        const result = await pool.query('UPDATE sessions SET first_name = $1, last_name = $2, phone = $3, email = $4 WHERE id = $4', [first_name, last_name, phone, email])
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Сессия не найдена" });
        }
        res.status(200).json({ message: "Сессия обновлена", user: result.rows[0] })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка в обновлении сессии" }); 
    }
});

router.delete('/sessions/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM sessions WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Сессия не найдена" });
        }
        res.status(200).json({ message: "Сессия удалена" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении сессии" });
    }
});


export default router;