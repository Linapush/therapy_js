import dotenv from 'dotenv'
import pool from '../db_connection.js';
import router from '../utils/router.js';
import checkAdminRole from '../utils/verify_token.js';
import {check, validationResult, body} from 'express-validator';


dotenv.config();


const validateSession = (isUpdate = false) => {
    return [
        body('patient_id').if(body('patient_id').exists()).isInt().withMessage('Поле patient_id должно быть целым числом'),
        body('therapist_id').if(body('therapist_id').exists()).isInt().withMessage('Поле therapist_id должно быть целым числом'),
        body('date').if(body('date').exists()).isISO8601().withMessage('Поле date должно быть в формате ISO8601'),
        body('time').if(body('time').exists()).matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Поле time должно быть в формате HH:MM'),
        body('notes').if(body('notes').exists()).isString().withMessage('Поле notes должно быть строкой'),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
    ];
};


router.get('/sessions', async (req, res) => {

    try {
        const session = await pool.query('SELECT * FROM sessions');
        res.status(200).json(session.rows)
    } catch (err) {
        res.status(500).json({error: "Не удалось получить прием у терапевта"})
    }
}); 


router.get('/sessions/:id', async (req, res) => {
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


router.post('/sessions', checkAdminRole, validateSession, async (req, res) => {
    console.log('Тело запроса:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Ошибки валидации:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { patient_id, therapist_id, date, time, notes } = req.body;
    if (!patient_id) {
        return res.status(400).json({ error: 'Поле patient_id обязательно' });
    }

    try {
        console.log('Перед вставкой:', patient_id, therapist_id, date, time, notes);
        await pool.query(
            'INSERT INTO sessions (patient_id, therapist_id, date, time, notes) VALUES ($1, $2, $3, $4, $5)',
            [patient_id, therapist_id, date, time, notes]
        );
        res.status(201).send('Прием добавлен.');
    } catch (err) {
        console.error('Ошибка добавления:', err);
        res.status(500).json({ error: 'Failed to add session', details: err.message });
    }
});


router.put('/sessions/:id', checkAdminRole, validateSession, async (req, res) => {
    console.log('Запрос PUT /sessions/:id получен');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Ошибки валидации:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { patient_id, therapist_id, date, time, notes } = req.body;

    console.log('Параметры запроса:', { id, patient_id, therapist_id, date, time, notes });

    try {
        console.log(`Поиск приема с id ${id}`);
        const currentSessionResult = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
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

        console.log('Результат обновления:', result.rows[0]);
        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error('Ошибка при обновлении приема:', err);
        res.status(500).json({ error: 'Ошибка при обновлении приема.' });
    }
});



router.delete('/sessions/:id', checkAdminRole, async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    try {
        const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Прием у терапевта не найден' });
        }
        await pool.query(`
            SELECT setval('sessions_id_seq', COALESCE((SELECT MAX(id) FROM sessions), 1), true);
        `);

        res.status(200).json({ message: 'Прием удален' });
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при удалении приема.' });
    }
});


export default router;
