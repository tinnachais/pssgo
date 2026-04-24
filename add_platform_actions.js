const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/residents.ts', 'utf8');

c += `

export async function getPlatformUser(lineUserId: string) {
    const userRes = await query("SELECT line_user_id, line_display_name, line_picture_url, phone_number FROM residents WHERE line_user_id = $1 LIMIT 1", [lineUserId]);
    const vehiclesRes = await query("SELECT id, license_plate, province, is_active FROM vehicles WHERE line_user_id = $1", [lineUserId]);
    
    if (userRes.rows.length === 0) return null;
    return {
        ...userRes.rows[0],
        vehicles: vehiclesRes.rows
    };
}

export async function updatePlatformUser(lineUserId: string, data: { phone_number: string }) {
    if (!lineUserId) throw new Error("Invalid User ID");
    
    await query("UPDATE residents SET phone_number = $1 WHERE line_user_id = $2", [data.phone_number, lineUserId]);
    revalidatePath("/liff-users");
    revalidatePath(\`/liff-users/edit/\${lineUserId}\`);
}
`;

fs.writeFileSync('c:/Toon/pssgo/app/actions/residents.ts', c);
console.log('Added platform user actions');
