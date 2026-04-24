require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'resident_vehicles'").then(res => {
  console.log(res.rows);
  pool.end();
});
