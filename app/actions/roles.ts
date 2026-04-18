"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getRoles() {
  const result = await query("SELECT * FROM roles ORDER BY id ASC");
  return result.rows;
}

export async function getRole(id: number) {
  const result = await query("SELECT * FROM roles WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addRole(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const permissions = formData.getAll("permissions") as string[];
  
  if (!name) throw new Error("Missing required fields");
  
  const permString = JSON.stringify(permissions);
  
  await query(
    `INSERT INTO roles (name, description, permissions) VALUES ($1, $2, $3)`,
    [name, description, permString]
  );
  revalidatePath("/roles");
  revalidatePath("/", "layout");
  redirect("/roles");
}

export async function deleteRole(id: number) {
  await query("DELETE FROM roles WHERE id = $1", [id]);
  revalidatePath("/roles");
  revalidatePath("/", "layout");
}

export async function updateRole(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const permissions = formData.getAll("permissions") as string[];
  
  if (!name) throw new Error("Missing required fields");
  
  const permString = JSON.stringify(permissions);
  
  await query(
    "UPDATE roles SET name = $1, description = $2, permissions = $3 WHERE id = $4",
    [name, description, permString, id]
  );
  revalidatePath("/roles");
  revalidatePath("/", "layout");
  redirect("/roles");
}

export async function toggleRoleStatus(id: number, isActive: boolean) {
  await query("UPDATE roles SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/", "layout");
}
