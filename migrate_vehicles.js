const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resident_vehicles (
        id SERIAL PRIMARY KEY,
        resident_id INT REFERENCES residents(id) ON DELETE CASCADE,
        vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(resident_id, vehicle_id)
      );
    `);
    
    // Add line_user_id to vehicles if it doesn't exist
    await pool.query(`
      ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255);
    `);
    
    // Backfill line_user_id from residents
    await pool.query(`
      UPDATE vehicles v
      SET line_user_id = r.line_user_id
      FROM residents r
      WHERE v.resident_id = r.id AND v.line_user_id IS NULL AND r.line_user_id IS NOT NULL;
    `);
    
    // Migrate existing vehicle assignments to the join table
    await pool.query(`
      INSERT INTO resident_vehicles (resident_id, vehicle_id)
      SELECT resident_id, id FROM vehicles WHERE resident_id IS NOT NULL
      ON CONFLICT DO NOTHING;
    `);

    console.log('Migration successful');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
migrate();
