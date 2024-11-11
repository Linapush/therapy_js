import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

const pool = new Pool({
  user: 'linapush',
  host: 'localhost',
  database: 'therapy',
  password: 'some@password123',
  port: 5434,
});

export default pool;

// console.log("Database password:", process.env.DB_PASSWORD, typeof process.env.DB_PASSWORD);