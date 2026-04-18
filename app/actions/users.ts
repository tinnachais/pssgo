"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getUsers() {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("pssgo_session")?.value;
    
    let currentUser: any = null;
    if (sessionData) {
        const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
        if (decoded.userId === "admin") {
            const result = await query("SELECT * FROM users ORDER BY created_at DESC");
            return result.rows;
        }
        currentUser = await getUser(Number(decoded.userId));
    }

    if (!currentUser) return [];

    const level = currentUser.level || "Level1";
    if (level === "Level1") {
        const result = await query("SELECT * FROM users ORDER BY created_at DESC");
        return result.rows;
    }

    if (level === "Level2") {
        // Level 2 sees Level 3 users whose sites belong to Level 2's providers
        const providerIds = Array.isArray(currentUser.provider_ids) ? currentUser.provider_ids : [];
        if (providerIds.length === 0) return [];

        const result = await query(`
            SELECT u.* FROM users u
            WHERE u.level = 'Level3'
            AND EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(u.site_ids) as s_id
                JOIN sites s ON s.id = s_id.value::int
                WHERE s.provider_id = ANY($1::int[])
            )
            ORDER BY u.created_at DESC
        `, [providerIds]);
        return result.rows;
    }

    if (level === "Level3") {
        // Level 3 sees users (usually Level 3) in the same sites
        const siteIds = Array.isArray(currentUser.site_ids) ? currentUser.site_ids : [];
        if (siteIds.length === 0) return [];

        const result = await query(`
            SELECT u.* FROM users u
            WHERE u.site_ids ?| $1::text[]
            ORDER BY u.created_at DESC
        `, [siteIds.map(String)]);
        return result.rows;
    }

    return [];
}

export async function getUser(id: number) {
  const result = await query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function addUser(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string || "Guard";
  const level = formData.get("level") as string || "Level1";
  const passwordRaw = formData.get("password") as string;
  const providerIds = formData.getAll("provider_ids").map(id => Number(id)); // array of numbers
  const siteIds = formData.getAll("site_ids").map(id => Number(id)); // array of numbers
  
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let currentUserLevel = "Level1";
  if (sessionData) {
      const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
      currentUserLevel = decoded.level || "Level1";
  }

  // SECURITY: Level 2 can only create Level 3
  if (currentUserLevel === 'Level2' && level !== 'Level3') {
      throw new Error("คุณมีสิทธิ์สร้างได้เฉพาะผู้ใช้งานระดับ Level 3 เท่านั้น");
  }

  if (!firstName || !lastName || !email || !passwordRaw) throw new Error("Missing required fields");
  
  const crypto = require("crypto");
  const hashed = crypto.createHash("sha1").update(passwordRaw).digest("hex");

  try {
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_ids JSONB DEFAULT '[]'::jsonb");
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS site_ids JSONB DEFAULT '[]'::jsonb");
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Level1'");
  } catch(e) {}

  // If level 1, clear provider_ids and site_ids
  // If level 2, clear site_ids
  let finalProviderIds = providerIds;
  let finalSiteIds = siteIds;
  if (level === 'Level1') { finalProviderIds = []; finalSiteIds = []; }
  if (level === 'Level2') { finalSiteIds = []; }

  await query(
    `INSERT INTO users (first_name, last_name, email, role, level, password, provider_ids, site_ids) VALUES ($1, $2, $3, $4, $5, $6, CAST($7 AS jsonb), CAST($8 AS jsonb))`,
    [firstName, lastName, email, role, level, hashed, JSON.stringify(finalProviderIds), JSON.stringify(finalSiteIds)]
  );
  revalidatePath("/users");
  revalidatePath("/", "layout");
  redirect("/users");
}

export async function deleteUser(id: number) {
  await query("DELETE FROM users WHERE id = $1", [id]);
  revalidatePath("/users");
  revalidatePath("/", "layout");
}

export async function updateUser(id: number, formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string || "Guard";
  const level = formData.get("level") as string || "Level1";
  const passwordRaw = formData.get("password") as string;
  const providerIds = formData.getAll("provider_ids").map(pid => Number(pid));
  const siteIds = formData.getAll("site_ids").map(sid => Number(sid));
  
  if (!firstName || !lastName || !email) throw new Error("Missing required fields");
  
  try {
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_ids JSONB DEFAULT '[]'::jsonb");
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS site_ids JSONB DEFAULT '[]'::jsonb");
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Level1'");
  } catch(e) {}

  let finalProviderIds = providerIds;
  let finalSiteIds = siteIds;
  if (level === 'Level1') { finalProviderIds = []; finalSiteIds = []; }
  if (level === 'Level2') { finalSiteIds = []; }

  if (passwordRaw && passwordRaw.trim() !== "") {
      const crypto = require("crypto");
      const hashed = crypto.createHash("sha1").update(passwordRaw).digest("hex");
      await query(
        "UPDATE users SET first_name = $1, last_name = $2, email = $3, role = $4, level = $5, password = $6, provider_ids = CAST($7 AS jsonb), site_ids = CAST($8 AS jsonb) WHERE id = $9",
        [firstName, lastName, email, role, level, hashed, JSON.stringify(finalProviderIds), JSON.stringify(finalSiteIds), id]
      );
  } else {
      await query(
        "UPDATE users SET first_name = $1, last_name = $2, email = $3, role = $4, level = $5, provider_ids = CAST($6 AS jsonb), site_ids = CAST($7 AS jsonb) WHERE id = $8",
        [firstName, lastName, email, role, level, JSON.stringify(finalProviderIds), JSON.stringify(finalSiteIds), id]
      );
  }
  
  revalidatePath("/users");
  revalidatePath("/", "layout");
  redirect("/users");
}

export async function updateSelf(formData: FormData) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("pssgo_session")?.value;
    if (!sessionData) throw new Error("Unauthorized");
    
    const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
    const userId = Number(decoded.userId);
    if (isNaN(userId)) throw new Error("Invalid User Session");

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const passwordRaw = formData.get("password") as string;

    if (!firstName || !lastName || !email) throw new Error("Missing required fields");

    if (passwordRaw && passwordRaw.trim() !== "") {
        const crypto = require("crypto");
        const hashed = crypto.createHash("sha1").update(passwordRaw).digest("hex");
        await query(
            "UPDATE users SET first_name = $1, last_name = $2, email = $3, password = $4 WHERE id = $5",
            [firstName, lastName, email, hashed, userId]
        );
    } else {
        await query(
            "UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4",
            [firstName, lastName, email, userId]
        );
    }
    
    revalidatePath("/", "layout");
    revalidatePath("/profile");
    return { success: true, message: "โปรไฟล์ถูกอัปเดตเรียบร้อยแล้ว" };
}

