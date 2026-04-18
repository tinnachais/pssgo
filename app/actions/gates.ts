"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function getGates() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let allowedProviderIds: number[] | null = null;
  const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;

  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId === "admin") {
             // Super admin
          } else if (decoded.userId) {
              const { getUser } = await import("./users");
              const u = await getUser(Number(decoded.userId));
              const isAdminUser = u && (u.role === "Admin" || u.role === "admin" || u.level === "Level1");
              
              if (!isAdminUser && u && Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
                 allowedProviderIds = u.provider_ids;
              } else if (!isAdminUser) {
                 return [];
              }
          }
      } catch (e) {}
  }

  let queryStr = `
    SELECT gates.*, zones.name as zone_name, sites.name as site_name, gate_types.name as type_name 
    FROM gates 
    LEFT JOIN zones ON gates.zone_id = zones.id 
    LEFT JOIN sites ON zones.site_id = sites.id
    LEFT JOIN gate_types ON gates.type_id = gate_types.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (allowedProviderIds !== null) {
      params.push(allowedProviderIds);
      queryStr += ` AND sites.provider_id = ANY($${params.length}::int[]) `;
  }

  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      queryStr += ` AND sites.id = $${params.length} `;
  }

  queryStr += ` ORDER BY gates.created_at DESC `;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getGate(id: number) {
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
    SELECT gates.*, sites.provider_id 
    FROM gates 
    LEFT JOIN zones ON gates.zone_id = zones.id 
    LEFT JOIN sites ON zones.site_id = sites.id 
    WHERE gates.id = $1
  `, [id]);
  
  const gate = result.rows[0] || null;

  if (gate && allowedProviderIds !== null && !allowedProviderIds.includes(gate.provider_id)) {
      return null;
  }

  return gate;
}

export async function addGate(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const zoneId = formData.get("zoneId") as string;
  const typeId = formData.get("typeId") as string;

  if (!name || !zoneId) {
    throw new Error("Missing required fields");
  }

  await query(
    "INSERT INTO gates (name, description, zone_id, type_id) VALUES ($1, $2, $3, $4)",
    [name, description || null, parseInt(zoneId, 10), typeId ? parseInt(typeId, 10) : null]
  );
  revalidatePath("/gates");
  revalidatePath("/", "layout");
  redirect("/gates");
}

export async function toggleGateStatus(id: number, isActive: boolean) {
  await query("UPDATE gates SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/gates");
  revalidatePath("/", "layout");
}

export async function deleteGate(id: number) {
  await query("DELETE FROM gates WHERE id = $1", [id]);
  revalidatePath("/gates");
  revalidatePath("/", "layout");
}

export async function updateGate(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const zoneId = formData.get("zoneId") as string;
  const typeId = formData.get("typeId") as string;

  if (!name || !zoneId) {
    throw new Error("Missing required fields");
  }

  await query(
    "UPDATE gates SET name = $1, description = $2, zone_id = $3, type_id = $4 WHERE id = $5",
    [name, description || null, parseInt(zoneId, 10), typeId ? parseInt(typeId, 10) : null, id]
  );
  revalidatePath("/gates");
  revalidatePath("/", "layout");
  redirect("/gates");
}
