

function registerUser(req, res, next) {
    console.log(req.session)
    if (req.session.username) {
        next();
    } else {
        res.redirect('/');
    }
}


function userLogedIn(req, res, next) {
    console.log(req.session)

    if (req.session.username) {
        console.log(user)
        next();
    } else {
        res.redirect('/login');
    }
}


async function adminAuth(req, res, next) {
    console.log(req.session)
    if (req.session.username && req.session.user.role === 'admin') {
        next();
    } else {
        res.redirect('/login');
    }
}


async function therapistAuth(req, res, next) {
    console.log(req.session)
    if (req.session.username && req.session.user && req.session.user.role === 'therapist') {
        next();
    } else {
        res.redirect('/login');
    }
}

export default {registerUser, userLogedIn, adminAuth, therapistAuth};