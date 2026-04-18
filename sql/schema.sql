-- Provider (องค์กร/บริษัท ผู้รับรายได้และออกใบกำกับภาษี)
CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    tax_id TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ข้อมูลโครงการ/หมู่บ้าน (Sites)
CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ข้อมูลพื้นที่/โซนย่อย (Zones) อยู่ภายใต้ Sites
CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ประเภทของจุดติดตั้ง (Gate Types)
CREATE TABLE IF NOT EXISTS gate_types (
    id SERIAL PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ประเภทรถยนต์ (Vehicle Types)
CREATE TABLE IF NOT EXISTS vehicle_types (
    id SERIAL PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ยี่ห้อรถยนต์ (Vehicle Brands)
CREATE TABLE IF NOT EXISTS vehicle_brands (
    id SERIAL PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สีรถยนต์ (Vehicle Colors)
CREATE TABLE IF NOT EXISTS vehicle_colors (
    id SERIAL PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ประเภทที่จอดรถ (Park Types)
CREATE TABLE IF NOT EXISTS park_types (
    id SERIAL PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- อัตราค่าจอดรถ (Parking Fees)
CREATE TABLE IF NOT EXISTS parking_fees (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ส่วนลดค่าจอดรถ (Parking Discounts)
CREATE TABLE IF NOT EXISTS parking_discounts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ค่าปรับ (Parking Fines)
CREATE TABLE IF NOT EXISTS parking_fines (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    fine_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- วันหยุดพิเศษ (Special Days / Holidays)
CREATE TABLE IF NOT EXISTS special_days (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- จุดติดตั้งกล้อง LPR / ไม้กั้น (Gates) อยู่ภายใต้ Zones
CREATE TABLE IF NOT EXISTS gates (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES zones(id) ON DELETE CASCADE,
    type_id INTEGER REFERENCES gate_types(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ข้อมูลลูกบ้านและรถที่ลงทะเบียน (Whitelist)
CREATE TABLE IF NOT EXISTS residents (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    house_number TEXT NOT NULL,
    license_plate TEXT NOT NULL UNIQUE,
    line_user_id TEXT,
    invite_code TEXT UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ข้อมูลยานพาหนะรวมศูนย์ (Vehicles)
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    type_id INTEGER REFERENCES vehicle_types(id) ON DELETE SET NULL,
    park_type_id INTEGER REFERENCES park_types(id) ON DELETE SET NULL,
    license_plate TEXT NOT NULL,
    province TEXT,
    brand TEXT,
    color TEXT,
    owner_name TEXT,
    house_number TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- กลุ่มรายรับ (Revenue Groups)
CREATE TABLE IF NOT EXISTS revenue_groups (
    id SERIAL PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ประเภทรายรับ (Revenue Types)
CREATE TABLE IF NOT EXISTS revenue_types (
    id SERIAL PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- วิธีรับชำระเงิน (Revenue Methods)
CREATE TABLE IF NOT EXISTS revenue_methods (
    id SERIAL PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ข้อมูลรายได้/ใบเสร็จ (Revenues)
CREATE TABLE IF NOT EXISTS revenues (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES revenue_groups(id) ON DELETE SET NULL,
    type_id INTEGER REFERENCES revenue_types(id) ON DELETE SET NULL,
    method_id INTEGER REFERENCES revenue_methods(id) ON DELETE SET NULL,
    receipt_no TEXT UNIQUE NOT NULL,
    license_plate TEXT,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'CASH',
    payment_status TEXT DEFAULT 'PAID',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- บันทึกการเข้า-ออกรถยนต์
CREATE TABLE IF NOT EXISTS vehicle_logs (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    license_plate TEXT NOT NULL,
    vehicle_type TEXT,
    house_number TEXT,
    purpose TEXT,
    lpr_image_url TEXT,
    lpr_confidence TEXT,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP,
    status TEXT DEFAULT 'IN',
    is_resident BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ผู้มาติดต่อ (Visitors)
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    id_card_number TEXT,
    full_name TEXT NOT NULL,
    card_type TEXT DEFAULT 'ID Card',
    vehicle_plate TEXT,
    purpose TEXT,
    house_number TEXT,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    status TEXT DEFAULT 'IN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration สำหรับเพิ่มคอลัมน์ให้กับฐานข้อมูลเดิมอัตโนมัติ
ALTER TABLE gate_types ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE gates ADD COLUMN IF NOT EXISTS type_id INTEGER REFERENCES gate_types(id) ON DELETE SET NULL;
ALTER TABLE revenues ADD COLUMN IF NOT EXISTS type_id INTEGER REFERENCES revenue_types(id) ON DELETE SET NULL;
ALTER TABLE revenues ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES revenue_groups(id) ON DELETE SET NULL;
ALTER TABLE revenues ADD COLUMN IF NOT EXISTS method_id INTEGER REFERENCES revenue_methods(id) ON DELETE SET NULL;

-- สิทธิ์การใช้งานและเมนู (Roles & Permissions)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT, 
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ผู้ใช้งานระบบ (System Users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT 'e5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4', -- default: password (sha1 for basic MVP)
    role TEXT DEFAULT 'Guard',
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Keys (Multi-Tenancy) Migration:
-- Ensure every informational/master data table is scoped under a site (tenant)
ALTER TABLE gate_types ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE vehicle_types ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE vehicle_brands ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE vehicle_colors ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE park_types ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE parking_fees ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE parking_discounts ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE parking_fines ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE special_days ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE gates ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE;

-- System Extensions Migration:
ALTER TABLE residents ADD COLUMN IF NOT EXISTS line_user_id TEXT;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS line_display_name TEXT;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS line_picture_url TEXT;
