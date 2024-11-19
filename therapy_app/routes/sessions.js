import dotenv from 'dotenv'
import pool from '../db_connection.js';
import router from '../utils/router.js';
import verifyToken from '../utils/verify_token.js';


dotenv.config();


router.get('/sessions', verifyToken, async (req, res) => {

    try {
        const session = await pool.query('SELECT * FROM sessions');
        res.status(200).json(session.rows)
    } catch (err) {
        res.status(500).json({error: "Не удалось получить прием у терапевта"})
    }
}); 


router.get('/sessions/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const session = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
        if (session.rows.length === 0) {
            return res.status(404).json({ error: 'Такого приема у терапевта нет' });
        }
        res.status(200).json(session);
    } catch (err) {
        res.status(500).json({error: "Не удалось получить прием у терапевта"});
    }
});


router.post('/sessions', verifyToken, async (req, res) => {    
    const { patient_id, therapist_id, date, time, notes } = req.body;
    const user = req.user; 

    if (!user || !user.id) {
        console.warn('Попытка доступа без авторизации. Пользователь не найден в сессии.');
        return res.status(403).json({ error: 'Пользователь не авторизован' });
    }

    try {
        const userRole = user.role;
        if (userRole !== 'admin') {
            console.warn(`Отказ в доступе. Пользователь ${user.username} не имеет прав для добавления приема у терапевта.`);
            return res.status(403).json({ error: 'У вас нет прав для добавления приема у терапевта' });
        }
        const result = await pool.query('INSERT INTO sessions (patient_id, therapist_id, date, time, notes) VALUES ($1, $2, $3, $4, $5)', [patient_id, therapist_id, date, time, notes]);
        res.status(201).json('Прием у терапевта успешно добавлен:', result.rows[0]);
    } catch (err) {
        res.status(500).json({error: 'Ошибка при добавлении приема у терапевта'})
    }
});


// router.put('/sessions/:id', verifyToken, async (req, res) => {
//     const { id } = req.params;
//     const { patient_id, therapist_id, date, time, notes } = req.body;
//     const user = req.user;

//     if (!user || user.role !== 'admin') {
//         return res.status(403).json({ error: 'У вас нет прав для обновления приема.' });
//     }

//     try {
//         const result = await pool.query(
//             'UPDATE sessions SET patient_id = $1, therapist_id = $2, date = $3, time = $4, notes = $5 WHERE id = $6 RETURNING *',
//             [patient_id, therapist_id, date, time, notes, id]
//         );
//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'Прием у терапевта не найден' });
//         }
//         res.json(result.rows[0]);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Ошибка при обновлении приема.' });
//     }
// });


router.put('/sessions/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { patient_id, therapist_id, date, time, notes } = req.body;
    const user = req.user;

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав для обновления приема.' });
    }

    try {
        const currentSessionResult = await pool.query(
            'SELECT * FROM sessions WHERE id = $1',
            [id]
        );

        if (currentSessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Прием у терапевта не найден' });
        }

        const currentSession = currentSessionResult.rows[0];

        const updatedPatientId = patient_id !== undefined ? patient_id : currentSession.patient_id;
        const updatedTherapistId = therapist_id !== undefined ? therapist_id : currentSession.therapist_id;
        const updatedDate = date !== undefined ? date : currentSession.date;
        const updatedTime = time !== undefined ? time : currentSession.time;
        const updatedNotes = notes !== undefined ? notes : currentSession.notes;

        const result = await pool.query(
            'UPDATE sessions SET patient_id = $1, therapist_id = $2, date = $3, time = $4, notes = $5 WHERE id = $6 RETURNING *',
            [updatedPatientId, updatedTherapistId, updatedDate, updatedTime, updatedNotes, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при обновлении приема.' });
    }
});


router.delete('/sessions/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав для удаления приема.' });
    }

    try {
        const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Сессия не найдена' });
        }
        res.json({ message: 'Прием успешно удален' });
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при удалении приема.' });
    }
});


export default router;
