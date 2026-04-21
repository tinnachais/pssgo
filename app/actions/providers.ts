"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function getProviders() {
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
    SELECT providers.*, COUNT(sites.id) as sites_count
    FROM providers 
    LEFT JOIN sites ON sites.provider_id = providers.id
  `;
  const params: any[] = [];

  if (allowedProviderIds !== null) {
      queryStr += ` WHERE providers.id = ANY($1::int[]) `;
      params.push(allowedProviderIds);
  }

  queryStr += `
    GROUP BY providers.id
    ORDER BY providers.created_at DESC
  `;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getProvider(id: number) {
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

  if (allowedProviderIds !== null && !allowedProviderIds.includes(id)) {
      return null;
  }

  const result = await query("SELECT * FROM providers WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addProvider(formData: FormData) {
  const name = formData.get("name") as string;
  const taxId = formData.get("taxId") as string;
  const address = formData.get("address") as string;
  const contactName = formData.get("contactName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const email = formData.get("email") as string;
  const advanceDaysStr = formData.get("invoiceAdvanceDays") as string;
  const advanceDays = advanceDaysStr ? parseInt(advanceDaysStr, 10) : 7;

  if (!name) {
    throw new Error("Missing required fields");
  }

  await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS invoice_advance_days INT DEFAULT 7");
  await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS contact_name TEXT DEFAULT NULL");
  await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT NULL");
  await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS email TEXT DEFAULT NULL");

  await query(
    "INSERT INTO providers (name, tax_id, address, invoice_advance_days, contact_name, phone_number, email) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [name, taxId || null, address || null, advanceDays, contactName || null, phoneNumber || null, email || null]
  );
  revalidatePath("/settings/providers");
  redirect("/settings/providers");
}

export async function toggleProviderStatus(id: number, isActive: boolean) {
  await query("UPDATE providers SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/settings/providers");
}

export async function deleteProvider(id: number) {
  await query("DELETE FROM providers WHERE id = $1", [id]);
  revalidatePath("/settings/providers");
}

export async function updateProvider(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const taxId = formData.get("taxId") as string;
  const address = formData.get("address") as string;
  const contactName = formData.get("contactName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const email = formData.get("email") as string;
  const advanceDaysStr = formData.get("invoiceAdvanceDays") as string;
  const advanceDays = advanceDaysStr ? parseInt(advanceDaysStr, 10) : 7;

  if (!name) {
    throw new Error("Missing required fields");
  }

  await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS invoice_advance_days INT DEFAULT 7");
  await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS contact_name TEXT DEFAULT NULL");
  await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT NULL");
  await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS email TEXT DEFAULT NULL");

  await query(
    "UPDATE providers SET name = $1, tax_id = $2, address = $3, invoice_advance_days = $4, contact_name = $5, phone_number = $6, email = $7 WHERE id = $8",
    [name, taxId || null, address || null, advanceDays, contactName || null, phoneNumber || null, email || null, id]
  );
  revalidatePath("/settings/providers");
  redirect("/settings/providers");
}
