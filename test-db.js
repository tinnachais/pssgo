require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

console.log("กำลังทดสอบเชื่อมต่อ...");
console.log(`Host: ${process.env.DB_HOST}, User: ${process.env.DB_USER}, DB: ${process.env.DB_NAME}`);

pool.query('SELECT NOW()')
  .then(res => {
    console.log('\n✅ เชื่อมต่อฐานข้อมูลสำเร็จ!');
    console.log('✅ เวลาเซิฟเวอร์ PostgreSQL:', res.rows[0].now);
    return pool.end();
  })
  .catch(err => {
    console.error('\n❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:');
    console.error(err.message);
    process.exit(1);
  });
