import express from 'express';
import path from 'path';
import session from 'express-session';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import clientRoutes from './routes/patients.js';
import sessionRoutes from './routes/sessions.js';
import therapistsRoutes from './routes/therapists.js';

const app = express();
const PORT = 8005;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } // Сессия на 10 минут
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', clientRoutes);
app.use('/', sessionRoutes);
app.use('/', therapistsRoutes);

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// в app.js будем создавать роли и логику для них
// роль: пользователь и роль админ
// пользователь: логинится, записывается к врачу - создается запись
// админ: что-то делает
// терапевт: что-то делает
