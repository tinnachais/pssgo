require('dotenv').config({path:'.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const statsQuery = `
    WITH valid_logs AS (
      SELECT al.id, al.action, al.type,
        COALESCE(
           al.site_id,
           (SELECT site_id FROM vehicles WHERE license_plate = al.license_plate LIMIT 1),
           (SELECT site_id FROM visitors WHERE id = al.visitor_id LIMIT 1),
           (SELECT z.site_id FROM gates g JOIN zones z ON g.zone_id = z.id WHERE g.name = al.gate_name LIMIT 1),
           (SELECT site_id FROM residents WHERE house_number = al.house_number LIMIT 1)
        ) as site_id
      FROM access_logs al
      WHERE DATE(al.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') = DATE(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok') OR DATE(al.created_at) = CURRENT_DATE
    )
    SELECT
      COUNT(DISTINCT CASE WHEN valid_logs.action = 'IN' THEN valid_logs.id END) as total_in,
      COUNT(DISTINCT CASE WHEN valid_logs.action = 'OUT' THEN valid_logs.id END) as total_out,
      COUNT(DISTINCT CASE WHEN valid_logs.action = 'IN' AND valid_logs.type = 'RESIDENT' THEN valid_logs.id END) as in_resident,
      COUNT(DISTINCT CASE WHEN valid_logs.action = 'IN' AND valid_logs.type != 'RESIDENT' THEN valid_logs.id END) as in_visitor,
      COUNT(DISTINCT CASE WHEN valid_logs.action = 'OUT' AND valid_logs.type = 'RESIDENT' THEN valid_logs.id END) as out_resident,
      COUNT(DISTINCT CASE WHEN valid_logs.action = 'OUT' AND valid_logs.type != 'RESIDENT' THEN valid_logs.id END) as out_visitor
    FROM valid_logs
    LEFT JOIN sites s ON valid_logs.site_id = s.id
    WHERE 1=1
`;
pool.query(statsQuery).then(res => { console.log('Stats:', res.rows); pool.end(); });
