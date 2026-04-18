"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getParkingFines() {
  await query("ALTER TABLE parking_fines ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL");
  await query("ALTER TABLE parking_fines ADD COLUMN IF NOT EXISTS site_id INT DEFAULT NULL");

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;
  
  let allowedProviderIds: number[] | null = null;
  let allowedSiteIds: number[] | null = null;
  let isAdmin = false;

  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId === "admin") {
             isAdmin = true;
          } else if (decoded.userId) {
              const { getUser } = await import("./users");
              const u = await getUser(Number(decoded.userId));
              if (u) {
                  const level = u.level || "Level1";
                  if (level === "Level1") {
                      isAdmin = true;
                  } else if (level === "Level2") {
                      allowedProviderIds = Array.isArray(u.provider_ids) ? u.provider_ids : [];
                  } else if (level === "Level3") {
                      allowedSiteIds = Array.isArray(u.site_ids) ? u.site_ids : [];
                  }
              }
          }
      } catch (e) {}
  }

  let queryStr = `SELECT * FROM parking_fines WHERE 1=1 `;
  const params: any[] = [];

  // 1. Filter by hierarchy/permissions
  if (!isAdmin) {
      if (allowedSiteIds !== null) {
          params.push(allowedSiteIds);
          queryStr += ` AND site_id = ANY($${params.length}::int[]) `;
      } else if (allowedProviderIds !== null) {
          params.push(allowedProviderIds);
          queryStr += ` AND (provider_id = ANY($${params.length}::int[]) OR site_id IN (SELECT id FROM sites WHERE provider_id = ANY($${params.length}::int[]))) `;
      } else {
          return []; // No access
      }
  }

  // 2. Filter by UI Selection (if any)
  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      queryStr += ` AND site_id = $${params.length} `;
  }

  queryStr += ` ORDER BY created_at ASC`;
  const result = await query(queryStr, params);
  return result.rows;
}

export async function getParkingFine(id: number) {
  const result = await query("SELECT * FROM parking_fines WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addParkingFine(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const amountStr = formData.get("fine_amount") as string;
  const fineAmount = parseFloat(amountStr) || 0;
  
  if (!name) throw new Error("Missing required fields");

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
  
  await query(
    "INSERT INTO parking_fines (name, description, fine_amount, provider_id, site_id) VALUES ($1, $2, $3, $4, $5)", 
    [name, description || null, fineAmount, providerToAssign, siteToAssign]
  );
  revalidatePath("/parking-fees/fine");
  revalidatePath("/", "layout");
  redirect("/parking-fees/fine");
}

export async function deleteParkingFine(id: number) {
  await query("DELETE FROM parking_fines WHERE id = $1", [id]);
  revalidatePath("/parking-fees/fine");
  revalidatePath("/", "layout");
}

export async function updateParkingFine(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const amountStr = formData.get("fine_amount") as string;
  const fineAmount = parseFloat(amountStr) || 0;
  
  if (!name) throw new Error("Missing required fields");
  
  await query("UPDATE parking_fines SET name = $1, description = $2, fine_amount = $3 WHERE id = $4", [name, description || null, fineAmount, id]);
  revalidatePath("/parking-fees/fine");
  revalidatePath("/", "layout");
  redirect("/parking-fees/fine");
}

export async function toggleParkingFineStatus(id: number, isActive: boolean) {
  await query("UPDATE parking_fines SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/parking-fees/fine");
  revalidatePath("/", "layout");
}
