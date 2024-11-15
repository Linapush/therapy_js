import bcrypt from 'bcrypt';


function registerUser(req, res, next) {
    if (!req.session.username) {
        next();
    } else {
        res.redirect('/');
    }
}


function userLogedIn(req, res, next) {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/login');
    }
}


async function getUserByUsername(username) {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
}


async function adminAuth(req, res, next) {
    if (req.session.username) {
        const user = await getUserByUsername(req.session.username);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.redirect('/admin');
        }
    } else {
        res.redirect('/login');
    }
}

async function therapistAuth(req, res, next) {
    if (req.session.username) {
        const user = await getUserByUsername(req.session.username);
        if (user && user.role === 'therapist') {
            next();
        } else {
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
}

export default {registerUser, userLogedIn, adminAuth, therapistAuth};