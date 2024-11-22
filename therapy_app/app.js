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
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';



dotenv.config();


const app = express();
const PORT = 8005;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:8005',
    credentials: true,
    exposedHeaders: ['Authorization'],
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    },
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'user_pages', 'index.html'));
});

app.get('/test-error', (req, res, next) => {
    const err = new Error('Ошибка транзакции');
    err.code = '100';
    next(err);
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', clientRoutes);
app.use('/', sessionRoutes);
app.use('/', therapistsRoutes);


const therapy_app = app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

export default therapy_app; 