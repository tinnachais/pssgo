const fs = require('fs'); 
const code = `
export async function joinSiteWithInviteCode(lineUserId: string, inviteCode: string, selectedVehicleIds?: number[]) {
    try {
        if (!lineUserId || !inviteCode) return { success: false, message: "ข้อมูลไม่ครบถ้วน" };
        const targetRes = await query("SELECT id, house_number, site_id, line_user_id FROM residents WHERE invite_code = $1 AND is_active = true", [inviteCode]);
        if (targetRes.rows.length === 0) return { success: false, message: "Invite Code ไม่ถูกต้องหรือหมดอายุ" };
        const target = targetRes.rows[0];
        const checkExisting = await query("SELECT id, parent_id, is_owner FROM residents WHERE line_user_id = $1 AND is_active = true AND (id = $2 OR parent_id = $2)", [lineUserId, target.id]);
        if (checkExisting.rows.length > 0) return { success: false, message: "คุณเป็นสมาชิกในบ้านนี้แล้ว" };
        const currentUserRes = await query("SELECT id, house_number, owner_name, line_display_name, line_picture_url, phone_number FROM residents WHERE line_user_id = $1 AND is_active = true ORDER BY id DESC LIMIT 1", [lineUserId]);
        if (currentUserRes.rows.length === 0) return { success: false, message: "ไม่พบผู้ใช้งาน" };
        const currentUser = currentUserRes.rows[0];

        let houseLimit = 1;
        if (target.site_id) {
            const siteLimitQuery = await query("SELECT max_vehicles FROM sites WHERE id = $1", [target.site_id]);
            if (siteLimitQuery.rows.length > 0) {
                const siteMax = siteLimitQuery.rows[0].max_vehicles;
                if (siteMax === 0) {
                    const ownerRes = await query("SELECT house_max_vehicles, max_vehicles FROM residents WHERE id = $1", [target.id]);
                    houseLimit = ownerRes.rows[0]?.house_max_vehicles || ownerRes.rows[0]?.max_vehicles || 1;
                } else {
                    houseLimit = siteMax;
                }
            }
        }
        
        const serviceUserQuery = await query("SELECT * FROM vehicles WHERE line_user_id = $1", [lineUserId]);
        const availableVehicles = serviceUserQuery.rows;

        if (!selectedVehicleIds && availableVehicles.length > 0) {
            return { success: false, requireSelection: true, availableQuota: houseLimit, vehicles: availableVehicles };
        }

        let newResidentId = target.id;
        if (!target.line_user_id) {
            await query("UPDATE residents SET line_user_id = $1, line_display_name = $2, line_picture_url = $3, owner_name = COALESCE($5, owner_name) WHERE id = $4", [lineUserId, currentUser.line_display_name, currentUser.line_picture_url, target.id, currentUser.owner_name]);
        } else {
            const crypto = require('crypto');
            const genInviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
            const newRes = await query("INSERT INTO residents (line_user_id, line_display_name, line_picture_url, owner_name, phone_number, house_number, license_plate, is_owner, is_active, invite_code, parent_id, site_id) VALUES ($1, $2, $3, $4, $5, $6, $7, false, true, $8, $9, $10) RETURNING id", [lineUserId, currentUser.line_display_name, currentUser.line_picture_url, currentUser.owner_name || currentUser.line_display_name, currentUser.phone_number, target.house_number, \`USER-\${lineUserId.substring(0, 6).toUpperCase()}\`, genInviteCode, target.id, target.site_id]);
            newResidentId = newRes.rows[0].id;
        }

        if (selectedVehicleIds && selectedVehicleIds.length > 0) {
            const vehiclesToMove = availableVehicles.filter(v => selectedVehicleIds.includes(v.id));
            const finalVehiclesToMove = vehiclesToMove.slice(0, houseLimit);
            for (const v of finalVehiclesToMove) {
                await query("INSERT INTO resident_vehicles (resident_id, vehicle_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [newResidentId, v.id]);
            }
        }
        return { success: true, message: "เข้าร่วมสถานที่สำเร็จ" };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}

export async function leaveResidentSite(lineUserId: string, residentId?: number) {
    try {
        if (!lineUserId) return { success: false, message: "ไม่พบข้อมูลผู้ใช้" };
        let resQuery;
        if (residentId) {
            resQuery = await query("SELECT * FROM residents WHERE line_user_id = $1 AND id = $2 AND is_active = true", [lineUserId, residentId]);
        } else {
            resQuery = await query("SELECT * FROM residents WHERE line_user_id = $1 AND is_active = true ORDER BY id DESC LIMIT 1", [lineUserId]);
        }
        if (resQuery.rows.length === 0) return { success: false, message: "ไม่พบข้อมูล" };
        const current = resQuery.rows[0];

        if (current.house_number?.startsWith("ผู้ใช้บริการ-") || (!current.site_id && !current.parent_id && !current.is_owner)) {
            return { success: false, message: "คุณไม่สามารถออกจากโปรไฟล์ผู้ใช้บริการหลักได้" };
        }

        const shortId = current.line_user_id.substring(0, 6).toUpperCase();
        const newHouseNumber = \`ผู้ใช้บริการ-\${shortId}\`;
        
        let serviceUserQuery = await query("SELECT id, house_number FROM residents WHERE line_user_id = $1 AND (site_id IS NULL OR house_number LIKE 'ผู้ใช้บริการ-%') LIMIT 1", [lineUserId]);
        
        if (serviceUserQuery.rows.length === 0) {
            const crypto = require('crypto');
            const newInviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
            await query("INSERT INTO residents (line_user_id, line_display_name, line_picture_url, owner_name, phone_number, house_number, license_plate, is_owner, is_active, invite_code) VALUES ($1, $2, $3, $4, $5, $6, $7, false, true, $8)", [current.line_user_id, current.line_display_name, current.line_picture_url, current.owner_name || current.line_display_name || 'ผู้ใช้บริการทั่วไป', current.phone_number, newHouseNumber, \`USER-\${shortId}\`, newInviteCode]);
        }

        await query("DELETE FROM resident_vehicles WHERE resident_id = $1", [current.id]);
        if (current.is_owner) {
            await query("UPDATE residents SET line_user_id = NULL, line_display_name = NULL, line_picture_url = NULL WHERE id = $1", [current.id]);
        } else {
            await query("DELETE FROM residents WHERE id = $1", [current.id]);
        }
        return { success: true, message: "ออกจากสถานที่สำเร็จ" };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}

export async function getPublicSites() {
    try {
        const res = await query("SELECT * FROM sites WHERE is_public = true AND is_active = true");
        return res.rows;
    } catch (err: any) {
        return [];
    }
}

export async function generateVehicleShareCode(vehicleId: number, lineUserId: string) {
    try {
        const vRes = await query("SELECT id FROM vehicles WHERE id = $1 AND line_user_id = $2", [vehicleId, lineUserId]);
        if (vRes.rows.length === 0) return { success: false, message: "ไม่มีสิทธิ์แชร์รถคันนี้" };

        const crypto = require('crypto');
        const shareCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        await query("UPDATE vehicles SET share_code = $1 WHERE id = $2", [shareCode, vehicleId]);
        return { success: true, shareCode };
    } catch (err: any) {
        return { success: false, message: "เกิดข้อผิดพลาด: " + err.message };
    }
}

export async function joinSharedVehicle(lineUserId: string, shareCode: string) {
    try {
        if (!lineUserId) return { success: false, message: "กรุณาล็อกอินด้วย LINE" };
        const vRes = await query("SELECT id, line_user_id, license_plate FROM vehicles WHERE share_code = $1", [shareCode]);
        if (vRes.rows.length === 0) return { success: false, message: "รหัสไม่ถูกต้อง หรือหมดอายุแล้ว" };
        
        const vehicle = vRes.rows[0];
        if (vehicle.line_user_id === lineUserId) return { success: false, message: "คุณเป็นเจ้าของรถคันนี้อยู่แล้ว" };

        const shareCheck = await query("SELECT id FROM vehicle_shares WHERE vehicle_id = $1 AND line_user_id = $2", [vehicle.id, lineUserId]);
        if (shareCheck.rows.length > 0) return { success: false, message: "คุณได้รับแชร์รถคันนี้ไปแล้ว" };

        await query("INSERT INTO vehicle_shares (vehicle_id, line_user_id) VALUES ($1, $2)", [vehicle.id, lineUserId]);
        await query("UPDATE vehicles SET share_code = NULL WHERE id = $1", [vehicle.id]);

        return { success: true, message: \`เพิ่มรถ \${vehicle.license_plate} เข้าสู่กระเป๋ารถของคุณแล้ว!\` };
    } catch (err: any) {
        return { success: false, message: "เกิดข้อผิดพลาด: " + err.message };
    }
}

export async function revokeSharedVehicle(vehicleId: number, targetLineUserId: string, lineUserId: string) {
    try {
        const vRes = await query("SELECT id FROM vehicles WHERE id = $1 AND line_user_id = $2", [vehicleId, lineUserId]);
        if (vRes.rows.length === 0) return { success: false, message: "ไม่มีสิทธิ์ยกเลิกการแชร์" };

        await query("DELETE FROM vehicle_shares WHERE vehicle_id = $1 AND line_user_id = $2", [vehicleId, targetLineUserId]);
        return { success: true, message: "ยกเลิกการแชร์สำเร็จ" };
    } catch (err: any) {
        return { success: false, message: "เกิดข้อผิดพลาด: " + err.message };
    }
}

export async function toggleNotifyVehicleAccess(lineUserId: string, value: boolean) {
    try {
        await query("UPDATE residents SET notify_vehicle_access = $1 WHERE line_user_id = $2", [value, lineUserId]);
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}
`;
fs.appendFileSync('c:/Toon/pssgo/app/actions/liff.ts', code);
