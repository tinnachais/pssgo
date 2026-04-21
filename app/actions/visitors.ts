"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function getVisitors() {
  const { unstable_noStore: noStore } = await import("next/cache");
  noStore();
  await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL");
  await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS site_id INT DEFAULT NULL");

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let allowedProviderIds: number[] | null = null;
  let isAdmin = false;

  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId === "admin") {
             isAdmin = true;
          } else if (decoded.userId) {
              const { getUser } = await import("./users");
              const u = await getUser(Number(decoded.userId));
              if (u && Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
                 allowedProviderIds = u.provider_ids;
              } else {
                 return []; // Not authorized for any provider
              }
          }
      } catch (e) {}
  }

  const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;

  let queryStr = `
    SELECT v.* FROM visitors v
    LEFT JOIN residents r ON v.house_number = r.house_number
    WHERE 1=1
  `;
  const params: any[] = [];

  if (!isAdmin && allowedProviderIds && allowedProviderIds.length > 0) {
      params.push(allowedProviderIds);
      queryStr += ` AND (v.provider_id = ANY($${params.length}::int[]) OR r.provider_id = ANY($${params.length}::int[])) `;
  }

  if (selectedSiteId && selectedSiteId !== "all") {
      params.push(parseInt(selectedSiteId, 10));
      queryStr += ` AND (v.site_id = $${params.length} OR r.site_id = $${params.length}) `;
  }

  queryStr += `
    ORDER BY 
      CASE v.status 
        WHEN 'PRE' THEN 1
        WHEN 'IN' THEN 2
        WHEN 'INVITED' THEN 3
        WHEN 'OUT' THEN 4
        WHEN 'CANCELLED' THEN 5
        ELSE 6 
      END ASC,
      COALESCE(v.check_in_time, v.expected_in_time, v.created_at) DESC
  `;

  // We group by v.id to prevent duplication if multiple residents share the same house_number
  let dedupQuery = `
    WITH cte AS (${queryStr})
    SELECT DISTINCT ON (id) * FROM cte ORDER BY id DESC
  `;
  
  // Wait, if we use DISTINCT ON (id), we lose the original complex ORDER BY.
  // Better to just GROUP BY all v.* columns, or use a window function inside SELECT: 
  // No, just don't join residents directly unless needed, or use EXISTS.
  
  // Let's rewrite safely with EXISTS:
  let finalQueryStr = `
    SELECT v.*,
           (SELECT COALESCE(SUM(amount), 0) FROM revenues WHERE visitor_id = v.id AND payment_status = 'PAID') as total_paid
    FROM visitors v
    WHERE 1=1
  `;
  const finalParams: any[] = [];

  if (!isAdmin && allowedProviderIds && allowedProviderIds.length > 0) {
      finalParams.push(allowedProviderIds);
      finalQueryStr += ` AND (v.provider_id = ANY($${finalParams.length}::int[]) OR (v.provider_id IS NULL AND EXISTS (SELECT 1 FROM residents r JOIN sites s ON r.site_id = s.id WHERE r.house_number = v.house_number AND s.provider_id = ANY($${finalParams.length}::int[])))) `;
  }

  if (selectedSiteId && selectedSiteId !== "all") {
      finalParams.push(parseInt(selectedSiteId, 10));
      finalQueryStr += ` AND (v.site_id = $${finalParams.length} OR (v.site_id IS NULL AND EXISTS (SELECT 1 FROM residents r WHERE r.house_number = v.house_number AND r.site_id = $${finalParams.length}))) `;
  }

  finalQueryStr += `
    ORDER BY 
      CASE v.status 
        WHEN 'PRE' THEN 1
        WHEN 'IN' THEN 2
        WHEN 'INVITED' THEN 3
        WHEN 'OUT' THEN 4
        WHEN 'CANCELLED' THEN 5
        ELSE 6 
      END ASC,
      COALESCE(v.check_in_time, v.expected_in_time, v.created_at) DESC
  `;

  const result = await query(finalQueryStr, finalParams);
  return result.rows;
}

