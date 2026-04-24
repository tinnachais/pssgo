"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function initParkingRightsTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS parking_rights (
            id SERIAL PRIMARY KEY,
            resident_id INT REFERENCES residents(id) ON DELETE CASCADE,
            vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
            park_type_id INT REFERENCES park_types(id) ON DELETE SET NULL,
            parking_fee_id INT REFERENCES parking_fees(id) ON DELETE SET NULL,
            start_date DATE,
            end_date DATE,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

export async function getResidentParkingRights(residentId: number) {
    await initParkingRightsTable();
    const result = await query(`
        SELECT pr.*, 
               v.license_plate, v.province,
               pt.name as park_type_name,
               pf.name as parking_fee_name
        FROM parking_rights pr
        LEFT JOIN vehicles v ON pr.vehicle_id = v.id
        LEFT JOIN park_types pt ON pr.park_type_id = pt.id
        LEFT JOIN parking_fees pf ON pr.parking_fee_id = pf.id
        WHERE pr.resident_id = $1
        ORDER BY pr.created_at DESC
    `, [residentId]);
    return result.rows;
}

export async function addParkingRight(data: any) {
    await initParkingRightsTable();
    const { resident_id, vehicle_id, park_type_id, parking_fee_id, start_date, end_date } = data;
    
    await query(`
        INSERT INTO parking_rights (resident_id, vehicle_id, park_type_id, parking_fee_id, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [
        parseInt(resident_id), 
        vehicle_id ? parseInt(vehicle_id) : null,
        park_type_id ? parseInt(park_type_id) : null,
        parking_fee_id ? parseInt(parking_fee_id) : null,
        start_date || null,
        end_date || null
    ]);

    revalidatePath("/residents");
    revalidatePath("/liff-users");
    revalidatePath("/", "layout");
}

export async function updateParkingRight(id: number, data: any) {
    const { vehicle_id, park_type_id, parking_fee_id, start_date, end_date } = data;
    
    await query(`
        UPDATE parking_rights
        SET vehicle_id = $1, park_type_id = $2, parking_fee_id = $3, start_date = $4, end_date = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
    `, [
        vehicle_id ? parseInt(vehicle_id) : null,
        park_type_id ? parseInt(park_type_id) : null,
        parking_fee_id ? parseInt(parking_fee_id) : null,
        start_date || null,
        end_date || null,
        id
    ]);

    revalidatePath("/residents");
    revalidatePath("/liff-users");
    revalidatePath("/", "layout");
}

export async function deleteParkingRight(id: number) {
    await query("DELETE FROM parking_rights WHERE id = $1", [id]);
    revalidatePath("/residents");
    revalidatePath("/liff-users");
    revalidatePath("/", "layout");
}

export async function toggleParkingRightStatus(id: number, isActive: boolean) {
    await query("UPDATE parking_rights SET is_active = $1 WHERE id = $2", [isActive, id]);
    revalidatePath("/residents");
    revalidatePath("/liff-users");
    revalidatePath("/", "layout");
}
