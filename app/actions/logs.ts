"use server";

import { query } from "@/lib/db";

// ดึงข้อมูลประวัติการเข้าออกล่าสุด (จำกัดจำนวน) เพื่อแสดงบน Dashboard
export async function getRecentLogs(limit = 50) {
  const result = await query(
    "SELECT * FROM vehicle_logs ORDER BY entry_time DESC LIMIT $1",
    [limit]
  );
  return result.rows;
}
