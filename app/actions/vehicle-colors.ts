"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getVehicleColors() {
  const result = await query("SELECT * FROM vehicle_colors ORDER BY created_at ASC");
  return result.rows;
}

export async function getVehicleColor(id: number) {
  const result = await query("SELECT * FROM vehicle_colors WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addVehicleColor(formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name || !code) throw new Error("Missing required fields");
  
  await query("INSERT INTO vehicle_colors (code, name, description) VALUES ($1, $2, $3)", [code.toUpperCase(), name, description || null]);
  revalidatePath("/vehicles/vehicle-colors");
  revalidatePath("/", "layout");
  redirect("/vehicles/vehicle-colors");
}

export async function deleteVehicleColor(id: number) {
  await query("DELETE FROM vehicle_colors WHERE id = $1", [id]);
  revalidatePath("/vehicles/vehicle-colors");
  revalidatePath("/", "layout");
}

export async function updateVehicleColor(id: number, formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name || !code) throw new Error("Missing required fields");
  
  await query("UPDATE vehicle_colors SET code = $1, name = $2, description = $3 WHERE id = $4", [code.toUpperCase(), name, description || null, id]);
  revalidatePath("/vehicles/vehicle-colors");
  revalidatePath("/", "layout");
  redirect("/vehicles/vehicle-colors");
}

export async function toggleVehicleColorStatus(id: number, isActive: boolean) {
  await query("UPDATE vehicle_colors SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/vehicles/vehicle-colors");
  revalidatePath("/", "layout");
}
