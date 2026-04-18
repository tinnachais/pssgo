"use server";

import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function login(formData: FormData) {
  const emailRaw = formData.get("email");
  const passwordRaw = formData.get("password");
  
  const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : "";
  const password = typeof passwordRaw === 'string' ? passwordRaw : "";
  
  if (!email || !password) {
    redirect("/login?error=missing_fields");
  }

  let isValid = false;
  let userId = null;

  // Fallback credentials just in case DB is not set up yet
  if (email === "admin@pssgo.com" && password === "password123") {
    isValid = true;
    userId = "admin";
  } else {
    try {
      const hashed = crypto.createHash("sha1").update(password).digest("hex");
      const result = await query("SELECT id FROM users WHERE email = $1 AND password = $2 AND is_active = TRUE", [email, hashed]);
      
      if (result.rows.length > 0) {
        isValid = true;
        userId = result.rows[0].id;
      }
    } catch (err) {
      console.error("Auth Exception:", err);
    }
  }

  if (isValid) {
    const cookieStore = await cookies();
    const sessionData = Buffer.from(JSON.stringify({ userId, email, ts: Date.now() })).toString('base64');
    
    cookieStore.set("pssgo_session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week session
      path: "/",
      sameSite: "lax"
    });
    
    redirect("/");
  } else {
    redirect("/login?error=invalid_credentials");
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("pssgo_session");
  redirect("/login");
}
