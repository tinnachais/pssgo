"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getParkingFees() {
  await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL");
  await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS site_id INT DEFAULT NULL");
  await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS buffer_time_minutes INT DEFAULT 15");
  await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS revenue_type_id INT DEFAULT NULL");

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;
  
  let allowedProviderIds: number[] | null = null;
  let allowedSiteIds: number[] | null = null;
  let isAdmin = false;

  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId === "admin") {
             isAdmin = true;
          } else if (decoded.userId) {
              const { getUser } = await import("./users");
              const u = await getUser(Number(decoded.userId));
              if (u) {
                  const level = u.level || "Level1";
                  if (level === "Level1") {
                      isAdmin = true;
                  } else if (level === "Level2") {
                      allowedProviderIds = Array.isArray(u.provider_ids) ? u.provider_ids : [];
                  } else if (level === "Level3") {
                      allowedSiteIds = Array.isArray(u.site_ids) ? u.site_ids : [];
                  }
              }
          }
      } catch (e) {}
  }

  let queryStr = `SELECT * FROM parking_fees WHERE 1=1 `;
  const params: any[] = [];

  // 1. Filter by hierarchy/permissions
  if (!isAdmin) {
      if (allowedSiteIds !== null) {
          params.push(allowedSiteIds);
          queryStr += ` AND site_id = ANY($${params.length}::int[]) `;
      } else if (allowedProviderIds !== null) {
          params.push(allowedProviderIds);
          queryStr += ` AND (provider_id = ANY($${params.length}::int[]) OR site_id IN (SELECT id FROM sites WHERE provider_id = ANY($${params.length}::int[]))) `;
      } else {
          return []; // No access
      }
  }

  // 2. Filter by UI Selection (if any)
  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      queryStr += ` AND site_id = $${params.length} `;
  }

  queryStr += ` ORDER BY created_at ASC`;

  const result = await query(queryStr, params);
  return result.rows;
}

export async function getPublicParkingFees(siteId: number | null) {
  if (!siteId) {
      const res = await query("SELECT * FROM parking_fees ORDER BY created_at ASC");
      return res.rows;
  }
  const result = await query("SELECT * FROM parking_fees WHERE site_id = $1 ORDER BY created_at ASC", [siteId]);
  return result.rows;
}

