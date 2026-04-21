"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function analyzeCarImage(formData: FormData) {
  try {
    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) {
       return { success: false, message: "No image" };
    }

    // เรียก Plate Recognizer API โดยตรง
    const lprFormData = new FormData();
    lprFormData.append('upload', imageFile);
    lprFormData.append('regions', 'th');

    const lprResponse = await fetch('https://lpr.plawan.app/v1/plate-reader/', {
        method: 'POST',
        headers: {
            'Authorization': 'Token b696619c5bbdb3a2c86757bcb4c8e4838ed103cf',
        },
        body: lprFormData
    });

    const lprResult = await lprResponse.json();
    
    if (!lprResponse.ok) {
        throw new Error("LPR API Error: " + JSON.stringify(lprResult));
    }

    if (!lprResult.results || lprResult.results.length === 0) {
        return { success: false, message: "ไม่พบป้ายทะเบียนในรูปภาพ" };
    }

    const firstResult = lprResult.results[0];
    const plate = firstResult.plate ? firstResult.plate.toUpperCase() : "";
    
    // แปลสี
    let rawColor = "";
    if (firstResult.color && firstResult.color.length > 0) {
        rawColor = firstResult.color[0].color;
    }
    const colorMap: Record<string, string> = {
        white: "ขาว", black: "ดำ", silver: "บรอนซ์เงิน", gray: "เทา",
        red: "แดง", blue: "น้ำเงิน", yellow: "เหลือง", green: "เขียว",
        brown: "น้ำตาล", gold: "ทอง", orange: "ส้ม"
    };
    const thaiColor = colorMap[rawColor.toLowerCase()] || rawColor;

    // จังหวัด (Plawan LPR อาจส่งมาในฟิลด์ province หรือ region)
    let province = firstResult.province || "";
    if (!province && firstResult.region) {
        if (firstResult.region.name) {
            province = firstResult.region.name;
        } else if (firstResult.region.code) {
             const code = firstResult.region.code.toLowerCase();
             const thProvinces: Record<string, string> = {
                "th-10": "กรุงเทพมหานคร", "th-11": "สมุทรปราการ", "th-12": "นนทบุรี", "th-13": "ปทุมธานี", "th-14": "พระนครศรีอยุธยา",
                "th-15": "อ่างทอง", "th-16": "ลพบุรี", "th-17": "สิงห์บุรี", "th-18": "ชัยนาท", "th-19": "สระบุรี",
                "th-20": "ชลบุรี", "th-21": "ระยอง", "th-22": "จันทบุรี", "th-23": "ตราด", "th-24": "ฉะเชิงเทรา",
                "th-25": "ปราจีนบุรี", "th-26": "นครนายก", "th-27": "สระแก้ว", "th-30": "นครราชสีมา", "th-31": "บุรีรัมย์",
                "th-32": "สุรินทร์", "th-33": "ศรีสะเกษ", "th-34": "อุบลราชธานี", "th-35": "ยโสธร", "th-36": "ชัยภูมิ",
                "th-37": "อำนาจเจริญ", "th-38": "บึงกาฬ", "th-39": "หนองบัวลำภู", "th-40": "ขอนแก่น", "th-41": "อุดรธานี",
                "th-42": "เลย", "th-43": "หนองคาย", "th-44": "มหาสารคาม", "th-45": "ร้อยเอ็ด", "th-46": "กาฬสินธุ์",
                "th-47": "สกลนคร", "th-48": "นครพนม", "th-49": "มุกดาหาร", "th-50": "เชียงใหม่", "th-51": "ลำพูน",
                "th-52": "ลำปาง", "th-53": "อุตรดิตถ์", "th-54": "แพร่", "th-55": "น่าน", "th-56": "พะเยา",
                "th-57": "เชียงราย", "th-58": "แม่ฮ่องสอน", "th-60": "นครสวรรค์", "th-61": "อุทัยธานี", "th-62": "กำแพงเพชร",
                "th-63": "ตาก", "th-64": "สุโขทัย", "th-65": "พิษณุโลก", "th-66": "พิจิตร", "th-67": "เพชรบูรณ์",
                "th-70": "ราชบุรี", "th-71": "กาญจนบุรี", "th-72": "สุพรรณบุรี", "th-73": "นครปฐม", "th-74": "สมุทรสาคร",
                "th-75": "สมุทรสงคราม", "th-76": "เพชรบุรี", "th-77": "ประจวบคีรีขันธ์", "th-80": "นครศรีธรรมราช", "th-81": "กระบี่",
                "th-82": "พังงา", "th-83": "ภูเก็ต", "th-84": "สุราษฎร์ธานี", "th-85": "ระนอง", "th-86": "ชุมพร",
                "th-90": "สงขลา", "th-91": "สตูล", "th-92": "ตรัง", "th-93": "พัทลุง", "th-94": "ปัตตานี",
                "th-95": "ยะลา", "th-96": "นราธิวาส"
             };
             province = thProvinces[code] || code.replace("th-", "").toUpperCase();
        }
    }

    let vehicleType = "";
    if (firstResult.vehicle && firstResult.vehicle.type) {
        const typeStr = firstResult.vehicle.type.toLowerCase();
        const typeMap: Record<string, string> = {
            "sedan": "รถยนต์", "suv": "รถยนต์ (SUV)", "pickup": "รถกระบะ", "truck": "รถบรรทุก",
            "motorcycle": "รถจักรยานยนต์", "van": "รถตู้", "bus": "รถบัส"
        };
        vehicleType = typeMap[typeStr] || typeStr;
    }

    const carData = {
        licensePlate: plate,
        province: province,
        color: thaiColor,
        type: vehicleType
    };

    return { success: true, data: carData };

  } catch (err: any) {
    console.error("LPR Analysis Error:", err);
    return { success: false, message: "LPR ล้มเหลว: " + err.message };
  }
}

