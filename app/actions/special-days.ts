"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getSpecialDays() {
  await query("ALTER TABLE special_days ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL");
  await query("ALTER TABLE special_days ADD COLUMN IF NOT EXISTS site_id INT DEFAULT NULL");

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
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
                 return [];
              }
          }
      } catch (e) {}
  }

  const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;

  let queryStr = `SELECT * FROM special_days WHERE 1=1 `;
  const params: any[] = [];

  if (!isAdmin && allowedProviderIds && allowedProviderIds.length > 0) {
      params.push(allowedProviderIds);
      queryStr += ` AND provider_id = ANY($${params.length}::int[]) `;
  }

  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      queryStr += ` AND site_id = $${params.length} `;
  }

  queryStr += ` ORDER BY date ASC`;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getSpecialDay(id: number) {
  const result = await query("SELECT * FROM special_days WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addSpecialDay(formData: FormData) {
  const name = formData.get("name") as string;
  const dateStr = formData.get("date") as string;
  const is_recurring = formData.get("is_recurring") === "on";
  const description = formData.get("description") as string;
  
  if (!name || !dateStr) throw new Error("Missing required fields");

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  const selectedSiteIdStr = cookieStore.get("pssgo_selected_site_id")?.value;
  
  let providerToAssign: number | null = null;
  let siteToAssign: number | null = null;

  if (selectedSiteIdStr && selectedSiteIdStr !== "all") {
      siteToAssign = parseInt(selectedSiteIdStr, 10);
  }

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
  
  // Check for duplicate date
  let checkQuery = "SELECT id FROM special_days WHERE date = $1";
  let checkParams: any[] = [dateStr];
  
  if (siteToAssign) {
      checkQuery += " AND site_id = $2";
      checkParams.push(siteToAssign);
  } else if (providerToAssign) {
      checkQuery += " AND provider_id = $2";
      checkParams.push(providerToAssign);
  } else {
      checkQuery += " AND site_id IS NULL AND provider_id IS NULL";
  }

  const existing = await query(checkQuery, checkParams);
  if (existing.rows.length > 0) {
      throw new Error("วันที่นี้ถูกกำหนดเป็นวันพิเศษไว้แล้ว");
  }

  await query(
    `INSERT INTO special_days (name, date, is_recurring, description, provider_id, site_id) VALUES ($1, $2, $3, $4, $5, $6)`,
    [name, dateStr, is_recurring, description || null, providerToAssign, siteToAssign]
  );
  revalidatePath("/special-days");
  revalidatePath("/", "layout");
  redirect("/special-days");
}

export async function deleteSpecialDay(id: number) {
  await query("DELETE FROM special_days WHERE id = $1", [id]);
  revalidatePath("/special-days");
  revalidatePath("/", "layout");
}

export async function updateSpecialDay(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const dateStr = formData.get("date") as string;
  const is_recurring = formData.get("is_recurring") === "on";
  const description = formData.get("description") as string;
  
  if (!name || !dateStr) throw new Error("Missing required fields");
  
  // Check for duplicate date (ignoring current record)
  const existing = await query("SELECT id FROM special_days WHERE date = $1 AND id != $2", [dateStr, id]);
  if (existing.rows.length > 0) {
      throw new Error("วันที่นี้ถูกกำหนดเป็นวันพิเศษไว้แล้ว");
  }

  await query(
    "UPDATE special_days SET name = $1, date = $2, is_recurring = $3, description = $4 WHERE id = $5",
    [name, dateStr, is_recurring, description || null, id]
  );
  revalidatePath("/special-days");
  revalidatePath("/", "layout");
  redirect("/special-days");
}

export async function toggleSpecialDayStatus(id: number, isActive: boolean) {
  await query("UPDATE special_days SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/special-days");
  revalidatePath("/", "layout");
}
