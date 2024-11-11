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

router.get('/therapists', async (req, res) => {
    try {
        const patients = await pool.query('SELECT * FROM therapists');
        res.status(200).json(patients.rows)
    } catch (err) {
        console.error("Не удалось получить терапевтов", err);
        res.status(500).json({error: err.message})
    }
});

router.post('/therapists', checkAuth, async(req, res) => {
    const { first_name, last_name, specialization, description } = req.body;
    const client = req.session.client;

    try {
        const userId = userIdQuery.rows[0].id;
        const result = await pool.query('INSERT INTO therapists (first_name, last_name, specialization, description, userId) VALUES ($1, $2, $3, $4, $5)', [first_name, last_name, specialization, description, userId]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error: 'Ошибка при добавлении терапевта'})
    }
});

router.put('/therapists/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, specialization, description } = req.body;
    try {
        const result = await pool.query('UPDATE therapists SET first_name = $1, last_name = $2, specialization = $3, description = $4 WHERE id = $4', [first_name, last_name, specialization, description, userId])
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Терапевт не найден" });
        }
        res.status(200).json({ message: "Терапевт обновлен", user: result.rows[0] })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка в обновлении терапевтов" }); 
    }
});

router.delete('/therapists/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM therapists WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Терапевт не найден" });
        }
        res.status(200).json({ message: "Терапевт удален" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении терапевтов" });
    }
});


export default router;