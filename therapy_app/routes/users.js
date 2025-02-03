import dotenv from 'dotenv';
import pool from '../db_connection.js';
import router from '../utils/router.js';
import verifyToken from '../utils/verify_token.js';
import bcrypt from 'bcryptjs';


dotenv.config();


async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}


router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
            console.error('Ошибка при получении пользователей:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});



router.get('/users/:id', async (req, res) => {
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


router.post('/users', verifyToken, async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        const result = await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
        [username, hashedPassword, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при создании пользователя:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});



router.delete('/users/:id', verifyToken, async (req, res) => {
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


// import path from 'path';
// import { fileURLToPath } from 'url';

// import router from '../utils/router.js'
// import pool from '../db_connection.js'
// import auth_by_role from '../utils/auth_by_role.js'


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // регистрация нового пользователя

// // router.get('/users', auth_by_role.adminAuth, async (req, res) => {
// //     res.sendFile(path.join(__dirname, '../public/user_pages/login.html'));
// // });

// // router.get('/users', async (req, res) => {
// //     res.sendFile(path.join(__dirname, '../public/user_pages/login.html'));
// // });

// // // на правах админа
// // router.get('/users', auth_by_role.adminAuth, async (req, res) => {
// //     try {
// //         const users = await pool.query('SELECT * FROM users');
// //         res.status(200).json(users.rows);
// //     } catch (err) {
// //         console.error("Не удалось получить пользователей", err);
// //         res.status(500).json({ error: err.message });
// //     }
// // });

// // на правах админа
// router.get('/users', async (req, res) => {
//     try {
//         const users = await pool.query('SELECT * FROM users');
//         res.status(200).json(users.rows);
//     } catch (err) {
//         console.error("Не удалось получить пользователей", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// router.get('/users/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
//         if (!user) {
//             return res.status(404).send();
//         }
//         res.status(200).json(user);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send();
//     }
// });

// // на правах админа
// // router.post('/users', auth_by_role.adminAuth, async(req, res) => {
// //     const { username, password } = req.body;
// //     const user = req.session.user;

// //     try {
// //         const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
// //         res.status(201).json(result.rows[0]);
// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({error: 'Ошибка при добавлении пользователя'})
// //     }
// // });

// router.post('/users', async(req, res) => {
//     const { username, password } = req.body;
//     const user = req.session.user;

//     try {
//         const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({error: 'Ошибка при добавлении пользователя'})
//     }
// });

// // update пока не нужен
// // // // на правах админа
// // router.put('/users/:id', auth_by_role.adminAuth, async (req, res) => {
// //     const { id } = req.params;
// //     const { username, password } = req.body;

// //     try {
// //         const result = await pool.query('UPDATE users SET username = $1, password = $2 WHERE id = $4', [username, password])

// //         if (result.rowCount === 0) {
// //             return res.status(404).json({ error: "Пользователь не найден" });
// //         }
// //         res.status(200).json({ message: "Пользователь обновлен", user: result.rows[0] })
// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({ error: "Ошибка в обновлении пользователя" }); 
// //     }
// // });


// // // на правах админа
// // router.delete('/users/:id', auth_by_role.adminAuth, async (req, res) => {
// //     const { id } = req.params;
// //     try {
// //         const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
// //         if (result.rowCount === 0) {
// //             return res.status(404).json({ error: "Пользователь не найден" });
// //         }
// //         res.status(200).json({ message: "Пользователь удален" });
// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({ error: "Ошибка при удалении пользователя" });
// //     }
// // });

// router.delete('/users/:id',  async (req, res) => {
//     const { id } = req.params;
//     try {
//         const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: "Пользователь не найден" });
//         }
//         res.status(200).json({ message: "Пользователь удален" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Ошибка при удалении пользователя" });
//     }
// });

// export default router;