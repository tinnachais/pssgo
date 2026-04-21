"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function getSites() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let allowedProviderIds: number[] | null = null;
  let allowedSiteIds: number[] | null = null;

  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId === "admin") {
              // Super admin see all
          } else if (decoded.userId) {
              const { getUser } = await import("./users");
              const u = await getUser(Number(decoded.userId));
              
              if (u) {
                  const level = u.level || "Level1";
                  
                  if (level === "Level1") {
                      // Level 1 see all
                  } else if (level === "Level2") {
                      // Level 2 see only assigned providers' sites
                      allowedProviderIds = Array.isArray(u.provider_ids) ? u.provider_ids : [];
                      if (allowedProviderIds && allowedProviderIds.length === 0) return [];
                  } else if (level === "Level3") {
                      // Level 3 see only assigned sites
                      allowedSiteIds = Array.isArray(u.site_ids) ? u.site_ids : [];
                      if (allowedSiteIds && allowedSiteIds.length === 0) return [];
                  }
              }
          }
      } catch (e) {
          console.error("error in getSites session processing", e);
      }
  }

  let queryStr = `
    SELECT sites.*, providers.name as provider_name, packages.name as package_name, packages.max_vehicles as package_max_vehicles,
    COALESCE(
      (
        SELECT json_agg(json_build_object('id', zones.id, 'name', zones.name, 'is_active', zones.is_active))
        FROM zones
        WHERE zones.site_id = sites.id
      ), 
      '[]'::json
    ) as zones_data,
    (SELECT COUNT(DISTINCT house_number) FROM residents WHERE site_id = sites.id) as total_houses,
    (SELECT COUNT(*) FROM residents WHERE site_id = sites.id AND is_active = true) as total_residents,
    (SELECT COUNT(*) FROM vehicles WHERE site_id = sites.id AND is_active = true) as total_vehicles
    FROM sites 
    LEFT JOIN providers ON sites.provider_id = providers.id 
    LEFT JOIN packages ON sites.package_id = packages.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (allowedSiteIds !== null) {
      if (allowedSiteIds.length > 0) {
          queryStr += ' AND sites.id = ANY($1::int[])';
          params.push(allowedSiteIds);
      } else {
          return [];
      }
  } else if (allowedProviderIds !== null) {
      if (allowedProviderIds.length > 0) {
          queryStr += ' AND sites.provider_id = ANY($1::int[])';
          params.push(allowedProviderIds);
      } else {
          return [];
      }
  }

  queryStr += ` ORDER BY sites.created_at DESC `;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getSite(id: number) {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let allowedProviderIds: number[] | null = null;

  if (sessionData) {
     try {
       const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
       if (decoded.userId && decoded.userId !== "admin") {
           const { getUser } = await import("./users");
           const u = await getUser(Number(decoded.userId));
           if (u && Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
               allowedProviderIds = u.provider_ids;
           }
       }
     } catch (e) {}
  }

  const result = await query(`
    SELECT sites.*, providers.name as provider_name, packages.name as package_name,
    COALESCE(
      (
        SELECT json_agg(json_build_object('id', zones.id, 'name', zones.name, 'is_active', zones.is_active))
        FROM zones
        WHERE zones.site_id = sites.id
      ), 
      '[]'::json
    ) as zones_data,
    (SELECT COUNT(DISTINCT house_number) FROM residents WHERE site_id = sites.id) as total_houses,
    (SELECT COUNT(*) FROM residents WHERE site_id = sites.id AND is_active = true) as total_residents,
    (SELECT COUNT(*) FROM vehicles WHERE site_id = sites.id AND is_active = true) as total_vehicles
    FROM sites 
    LEFT JOIN providers ON sites.provider_id = providers.id 
    LEFT JOIN packages ON sites.package_id = packages.id
    WHERE sites.id = $1
  `, [id]);
  const site = result.rows[0] || null;

  if (site && allowedProviderIds !== null && !allowedProviderIds.includes(site.provider_id)) {
      return null;
  }

  return site;
}

export async function addSite(formData: FormData) {
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const providerId = formData.get("providerId") as string;
  const maxVehicles = formData.get("maxVehicles") as string;
  const lat = formData.get("lat") as string;
  const lng = formData.get("lng") as string;
  const contactLink = formData.get("contactLink") as string;
  const autoSetup = formData.get("autoSetup") as string;

  if (!name) {
    throw new Error("Missing required fields");
  }

  await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS max_vehicles INT DEFAULT 1');
  await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8)');
  await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8)');
  await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS contact_link VARCHAR(255)');

  const result = await query(
    "INSERT INTO sites (name, address, provider_id, max_vehicles, lat, lng, contact_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
    [
      name, 
      address || null, 
      providerId ? parseInt(providerId, 10) : null, 
      maxVehicles ? parseInt(maxVehicles, 10) : 1, 
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null,
      contactLink || null
    ]
  );
  
  const siteId = result.rows[0].id;

  if (autoSetup === "on" && providerId) {
      // 1. Create default Zone
      const zoneRes = await query("INSERT INTO zones (site_id, name) VALUES ($1, $2) RETURNING id", [siteId, 'โซนหลัก']);
      const zoneId = zoneRes.rows.length > 0 ? zoneRes.rows[0].id : null;
      
      // 2. Create default Gate
      await query("INSERT INTO gates (site_id, zone_id, name) VALUES ($1, $2, $3)", [siteId, zoneId, 'ประตูหลัก (ทางเข้า)']);
      await query("INSERT INTO gates (site_id, zone_id, name) VALUES ($1, $2, $3)", [siteId, zoneId, 'ประตูหลัก (ทางออก)']);
      
      // Ensure providers table has these columns before querying
      await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS contact_name TEXT DEFAULT NULL");
      await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT NULL");
      
      // 3. Create Resident using Provider Info
      const pRes = await query("SELECT name, phone_number, contact_name FROM providers WHERE id = $1", [parseInt(providerId, 10)]);
      if (pRes.rows.length > 0) {
          const provider = pRes.rows[0];
          const crypto = await import("crypto");
          const inviteCode = "PSS-" + crypto.randomBytes(3).toString("hex").toUpperCase();
          const ownerName = provider.contact_name || provider.name;
          
          await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150)");
          await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50)");
          await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS site_id INT DEFAULT NULL");

          await query(
            "INSERT INTO residents (site_id, house_number, phone_number, owner_name, license_plate, invite_code) VALUES ($1, $2, $3, $4, $5, $6)", 
            [siteId, 'นิติบุคคล', provider.phone_number || null, ownerName, `รอลงทะเบียน-${Date.now()}`, inviteCode]
          );
      }
  }

  revalidatePath("/sites");
  redirect("/sites");
}

export async function toggleSiteStatus(id: number, isActive: boolean) {
  await query("UPDATE sites SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/sites");
}

export async function deleteSite(id: number) {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;

  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId && decoded.userId !== "admin") {
              const { getUser } = await import("./users");
              const u = await getUser(Number(decoded.userId));
              if (u && u.level === "Level3") {
                  throw new Error("L3_RESTRICTION");
              }
          }
      } catch (e: any) {
          if (e.message === "L3_RESTRICTION") throw new Error("ผู้ใช้งานระดับ L3 ไม่มีสิทธิ์ลบโครงการได้");
      }
  }

  await query("DELETE FROM sites WHERE id = $1", [id]);
  revalidatePath("/sites");
}

export async function updateSite(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const providerId = formData.get("providerId") as string;
  const maxVehicles = formData.get("maxVehicles") as string;
  const lat = formData.get("lat") as string;
  const lng = formData.get("lng") as string;
  const contactLink = formData.get("contactLink") as string;

  if (!name) {
    throw new Error("Missing required fields");
  }

  await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS max_vehicles INT DEFAULT 1');
  await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8)');
  await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8)');
  await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS contact_link VARCHAR(255)');

  await query(
    "UPDATE sites SET name = $1, address = $2, provider_id = $3, max_vehicles = $4, lat = $5, lng = $6, contact_link = $7 WHERE id = $8",
    [
      name, 
      address || null, 
      providerId ? parseInt(providerId, 10) : null, 
      maxVehicles ? parseInt(maxVehicles, 10) : 1, 
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null,
      contactLink || null,
      id
    ]
  );
  revalidatePath("/sites");
  redirect("/sites");
}
