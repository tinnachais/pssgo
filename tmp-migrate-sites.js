require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function run() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS sites (id SERIAL PRIMARY KEY, name TEXT NOT NULL, address TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW());`);
    await pool.query(`INSERT INTO sites (name) VALUES ('HQ Site') ON CONFLICT DO NOTHING;`);
    const tables = ['residents', 'vehicle_logs', 'roles', 'users', 'vehicle_types', 'vehicle_colors'];
    for (const t of tables) {
      await pool.query(`CREATE TABLE IF NOT EXISTS ${t} (id SERIAL PRIMARY KEY);`);
      try {
        await pool.query(`ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS site_id INTEGER DEFAULT 1 REFERENCES sites(id) ON DELETE CASCADE;`);
        console.log(`Added site_id to ${t}`);
      } catch(err) {
        console.error(`Error on ${t}: ${err.message}`);
      }
    }
    console.log('Done mapping site_id master key to tables!');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
