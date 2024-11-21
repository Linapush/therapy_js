import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: 'linapush',
  host: 'localhost',
  database: 'therapy',
  password: 'some@password123',
  port: 5432,
});

export const query = (text, params) => pool.query(text, params);
export default pool;


// psql -U linapush -h localhost -d therapy -p 5432
// console.log("Database password:", process.env.DB_PASSWORD, typeof process.env.DB_PASSWORD);