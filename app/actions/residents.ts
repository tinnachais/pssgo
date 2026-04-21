"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { sendLineMessage, generateResidentFlexMessage } from "@/lib/line";

// ดึงข้อมูลผู้เช่า/ร้าน/บริษัททั้งหมด พร้อม ID รถที่ผูกติดอยู่
export async function getResidents() {
  // Ensure basic info and relationship columns exist
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150)");
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50)");
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT true");
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS parent_id INT DEFAULT NULL");
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS site_id INT DEFAULT NULL");

  // Create access logs table just in case
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'RESIDENT'");
  await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS visitor_log_id INT DEFAULT NULL");

  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let allowedProviderIds: number[] | null = null;
  const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;

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

  let queryStr = `
    SELECT r.*, s.name as site_name,
      (SELECT json_agg(json_build_object('id', v.id, 'license_plate', v.license_plate, 'province', v.province, 'is_active', v.is_active)) FROM vehicles v WHERE v.resident_id = r.id) as user_vehicles
    FROM residents r 
    LEFT JOIN sites s ON r.site_id = s.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (allowedProviderIds !== null) {
      params.push(allowedProviderIds);
      queryStr += ` AND s.provider_id = ANY($${params.length}::int[]) `;
  }

  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      queryStr += ` AND r.site_id = $${params.length} `;
  }

  queryStr += ` ORDER BY r.created_at DESC `;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getResident(id: number) {
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
    SELECT r.*, s.name as site_name, s.provider_id,
      (SELECT json_agg(json_build_object('id', v.id, 'license_plate', v.license_plate, 'province', v.province, 'is_active', v.is_active)) FROM vehicles v WHERE v.resident_id = r.id) as user_vehicles
    FROM residents r 
    LEFT JOIN sites s ON r.site_id = s.id
    WHERE r.id = $1
  `, [id]);
  
  const resi = result.rows[0] || null;

  if (resi && allowedProviderIds !== null && !allowedProviderIds.includes(resi.provider_id)) {
      return null;
  }

  return resi;
}

import crypto from "crypto";

// เพิ่มผู้เช่า/ร้าน/บริษัทใหม่พร้อมป้ายทะเบียน
export async function addResident(formData: FormData) {
  const houseNumber = formData.get("houseNumber") as string;
  const lpInput = formData.get("licensePlate") as string;
  const ownerName = formData.get("ownerName") as string || null;
  const phoneNumber = formData.get("phoneNumber") as string || null;
  const siteId = formData.get("siteId") as string || null;
  const houseMaxVehiclesRaw = formData.get("houseMaxVehicles") as string || null;
  const houseMaxVehicles = houseMaxVehiclesRaw !== null && houseMaxVehiclesRaw !== "" ? parseInt(houseMaxVehiclesRaw, 10) : null;
  const maxVehiclesRaw = formData.get("maxVehicles") as string || null;
  const maxVehicles = maxVehiclesRaw !== null && maxVehiclesRaw !== "" ? parseInt(maxVehiclesRaw, 10) : null;
  const licensePlate = lpInput ? lpInput.trim() : `รอลงทะเบียน-${Date.now()}`;

  if (!houseNumber) {
    throw new Error("Missing required fields");
  }

  // Ensure DB schema has the new fields
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150)");
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50)");
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS site_id INT DEFAULT NULL");
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS max_vehicles INT DEFAULT NULL");
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS house_max_vehicles INT DEFAULT NULL");

  // สร้าง Invite Code แบบสุ่ม (ตัวอย่าง: PSS-A1B2C3)
  const inviteCode = "PSS-" + crypto.randomBytes(3).toString("hex").toUpperCase();

  const insertedRes = await query(
    "INSERT INTO residents (house_number, license_plate, invite_code, owner_name, phone_number, site_id, max_vehicles, house_max_vehicles) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
    [houseNumber, licensePlate, inviteCode, ownerName, phoneNumber, siteId ? parseInt(siteId, 10) : null, maxVehicles, houseMaxVehicles]
  );
  const newResidentId = insertedRes.rows[0].id;

  await query("ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS resident_id INT DEFAULT NULL");

  // นำป้ายทะเบียนที่ผู้เช่า/ร้าน/บริษัทเพิ่ม ไปใส่ไว้ในตารางยานพาหนะรวมศูนย์ด้วย
  if (!licensePlate.startsWith("รอลงทะเบียน-")) {
    await query(
      "INSERT INTO vehicles (license_plate, house_number, resident_id) VALUES ($1, $2, $3)",
      [licensePlate, houseNumber, newResidentId]
    );
  }

  revalidatePath("/residents");
  revalidatePath("/", "layout");
  redirect("/residents");
}

export async function updateResidentProfile(id: number, formData: FormData) {
  const ownerName = formData.get("ownerName") as string || null;
  const phoneNumber = formData.get("phoneNumber") as string || null;
  const maxVehiclesRaw = formData.get("maxVehicles") as string || null;
  const maxVehicles = maxVehiclesRaw !== null && maxVehiclesRaw !== "" ? parseInt(maxVehiclesRaw, 10) : null;

  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150)");
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50)");
  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS max_vehicles INT DEFAULT NULL");

  await query(
    "UPDATE residents SET owner_name = $1, phone_number = $2, max_vehicles = $3 WHERE id = $4",
    [ownerName, phoneNumber, maxVehicles, id]
  );

  revalidatePath("/residents");
  revalidatePath("/", "layout");
  redirect("/residents");
}

