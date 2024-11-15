import path from 'path';
import pool from '../db_connection.js'
import router from '../utils/router.js'
import auth_by_role from '../utils/auth_by_role.js'


router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin_pages/admin_login.html'));
});


router.post('/admin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2 AND role = $3', [username, password, 'admin']);
        if (user.rows.length > 0) {
            req.session.user = user.rows[0];
            res.redirect('/admin/dashboard');
        } else {
            res.status().send('Неверное имя пользователя или пароль.');
        }
    } catch (err) {
        console.error(err);
        res.send('Ошибка при авторизации.');
    }
});


router.get('/admin/dashboard', auth_by_role.adminAuth, (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        res.sendFile(path.join(__dirname, '../views/admin_dashboard.html')); // Страница админского дашборда
    } else {
        res.redirect('/admin');
    }
});


router.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin');
});

export default router;
