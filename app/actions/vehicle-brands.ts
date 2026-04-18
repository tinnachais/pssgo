"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getVehicleBrands() {
  const result = await query("SELECT * FROM vehicle_brands ORDER BY name ASC");
  return result.rows;
}

export async function getVehicleBrand(id: number) {
  const result = await query("SELECT * FROM vehicle_brands WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addVehicleBrand(formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name || !code) throw new Error("Missing required fields");
  
  await query("INSERT INTO vehicle_brands (code, name, description) VALUES ($1, $2, $3)", [code.toUpperCase(), name, description || null]);
  revalidatePath("/vehicles/vehicle-brands");
  revalidatePath("/", "layout");
  redirect("/vehicles/vehicle-brands");
}

export async function deleteVehicleBrand(id: number) {
  await query("DELETE FROM vehicle_brands WHERE id = $1", [id]);
  revalidatePath("/vehicles/vehicle-brands");
  revalidatePath("/", "layout");
}

export async function updateVehicleBrand(id: number, formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  if (!name || !code) throw new Error("Missing required fields");
  
  await query("UPDATE vehicle_brands SET code = $1, name = $2, description = $3 WHERE id = $4", [code.toUpperCase(), name, description || null, id]);
  revalidatePath("/vehicles/vehicle-brands");
  revalidatePath("/", "layout");
  redirect("/vehicles/vehicle-brands");
}

export async function toggleVehicleBrandStatus(id: number, isActive: boolean) {
  await query("UPDATE vehicle_brands SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/vehicles/vehicle-brands");  revalidatePath("/", "layout");
}
