"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getGateTypes() {
  const result = await query("SELECT * FROM gate_types ORDER BY created_at ASC");
  return result.rows;
}

export async function getGateType(id: number) {
  const result = await query("SELECT * FROM gate_types WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addGateType(formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name || !code) throw new Error("Missing required fields");
  
  await query("INSERT INTO gate_types (code, name, description) VALUES ($1, $2, $3)", [code.toUpperCase(), name, description || null]);
  revalidatePath("/settings/gate-types");
  revalidatePath("/", "layout");
  redirect("/settings/gate-types");
}

export async function deleteGateType(id: number) {
  await query("DELETE FROM gate_types WHERE id = $1", [id]);
  revalidatePath("/settings/gate-types");
  revalidatePath("/", "layout");
}

export async function updateGateType(id: number, formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name || !code) throw new Error("Missing required fields");
  
  await query("UPDATE gate_types SET code = $1, name = $2, description = $3 WHERE id = $4", [code.toUpperCase(), name, description || null, id]);
  revalidatePath("/settings/gate-types");
  revalidatePath("/", "layout");
  redirect("/settings/gate-types");
}

export async function toggleGateTypeStatus(id: number, isActive: boolean) {
  await query("UPDATE gate_types SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/settings/gate-types");
  revalidatePath("/", "layout");
}
