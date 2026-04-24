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
      INSERT INTO resident_vehicles (resident_id, vehicle_id)
      SELECT resident_id, id FROM vehicles
      WHERE resident_id IS NOT NULL
      ON CONFLICT DO NOTHING
    `);
    console.log('Migrated missing mappings:', res.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
