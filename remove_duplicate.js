const fs = require('fs'); 
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/liff.ts', 'utf8'); 

const oldCode = `export async function getPublicSites() {
    try {
        const res = await query("SELECT * FROM sites WHERE is_public = true AND is_active = true");
        return res.rows;
    } catch (err: any) {
        return [];
    }
}`;

const idx = c.lastIndexOf(oldCode);
if (idx !== -1) {
    c = c.slice(0, idx) + c.slice(idx + oldCode.length);
}

fs.writeFileSync('c:/Toon/pssgo/app/actions/liff.ts', c);