export async function getVisitor(id: number) {
  const result = await query("SELECT * FROM visitors WHERE id = $1", [id]);
  return result.rows[0] || null;
}

import { sendLineMessage, generateVisitorEntryFlexMessage, generateVisitorExitFlexMessage } from "@/lib/line";

export async function addVisitor(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const idCardNumber = formData.get("idCardNumber") as string;
  const cardType = formData.get("cardType") as string || "บัตรประชาชน";
  const vehiclePlate = formData.get("vehiclePlate") as string;
  const vehicleProvince = formData.get("vehicleProvince") as string;
  const vehicleColor = formData.get("vehicleColor") as string;
  const purpose = formData.get("purpose") as string;
  const houseNumber = formData.get("houseNumber") as string;
  let imageUrl = formData.get("imageUrl") as string;
  
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
      const ext = path.extname(imageFile.name) || ".jpg";
      const filename = `${crypto.randomUUID()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/visitors");
      
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      
      imageUrl = `/uploads/visitors/${filename}`;
  }
  
  if (!fullName) throw new Error("Missing required fields");
  
  if (houseNumber) {
      const privacyCheck = await query("SELECT privacy_mode FROM residents WHERE house_number = $1 AND privacy_mode = true LIMIT 1", [houseNumber]);
      if (privacyCheck.rows.length > 0) {
          throw new Error(`สถานที่/ห้อง ${houseNumber} เปิดโหมดความเป็นส่วนตัว ไม่อนุญาตให้เข้าพบ (Do Not Disturb)`);
      }
  }

  await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS vehicle_province VARCHAR(255)");
  await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS vehicle_color VARCHAR(100)");
  await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL");
  await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS site_id INT DEFAULT NULL");

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

  const visitorResult = await query(
    `INSERT INTO visitors (full_name, id_card_number, card_type, vehicle_plate, vehicle_province, vehicle_color, purpose, house_number, status, provider_id, site_id, image_url) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'IN', $9, $10, $11) RETURNING id`,
    [fullName, idCardNumber || null, cardType, vehiclePlate || null, vehicleProvince || null, vehicleColor || null, purpose || null, houseNumber || null, providerToAssign, siteToAssign, imageUrl || null]
  );
  
  const visitorId = visitorResult.rows[0].id;
  
  // สร้างตรรกะให้ transaction ไปเก็บลงใน access_logs
  await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'RESIDENT'");
  await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS visitor_id INT DEFAULT NULL");

  await query(
    `INSERT INTO access_logs (license_plate, house_number, action, type, visitor_id) VALUES ($1, $2, 'IN', 'VISITOR', $3)`,
    [vehiclePlate || 'UNKNOWN', houseNumber || null, visitorId]
  );

  // ส่งแจ้งเตือน LINE ไปยังผู้เช่า/ร้าน/บริษัทในรหัสสถานที่/ห้องนั้น
  if (houseNumber) {
     try {
        const notifyRes = await query(
            "SELECT r.line_user_id, s.name as site_name FROM residents r LEFT JOIN sites s ON r.site_id = s.id WHERE r.house_number = $1 AND r.is_active = true AND r.line_user_id IS NOT NULL",
            [houseNumber]
        );
        if (notifyRes.rows.length > 0) {
            const siteName = notifyRes.rows[0].site_name;
            const liffUrl = process.env.NEXT_PUBLIC_LIFF_ID ? `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}` : undefined;
            const messages = generateVisitorEntryFlexMessage(
                purpose || fullName || "มาติดต่อ",
                vehiclePlate ? `${vehiclePlate} ${vehicleProvince || ''} ${vehicleColor ? `(สี${vehicleColor})` : ''}`.trim() : "ไม่ระบุทะเบียน",
                imageUrl || undefined, // imageUrl
                liffUrl,
                siteName
            );
            // ส่งหาผู้เช่า/ร้าน/บริษัททุกคนในบ้านที่ผูก LINE ไว้
            for (const r of notifyRes.rows) {
                await sendLineMessage(r.line_user_id, messages);
            }
        }
     } catch (e) {
        console.error("Failed to send LINE notification:", e);
     }
  }

  revalidatePath("/visitor");
  revalidatePath("/", "layout");
  redirect("/visitor");
}

export async function checkoutVisitor(id: number) {
  const visitorRes = await query("SELECT full_name, purpose, house_number, vehicle_plate, vehicle_province, vehicle_color, e_stamp, image_url, invite_token, card_type FROM visitors WHERE id = $1", [id]);
  
  if (visitorRes.rows.length > 0 && !visitorRes.rows[0].e_stamp) {
      return { success: false, message: "ไม่อนุญาตให้ออก: ต้องได้รับการประทับตรา (E-Stamp) จากผู้เช่า/ร้าน/บริษัทก่อน" };
  }

  await query("UPDATE visitors SET status = 'OUT', check_out_time = CURRENT_TIMESTAMP WHERE id = $1", [id]);

  if (visitorRes.rows.length > 0) {
     const visitor = visitorRes.rows[0];
     const isAppointment = !!(visitor.invite_token || visitor.card_type === 'ลงทะเบียนล่วงหน้า');
     
     await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'RESIDENT'");
     await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS visitor_id INT DEFAULT NULL");
   
     await query(
       `INSERT INTO access_logs (license_plate, house_number, action, type, visitor_id) VALUES ($1, $2, 'OUT', 'VISITOR', $3)`,
       [visitor.vehicle_plate || 'UNKNOWN', visitor.house_number || null, id]
     );
     const houseNumber = visitor?.house_number;
     if (houseNumber) {
         try {
            const notifyRes = await query(
                "SELECT r.line_user_id, s.name as site_name FROM residents r LEFT JOIN sites s ON r.site_id = s.id WHERE r.house_number = $1 AND r.is_active = true AND r.line_user_id IS NOT NULL",
                [houseNumber]
            );
            if (notifyRes.rows.length > 0) {
                const siteName = notifyRes.rows[0].site_name;
                const checkoutMessages = generateVisitorExitFlexMessage(
                    visitor.purpose || visitor.full_name || "มาติดต่อ",
                    visitor.vehicle_plate ? `${visitor.vehicle_plate} ${visitor.vehicle_province || ''} ${visitor.vehicle_color ? `(สี${visitor.vehicle_color})` : ''}`.trim() : "ไม่ระบุทะเบียน",
                    new Date().toLocaleTimeString('th-TH'),
                    siteName,
                    visitor.image_url || undefined,
                    isAppointment
                );
                for (const r of notifyRes.rows) {
                    await sendLineMessage(r.line_user_id, checkoutMessages);
                }
            }
         } catch (e) {
            console.error("Failed to send LINE checkout notification:", e);
         }
     }
  }

  revalidatePath("/visitor");
  revalidatePath("/", "layout");
}

export async function deleteVisitor(id: number) {
  await query("DELETE FROM access_logs WHERE visitor_id = $1", [id]);
  await query("DELETE FROM visitors WHERE id = $1", [id]);
  revalidatePath("/visitor");
  revalidatePath("/monitor");
  revalidatePath("/", "layout");
}

export async function preRegisterVisitor(formData: FormData) {
  const inviteToken = formData.get("inviteToken") as string;
  const fullName = formData.get("fullName") as string;
  const vehiclePlate = formData.get("vehiclePlate") as string;
  const vehicleProvince = formData.get("vehicleProvince") as string;
  const vehicleColor = formData.get("vehicleColor") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const purpose = formData.get("purpose") as string;

  if (!fullName) return { success: false, message: "กรุณาระบุชื่อผู้ติดต่อ" };

  await query('ALTER TABLE visitors ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)');
  await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS vehicle_province VARCHAR(255)");
  await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS vehicle_color VARCHAR(100)");

  let imageUrl = null;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
      const ext = path.extname(imageFile.name) || ".jpg";
      const filename = `${crypto.randomUUID()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/vehicles");
      
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      
      imageUrl = `/uploads/vehicles/${filename}`;
  }

  if (inviteToken) {
      const res = await query("SELECT id FROM visitors WHERE invite_token = $1 AND status = 'INVITED'", [inviteToken]);
      if (res.rows.length === 0) {
          return { success: false, message: "ลิงก์นัดหมายนี้ถูกใช้งานไปแล้ว หรือหมดอายุการใช้งาน" };
      }
      
      if (imageUrl) {
          await query(
              `UPDATE visitors 
               SET full_name = $1, vehicle_plate = $2, vehicle_province = $3, vehicle_color = $4, phone_number = $5, purpose = $6, status = 'PRE', card_type = 'ลงทะเบียนล่วงหน้า', image_url = $8
               WHERE invite_token = $7`,
              [fullName, vehiclePlate || null, vehicleProvince || null, vehicleColor || null, phoneNumber || null, purpose || null, inviteToken, imageUrl]
          );
      } else {
          await query(
              `UPDATE visitors 
               SET full_name = $1, vehicle_plate = $2, vehicle_province = $3, vehicle_color = $4, phone_number = $5, purpose = $6, status = 'PRE', card_type = 'ลงทะเบียนล่วงหน้า'
               WHERE invite_token = $7`,
              [fullName, vehiclePlate || null, vehicleProvince || null, vehicleColor || null, phoneNumber || null, purpose || null, inviteToken]
          );
      }
      
      revalidatePath("/visitor");
      return { success: true };
  }
  
  // Fallback (if no token, might be public no-invite link, currently not used)
  return { success: false, message: "ไม่พบข้อมูลคำเชิญ" };
}

