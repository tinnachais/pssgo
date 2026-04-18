"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function getVehicles() {
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
    SELECT v.*, 
           s.name as site_name, 
           vt.name as type_name, 
           vt.code as type_code,
           pt.name as park_type_name,
           pt.code as park_type_code
    FROM vehicles v
    LEFT JOIN sites s ON v.site_id = s.id
    LEFT JOIN vehicle_types vt ON v.type_id = vt.id
    LEFT JOIN park_types pt ON v.park_type_id = pt.id
    WHERE 1=1
  `;
  
  const params: any[] = [];
  if (allowedProviderIds !== null) {
      params.push(allowedProviderIds);
      queryStr += ` AND s.provider_id = ANY($${params.length}::int[]) `;
  }

  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      queryStr += ` AND v.site_id = $${params.length} `;
  }

  queryStr += ` ORDER BY v.created_at DESC `;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getVehicle(id: number) {
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
     SELECT v.*, s.provider_id
     FROM vehicles v
     LEFT JOIN sites s ON v.site_id = s.id
     WHERE v.id = $1
  `, [id]);
  
  const veh = result.rows[0] || null;

  if (veh && allowedProviderIds !== null && !allowedProviderIds.includes(veh.provider_id)) {
      return null;
  }

  return veh;
}

export async function addVehicle(formData: FormData) {
  const licensePlate = formData.get("licensePlate") as string;
  const province = formData.get("province") as string;
  const typeId = formData.get("typeId") as string;
  const parkTypeId = formData.get("parkTypeId") as string;
  const brand = formData.get("brand") as string;
  const color = formData.get("color") as string;
  const residentId = formData.get("residentId") as string;

  if (!residentId || !licensePlate) throw new Error("Missing required fields");

  await query('ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS resident_id INT DEFAULT NULL');

  const residentQuery = await query(`SELECT site_id, house_number, owner_name FROM residents WHERE id = $1`, [parseInt(residentId, 10)]);
  const resident = residentQuery.rows[0];
  if (!resident) throw new Error("Resident not found");

  await query(`
    INSERT INTO vehicles (site_id, license_plate, province, type_id, park_type_id, brand, color, owner_name, house_number, resident_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [
    resident.site_id || null, licensePlate, province || null,
    typeId ? parseInt(typeId, 10) : null,
    parkTypeId ? parseInt(parkTypeId, 10) : null,
    brand || null, color || null, resident.owner_name || null, resident.house_number || null,
    parseInt(residentId, 10)
  ]);
  
  revalidatePath("/vehicles");
  revalidatePath("/", "layout");
  redirect("/vehicles");
}

export async function updateVehicle(id: number, formData: FormData) {
  const licensePlate = formData.get("licensePlate") as string;
  const province = formData.get("province") as string;
  const typeId = formData.get("typeId") as string;
  const parkTypeId = formData.get("parkTypeId") as string;
  const brand = formData.get("brand") as string;
  const color = formData.get("color") as string;
  const residentId = formData.get("residentId") as string;

  if (!residentId || !licensePlate) throw new Error("Missing required fields");

  await query('ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS resident_id INT DEFAULT NULL');

  const residentQuery = await query(`SELECT site_id, house_number, owner_name FROM residents WHERE id = $1`, [parseInt(residentId, 10)]);
  const resident = residentQuery.rows[0];
  if (!resident) throw new Error("Resident not found");

  await query(`
    UPDATE vehicles 
    SET site_id = $1, license_plate = $2, province = $3, type_id = $4, park_type_id = $5, brand = $6, color = $7, owner_name = $8, house_number = $9, resident_id = $10
    WHERE id = $11
  `, [
    resident.site_id || null, licensePlate, province || null,
    typeId ? parseInt(typeId, 10) : null,
    parkTypeId ? parseInt(parkTypeId, 10) : null,
    brand || null, color || null, resident.owner_name || null, resident.house_number || null,
    parseInt(residentId, 10), id
  ]);
  
  revalidatePath("/vehicles");
  revalidatePath("/", "layout");
  redirect("/vehicles");
}

export async function deleteVehicle(id: number) {
  await query("DELETE FROM vehicles WHERE id = $1", [id]);
  revalidatePath("/vehicles");
  revalidatePath("/", "layout");
}

export async function toggleVehicleStatus(id: number, isActive: boolean) {
  await query("UPDATE vehicles SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/vehicles");
  revalidatePath("/", "layout");
}
