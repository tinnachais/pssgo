import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Expected fields from LPR camera or Handheld
    const { license_plate, action, type, gate_name, image_url, visitor_id, created_at } = body;

    if (!license_plate) {
      return NextResponse.json({ error: "license_plate is required" }, { status: 400 });
    }

    // Ensure site_id column exists
    try {
      await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS site_id INT");
    } catch(e) {}

    const logAction = action || "IN";
    let logType = type || "VISITOR";
    let houseNumber = null;
    let detectedVisitorId = visitor_id || null;
    let siteId = null;
    let finalCreatedAt = created_at || "NOW()";

    // 1. Try detect from Resident
    const residentCheck = await query(
      "SELECT house_number, site_id FROM residents WHERE license_plate = $1 AND is_active = TRUE LIMIT 1",
      [license_plate]
    );

    if (residentCheck.rows.length > 0) {
      logType = "RESIDENT";
      houseNumber = residentCheck.rows[0].house_number;
      siteId = residentCheck.rows[0].site_id;
    }

    // 2. Detect if Visitor and Site from visitor
    if (logType === "VISITOR" && !detectedVisitorId) {
       const visitorCheck = await query(
         "SELECT id, site_id FROM visitors WHERE license_plate = $1 AND status != 'CANCELLED' ORDER BY created_at DESC LIMIT 1",
         [license_plate]
       );
       if (visitorCheck.rows.length > 0) {
         detectedVisitorId = visitorCheck.rows[0].id;
         if (!siteId) siteId = visitorCheck.rows[0].site_id;
       }
    } else if (detectedVisitorId && !siteId) {
       const v = await query("SELECT site_id FROM visitors WHERE id = $1", [detectedVisitorId]);
       if (v.rows.length > 0) siteId = v.rows[0].site_id;
    }

    // 3. Detect Site from Gate if still not found
    if (!siteId && gate_name) {
       const gateCheck = await query(
         "SELECT z.site_id FROM gates g JOIN zones z ON g.zone_id = z.id WHERE g.name = $1 LIMIT 1",
         [gate_name]
       );
       if (gateCheck.rows.length > 0) {
         siteId = gateCheck.rows[0].site_id;
       }
    }

    // Insert into access_logs (The table used by Monitor)
    const result = await query(
      `INSERT INTO access_logs 
      (license_plate, house_number, action, type, visitor_id, gate_name, image_url, site_id, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ${finalCreatedAt === "NOW()" ? "NOW()" : "$9"}) RETURNING id`,
      [
        license_plate,
        houseNumber,
        logAction,
        logType,
        detectedVisitorId,
        gate_name || "GATE_01",
        image_url || null,
        siteId,
        ...(finalCreatedAt === "NOW()" ? [] : [finalCreatedAt])
      ]
    );

    return NextResponse.json({ 
        success: true, 
        log_id: result.rows[0].id, 
        type: logType,
        house_number: houseNumber,
        message: `Success: ${logType} ${logAction} recorded.` 
    });

  } catch (error: any) {
    console.error("LPR Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