export async function getLiffProfileData(lineUserId: string) {
    try {
        await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT true");
        await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS parent_id INT DEFAULT NULL");
        await query("ALTER TABLE residents ADD COLUMN IF NOT EXISTS privacy_mode BOOLEAN DEFAULT FALSE");

        await query("ALTER TABLE sites ADD COLUMN IF NOT EXISTS contact_link VARCHAR(255)");
        await query("ALTER TABLE sites ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMP");
        const res = await query("SELECT r.*, s.name as site_name, s.lat as site_lat, s.lng as site_lng, s.contact_link as site_contact_link, s.package_expires_at FROM residents r LEFT JOIN sites s ON r.site_id = s.id WHERE r.line_user_id = $1 AND r.is_active = true LIMIT 1", [lineUserId]);
        if (res.rows.length === 0) {
            return { isRegistered: false };
        }
        const resident = res.rows[0];

        if (!resident.site_lat || !resident.site_lng || !resident.site_contact_link) {
            // Fallback to first site if site_id is missing or site has no lat/lng/contact
            const fallbackSite = await query("SELECT lat, lng, name as site_name, contact_link FROM sites WHERE lat IS NOT NULL AND lat != '' AND lng IS NOT NULL AND lng != '' ORDER BY id ASC LIMIT 1");
            if (fallbackSite.rows.length > 0) {
                resident.site_lat = resident.site_lat || fallbackSite.rows[0].lat;
                resident.site_lng = resident.site_lng || fallbackSite.rows[0].lng;
                resident.site_name = resident.site_name || fallbackSite.rows[0].site_name;
                resident.site_contact_link = resident.site_contact_link || fallbackSite.rows[0].contact_link;
            }
        }
        
        const vehiclesQuery = await query(`
            SELECT v.*, r.line_display_name, r.line_picture_url, r.owner_name, vt.name as type_name 
            FROM vehicles v 
            LEFT JOIN residents r ON v.resident_id = r.id 
            LEFT JOIN vehicle_types vt ON v.type_id = vt.id
            WHERE v.house_number = $1 
            ORDER BY v.created_at DESC
        `, [resident.house_number]);
        const vehicles = vehiclesQuery.rows;

        // Ensure columns exist before querying
        await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS max_vehicles INT DEFAULT 2');
        await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS max_residents INT DEFAULT 2');

        let siteLimitQuery;
        if (resident.site_id) {
            siteLimitQuery = await query(`SELECT max_vehicles, max_residents FROM sites WHERE id = $1`, [resident.site_id]);
        } else {
            siteLimitQuery = await query(`SELECT max_vehicles, max_residents FROM sites LIMIT 1`);
        }
        const maxVehicles = (siteLimitQuery.rows.length > 0 && siteLimitQuery.rows[0].max_vehicles) ? siteLimitQuery.rows[0].max_vehicles : 1;
        const maxResidents = (siteLimitQuery.rows.length > 0 && siteLimitQuery.rows[0].max_residents) ? siteLimitQuery.rows[0].max_residents : 2;

        const familyMembersQuery = await query("SELECT id, owner_name, line_user_id, line_display_name, line_picture_url, is_active, created_at, invite_code FROM residents WHERE parent_id = $1 ORDER BY created_at DESC", [resident.id]);
        const familyMembers = familyMembersQuery.rows;

        let isVillageFull = false;
        if (resident.site_id) {
            const pkgQuery = await query(`
                SELECT p.max_vehicles 
                FROM sites s JOIN packages p ON s.package_id = p.id
                WHERE s.id = $1
            `, [resident.site_id]);
            if (pkgQuery.rows.length > 0 && pkgQuery.rows[0].max_vehicles) {
                const tvQuery = await query("SELECT COUNT(*) as count FROM vehicles WHERE site_id = $1 AND is_active = true", [resident.site_id]);
                if (parseInt(tvQuery.rows[0].count, 10) >= pkgQuery.rows[0].max_vehicles) {
                    isVillageFull = true;
                }
            }
        }

        return {
            isRegistered: true,
            resident,
            vehicles,
            familyMembers,
            maxVehicles,
            maxResidents,
            isVillageFull,
            isExpired: resident.package_expires_at ? new Date(resident.package_expires_at) < new Date() : true
        };
    } catch (err) {
        console.error("fetch profile error", err);
        return { isRegistered: false };
    }
}

