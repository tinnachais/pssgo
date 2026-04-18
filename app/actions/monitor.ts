"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAccessLogs(limit: number = 50) {
  const { unstable_noStore: noStore } = await import("next/cache");
  noStore();

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;

  // สร้างตารางเพื่อความแน่ใจ
  await query(`
    CREATE TABLE IF NOT EXISTS access_logs (
        id SERIAL PRIMARY KEY,
        license_plate VARCHAR(50),
        house_number VARCHAR(50),
        action VARCHAR(10),
        type VARCHAR(20) DEFAULT 'RESIDENT',
        visitor_log_id INT DEFAULT NULL,
        image_url TEXT,
        gate_name VARCHAR(100),
        site_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'RESIDENT'");
  await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS visitor_id INT DEFAULT NULL");
  await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS site_id INT DEFAULT NULL");

  let queryStr = `
    WITH valid_logs AS (
      SELECT al.id, al.license_plate, al.house_number, al.action, al.type, al.visitor_id, al.image_url, al.gate_name, al.created_at, 
        COALESCE(
           al.site_id,
           (SELECT site_id FROM vehicles WHERE license_plate = al.license_plate LIMIT 1),
           (SELECT site_id FROM visitors WHERE id = al.visitor_id LIMIT 1),
           (SELECT z.site_id FROM gates g JOIN zones z ON g.zone_id = z.id WHERE g.name = al.gate_name LIMIT 1),
           (SELECT site_id FROM residents WHERE house_number = al.house_number LIMIT 1)
        ) as calculated_site_id
      FROM access_logs al
    ),
    sessionize AS (
      SELECT vl.id, vl.license_plate, vl.house_number, vl.action, vl.type, vl.visitor_id, vl.image_url, vl.gate_name, vl.created_at, s.provider_id, vl.calculated_site_id as site_id,
             SUM(CASE WHEN vl.action = 'IN' THEN 1 ELSE 0 END) OVER (
                 PARTITION BY COALESCE(NULLIF(vl.license_plate, 'UNKNOWN'), 'VISITOR_' || vl.visitor_id::text, 'LOG_' || vl.id::text) 
                 ORDER BY vl.created_at ASC
             ) as session_id,
             COALESCE(NULLIF(vl.license_plate, 'UNKNOWN'), 'VISITOR_' || vl.visitor_id::text, 'LOG_' || vl.id::text) as session_group
      FROM valid_logs vl
      LEFT JOIN sites s ON vl.calculated_site_id = s.id
    ),
    paired_logs AS (
      SELECT 
        MAX(id) as id,
        MAX(license_plate) as license_plate,
        MAX(house_number) as house_number,
        MAX(type) as type,
        MAX(visitor_id) as visitor_id,
        MIN(CASE WHEN action = 'IN' THEN created_at END) as time_in,
        MAX(CASE WHEN action = 'OUT' THEN created_at END) as time_out,
        MAX(CASE WHEN action = 'IN' THEN gate_name END) as gate_in,
        MAX(CASE WHEN action = 'OUT' THEN gate_name END) as gate_out,
        MAX(CASE WHEN action = 'IN' THEN image_url END) as image_in,
        MAX(CASE WHEN action = 'OUT' THEN image_url END) as image_out,
        MAX(created_at) as last_event,
        MAX(site_id) as site_id,
        MAX(provider_id) as provider_id
      FROM sessionize
      GROUP BY session_group, session_id
    )
    SELECT p.*,
       v.id as vehicle_id, v.brand as vehicle_brand, v.color as vehicle_color,
       vl.purpose as visitor_purpose, 'N/A' as e_stamp_status,
       pt.name as park_type_name,
       (SELECT SUM(amount) FROM revenues WHERE visitor_id = p.visitor_id AND payment_status = 'PAID') as total_revenue
    FROM paired_logs p
    LEFT JOIN (
       SELECT *, ROW_NUMBER() OVER(PARTITION BY license_plate ORDER BY id DESC) as rn FROM vehicles
    ) v ON p.license_plate = v.license_plate AND v.rn = 1
    LEFT JOIN park_types pt ON v.park_type_id = pt.id
    LEFT JOIN visitors vl ON p.visitor_id = vl.id
    WHERE 1=1
  `;
  
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let allowedProviderIds: number[] | null = null;
  let isAdmin = false;
  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId === "admin") {
             isAdmin = true;
          } else if (decoded.userId) {
              const { getUser } = await import("./users");
              const u = await getUser(Number(decoded.userId));
              if (u && Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
                 allowedProviderIds = u.provider_ids;
              } else {
                 allowedProviderIds = [];
              }
          }
      } catch (e) {}
  }

  const params: any[] = [];
  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      queryStr += ` AND p.site_id = $${params.length} `;
  } else if (!isAdmin && allowedProviderIds) {
      if (allowedProviderIds.length > 0) {
          params.push(allowedProviderIds);
          queryStr += ` AND p.provider_id = ANY($${params.length}::int[]) `;
      } else {
          queryStr += ` AND 1=0 `;
      }
  }

  params.push(limit);
  queryStr += ` ORDER BY p.last_event DESC LIMIT $${params.length} `;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getMonitorStats() {
  const { unstable_noStore: noStore } = await import("next/cache");
  noStore();

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;
  const sessionData = cookieStore.get("pssgo_session")?.value;

  let allowedProviderIds: number[] | null = null;
  let isAdmin = false;
  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId === "admin") {
             isAdmin = true;
          } else if (decoded.userId) {
              const { getUser } = await import("./users");
              const u = await getUser(Number(decoded.userId));
              if (u && Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
                 allowedProviderIds = u.provider_ids;
              } else {
                 allowedProviderIds = [];
              }
          }
      } catch (e) {}
  }

  let statsQuery = `
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

  const params: any[] = [];
  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      statsQuery += ` AND valid_logs.site_id = $${params.length} `;
  } else if (!isAdmin && allowedProviderIds) {
      if (allowedProviderIds.length > 0) {
          params.push(allowedProviderIds);
          statsQuery += ` AND s.provider_id = ANY($${params.length}::int[]) `;
      } else {
          statsQuery += ` AND 1=0 `;
      }
  }

  const statsRes = await query(statsQuery, params);
  
  let activeQuery = `
    WITH valid_logs AS (
      SELECT al.id, al.license_plate, al.visitor_id, al.action, al.type, al.created_at,
        COALESCE(
           al.site_id,
           (SELECT site_id FROM vehicles WHERE license_plate = al.license_plate LIMIT 1),
           (SELECT site_id FROM visitors WHERE id = al.visitor_id LIMIT 1),
           (SELECT z.site_id FROM gates g JOIN zones z ON g.zone_id = z.id WHERE g.name = al.gate_name LIMIT 1),
           (SELECT site_id FROM residents WHERE house_number = al.house_number LIMIT 1)
        ) as calculated_site_id
      FROM access_logs al
    ),
    sessionize AS (
      SELECT vl.id, vl.license_plate, vl.visitor_id, vl.action, vl.type, vl.created_at, s.provider_id, vl.calculated_site_id as site_id,
             SUM(CASE WHEN vl.action = 'IN' THEN 1 ELSE 0 END) OVER (
                 PARTITION BY COALESCE(NULLIF(vl.license_plate, 'UNKNOWN'), 'VISITOR_' || vl.visitor_id::text, 'LOG_' || vl.id::text) 
                 ORDER BY vl.created_at ASC
             ) as session_id,
             COALESCE(NULLIF(vl.license_plate, 'UNKNOWN'), 'VISITOR_' || vl.visitor_id::text, 'LOG_' || vl.id::text) as session_group
      FROM valid_logs vl
      LEFT JOIN sites s ON vl.calculated_site_id = s.id
    ),
    paired AS (
      SELECT session_group, MIN(CASE WHEN action = 'IN' THEN created_at END) as time_in, MAX(CASE WHEN action = 'OUT' THEN created_at END) as time_out, MAX(type) as type, MAX(site_id) as site_id, MAX(provider_id) as provider_id
      FROM sessionize GROUP BY session_group, session_id
    )
    SELECT 
      COUNT(*) as currently_inside,
      COUNT(CASE WHEN type = 'RESIDENT' THEN 1 END) as inside_resident,
      COUNT(CASE WHEN type != 'RESIDENT' THEN 1 END) as inside_visitor
    FROM paired WHERE time_in IS NOT NULL AND time_out IS NULL
  `;
  
  const activeParams: any[] = [];
  if (selectedSiteId && selectedSiteId !== "all") {
      activeParams.push(parseInt(selectedSiteId, 10));
      activeQuery += ` AND site_id = $${activeParams.length} `;
  } else if (!isAdmin && allowedProviderIds) {
      if (allowedProviderIds.length > 0) {
          activeParams.push(allowedProviderIds);
          activeQuery += ` AND provider_id = ANY($${activeParams.length}::int[]) `;
      } else {
          activeQuery += ` AND 1=0 `;
      }
  }

  const activeRes = await query(activeQuery, activeParams);
  
  return {
      total_in: parseInt(statsRes.rows[0]?.total_in || '0', 10),
      total_out: parseInt(statsRes.rows[0]?.total_out || '0', 10),
      in_resident: parseInt(statsRes.rows[0]?.in_resident || '0', 10),
      in_visitor: parseInt(statsRes.rows[0]?.in_visitor || '0', 10),
      out_resident: parseInt(statsRes.rows[0]?.out_resident || '0', 10),
      out_visitor: parseInt(statsRes.rows[0]?.out_visitor || '0', 10),
      currently_inside: parseInt(activeRes.rows[0]?.currently_inside || '0', 10),
      inside_resident: parseInt(activeRes.rows[0]?.inside_resident || '0', 10),
      inside_visitor: parseInt(activeRes.rows[0]?.inside_visitor || '0', 10)
  };
}

export async function clearAccessLogs() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  
  let isAuthorized = false;

  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId === "admin") {
              isAuthorized = true;
          } else if (decoded.userId) {
              const { getUser } = await import("./users");
              const u = await getUser(Number(decoded.userId));
              // Check for role 'Admin' or level 'Level1' (highest level)
              if (u && (u.role === "Admin" || u.role === "admin" || u.level === "Level1")) {
                  isAuthorized = true;
              }
          }
      } catch (e) {
          return { error: "Authentication failed" };
      }
  } else {
      return { error: "No session found" };
  }

  if (!isAuthorized) {
      return { error: "สิทธิ์ไม่เพียงพอ เฉพาะแอดมินเท่านั้น" };
  }

  try {
      await query("TRUNCATE TABLE access_logs RESTART IDENTITY CASCADE");
      revalidatePath("/monitor");
      revalidatePath("/", "layout");
      return { success: true };
  } catch (err: any) {
      console.error("CLEAR LOGS ERROR:", err);
      return { error: err.message || "Failed to clear logs" };
  }
}
