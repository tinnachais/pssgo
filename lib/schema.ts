import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

// ไซต์หรือโครงการ (Master Key สำหรับ Multi-tenancy)
export const sites = pgTable("sites", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// ข้อมูลลูกบ้านและรถที่ลงทะเบียน (Whitelist)
export const residents = pgTable("residents", {
    id: serial("id").primaryKey(),
    siteId: integer("site_id").notNull().references(() => sites.id, { onDelete: 'cascade' }),
    houseNumber: text("house_number").notNull(),
    licensePlate: text("license_plate").notNull(),
    lineUserId: text("line_user_id"),
    lineDisplayName: text("line_display_name"),
    linePictureUrl: text("line_picture_url"),
    inviteCode: text("invite_code").unique(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// บันทึกการเข้า-ออกรถยนต์
export const vehicleLogs = pgTable("vehicle_logs", {
    id: serial("id").primaryKey(),
    siteId: integer("site_id").notNull().references(() => sites.id, { onDelete: 'cascade' }),
    licensePlate: text("license_plate").notNull(),
    vehicleType: text("vehicle_type"),           // ประเภทรถ เช่น เก๋ง, กระบะ (อาจมาจาก LPR หรือให้ รปภ กรอก)
    houseNumber: text("house_number"),           // บ้านที่ติดต่อ
    purpose: text("purpose"),                    // วัตถุประสงค์
    lprImageUrl: text("lpr_image_url"),          // URL รูปภาพจากกล้อง
    lprConfidence: text("lpr_confidence"),       // ความแม่นยำในการอ่านป้าย %
    entryTime: timestamp("entry_time").defaultNow(),
    exitTime: timestamp("exit_time"),
    status: text("status").default("IN"),        // 'IN' หรือ 'OUT'
    isResident: boolean("is_resident").default(false), // เป็นรถลูกบ้านหรือไม่ (เช็คจาก residents table)
    updatedAt: timestamp("updated_at").defaultNow(),
});

// กลุ่มสิทธิ์การใช้งาน
export const roles = pgTable("roles", {
    id: serial("id").primaryKey(),
    siteId: integer("site_id").notNull().references(() => sites.id, { onDelete: 'cascade' }),
    name: text("name").notNull(),
    description: text("description"),
    permissions: text("permissions"), // JSON string of allowed modules
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// ผู้ใช้งานระบบ
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    siteId: integer("site_id").notNull().references(() => sites.id, { onDelete: 'cascade' }),
    roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    fullName: text("full_name").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});
