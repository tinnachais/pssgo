const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/actions/sites.ts', 'utf8');
if (!c.includes('bulkAddSites')) {
    c += `
export async function bulkAddSites(rows: any[]) {
  const crypto = await import("crypto");
  for (const row of rows) {
    if (!row.name) continue;
    const apiToken = crypto.randomBytes(32).toString("hex");
    
    // Auto map Type from Thai names if provided
    let type = row.type || "TIER1_PRIVATE";
    if (row.type && row.type.includes("Tier 1")) type = "TIER1_PRIVATE";
    if (row.type && row.type.includes("Tier 2")) type = "TIER2_PUBLIC_CITY";
    if (row.type && row.type.includes("Tier 3")) type = "TIER3_PUBLIC_PSS";
    if (row.type && row.type.includes("Tier 4")) type = "TIER4_PUBLIC_OTHERS";

    await query(
      "INSERT INTO sites (name, address, provider_id, max_vehicles, lat, lng, contact_link, package_id, api_token, type, enable_appointments, enable_visitor_id_exchange, mock_slots_car, mock_slots_motorcycle, mock_fee_car, mock_fee_motorcycle, mock_free_time_car, mock_free_time_motorcycle) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)",
      [
        row.name, 
        row.address || null, 
        row.provider_id ? parseInt(row.provider_id) : null, 
        row.max_vehicles ? parseInt(row.max_vehicles) : 1, 
        row.lat ? parseFloat(row.lat) : null, 
        row.lng ? parseFloat(row.lng) : null, 
        row.contact_link || null, 
        row.package_id ? parseInt(row.package_id) : null, 
        apiToken, 
        type, 
        row.enable_appointments !== false && row.enable_appointments !== "false" && row.enable_appointments !== 0 && row.enable_appointments !== "0", 
        row.enable_visitor_id_exchange !== false && row.enable_visitor_id_exchange !== "false" && row.enable_visitor_id_exchange !== 0 && row.enable_visitor_id_exchange !== "0", 
        row.mock_slots_car ? parseInt(row.mock_slots_car) : null, 
        row.mock_slots_motorcycle ? parseInt(row.mock_slots_motorcycle) : null, 
        row.mock_fee_car || null, 
        row.mock_fee_motorcycle || null, 
        row.mock_free_time_car || null, 
        row.mock_free_time_motorcycle || null
      ]
    );
  }
  revalidatePath("/sites");
}
`;
    fs.writeFileSync('c:/Toon/pssgo/app/actions/sites.ts', c);
    console.log('Added bulkAddSites');
}
