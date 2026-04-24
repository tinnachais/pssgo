const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/residents.ts', 'utf8');

const newCode = `
export async function getLiffUserActivityLogs(lineUserId: string) {
    if (!lineUserId) return [];

    try {
        // 1. Registration events
        const registrations = await query(\`
            SELECT id::text, created_at, 'REGISTER' as type, 
                   'สมัครใช้งาน/เข้าร่วมสถานที่' as title, 
                   house_number as detail 
            FROM residents 
            WHERE line_user_id = $1
        \`, [lineUserId]);

        // 2. Added vehicles
        const vehicles = await query(\`
            SELECT rv.id::text, rv.created_at, 'VEHICLE_ADD' as type, 
                   'เพิ่มทะเบียนรถ' as title, 
                   v.license_plate as detail
            FROM resident_vehicles rv
            JOIN residents r ON rv.resident_id = r.id
            JOIN vehicles v ON rv.vehicle_id = v.id
            WHERE r.line_user_id = $1
        \`, [lineUserId]);

        // 3. Shared vehicles
        const shares = await query(\`
            SELECT vs.id::text, vs.created_at, 'VEHICLE_SHARE' as type, 
                   'ได้รับสิทธิ์แชร์รถ' as title, 
                   v.license_plate as detail
            FROM vehicle_shares vs
            JOIN vehicles v ON vs.vehicle_id = v.id
            WHERE vs.line_user_id = $1
        \`, [lineUserId]);

        // 4. Access Logs
        const accessLogs = await query(\`
            SELECT al.id::text, al.created_at, 'ACCESS' as type, 
                   CASE WHEN al.action = 'IN' THEN 'เข้าสถานที่' ELSE 'ออกสถานที่' END as title,
                   al.license_plate || COALESCE(' (' || s.name || ')', '') as detail
            FROM access_logs al
            LEFT JOIN sites s ON al.site_id = s.id
            WHERE al.license_plate IN (
                SELECT v.license_plate FROM vehicles v
                JOIN resident_vehicles rv ON v.id = rv.vehicle_id
                JOIN residents r ON rv.resident_id = r.id
                WHERE r.line_user_id = $1
                UNION
                SELECT v.license_plate FROM vehicles v
                JOIN vehicle_shares vs ON v.id = vs.vehicle_id
                WHERE vs.line_user_id = $1
            )
            ORDER BY al.created_at DESC
            LIMIT 100
        \`, [lineUserId]);

        let logs = [
            ...registrations.rows,
            ...vehicles.rows,
            ...shares.rows,
            ...accessLogs.rows
        ];

        logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        return logs.slice(0, 200);
    } catch (err: any) {
        console.error(err);
        return [];
    }
}
`;

if (!c.includes('export async function getLiffUserActivityLogs')) {
    c = c + '\n' + newCode;
    fs.writeFileSync('c:/Toon/pssgo/app/actions/residents.ts', c);
    console.log("Added getLiffUserActivityLogs to residents.ts");
}
