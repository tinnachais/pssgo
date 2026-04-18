"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getRevenues() {
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

  let queryStr = `
    SELECT r.*, s.name as site_name, rg.name as group_name, rt.name as type_name, rm.name as method_name
    FROM revenues r
    LEFT JOIN sites s ON r.site_id = s.id
    LEFT JOIN revenue_groups rg ON r.group_id = rg.id
    LEFT JOIN revenue_types rt ON r.type_id = rt.id
    LEFT JOIN revenue_methods rm ON r.method_id = rm.id
    WHERE 1=1
  `;
  const params: any[] = [];

  // 1. Filter by hierarchy/permissions
  if (!isAdmin) {
      if (allowedSiteIds !== null) {
          params.push(allowedSiteIds);
          queryStr += ` AND r.site_id = ANY($${params.length}::int[]) `;
      } else if (allowedProviderIds !== null) {
          params.push(allowedProviderIds);
          queryStr += ` AND r.site_id IN (SELECT id FROM sites WHERE provider_id = ANY($${params.length}::int[])) `;
      } else {
          return []; // No access
      }
  }

  // 2. Filter by UI Selection (if any)
  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      queryStr += ` AND r.site_id = $${params.length} `;
  }

  queryStr += ` ORDER BY r.issued_at DESC`;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getRevenue(id: number) {
  const result = await query("SELECT * FROM revenues WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addRevenue(formData: FormData) {
  const siteId = formData.get("siteId") as string;
  const typeId = formData.get("typeId") as string;

  let groupId: string | number | null = null;
  if (typeId) {
      const typeRes = await query("SELECT group_id FROM revenue_types WHERE id = $1", [parseInt(typeId)]);
      if (typeRes.rows.length > 0) {
          groupId = typeRes.rows[0].group_id;
      }
  }
  const methodId = formData.get("methodId") as string;
  let receiptNo = formData.get("receiptNo") as string;
  const licensePlate = formData.get("licensePlate") as string;
  const description = formData.get("description") as string;
  const amount = formData.get("amount") as string;
  const paymentStatus = formData.get("paymentStatus") as string;

  if (!receiptNo) {
     receiptNo = "RC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  if (!siteId || !amount) throw new Error("Missing required fields");

  await query(`
    INSERT INTO revenues (site_id, group_id, type_id, method_id, receipt_no, license_plate, description, amount, payment_status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    parseInt(siteId), groupId ? parseInt(groupId.toString()) : null, typeId ? parseInt(typeId) : null, methodId ? parseInt(methodId) : null, receiptNo.toUpperCase(), licensePlate?.toUpperCase() || null,
    description || null, parseFloat(amount),
    paymentStatus || 'PAID'
  ]);
  
  revalidatePath("/revenues");
  revalidatePath("/", "layout");
  redirect("/revenues");
}

export async function updateRevenue(id: number, formData: FormData) {
  const siteId = formData.get("siteId") as string;
  const typeId = formData.get("typeId") as string;

  let groupId: string | number | null = null;
  if (typeId) {
      const typeRes = await query("SELECT group_id FROM revenue_types WHERE id = $1", [parseInt(typeId)]);
      if (typeRes.rows.length > 0) {
          groupId = typeRes.rows[0].group_id;
      }
  }
  const methodId = formData.get("methodId") as string;
  const receiptNo = formData.get("receiptNo") as string;
  const licensePlate = formData.get("licensePlate") as string;
  const description = formData.get("description") as string;
  const amount = formData.get("amount") as string;
  const paymentStatus = formData.get("paymentStatus") as string;

  if (!siteId || !amount) throw new Error("Missing required fields");

  await query(`
    UPDATE revenues 
    SET site_id = $1, group_id = $2, type_id = $3, method_id = $4, receipt_no = $5, license_plate = $6, description = $7, amount = $8, payment_status = $9
    WHERE id = $10
  `, [
    parseInt(siteId), groupId ? parseInt(groupId.toString()) : null, typeId ? parseInt(typeId) : null, methodId ? parseInt(methodId) : null, receiptNo.toUpperCase(), licensePlate?.toUpperCase() || null,
    description || null, parseFloat(amount),
    paymentStatus || 'PAID', id
  ]);
  
  revalidatePath("/revenues");
  revalidatePath("/", "layout");
  redirect("/revenues");
}

export async function deleteRevenue(id: number) {
  await query("DELETE FROM revenues WHERE id = $1", [id]);
  revalidatePath("/revenues");
  revalidatePath("/", "layout");
}

export async function updateRevenueStatus(id: number, status: string) {
  await query("UPDATE revenues SET payment_status = $1 WHERE id = $2", [status, id]);
  revalidatePath("/revenues");
  revalidatePath("/", "layout");
}
