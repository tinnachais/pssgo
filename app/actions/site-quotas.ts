"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function initSiteQuotasTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS site_quotas (
            id SERIAL PRIMARY KEY,
            site_id INT REFERENCES sites(id) ON DELETE CASCADE,
            park_type_id INT REFERENCES park_types(id) ON DELETE CASCADE,
            parking_fee_id INT REFERENCES parking_fees(id) ON DELETE CASCADE,
            quota_limit INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

export async function getSiteQuotas(siteId: number) {
    await initSiteQuotasTable();
    const result = await query(`
        SELECT sq.*, 
               pt.name as park_type_name,
               pf.name as parking_fee_name
        FROM site_quotas sq
        LEFT JOIN park_types pt ON sq.park_type_id = pt.id
        LEFT JOIN parking_fees pf ON sq.parking_fee_id = pf.id
        WHERE sq.site_id = $1
        ORDER BY sq.created_at ASC
    `, [siteId]);
    return result.rows;
}

export async function addSiteQuota(data: any) {
    await initSiteQuotasTable();
    const { site_id, parking_fee_id, quota_limit } = data;

    // Get park_type_id from parking_fees
    const feeQuery = await query("SELECT applicable_park_type_ids FROM parking_fees WHERE id = $1", [parseInt(parking_fee_id, 10)]);
    let park_type_id: number | null = null;
    if (feeQuery.rows.length > 0 && feeQuery.rows[0].applicable_park_type_ids) {
        try {
            const types = typeof feeQuery.rows[0].applicable_park_type_ids === 'string' 
                ? JSON.parse(feeQuery.rows[0].applicable_park_type_ids)
                : feeQuery.rows[0].applicable_park_type_ids;
            if (Array.isArray(types) && types.length > 0) {
                park_type_id = parseInt(types[0], 10);
            }
        } catch(e) {}
    }

    // Check package limit
    const siteQuery = await query(`
        SELECT s.package_id, p.max_vehicles 
        FROM sites s 
        LEFT JOIN packages p ON s.package_id = p.id 
        WHERE s.id = $1
    `, [site_id]);

    if (siteQuery.rows.length === 0) throw new Error("Site not found");

    const maxPackageQuota = siteQuery.rows[0].max_vehicles || 0;

    const currentQuotas = await query(`SELECT SUM(quota_limit) as total FROM site_quotas WHERE site_id = $1`, [site_id]);
    const currentTotal = parseInt(currentQuotas.rows[0].total || "0", 10);
    const newLimit = parseInt(quota_limit, 10);

    if (currentTotal + newLimit > maxPackageQuota) {
        throw new Error(`ไม่สามารถเพิ่มโควต้าได้ โควต้ารวมจะเกินจำนวนที่แพคเกจกำหนด (${maxPackageQuota} สิทธิ์)`);
    }

    await query(`
        INSERT INTO site_quotas (site_id, park_type_id, parking_fee_id, quota_limit)
        VALUES ($1, $2, $3, $4)
    `, [
        parseInt(site_id),
        park_type_id,
        parseInt(parking_fee_id),
        newLimit
    ]);

    revalidatePath(`/sites/${site_id}`);
    revalidatePath("/sites");
}

export async function deleteSiteQuota(id: number, siteId: number) {
    await query("DELETE FROM site_quotas WHERE id = $1", [id]);
    revalidatePath(`/sites/${siteId}`);
    revalidatePath("/sites");
}