export async function requestEmailChangeOTP(newEmail: string) {
    // Ensure table exists
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS verification_codes (
                id SERIAL PRIMARY KEY,
                user_id INT,
                email VARCHAR(255),
                code VARCHAR(6),
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (err) {
        console.error("Failed to create verification_codes table:", err);
    }

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("pssgo_session")?.value;
    if (!sessionData) throw new Error("Unauthorized");
    
    const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
    const userId = Number(decoded.userId);

    // Check if email already in use
    const checkUser = await query("SELECT id FROM users WHERE email = $1 AND id != $2", [newEmail, userId]);
    if (checkUser.rows.length > 0) {
        throw new Error("อีเมลนี้ถูกใช้งานโดยบัญชีอื่นแล้ว");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await query(
        "INSERT INTO verification_codes (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)",
        [userId, newEmail, otp, expiresAt]
    );

    // SEND REAL EMAIL
    const { sendOTPEmail } = await import("@/lib/mail");
    await sendOTPEmail(newEmail, otp);

    return { success: true, message: "รหัส OTP ถูกส่งไปยังอีเมลใหม่ของคุณแล้ว" };
}

export async function verifyEmailChangeOTP(otp: string, newEmail: string) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("pssgo_session")?.value;
    if (!sessionData) throw new Error("Unauthorized");
    
    const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
    const userId = Number(decoded.userId);

    const result = await query(
        "SELECT * FROM verification_codes WHERE user_id = $1 AND email = $2 AND code = $3 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
        [userId, newEmail, otp]
    );

    if (result.rows.length === 0) {
        throw new Error("รหัส OTP ไม่ถูกต้องหรือหมดอายุ");
    }

    // Double check email uniqueness
    const checkUser = await query("SELECT id FROM users WHERE email = $1 AND id != $2", [newEmail, userId]);
    if (checkUser.rows.length > 0) {
        throw new Error("อีเมลนี้ถูกบัญชีอื่นใช้งานไปแล้วในระหว่างที่คุณกำลังขอรหัส");
    }

    // Update Email
    await query("UPDATE users SET email = $1 WHERE id = $2", [newEmail, userId]);
    
    // Clean up codes
    await query("DELETE FROM verification_codes WHERE user_id = $1", [userId]);

    revalidatePath("/", "layout");
    revalidatePath("/profile");
    
    return { success: true, message: "เปลี่ยนอีเมลเรียบร้อยแล้ว" };
}

export async function toggleUserStatus(id: number, isActive: boolean) {
  await query("UPDATE users SET is_active = $1 WHERE id = $2", [isActive, id]);
  revalidatePath("/", "layout");
}
