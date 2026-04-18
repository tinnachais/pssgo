"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function getZones() {
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
              // Check if user is an Admin (either by role or Level1)
              const isAdminUser = u && (u.role === "Admin" || u.role === "admin" || u.level === "Level1");
              
              if (!isAdminUser && u && Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
                 allowedProviderIds = u.provider_ids;
              } else if (!isAdminUser) {
                 return []; // Non-admins with no providers see nothing
              }
          }
      } catch (e) {}
  }

  let queryStr = `
    SELECT zones.*, sites.name as site_name,
    COALESCE(
      (
        SELECT json_agg(json_build_object('id', gates.id, 'name', gates.name, 'is_active', gates.is_active))
        FROM gates
        WHERE gates.zone_id = zones.id
      ), 
      '[]'::json
    ) as gates_data
    FROM zones 
    LEFT JOIN sites ON zones.site_id = sites.id 
    WHERE 1=1
  `;
  const params: any[] = [];

  if (allowedProviderIds !== null) {
      params.push(allowedProviderIds);
      queryStr += ` AND sites.provider_id = ANY($${params.length}::int[]) `;
  }

  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      queryStr += ` AND zones.site_id = $${params.length} `;
  }

  queryStr += ` ORDER BY zones.created_at DESC `;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getZone(id: number) {
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
    SELECT zones.*, sites.provider_id 
    FROM zones 
    LEFT JOIN sites ON zones.site_id = sites.id 
    WHERE zones.id = $1
  `, [id]);
  const zone = result.rows[0] || null;

  if (zone && allowedProviderIds !== null && !allowedProviderIds.includes(zone.provider_id)) {
      return null;
  }

  return zone;
}

export async function addZone(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const siteId = formData.get("siteId") as string;

  if (!name || !siteId) {
    throw new Error("Missing required fields");
  }

  await query(
    "INSERT INTO zones (name, description, site_id) VALUES ($1, $2, $3)",
    [name, description || null, parseInt(siteId, 10)]
  );
  revalidatePath("/zones");
  revalidatePath("/sites");
  revalidatePath("/", "layout");
  redirect("/zones");
}

export async function toggleZoneStatus(id: number, isActive: boolean) {
  await query("UPDATE zones SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/zones");
  revalidatePath("/sites");
  revalidatePath("/", "layout");
}

export async function deleteZone(id: number) {
  await query("DELETE FROM zones WHERE id = $1", [id]);
  revalidatePath("/zones");
  revalidatePath("/sites");
  revalidatePath("/", "layout");
}

export async function updateZone(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const siteId = formData.get("siteId") as string;

  if (!name || !siteId) {
    throw new Error("Missing required fields");
  }

  await query(
    "UPDATE zones SET name = $1, description = $2, site_id = $3 WHERE id = $4",
    [name, description || null, parseInt(siteId, 10), id]
  );
  revalidatePath("/zones");
  revalidatePath("/sites");
  revalidatePath("/", "layout");
  redirect("/zones");
}
