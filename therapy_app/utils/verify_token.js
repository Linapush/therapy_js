import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export default function checkAdminRole(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Доступ запрещен');
    }
}

// export default function verifyToken(req, res, next) {
//     const authHeader = req.headers["authorization"];
//     const [type, credentials] = authHeader.split(" ");
//         if (type === "Bearer") {
//             token = credentials;
//     }

//     console.log(req.session.token)
//     console.log(authHeader)
//     console.log('Проверка токена в заголовках запроса:', authHeader)

//     if (!authHeader) { 
//         console.warn('Токен отсутствует в заголовках запроса.');
//         return res.status(403).send('Токен отсутствует.');
//     }

//     const token = token.split(' ')[1];
//     console.log('Полученный токен:', token);
    
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) {
//             console.error('Ошибка при проверке токена:', err);
//             return res.status(401).send('Недействительный токен.');
//         }
//         req.user = decoded;
//         console.log('Токен успешно проверен. Декодированные данные пользователя:', decoded);
//         next();
//     });
// }

// через куки попробовать достать токен 

// export default function verifyToken(req, res, next) {
//     const token = req.session.token;
//     console.log(token)

//     if (!token) {
//         console.log('No token found in session.');
//         return res.redirect('/login');
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log('Decoded token:', decoded);
//         req.userId = decoded.userId;
//         next();
//     } catch (error) {
//         console.error('Invalid token:', error.message);
//         return res.status(401).send('Invalid token');
//     }
// };
