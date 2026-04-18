"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPackages() {
    await query(`
        CREATE TABLE IF NOT EXISTS packages (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            max_vehicles INT NOT NULL,
            monthly_price DECIMAL(10,2) NOT NULL,
            yearly_price DECIMAL(10,2) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const result = await query("SELECT * FROM packages ORDER BY max_vehicles ASC, id ASC");
    return result.rows;
}

export async function addPackage(formData: FormData) {
    const name = formData.get("name") as string;
    const maxVehicles = parseInt(formData.get("maxVehicles") as string, 10);
    const monthlyPrice = parseFloat(formData.get("monthlyPrice") as string);
    const yearlyPrice = parseFloat(formData.get("yearlyPrice") as string);

    if (!name || isNaN(maxVehicles) || isNaN(monthlyPrice) || isNaN(yearlyPrice)) {
        throw new Error("Missing or invalid fields");
    }

    await query(
        "INSERT INTO packages (name, max_vehicles, monthly_price, yearly_price) VALUES ($1, $2, $3, $4)",
        [name, maxVehicles, monthlyPrice, yearlyPrice]
    );

    revalidatePath("/packages");
}

export async function togglePackageStatus(id: number, isActive: boolean) {
    await query("UPDATE packages SET is_active = $1 WHERE id = $2", [isActive, id]);
    revalidatePath("/packages");
}

export async function deletePackage(id: number) {
    await query("DELETE FROM packages WHERE id = $1", [id]);
    revalidatePath("/packages");
}

export async function updatePackage(id: number, formData: FormData) {
    const name = formData.get("name") as string;
    const maxVehicles = parseInt(formData.get("maxVehicles") as string, 10);
    const monthlyPrice = parseFloat(formData.get("monthlyPrice") as string);
    const yearlyPrice = parseFloat(formData.get("yearlyPrice") as string);

    if (!name || isNaN(maxVehicles) || isNaN(monthlyPrice) || isNaN(yearlyPrice)) {
        throw new Error("Missing or invalid fields");
    }

    await query(
        "UPDATE packages SET name = $1, max_vehicles = $2, monthly_price = $3, yearly_price = $4 WHERE id = $5",
        [name, maxVehicles, monthlyPrice, yearlyPrice, id]
    );

    revalidatePath("/packages");
}
