require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function check() {
    try {
        await pool.query("SELECT 1 FROM liff_profiles");
        console.log("liff_profiles exists");
    } catch(e) {
        console.log("liff_profiles NO:", e.message);
    }
    try {
        await pool.query("SELECT 1 FROM vehicle_shares");
        console.log("vehicle_shares exists");
    } catch(e) {
        console.log("vehicle_shares NO:", e.message);
    }
    pool.end();
}
check();
