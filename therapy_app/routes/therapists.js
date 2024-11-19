// import router from '../utils/router.js'
// import pool from '../db_connection.js'

// //TODO // закончить со статус кодами

// // на правах у админа

// router.get('/therapists', async (req, res) => {
//     try {
//         const patients = await pool.query('SELECT * FROM therapists');
//         res.status(200).json(patients.rows)
//     } catch (err) {
//         console.error("Не удалось получить терапевтов", err);
//         res.status(500).json({error: err.message})
//     }
// });

// // на правах у админа

// router.post('/therapists', async(req, res) => {
//     const { specialization, description } = req.body;
//     const user = req.session.username;
    

//     try {
//         const userIdQuery = await pool.query('SELECT id FROM users WHERE username = $1', [user]);
//         if (userIdQuery.rows.length === 0) {
//             return res.status(404).json({ error: 'Пользователь не найден' });
//         }        
//         const userId = userIdQuery.rows[0].id;
//         const result = await pool.query('INSERT INTO therapists (specialization, description, userId) VALUES ($1, $2, $3)', [specialization, description, userId]);
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({error: 'Ошибка при добавлении терапевта'})
//     }
// });

// // на правах у админа

// router.put('/therapists/:id', async (req, res) => {
//     const { id } = req.params;
//     const { first_name, last_name, specialization, description } = req.body;
//     try {
//         const result = await pool.query('UPDATE therapists SET first_name = $1, last_name = $2, specialization = $3, description = $4 WHERE id = $4', [first_name, last_name, specialization, description, userId])
//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: "Терапевт не найден" });
//         }
//         res.status(200).json({ message: "Терапевт обновлен", user: result.rows[0] })
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Ошибка в обновлении терапевтов" }); 
//     }
// });

// // на правах у админа

// router.delete('/therapists/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const result = await pool.query('DELETE FROM therapists WHERE id = $1', [id]);
//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: "Терапевт не найден" });
//         }
//         res.status(200).json({ message: "Терапевт удален" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Ошибка при удалении терапевтов" });
//     }
// });


import dotenv from 'dotenv';
import pool from '../db_connection.js';
import router from '../utils/router.js';
import verifyToken from '../utils/verify_token.js';


dotenv.config();


router.get('/therapists', verifyToken, async (req, res) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав доступа.' });
    }
    try {
        const result = await pool.query(
        'SELECT t.id, t.user_id, t.specialization, t.description, u.username FROM therapists t JOIN users u ON t.user_id = u.id'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении терапевтов:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


router.get('/therapists/:id', verifyToken, async (req, res) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав доступа.' });
    }
    const { id } = req.params;
    try {
        const result = await pool.query(
        'SELECT t.id, t.user_id, t.specialization, t.description, u.username FROM therapists t JOIN users u ON t.user_id = u.id WHERE t.id = $1',
        [id]
        );
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Терапевт не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при получении терапевта:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


router.post('/therapists', verifyToken, async (req, res) => {
    console.log('Запрос на создание терапевта:', req.body);

    const { specialization, description } = req.body;
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
            console.warn(`Отказ в доступе. Пользователь ${user.username} не имеет прав для добавления терапевта.`);
            return res.status(403).json({ error: 'У вас нет прав для добавления терапевта' });
        }
        const result = await pool.query('INSERT INTO therapists (specialization, description, userId) VALUES ($1, $2, $3)', [specialization, description, userId]);
        console.log('Прием у терапевта успешно добавлен:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при создании терапевта:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


router.put('/therapists/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { specialization, description } = req.body;
    const user = req.user;

    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав доступа.' });
    }

    try {
        const result = await pool.query(
            'UPDATE therapists SET first_name = $1, last_name = $2, specialization = $3, description = $4 WHERE id = $4', 
            [specialization, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Терапевт не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при обновлении терапевта:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


router.delete('/therapists/:id', verifyToken, async (req, res) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'У вас нет прав доступа.' });
    }
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM therapists WHERE id = $1', [id]);
        if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Терапевт не найден' });
        }
        res.json({ message: 'Терапевт удален' });
    } catch (err) {
        console.error('Ошибка при удалении терапевта:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;