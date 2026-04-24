import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query("DELETE FROM residents WHERE line_display_name ILIKE '%toon pss%' AND is_active = false RETURNING id, line_display_name, house_number");
    console.log('Deleted:', res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
