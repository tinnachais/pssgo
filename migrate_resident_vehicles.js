const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@localhost:5432/pssgo_db',
});

async function run() {
  try {
    const res = await pool.query(`
      INSERT INTO resident_vehicles (resident_id, vehicle_id)
      SELECT resident_id, id FROM vehicles
      WHERE resident_id IS NOT NULL
      ON CONFLICT DO NOTHING
    `);
    console.log('Inserted missing mappings:', res.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
