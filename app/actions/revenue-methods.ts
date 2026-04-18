"use server";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getRevenueMethods() {
  const result = await query("SELECT * FROM revenue_methods ORDER BY id DESC");
  return result.rows;
}

export async function getRevenueMethod(id: number) {
  const result = await query("SELECT * FROM revenue_methods WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addRevenueMethod(formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  await query(
    "INSERT INTO revenue_methods (code, name, description) VALUES ($1, $2, $3)",
    [code?.toUpperCase(), name, description]
  );
  revalidatePath("/settings/revenue-methods");
  revalidatePath("/", "layout");
  redirect("/settings/revenue-methods");
}

export async function updateRevenueMethod(id: number, formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  await query(
    "UPDATE revenue_methods SET code = $1, name = $2, description = $3 WHERE id = $4",
    [code?.toUpperCase(), name, description, id]
  );
  revalidatePath("/settings/revenue-methods");
  revalidatePath("/", "layout");
  redirect("/settings/revenue-methods");
}

export async function deleteRevenueMethod(id: number) {
  await query("DELETE FROM revenue_methods WHERE id = $1", [id]);
  revalidatePath("/settings/revenue-methods");
  revalidatePath("/", "layout");
}

export async function toggleRevenueMethodStatus(id: number, status: boolean) {
  await query("UPDATE revenue_methods SET is_active = $1 WHERE id = $2", [status, id]);
  revalidatePath("/settings/revenue-methods");
  revalidatePath("/", "layout");
}
