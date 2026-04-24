const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fix() {
  try {
    // Fill line_user_id from residents
    await pool.query(`
      UPDATE vehicles v
      SET line_user_id = r.line_user_id
      FROM residents r
      WHERE v.resident_id = r.id AND v.line_user_id IS NULL AND r.line_user_id IS NOT NULL
    `);
    
    // Also, map them into resident_vehicles
    await pool.query(`
      INSERT INTO resident_vehicles (resident_id, vehicle_id)
      SELECT resident_id, id FROM vehicles WHERE resident_id IS NOT NULL
      ON CONFLICT DO NOTHING
    `);
    
    console.log('Fixed');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
fix();
