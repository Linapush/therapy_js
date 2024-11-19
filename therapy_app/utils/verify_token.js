import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export default function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        console.warn('Токен отсутствует в заголовках запроса.');
        return res.status(403).send('Токен отсутствует.');
    }
    const bearerToken = token.split(' ')[1];
    console.log('Полученный токен:', bearerToken);
    
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Ошибка при проверке токена:', err);
            return res.status(401).send('Недействительный токен.');
        }
        req.user = decoded;
        console.log('Токен успешно проверен. Декодированные данные пользователя:', decoded);
        next();
    });
}
