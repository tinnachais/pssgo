import { query } from "./lib/db";

async function checkSchema() {
  try {
    const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables:", tables.rows.map(r => r.table_name));
    
    for (const table of ['sites', 'zones', 'gates']) {
      const columns = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table]);
      console.log(`Columns for ${table}:`, columns.rows);
    }
  } catch (err) {
    console.error(err);
  }
}

checkSchema();
