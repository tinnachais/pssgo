import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pssgo' });
async function test() {
    const res = await pool.query('SELECT id, name, lat, lng FROM sites');
    console.log("DB DATA:", res.rows);
    pool.end();
}
test();
