import dotenv from 'dotenv';
import pkg from 'pg';


dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  user: 'linapush',
  host: 'localhost',
  database: 'therapy',
  password: 'some@password123',
  port: 5432,
});

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });


export default pool;


// psql -U linapush -h localhost -d therapy -p 5432
// console.log("Database password:", process.env.DB_PASSWORD, typeof process.env.DB_PASSWORD);