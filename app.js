import express from 'express';
import path from 'path';
import session from 'express-session';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import pkg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();


const { Pool } = pkg;
export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});


export const secretKey = process.env.TOKEN_SECRET;


const app = express();
export default app;


const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(session({
    secret: process.env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }
}));


const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));


app.use(express.static(path.join(__dirname, 'public')));


app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', adminRoutes);


if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
}
