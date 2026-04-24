require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function run() {
  try {
    const res = await pool.query(`
      UPDATE access_logs al 
      SET site_id = (
          SELECT r.site_id 
          FROM residents r 
          WHERE r.house_number = al.house_number 
          AND r.site_id IS NOT NULL 
          LIMIT 1
      ) 
      WHERE al.site_id IS NULL 
      AND al.house_number IS NOT NULL
    `);
    console.log('Updated access_logs site_ids:', res.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
