"use server";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getRevenueTypes() {
  await query("ALTER TABLE revenue_types ADD COLUMN IF NOT EXISTS group_id INT DEFAULT NULL");
  const result = await query(`
    SELECT rt.*, rg.name as group_name 
    FROM revenue_types rt
    LEFT JOIN revenue_groups rg ON rt.group_id = rg.id
    ORDER BY rt.id DESC
  `);
  return result.rows;
}

export async function getRevenueType(id: number) {
  const result = await query("SELECT * FROM revenue_types WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addRevenueType(formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const group_id_str = formData.get("group_id") as string;
  const group_id = group_id_str ? parseInt(group_id_str, 10) : null;
  
  await query("ALTER TABLE revenue_types ADD COLUMN IF NOT EXISTS group_id INT DEFAULT NULL");
  await query(
    "INSERT INTO revenue_types (code, name, description, group_id) VALUES ($1, $2, $3, $4)",
    [code?.toUpperCase(), name, description, group_id]
  );
  revalidatePath("/settings/revenue-types");
  revalidatePath("/", "layout");
  redirect("/settings/revenue-types");
}

export async function updateRevenueType(id: number, formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const group_id_str = formData.get("group_id") as string;
  const group_id = group_id_str ? parseInt(group_id_str, 10) : null;
  
  await query("ALTER TABLE revenue_types ADD COLUMN IF NOT EXISTS group_id INT DEFAULT NULL");
  await query(
    "UPDATE revenue_types SET code = $1, name = $2, description = $3, group_id = $4 WHERE id = $5",
    [code?.toUpperCase(), name, description, group_id, id]
  );
  revalidatePath("/settings/revenue-types");
  revalidatePath("/", "layout");
  redirect("/settings/revenue-types");
}

export async function deleteRevenueType(id: number) {
  await query("DELETE FROM revenue_types WHERE id = $1", [id]);
  revalidatePath("/settings/revenue-types");
  revalidatePath("/", "layout");
}

export async function toggleRevenueTypeStatus(id: number, status: boolean) {
  await query("UPDATE revenue_types SET is_active = $1 WHERE id = $2", [status, id]);
  revalidatePath("/settings/revenue-types");
  revalidatePath("/", "layout");
}
