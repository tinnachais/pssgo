import { Pool } from "pg";
import { config } from "dotenv";
import path from "path";
import * as url from 'url';

config({ path: path.join(process.cwd(), ".env.local") });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function main() {
  const client = await pool.connect();
  console.log("Connected to DB, running migration on parking_fees...");

  try {
    await client.query(`
      ALTER TABLE parking_fees 
        ADD COLUMN IF NOT EXISTS fee_type VARCHAR(50) DEFAULT 'GENERAL',
        ADD COLUMN IF NOT EXISTS grace_period_minutes INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS free_hours_with_stamp INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS is_flat_rate BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS base_hourly_rate NUMERIC(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS has_tiered_rates BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS tiered_rates JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS rounding_minutes INT DEFAULT 15,
        ADD COLUMN IF NOT EXISTS daily_max_rate NUMERIC(10,2) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS has_overnight_penalty BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS overnight_penalty_rate NUMERIC(10,2) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS overnight_start_time TIME DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS overnight_end_time TIME DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS monthly_rate NUMERIC(10,2) DEFAULT NULL;
    `);

    try {
        await client.query(`ALTER TABLE parking_fees DROP COLUMN IF EXISTS amount;`);
    } catch(e) {
        // Ignore if error dropping
    }
    
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