export async function updateHouseData(id: number, formData: FormData) {
  const houseNumber = formData.get("houseNumber") as string;
  const siteId = formData.get("siteId") as string || null;
  const houseMaxVehiclesRaw = formData.get("houseMaxVehicles") as string || null;
  const houseMaxVehicles = houseMaxVehiclesRaw !== null && houseMaxVehiclesRaw !== "" ? parseInt(houseMaxVehiclesRaw, 10) : null;

  if (!houseNumber) {
    throw new Error("Missing required fields");
  }

  await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS house_max_vehicles INT DEFAULT NULL");

  // Get current house number to update vehicles and family members later
  const currentResident = await query("SELECT house_number, is_owner FROM residents WHERE id = $1", [id]);
  if (currentResident.rows.length === 0 || !currentResident.rows[0].is_owner) {
     throw new Error("Only the house owner's record can change house data");
  }

  const oldHouseNumber = currentResident.rows[0].house_number;

  // Update this resident and all family members with the house fields
  await query(
    "UPDATE residents SET house_number = $1, site_id = $2, house_max_vehicles = $3 WHERE id = $4 OR parent_id = $4",
    [houseNumber, siteId ? parseInt(siteId, 10) : null, houseMaxVehicles, id]
  );

  // Update vehicles associated with the old house number (ensure they move to the new house number)
  if (oldHouseNumber && oldHouseNumber !== houseNumber) {
     await query("UPDATE vehicles SET house_number = $1, site_id = $2 WHERE house_number = $3", [houseNumber, siteId ? parseInt(siteId, 10) : null, oldHouseNumber]);
     await query("UPDATE access_logs SET house_number = $1 WHERE house_number = $2", [houseNumber, oldHouseNumber]);
  }

  revalidatePath("/residents");
  revalidatePath("/", "layout");
  redirect("/residents");
}

// เปิด/ปิด สถานะรถของผู้เช่า/ร้าน/บริษัท
export async function toggleResidentStatus(id: number, isActive: boolean) {
  await query("UPDATE residents SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/residents");
  revalidatePath("/", "layout");
}

// ลบข้อมูลรถออกจากระบบ
export async function deleteResident(id: number) {
  await query("DELETE FROM residents WHERE id = $1", [id]);
  revalidatePath("/residents");
  revalidatePath("/", "layout");
}

export async function deleteHouse(houseNumber: string, siteId: number | null) {
  if (!siteId) {
     await query("DELETE FROM residents WHERE house_number = $1 AND site_id IS NULL", [houseNumber]);
     await query("DELETE FROM vehicles WHERE house_number = $1 AND site_id IS NULL", [houseNumber]);
  } else {
     await query("DELETE FROM residents WHERE house_number = $1 AND site_id = $2", [houseNumber, siteId]);
     await query("DELETE FROM vehicles WHERE house_number = $1 AND (site_id = $2 OR site_id IS NULL)", [houseNumber, siteId]);
  }
  revalidatePath("/residents");
  revalidatePath("/", "layout");
}

export async function toggleHouseStatus(houseNumber: string, siteId: number | null, isActive: boolean) {
  if (!siteId) {
     await query("UPDATE residents SET is_active = $1 WHERE house_number = $2 AND site_id IS NULL", [isActive, houseNumber]);
     await query("UPDATE vehicles SET is_active = $1 WHERE house_number = $2 AND site_id IS NULL", [isActive, houseNumber]);
  } else {
     await query("UPDATE residents SET is_active = $1 WHERE house_number = $2 AND site_id = $3", [isActive, houseNumber, siteId]);
     await query("UPDATE vehicles SET is_active = $1 WHERE house_number = $2 AND (site_id = $3 OR site_id IS NULL)", [isActive, houseNumber, siteId]);
  }
  revalidatePath("/residents");
  revalidatePath("/", "layout");
}

export async function logResidentAccess(licensePlate: string, houseNumber: string, action: 'IN' | 'OUT') {
  await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'RESIDENT'");
  await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS visitor_log_id INT DEFAULT NULL");

  await query(`
    INSERT INTO access_logs (license_plate, house_number, action, type, gate_name)
    VALUES ($1, $2, $3, 'RESIDENT', 'Gate 1 (Manual Test)')
  `, [licensePlate, houseNumber, action]);

  // Send LINE push notification
  try {
     const notifyRes = await query("SELECT r.line_user_id, s.name as site_name FROM residents r LEFT JOIN sites s ON r.site_id = s.id WHERE r.house_number = $1 AND r.is_active = true AND r.line_user_id IS NOT NULL", [houseNumber]);
     if (notifyRes.rows.length > 0) {
         const siteName = notifyRes.rows[0].site_name;
         // Assume imageUrl is null for now since manual log doesn't include picture
         const messages = generateResidentFlexMessage(licensePlate, action, siteName);
         for (const r of notifyRes.rows) {
            await sendLineMessage(r.line_user_id, messages);
         }
     }
  } catch (e) {
     console.error("Failed to push manual log:", e);
  }

  revalidatePath("/residents");
}
