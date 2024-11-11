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

router.get('/patients', async (req, res) => {
    try {
        const patients = await pool.query('SELECT * FROM patients');
        res.status(200).json(patients.rows)
    } catch (err) {
        console.error("Не удалось получить пациентов", err);
        res.status(500).json({error: err.message})
    }
});

router.post('/patients', checkAuth, async(req, res) => {
    const { first_name, last_name, phone, email } = req.body;
    const client = req.session.client;

    try {
        const userId = userIdQuery.rows[0].id;
        const result = await pool.query('INSERT INTO patients (first_name, last_name, phone, email, userId) VALUES ($1, $2, $3, $4, $5)', [first_name, last_name, phone, email, userId]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error: 'Ошибка при добавлении пациента'})
    }
});

router.put('/patients/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone, email } = req.body;
    try {
        const result = await pool.query('UPDATE patients SET first_name = $1, last_name = $2, phone = $3, email = $4 WHERE id = $4', [first_name, last_name, phone, email])
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Пациент не найден" });
        }
        res.status(200).json({ message: "Пациент обновлен", user: result.rows[0] })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка в обновлении пациента" }); 
    }
});

router.delete('/patients/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM patients WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Пациент не найден" });
        }
        res.status(200).json({ message: "Пациент удален" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении пациента" });
    }
});


export default router;