import { randomUUID } from "crypto";

export async function createVisitorInvite(data: {
    fullName: string;
    purpose: string;
    residentId: string;
    expectedDate: string;
}) {
    await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS invite_token VARCHAR(255), ADD COLUMN IF NOT EXISTS expected_in_time TIMESTAMP");
    
    let houseNumber = null;
    if (data.residentId) {
        const res = await query("SELECT house_number FROM residents WHERE id = $1", [data.residentId]);
        if (res.rows.length > 0) houseNumber = res.rows[0].house_number;
    }
    
    const token = randomUUID();
    
    await query(
        `INSERT INTO visitors (full_name, purpose, house_number, status, card_type, invite_token, expected_in_time) 
         VALUES ($1, $2, $3, 'INVITED', 'คำเชิญ', $4, $5)`,
        [data.fullName, data.purpose || null, houseNumber, token, data.expectedDate ? new Date(data.expectedDate) : null]
    );
    
    revalidatePath("/visitor");
    return { success: true, token };
}

export async function getVisitorInvite(token: string) {
    if (!token) return null;
    try {
        const res = await query(`SELECT full_name, purpose, house_number, expected_in_time FROM visitors WHERE invite_token = $1 AND status = 'INVITED'`, [token]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
    } catch {
        return null;
    }
}

export async function getResidentAppointments(residentId: number, year: number, month: number) {
    await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)");
    await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS e_stamp BOOLEAN DEFAULT false");
    await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS e_stamp_date TIMESTAMP");
    const res = await query("SELECT house_number FROM residents WHERE id = $1", [residentId]);
    if (res.rows.length === 0) return [];
    const houseNumber = res.rows[0].house_number;
    
    // Fetch visitors with status INVITED, PRE, IN, OUT for this month
    const listRes = await query(`
        SELECT id, full_name, vehicle_plate, purpose, status, expected_in_time, check_in_time, check_out_time, image_url, invite_token, e_stamp, e_stamp_date
        FROM visitors
        WHERE house_number = $1 
          AND (
            EXTRACT(YEAR FROM COALESCE(expected_in_time, check_in_time, created_at)) = $2
            AND EXTRACT(MONTH FROM COALESCE(expected_in_time, check_in_time, created_at)) = $3
          )
        ORDER BY created_at DESC
    `, [houseNumber, year, month]);
    
    return listRes.rows;
}