export async function linkLineAccount(formData: FormData) {
  try {
    const inviteCode = formData.get("inviteCode") as string;
    const lineUserId = formData.get("lineUserId") as string;
    const displayName = formData.get("displayName") as string;
    const pictureUrl = formData.get("pictureUrl") as string;
    const imageFile = formData.get("image") as File | null;

    if (!inviteCode || !lineUserId) {
      return { success: false, message: "ข้อมูลไม่ครบถ้วน กรุณาลองใหม่" };
    }

    // 1. ค้นหาลูกบ้านจาก Invite Code 
    const res = await query(
      `SELECT id, house_number, license_plate, line_user_id, site_id FROM residents WHERE invite_code = $1 AND is_active = true`,
      [inviteCode]
    );

    if (res.rows.length === 0) {
      return { success: false, message: "รหัส Invite Code ไม่ถูกต้อง หรือไม่มีอยู่ในระบบ" };
    }

    const resident = res.rows[0];

    // 2. ตรวจสอบเงื่อนไขว่ารหัสนี้ถูกผูกไปหรือยัง
    if (resident.line_user_id && resident.line_user_id !== lineUserId) {
      return { success: false, message: "รหัส Invite Code นี้ถูกใช้งานโดยบัญชีอื่นไปแล้ว" };
    }

    // 3. อัปเดตข้อมูลผูกบัญชี LINE 
    await query(
      `UPDATE residents SET line_user_id = $1, line_display_name = $2, line_picture_url = $3 WHERE id = $4`,
      [lineUserId, displayName, pictureUrl, resident.id]
    );

    let detectedPlate = formData.get("detectedPlate") as string || resident.license_plate;
    let detectedColor = formData.get("detectedColor") as string || "ไม่ระบุ";
    let detectedProvince = formData.get("detectedProvince") as string || "";
    let detectedType = formData.get("detectedType") as string || "";
    let addedCar = false;

    // ถ้ามีการส่งข้อมูล AI หรือกรอกข้อมูลป้ายทะเบียนรถเข้ามา
    if (detectedPlate && detectedPlate !== "N/A") {
         const provinceToSave = detectedProvince && detectedProvince !== "N/A" ? detectedProvince : null;
         
         // 1. ตรวจสอบว่ามีรถคันนี้อยู่ในระบบแล้วหรือไม่ (ทะเบียนและจังหวัดเดียวกันในสถานที่เดียวกัน)
         let existingVehicle;
         if (resident.site_id) {
             existingVehicle = await query(
                 `SELECT id, house_number FROM vehicles WHERE license_plate = $1 AND (province = $2 OR ($2 IS NULL AND province IS NULL)) AND site_id = $3`,
                 [detectedPlate, provinceToSave, resident.site_id]
             );
         } else {
             existingVehicle = await query(
                 `SELECT id, house_number FROM vehicles WHERE license_plate = $1 AND (province = $2 OR ($2 IS NULL AND province IS NULL))`,
                 [detectedPlate, provinceToSave]
             );
         }

         if (existingVehicle.rows.length === 0) {
             // ถ้ารถยังไม่เคยมีในระบบ ต้องเช็คลิมิต (Layer 1: Per-House Max)
             let siteLimitQuery;
             if (resident.site_id) {
                 siteLimitQuery = await query(`SELECT max_vehicles FROM sites WHERE id = $1`, [resident.site_id]);
             } else {
                 siteLimitQuery = await query(`SELECT max_vehicles FROM sites LIMIT 1`);
             }
             const maxVehicles = (siteLimitQuery.rows.length > 0 && siteLimitQuery.rows[0].max_vehicles) ? siteLimitQuery.rows[0].max_vehicles : 1;
             
             const vehicleCountQuery = await query(`SELECT COUNT(*) as count FROM vehicles WHERE house_number = $1 AND is_active = true`, [resident.house_number]);
             const currentVehicles = parseInt(vehicleCountQuery.rows[0].count, 10);
             
             if (currentVehicles >= maxVehicles) {
                 return { success: false, message: `ไม่สามารถเพิ่มรถได้ เนื่องจากบ้านของคุณเพิ่มรถครบจำนวนสูงสุดแล้ว (${maxVehicles} คัน)` };
             }

             // Layer 2: Total Village Package Max
             if (resident.site_id) {
                 const pkgQuery = await query(`
                     SELECT p.max_vehicles 
                     FROM sites s JOIN packages p ON s.package_id = p.id
                     WHERE s.id = $1
                 `, [resident.site_id]);
                 if (pkgQuery.rows.length > 0 && pkgQuery.rows[0].max_vehicles) {
                     const packageMax = pkgQuery.rows[0].max_vehicles;
                     const tvQuery = await query("SELECT COUNT(*) as count FROM vehicles WHERE site_id = $1 AND is_active = true", [resident.site_id]);
                     const totalVillCars = parseInt(tvQuery.rows[0].count, 10);
                     if (totalVillCars >= packageMax) {
                         return { success: false, message: `ไม่สามารถเพิ่มรถได้ เนื่องจากหมู่บ้าน/อาคารของคุณใช้โควต้ายานพาหนะรวมเต็มจำนวนแล้ว กรุณาติดต่อส่วนกลาง` };
                     }
                 }
             }

             // ตรวจสอบคอลัมน์ image_url และ province และสร้างหากไม่มี
             await query('ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)');
             await query('ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS province VARCHAR(100)');
             await query('ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS resident_id INT DEFAULT NULL');

             // บันทึกไฟล์รูปรถลงเซิร์ฟเวอร์
             let imageUrl = "";
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

             // Map vehicleType string from AI to type_id in DB
             let typeId: number | null = null;
             if (detectedType) {
                 const typeQuery = await query(`SELECT id FROM vehicle_types WHERE name ILIKE $1 OR name ILIKE $2 LIMIT 1`, [`%${detectedType}%`, `%${detectedType.split(' ')[0]}%`]);
                 if (typeQuery.rows.length > 0) {
                     typeId = typeQuery.rows[0].id;
                 }
             }

             // Map default park_type "ลูกบ้าน" to park_type_id in DB
             let parkTypeId: number | null = null;
             const parkQuery = await query(`SELECT id FROM park_types WHERE name ILIKE '%ลูกบ้าน%' OR name ILIKE '%Resident%' OR code ILIKE '%RES%' LIMIT 1`);
             if (parkQuery.rows.length > 0) {
                 parkTypeId = parkQuery.rows[0].id;
             }

             // เพิ่มรถเข้าฐานข้อมูลรวมศูนย์ (vehicles) ทันที โดยแยกจังหวัดไปเก็บที่ช่อง province และฝัง site_id ด้วยเพื่อใช้นับโควต้า
             await query(
               "INSERT INTO vehicles (license_plate, house_number, color, image_url, province, resident_id, site_id, type_id, park_type_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
               [detectedPlate, resident.house_number, detectedColor, imageUrl, provinceToSave, resident.id, resident.site_id, typeId, parkTypeId]
             );
             addedCar = true;
         } else {
             // ถ้ารถมีอยู่แล้ว เช็คว่าเป็นของบ้านตัวเองหรือไม่
             if (existingVehicle.rows[0].house_number !== resident.house_number) {
                 return { success: false, message: `ป้ายทะเบียนนี้ถูกลงทะเบียนไว้แล้วโดยบ้านเลขที่ ${existingVehicle.rows[0].house_number} ในสถานที่นี้` };
             }
         }

         // อัปเดตรูปแบบที่แสดงผลหน้าแรก (รวมจังหวัด) ของลูกบ้านให้เป็นคันล่าสุดที่เพิ่ม
         const residentPlateDisplay = detectedProvince && detectedProvince !== "N/A" ? `${detectedPlate} ${detectedProvince}` : detectedPlate;
         await query("UPDATE residents SET license_plate = $1 WHERE id = $2", [residentPlateDisplay, resident.id]);
    }

    revalidatePath("/residents");
    revalidatePath("/vehicles");

    return { 
        success: true, 
        message: addedCar ? "ลงทะเบียนสำเร็จและเพิ่มรถเข้าสู่ระบบอัตโนมัติแล้ว!" : "ผูกบัญชีสำเร็จเรียบร้อย!",
        data: {
             houseNumber: resident.house_number,
             licensePlate: detectedPlate,
             color: detectedColor,
             addedViaAi: addedCar
        }
    };
  } catch (error: any) {
    console.error("LIFF Link Error:", error);
    return { success: false, message: "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function generateFamilyInvite(ownerId: number, memberName: string) {
    try {
        const ownerRes = await query("SELECT house_number, is_owner, site_id FROM residents WHERE id = $1 AND is_active = true", [ownerId]);
        if (ownerRes.rows.length === 0 || !ownerRes.rows[0].is_owner) {
            return { success: false, message: "อนุญาตเฉพาะเจ้าบ้านเท่านั้น" };
        }
        
        const houseNumber = ownerRes.rows[0].house_number;
        const siteId = ownerRes.rows[0].site_id;

        // ดึงโควต้า "จำนวนรถสูงสุดต่อบ้าน" มาใช้เป็นจำนวนลูกบ้านสูงสุดต่อบ้านด้วยเลย
        let limitQuery;
        if (siteId) {
            limitQuery = await query(`SELECT max_vehicles FROM sites WHERE id = $1`, [siteId]);
        } else {
            limitQuery = await query(`SELECT max_vehicles FROM sites LIMIT 1`);
        }
        const maxLimit = (limitQuery.rows.length > 0 && limitQuery.rows[0].max_vehicles) ? limitQuery.rows[0].max_vehicles : 1;
        
        const familyCountQuery = await query("SELECT COUNT(*) FROM residents WHERE parent_id = $1 OR id = $1", [ownerId]);
        const currentCount = parseInt(familyCountQuery.rows[0].count, 10);
        
        if (currentCount >= maxLimit) {
             return { success: false, message: `ไม่สามารถเพิ่มชาวบ้านได้เกินโควต้า (${maxLimit} คนต่อบ้าน ตามจำนวนรถ)` };
        }

        const inviteCode = "PSS-FAM-" + crypto.randomBytes(3).toString("hex").toUpperCase();
        
        try {
             // Drop the unique constraint if it exists because new system uses vehicles table
             await query("ALTER TABLE residents DROP CONSTRAINT IF EXISTS residents_license_plate_key");
        } catch(e) {
             // Ignore if fails
        }

        await query(
            "INSERT INTO residents (house_number, license_plate, invite_code, owner_name, is_owner, parent_id) VALUES ($1, $2, $3, $4, $5, $6)",
            [houseNumber, `สมาชิกร่วมบ้าน-${crypto.randomBytes(3).toString("hex")}`, inviteCode, memberName, false, ownerId]
        );
        
        return { success: true, message: "สร้างลิงก์เชิญสำเร็จ", inviteCode };
    } catch (err: any) {
        return { success: false, message: "การสร้างลิงก์เชิญล้มเหลว: " + err.message };
    }
}

export async function revokeFamilyMember(memberId: number, ownerId: number) {
    try {
        const ownerRes = await query("SELECT is_owner FROM residents WHERE id = $1 AND is_active = true", [ownerId]);
        if (ownerRes.rows.length === 0 || !ownerRes.rows[0].is_owner) {
            return { success: false, message: "อนุญาตเฉพาะเจ้าบ้านเท่านั้น" };
        }
        
        await query("DELETE FROM residents WHERE id = $1 AND parent_id = $2", [memberId, ownerId]);
        return { success: true, message: "ยกเลิกข้อมูลลูกบ้านสำเร็จ" };
    } catch (err: any) {
        return { success: false, message: "การลบล้มเหลว: " + err.message };
    }
}

export async function updateLiffProfile(id: number, lineUserId: string, data: { ownerName: string, phoneNumber: string }) {
    try {
        const res = await query("UPDATE residents SET owner_name = $1, phone_number = $2 WHERE id = $3 AND line_user_id = $4", 
            [data.ownerName, data.phoneNumber, id, lineUserId]);
        if (res.rowCount === 0) return { success: false, message: "ไม่มีสิทธิ์ในการแก้ไขข้อมูลนี้" };
        return { success: true, message: "บันทึกข้อมูลส่วนตัวสำเร็จ" };
    } catch (err: any) {
        return { success: false, message: "เกิดข้อผิดพลาด: " + err.message };
    }
}

export async function deleteLiffVehicle(vehicleId: number, residentId: number) {
    try {
        const residentQuery = await query("SELECT house_number, is_owner FROM residents WHERE id = $1", [residentId]);
        if (residentQuery.rows.length === 0) {
           return { success: false, message: "ไม่พบข้อมูลผู้ใช้" };
        }
        
        const resident = residentQuery.rows[0];
        
        let vehicleLicensePlate = "";
        
        let res;
        if (resident.is_owner) {
             // เจ้าบ้านลบรถทุกคันในบ้านตัวเองได้
             const vQuery = await query("SELECT license_plate FROM vehicles WHERE id = $1 AND house_number = $2", [vehicleId, resident.house_number]);
             if (vQuery.rows.length > 0) vehicleLicensePlate = vQuery.rows[0].license_plate;
        } else {
             // สมาชิกย่อยลบได้เฉพาะรถที่ตัวเองแอดมา
             const vQuery = await query("SELECT license_plate FROM vehicles WHERE id = $1 AND resident_id = $2", [vehicleId, residentId]);
             if (vQuery.rows.length > 0) vehicleLicensePlate = vQuery.rows[0].license_plate;
        }

        if (!vehicleLicensePlate) {
            return { success: false, message: "ไม่มีสิทธิ์ในการลบรถคันนี้ หรือไม่พบข้อมูลรถ" };
        }

        // ตรวจสอบสถานะว่ารถอยู่ข้างในหรือไม่ (ห้ามเปลี่ยน/ลบ ถ้ารถยังอยู่ในพื้นที่)
        const latestLog = await query(
            "SELECT action FROM access_logs WHERE license_plate = $1 ORDER BY created_at DESC LIMIT 1",
            [vehicleLicensePlate]
        );
        if (latestLog.rows.length > 0 && latestLog.rows[0].action === 'IN') {
             return { success: false, message: "ไม่สามารถลบ/เปลี่ยนรถได้ เนื่องจากรถคันดังกล่าวยังจอดอยู่ในพื้นที่สถานที่" };
        }

        if (resident.is_owner) {
             res = await query("DELETE FROM vehicles WHERE id = $1 AND house_number = $2 RETURNING id", [vehicleId, resident.house_number]);
        } else {
             res = await query("DELETE FROM vehicles WHERE id = $1 AND resident_id = $2 RETURNING id", [vehicleId, residentId]);
        }
        
        if (res.rows.length === 0) {
            return { success: false, message: "ไม่มีสิทธิ์ในการลบรถคันนี้" };
        }
        return { success: true, message: "ลบรถคันนี้สำเร็จ" };
    } catch (err: any) {
        return { success: false, message: "เกิดข้อผิดพลาดในการลบรถ" };
    }
}

export async function togglePrivacyMode(lineUserId: string, mode: boolean) {
    if (!lineUserId) return { success: false, message: "Unauthorized" };
    try {
        await query(`
            UPDATE residents SET privacy_mode = $1 
            WHERE house_number = (SELECT house_number FROM residents WHERE line_user_id = $2 LIMIT 1)
        `, [mode, lineUserId]);
        return { success: true };
    } catch (e: any) {
        console.error("Failed to toggle privacy mode:", e);
        return { success: false, message: e.message };
    }
}

export async function getResidentAccessLogs(houseNumber: string) {
    if (!houseNumber) return [];
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS access_logs (
                id SERIAL PRIMARY KEY,
                license_plate VARCHAR(50),
                house_number VARCHAR(50),
                action VARCHAR(10), -- 'IN' or 'OUT'
                image_url TEXT,
                gate_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // We can check logs for this specific house, or by specific license_plates
        // For right now, we check by house_number in access_logs or by vehicles belonging to house_number
        const res = await query(`
            SELECT * FROM access_logs 
            WHERE house_number = $1 OR license_plate IN (SELECT license_plate FROM vehicles WHERE house_number = $1)
            ORDER BY created_at DESC 
            LIMIT 50
        `, [houseNumber]);

        return res.rows;
    } catch (e: any) {
        console.error("Failed to get access logs:", e);
        return [];
    }
}

export async function eStampVisitor(visitorId: number, residentId: number) {
    try {
        await query('ALTER TABLE visitors ADD COLUMN IF NOT EXISTS e_stamp BOOLEAN DEFAULT false');
        await query('ALTER TABLE visitors ADD COLUMN IF NOT EXISTS e_stamp_date TIMESTAMP');
        
        const residentQuery = await query('SELECT house_number FROM residents WHERE id = $1', [residentId]);
        if (residentQuery.rows.length === 0) {
           return { success: false, message: 'ไม่พบข้อมูลผู้ใช้' };
        }
        const houseNumber = residentQuery.rows[0].house_number;
        
        const res = await query('UPDATE visitors SET e_stamp = true, e_stamp_date = CURRENT_TIMESTAMP WHERE id = $1 AND house_number = $2 RETURNING id', [visitorId, houseNumber]);
        
        if (res.rows.length === 0) {
            return { success: false, message: 'ไม่มีสิทธิ์ หรือไม่พบผู้มาติดต่อนี้' };
        }
        return { success: true, message: 'ประทับตรา E-Stamp สำเร็จ' };
    } catch (err: any) {
        return { success: false, message: 'เกิดข้อผิดพลาดในการประทับตรา' };
    }
}
