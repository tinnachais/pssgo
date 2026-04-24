const fs = require('fs');

async function fixTypes() {
    require('dotenv').config({ path: '.env.local' });
    const { Pool } = require('pg');
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    await pool.query("UPDATE sites SET type = 'TIER1_PRIVATE' WHERE type = 'PRIVATE' OR type IS NULL;");
    await pool.query("UPDATE sites SET type = 'TIER2_PUBLIC_CITY' WHERE type = 'PUBLIC';");
    await pool.query("UPDATE sites SET type = 'TIER4_PUBLIC_OTHERS' WHERE type = 'MOCK_PUBLIC';");
    
    console.log("DB Updated");
    pool.end();
}

fixTypes();
