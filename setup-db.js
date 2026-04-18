require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function main() {
  try {
    const schemaPath = path.join(__dirname, 'sql', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log("กำลังรันคำสั่ง SQL สร้างตาราง...");
    await pool.query(schemaSql);
    
    console.log("✅ สร้างตาราง 'residents' และ 'vehicle_logs' สำเร็จแล้ว!");
  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาด:", err.message);
  } finally {
    await pool.end();
  }
}

main();
