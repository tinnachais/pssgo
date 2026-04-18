"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function getVehicleTypes() {
  await query("ALTER TABLE vehicle_types ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL");

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

  let queryStr = "SELECT * FROM vehicle_types";
  const params: any[] = [];

  if (allowedProviderIds !== null) {
      queryStr += " WHERE provider_id IS NULL OR provider_id = ANY($1::int[])";
      params.push(allowedProviderIds);
  }

  queryStr += " ORDER BY created_at ASC";

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getVehicleType(id: number) {
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

  const result = await query("SELECT * FROM vehicle_types WHERE id = $1", [id]);
  const type = result.rows[0] || null;

  if (type && type.provider_id && allowedProviderIds !== null && !allowedProviderIds.includes(type.provider_id)) {
      return null;
  }

  return type;
}

export async function addVehicleType(formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name || !code) throw new Error("Missing required fields");

  await query("ALTER TABLE vehicle_types ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL");

  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let providerToAssign: number | null = null;

  if (sessionData) {
     try {
       const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
       if (decoded.userId && decoded.userId !== "admin") {
           const { getUser } = await import("./users");
           const u = await getUser(Number(decoded.userId));
           if (u && Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
               providerToAssign = u.provider_ids[0];
           }
       }
     } catch (e) {}
  }
  
  await query("INSERT INTO vehicle_types (code, name, description, provider_id) VALUES ($1, $2, $3, $4)", [code.toUpperCase(), name, description || null, providerToAssign]);
  revalidatePath("/settings/vehicle-types");
  revalidatePath("/", "layout");
  redirect("/settings/vehicle-types");
}

export async function deleteVehicleType(id: number) {
  await query("DELETE FROM vehicle_types WHERE id = $1", [id]);
  revalidatePath("/settings/vehicle-types");
  revalidatePath("/", "layout");
}

export async function updateVehicleType(id: number, formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name || !code) throw new Error("Missing required fields");
  
  await query("UPDATE vehicle_types SET code = $1, name = $2, description = $3 WHERE id = $4", [code.toUpperCase(), name, description || null, id]);
  revalidatePath("/settings/vehicle-types");
  revalidatePath("/", "layout");
  redirect("/settings/vehicle-types");
}

export async function toggleVehicleTypeStatus(id: number, isActive: boolean) {
  await query("UPDATE vehicle_types SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/settings/vehicle-types");
  revalidatePath("/", "layout");
}