export async function getParkingFee(id: number) {
  if (!id || isNaN(id)) return null;
  const result = await query("SELECT * FROM parking_fees WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addParkingFee(data: any) {
  try {
    // Add new columns if missing
    try {
      await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS has_time_interval_rates BOOLEAN DEFAULT FALSE");
      await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS time_interval_rates JSONB DEFAULT '[]'::jsonb");
      await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS applicable_days VARCHAR(50) DEFAULT 'ALL'");
      await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS applicable_park_type_ids JSONB DEFAULT '[]'::jsonb");
      await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS revenue_type_id INT DEFAULT NULL");
    } catch(e) {}

    const {
      name, description, fee_type, grace_period_minutes,
      free_hours_with_stamp, is_flat_rate, base_hourly_rate,
      has_tiered_rates, tiered_rates, rounding_minutes,
      daily_max_rate, has_overnight_penalty, overnight_penalty_rate,
      overnight_start_time, overnight_end_time, is_subscription, monthly_rate,
      has_time_interval_rates, time_interval_rates, applicable_days,
      applicable_park_type_ids, revenue_type_id
    } = data;

    if (!name) return { error: "Missing required fields" };

    const safeTime = (v: any) => (v === "" || v === undefined) ? null : v;
    const safeNum = (v: any) => (v === "" || v === undefined || isNaN(v)) ? null : Number(v);

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("pssgo_session")?.value;
    const selectedSiteIdStr = cookieStore.get("pssgo_selected_site_id")?.value;
    
    let providerToAssign: number | null = null;
    let siteToAssign: number | null = null;

    if (selectedSiteIdStr && selectedSiteIdStr !== "all") {
        siteToAssign = parseInt(selectedSiteIdStr, 10);
    }

    if (sessionData) {
        try {
            const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
            if (decoded.userId && decoded.userId !== "admin") {
                const { getUser } = await import("./users");
                const u = await getUser(Number(decoded.userId));
                if (u && Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
                    providerToAssign = u.provider_ids[0];
                }
            }
        } catch (e) {}
    }

    await query(`
      INSERT INTO parking_fees (
        name, description, fee_type, grace_period_minutes, free_hours_with_stamp,
        is_flat_rate, base_hourly_rate, has_tiered_rates, tiered_rates,
        rounding_minutes, daily_max_rate, has_overnight_penalty, overnight_penalty_rate,
        overnight_start_time, overnight_end_time, is_subscription, monthly_rate,
        has_time_interval_rates, time_interval_rates, provider_id, site_id, applicable_days,
        applicable_park_type_ids, buffer_time_minutes, revenue_type_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, CAST($9 AS jsonb), $10, $11, $12, $13, $14, $15, $16, $17, $18, CAST($19 AS jsonb), $20, $21, $22, CAST($23 AS jsonb), $24, $25
      )
    `, [
        name, description || null, fee_type || 'GENERAL', safeNum(grace_period_minutes) || 0, safeNum(free_hours_with_stamp) || 0,
        is_flat_rate || false, safeNum(base_hourly_rate) || 0, has_tiered_rates || false, JSON.stringify(tiered_rates || []),
        safeNum(rounding_minutes) || 15, safeNum(daily_max_rate), has_overnight_penalty || false, safeNum(overnight_penalty_rate),
        safeTime(overnight_start_time), safeTime(overnight_end_time), is_subscription || false, safeNum(monthly_rate),
        has_time_interval_rates || false, JSON.stringify(time_interval_rates || []),
        providerToAssign, siteToAssign, applicable_days || 'ALL',
        JSON.stringify(applicable_park_type_ids || []), safeNum(data.buffer_time_minutes) ?? 15, revenue_type_id || null
    ]);

    revalidatePath("/parking-fees");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("ADD FEE ERROR:", err);
    return { error: err.message || "Failed to add parking fee." };
  }
}

export async function updateParkingFee(id: number, data: any) {
  try {
    const {
      name, description, fee_type, grace_period_minutes,
      free_hours_with_stamp, is_flat_rate, base_hourly_rate,
      has_tiered_rates, tiered_rates, rounding_minutes,
      daily_max_rate, has_overnight_penalty, overnight_penalty_rate,
      overnight_start_time, overnight_end_time, is_subscription, monthly_rate,
      has_time_interval_rates, time_interval_rates, applicable_days,
      applicable_park_type_ids, revenue_type_id
    } = data;

    if (!name) return { error: "Missing required fields" };

    const safeTime = (v: any) => (v === "" || v === undefined) ? null : v;
    const safeNum = (v: any) => (v === "" || v === undefined || isNaN(v)) ? null : Number(v);

    try {
      await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS has_time_interval_rates BOOLEAN DEFAULT FALSE");
      await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS time_interval_rates JSONB DEFAULT '[]'::jsonb");
      await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS applicable_days VARCHAR(50) DEFAULT 'ALL'");
      await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS applicable_park_type_ids JSONB DEFAULT '[]'::jsonb");
      await query("ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS revenue_type_id INT DEFAULT NULL");
    } catch(e) {}

    await query(`
      UPDATE parking_fees SET 
        name = $1, description = $2, fee_type = $3, grace_period_minutes = $4, free_hours_with_stamp = $5,
        is_flat_rate = $6, base_hourly_rate = $7, has_tiered_rates = $8, tiered_rates = CAST($9 AS jsonb),
        rounding_minutes = $10, daily_max_rate = $11, has_overnight_penalty = $12, overnight_penalty_rate = $13,
        overnight_start_time = $14, overnight_end_time = $15, is_subscription = $16, monthly_rate = $17,
        has_time_interval_rates = $18, time_interval_rates = CAST($19 AS jsonb), applicable_days = $20,
        applicable_park_type_ids = CAST($21 AS jsonb), buffer_time_minutes = $22, revenue_type_id = $23
      WHERE id = $24
    `, [
        name, description || null, fee_type || 'GENERAL', safeNum(grace_period_minutes) || 0, safeNum(free_hours_with_stamp) || 0,
        is_flat_rate || false, safeNum(base_hourly_rate) || 0, has_tiered_rates || false, JSON.stringify(tiered_rates || []),
        safeNum(rounding_minutes) || 15, safeNum(daily_max_rate), has_overnight_penalty || false, safeNum(overnight_penalty_rate),
        safeTime(overnight_start_time), safeTime(overnight_end_time), is_subscription || false, safeNum(monthly_rate),
        has_time_interval_rates || false, JSON.stringify(time_interval_rates || []), applicable_days || 'ALL',
        JSON.stringify(applicable_park_type_ids || []),
        safeNum(data.buffer_time_minutes) ?? 15, revenue_type_id || null,
        id
    ]);

    revalidatePath("/parking-fees");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("UPDATE FEE ERROR:", err);
    return { error: err.message || "Failed to update parking fee." };
  }
}

export async function deleteParkingFee(id: number) {
  await query("DELETE FROM parking_fees WHERE id = $1", [id]);
  revalidatePath("/parking-fees");
  revalidatePath("/", "layout");
}

export async function toggleParkingFeeStatus(id: number, isActive: boolean) {
  await query("UPDATE parking_fees SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/parking-fees");
  revalidatePath("/", "layout");
}