export async function confirmVisitorIn(id: number) {
  await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS e_stamp BOOLEAN DEFAULT false");
  await query("ALTER TABLE visitors ADD COLUMN IF NOT EXISTS e_stamp_date TIMESTAMP");

  const checkRes = await query("SELECT expected_in_time, invite_token, card_type, status FROM visitors WHERE id = $1", [id]);
  let isAppointment = false;
  if (checkRes.rows.length > 0) {
      const row = checkRes.rows[0];
      if (row.invite_token || row.card_type === 'ลงทะเบียนล่วงหน้า' || row.status === 'PRE') {
          isAppointment = true;
      }
      if (row.expected_in_time) {
          const exp = new Date(row.expected_in_time);
          const now = new Date();
          const thaiExp = new Date(exp.getTime() + 7 * 3600000);
          const thaiNow = new Date(now.getTime() + 7 * 3600000);
          const isSameDay = thaiExp.getUTCDate() === thaiNow.getUTCDate() && thaiExp.getUTCMonth() === thaiNow.getUTCMonth() && thaiExp.getUTCFullYear() === thaiNow.getUTCFullYear();
          if (!isSameDay || now.getTime() < exp.getTime()) {
              return; // Server action reject
          }
      }
  }

  if (isAppointment) {
      await query("UPDATE visitors SET status = 'IN', check_in_time = CURRENT_TIMESTAMP, e_stamp = true, e_stamp_date = CURRENT_TIMESTAMP WHERE id = $1", [id]);
  } else {
      await query("UPDATE visitors SET status = 'IN', check_in_time = CURRENT_TIMESTAMP WHERE id = $1", [id]);
  }
  
  const visitorRes = await query("SELECT id, full_name, purpose, house_number, vehicle_plate, vehicle_province, vehicle_color, image_url FROM visitors WHERE id = $1", [id]);
  if (visitorRes.rows.length > 0) {
      const visitor = visitorRes.rows[0];
      
      await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'RESIDENT'");
      await query("ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS visitor_id INT DEFAULT NULL");

      await query(
          `INSERT INTO access_logs (license_plate, house_number, action, type, visitor_id) VALUES ($1, $2, 'IN', 'VISITOR', $3)`,
          [visitor.vehicle_plate || 'UNKNOWN', visitor.house_number || null, id]
      );

      // แจ้งเตือนผู้เช่า/ร้าน/บริษัทเมื่อแขกนัดหมายมาถึง
      if (visitor.house_number) {
         try {
            const notifyRes = await query("SELECT r.line_user_id, s.name as site_name FROM residents r LEFT JOIN sites s ON r.site_id = s.id WHERE r.house_number = $1 AND r.is_active = true AND r.line_user_id IS NOT NULL", [visitor.house_number]);
            if (notifyRes.rows.length > 0) {
                const siteName = notifyRes.rows[0].site_name;
                const liffUrl = !isAppointment && process.env.NEXT_PUBLIC_LIFF_ID ? `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}` : undefined;
                const messages = generateVisitorEntryFlexMessage(
                    visitor.purpose || visitor.full_name || "มาติดต่อ",
                    visitor.vehicle_plate ? `${visitor.vehicle_plate} ${visitor.vehicle_province || ''} ${visitor.vehicle_color ? `(สี${visitor.vehicle_color})` : ''}`.trim() : "ไม่ระบุทะเบียน",
                    visitor.image_url || undefined,
                    liffUrl,
                    siteName,
                    isAppointment
                );
                for (const r of notifyRes.rows) {
                    await sendLineMessage(r.line_user_id, messages);
                }
            }
         } catch (e) {
            console.error(e);
         }
      }
  }
  revalidatePath("/visitor");
  revalidatePath("/", "layout");
}

export async function cancelVisitorInvite(id: number) {
  await query("UPDATE visitors SET status = 'CANCELLED' WHERE id = $1 AND status = 'INVITED'", [id]);
  revalidatePath("/liff");
}
