"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getParkTypes() {
  await query("ALTER TABLE park_types ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL");

  const { cookies } = await import("next/headers");
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

  let queryStr = `
     SELECT pt.*, pf.name as parking_fee_name 
     FROM park_types pt
     LEFT JOIN parking_fees pf ON pt.parking_fee_id = pf.id
  `;
  const params: any[] = [];

  if (allowedProviderIds !== null) {
      queryStr += ` WHERE pt.provider_id IS NULL OR pt.provider_id = ANY($1::int[]) `;
      params.push(allowedProviderIds);
  }

  queryStr += ` ORDER BY pt.created_at ASC `;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getParkType(id: number) {
  const { cookies } = await import("next/headers");
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

  const result = await query("SELECT * FROM park_types WHERE id = $1", [id]);
  const pt = result.rows[0] || null;

  if (pt && pt.provider_id && allowedProviderIds !== null && !allowedProviderIds.includes(pt.provider_id)) {
      return null;
  }

  return pt;
}

export async function addParkType(formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const parkingFeeId = formData.get("parkingFeeId") as string;
  
  if (!name || !code) throw new Error("Missing required fields");
  
  await query("ALTER TABLE park_types ADD COLUMN IF NOT EXISTS parking_fee_id INT DEFAULT NULL");
  await query("ALTER TABLE park_types ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL");

  const { cookies } = await import("next/headers");
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

  await query("INSERT INTO park_types (code, name, description, parking_fee_id, provider_id) VALUES ($1, $2, $3, $4, $5)", 
     [code.toUpperCase(), name, description || null, parkingFeeId ? parseInt(parkingFeeId, 10) : null, providerToAssign]);
  revalidatePath("/settings/park-types");
  revalidatePath("/", "layout");
  redirect("/settings/park-types");
}

export async function deleteParkType(id: number) {
  await query("DELETE FROM park_types WHERE id = $1", [id]);
  revalidatePath("/settings/park-types");
  revalidatePath("/", "layout");
}

export async function updateParkType(id: number, formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const parkingFeeId = formData.get("parkingFeeId") as string;
  
  if (!name || !code) throw new Error("Missing required fields");
  
  await query("ALTER TABLE park_types ADD COLUMN IF NOT EXISTS parking_fee_id INT DEFAULT NULL");

  await query("UPDATE park_types SET code = $1, name = $2, description = $3, parking_fee_id = $4 WHERE id = $5", 
     [code.toUpperCase(), name, description || null, parkingFeeId ? parseInt(parkingFeeId, 10) : null, id]);
  revalidatePath("/settings/park-types");
  revalidatePath("/", "layout");
  redirect("/settings/park-types");
}

export async function toggleParkTypeStatus(id: number, isActive: boolean) {
  await query("UPDATE park_types SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/settings/park-types");
  revalidatePath("/", "layout");
}
