import dotenv from 'dotenv'
import pool from '../db_connection.js';
import router from '../utils/router.js';
import verifyToken from '../utils/verify_token.js';


dotenv.config();


router.get('/patients', verifyToken, async (req, res) => {
    console.log('Сессия в /patients:', req.session);

    try {
        const patient = await pool.query('SELECT * FROM patients');
        res.status(200).json(patient.rows)
    } catch (err) {
        console.error("Не выполнить GET запрос для пациентов", err);
        res.status(500).json({error: err.message})
    }
}); 


router.get('/patients/:id', verifyToken, async (req, res) => {
    console.log('Сессия в /patients:', req.session);
    const { id } = req.params;
    try {
        const session = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
        if (session.rows.length === 0) {
            return res.status(404).json({ error: 'Такого пациента нет' });
        }
        res.status(200).json(session);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});


router.post('/patients', verifyToken, async (req, res) => {
    console.log('Запрос на создание пациента:', req.body);
    
    const { first_name, last_name, phone, email } = req.body;
    const user = req.user; 
    console.log('Пользователь из сессии:', user);

    if (!user || !user.id) {
        console.warn('Попытка доступа без авторизации. Пользователь не найден в сессии.');
        return res.status(403).json({ error: 'Пользователь не авторизован' });
    }

    try {
        const userRole = user.role;
        console.log('Роль пользователя:', userRole)
        if (userRole !== 'admin') {
            console.warn(`Отказ в доступе. Пользователь ${user.username} не имеет прав для добавления пациента`);
            return res.status(403).json({ error: 'У вас нет прав для добавления приема у терапевта' });
        }
        const userId = user.id;
        const result = await pool.query('INSERT INTO patients (first_name, last_name, phone, email, user_id) VALUES ($1, $2, $3, $4, $5)', [first_name, last_name, phone, email, userId]);
        console.log('Пациент успешно добавлен:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Ошибка при добавлении пациента'})
    }
});


router.put('/patients/:id', verifyToken, async (req, res) => {
    const { first_name, last_name, phone, email } = req.body;
    const user = req.user;

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав для обновления приема.' });
    }

    try {
        const result = await pool.query(
            'UPDATE patients SET first_name = $1, last_name = $2, phone = $3, email = $4 WHERE id = $4', 
            [first_name, last_name, phone, email]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Сессия не найдена' });
        }
        res.json(result.rows[0]);
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при обновлении приема.' });
    }
});


router.delete('/patients/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав для удаления пациента.' });
    }

    try {
        const result = await pool.query('DELETE FROM patients WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пациент не найден' });
        }
        res.json({ message: 'Пациент успешно удален' });
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при удалении приема.' });
    }
});


export default router;



router.get('/patients', async (req, res) => {
    try {
        const patients = await pool.query('SELECT * FROM patients');
        res.status(200).json(patients.rows)
    } catch (err) {
        console.error("Не удалось получить пациентов", err);
        res.status(500).json({error: err.message})
    }
});



router.post('/patients', async(req, res) => {
    const { first_name, last_name, phone, email } = req.body;
    const user = req.session.user;

    if (!user || !user.id) {
        return res.status(403).json({ error: 'Пользователь не авторизован' });
    }

    try {
        // const userIdQuery = await pool.query('SELECT id FROM users WHERE id = $1', [user]);
        // const userId = userIdQuery.rows[0].id;
        const userId = user.id;
        const result = await pool.query('INSERT INTO patients (first_name, last_name, phone, email, user_id) VALUES ($1, $2, $3, $4, $5)', [first_name, last_name, phone, email, userId]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Ошибка при добавлении пациента'})
    }
});


// на правах админа, терапевта

// router.put('/patients/:id', auth_by_role.adminAuth, async (req, res) => {
//     const { id } = req.params;
//     const { first_name, last_name, phone, email } = req.body;
//     try {
//         const result = await pool.query('UPDATE patients SET first_name = $1, last_name = $2, phone = $3, email = $4 WHERE id = $4', [first_name, last_name, phone, email])
//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: "Пациент не найден" });
//         }
//         res.status(200).json({ message: "Пациент обновлен", user: result.rows[0] })
//     } catch (err) {
//         console.error(err);
//         console.error(err);
//         res.status(500).json({ error: "Ошибка в обновлении пациента" }); 
//     }
// });


router.put('/patients/:id', async (req, res) => {
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
        console.error(err);
        res.status(500).json({ error: "Ошибка в обновлении пациента" }); 
    }
});