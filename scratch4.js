require('dotenv').config({path:'.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const visitorId = 29;
  const vres = await pool.query("SELECT * FROM visitors WHERE id = $1", [visitorId]);
  const visitor = vres.rows[0];
  console.log("Visitor:", visitor);
  if (!visitor) return pool.end();

  let fees = await pool.query("SELECT * FROM parking_fees");
  console.log("Fees total:", fees.rows.length);

  // logic from page
  const rule = fees.rows.find(f => f.name.includes("ติดต่อ") || f.name.includes("Visitor")) || fees.rows[0];
  console.log("Rule:", rule);

  pool.end();
}
run();
