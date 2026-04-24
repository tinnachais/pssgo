const fs = require('fs'); 
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/liff.ts', 'utf8'); 

const startStr = 'export async function getLiffProfileData(lineUserId: string) {';
const idx = c.indexOf(startStr);
const endStr = '        if (!resident.site_lat || !resident.site_lng || !resident.site_contact_link) {';
const idx2 = c.indexOf(endStr, idx);

const newStr = `export async function getLiffProfileData(lineUserId: string, activeResidentId?: number) {
    try {
        await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT true");
        await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS parent_id INT DEFAULT NULL");
        await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS privacy_mode BOOLEAN DEFAULT FALSE");
        await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS notify_vehicle_access BOOLEAN DEFAULT true");

        await query("ALTER TABLE sites ADD COLUMN IF NOT EXISTS contact_link VARCHAR(255)");
        await query("ALTER TABLE sites ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMP");
        await query("ALTER TABLE sites ADD COLUMN IF NOT EXISTS enable_appointments BOOLEAN DEFAULT TRUE");
        
        const res = await query("SELECT r.*, s.name as site_name, s.lat as site_lat, s.lng as site_lng, s.contact_link as site_contact_link, s.package_expires_at, s.enable_appointments as site_enable_appointments FROM residents r LEFT JOIN sites s ON r.site_id = s.id WHERE r.line_user_id = $1 AND r.is_active = true ORDER BY r.id DESC", [lineUserId]);
        if (res.rows.length === 0) {
            return { isRegistered: false };
        }
        
        const availableResidents = res.rows;
        let resident = activeResidentId 
            ? availableResidents.find((r: any) => r.id === activeResidentId) 
            : availableResidents[0];
        
        if (!resident) resident = availableResidents[0];

`;
c = c.slice(0, idx) + newStr + c.slice(idx2); 
c = c.replace(/return {\s*isRegistered: true,\s*resident,\s*vehicles,/, 'return {\n            isRegistered: true,\n            resident,\n            availableResidents,\n            vehicles,');
fs.writeFileSync('c:/Toon/pssgo/app/actions/liff.ts', c);
