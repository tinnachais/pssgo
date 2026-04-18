"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

export async function autoGenerateInvoices() {
    // Ensure column exists to prevent crash
    await query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS invoice_advance_days INT DEFAULT 7");

    // Select active sites approaching expiration
    const expiringSitesQuery = await query(`
        SELECT s.id as site_id, s.package_id, s.package_cycle, s.package_expires_at, 
               p.invoice_advance_days,
               pkg.monthly_price, pkg.yearly_price
        FROM sites s
        JOIN providers p ON s.provider_id = p.id
        JOIN packages pkg ON s.package_id = pkg.id
        WHERE s.package_expires_at IS NOT NULL
        AND s.package_expires_at <= CURRENT_TIMESTAMP + (COALESCE(p.invoice_advance_days, 7) * INTERVAL '1 day')
    `);

    for (const site of expiringSitesQuery.rows) {
        // Check if an invoice is already generated for the upcoming period
        const nextPeriodStart = site.package_expires_at;
        
        // Calculate the check date in JS to avoid Postgres interval/timestamp resolution issues
        const checkDate = new Date(nextPeriodStart);
        checkDate.setDate(checkDate.getDate() - 1);

        const existsQuery = await query(`
            SELECT id FROM provider_revenues 
            WHERE site_id = $1 AND period_start >= $2
        `, [site.site_id, checkDate]);

        if (existsQuery.rows.length === 0) {
            let amount = parseFloat(site.monthly_price);
            
            // Make sure the start date falls on the 1st of the next month
            let tempStart = new Date(nextPeriodStart);
            tempStart.setDate(tempStart.getDate() + 1); // Push to the next day to securely cross the month boundary
            
            // Start is always 1st day of that month 00:00:00
            let periodStart = new Date(tempStart.getFullYear(), tempStart.getMonth(), 1, 0, 0, 0, 0);
            let periodEnd = new Date(periodStart);

            if (site.package_cycle === 'YEARLY') {
                amount = parseFloat(site.yearly_price);
                periodEnd = new Date(periodStart.getFullYear(), 11, 31, 23, 59, 59, 999);
            } else {
                // End is last day of the current month
                periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0, 23, 59, 59, 999);
            }

            await query(
                "INSERT INTO provider_revenues (site_id, package_id, billing_cycle, amount, status, period_start, period_end) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                [site.site_id, site.package_id, site.package_cycle, amount, 'PENDING', periodStart, periodEnd]
            );
        }
    }
}

export async function getProviderRevenues() {
    await query(`
        CREATE TABLE IF NOT EXISTS provider_revenues (
            id SERIAL PRIMARY KEY,
            site_id INT REFERENCES sites(id) ON DELETE CASCADE,
            package_id INT REFERENCES packages(id) ON DELETE SET NULL,
            billing_cycle VARCHAR(20) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'PAID',
            period_start TIMESTAMP,
            period_end TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Ensure columns exist on old data
    await query("ALTER TABLE provider_revenues ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PAID'");
    await query("ALTER TABLE provider_revenues ADD COLUMN IF NOT EXISTS period_start TIMESTAMP");
    await query("ALTER TABLE provider_revenues ADD COLUMN IF NOT EXISTS period_end TIMESTAMP");

    // Auto-generate invoices before querying the list
    await autoGenerateInvoices();

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("pssgo_session")?.value;
    let allowedProviderIds: number[] | null = null;
    const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;

    if (sessionData) {
       try {
         const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
         if (decoded.userId && decoded.userId !== "admin") {
             const { getUser } = await import("./users");
             const u = await getUser(Number(decoded.userId));
             if (u && Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
                 allowedProviderIds = u.provider_ids;
             }
         }
       } catch (e) {}
    }

    let q = `
        SELECT pr.*, s.name as site_name, p.name as package_name 
        FROM provider_revenues pr
        LEFT JOIN sites s ON pr.site_id = s.id
        LEFT JOIN packages p ON pr.package_id = p.id
        WHERE 1=1
    `;
    const params: any[] = [];

    if (allowedProviderIds !== null) {
        params.push(allowedProviderIds);
        q += ` AND s.provider_id = ANY($${params.length}::int[]) `;
    }

    if (selectedSiteId && selectedSiteId !== "all") {
        params.push(parseInt(selectedSiteId, 10));
        q += ` AND pr.site_id = $${params.length} `;
    }

    q += ` ORDER BY pr.period_start DESC, pr.created_at DESC `;

    const result = await query(q, params);
    
    return result.rows;
}

export async function getProviderRevenueById(id: number) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("pssgo_session")?.value;
    let allowedProviderIds: number[] | null = null;

    if (sessionData) {
       try {
         const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
         if (decoded.userId && decoded.userId !== "admin") {
             const { getUser } = await import("./users");
             const u = await getUser(Number(decoded.userId));
             if (u && Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
                 allowedProviderIds = u.provider_ids;
             }
         }
       } catch (e) {}
    }

    const result = await query(`
        SELECT pr.*, s.name as site_name, s.provider_id, p.name as package_name,
        prov.name as provider_name, prov.address as provider_address, prov.tax_id as provider_tax_id
        FROM provider_revenues pr
        LEFT JOIN sites s ON pr.site_id = s.id
        LEFT JOIN packages p ON pr.package_id = p.id
        LEFT JOIN providers prov ON s.provider_id = prov.id
        WHERE pr.id = $1
    `, [id]);
    
    const rev = result.rows[0] || null;

    if (rev && allowedProviderIds !== null && !allowedProviderIds.includes(rev.provider_id)) {
        return null;
    }

    return rev;
}

export async function addProviderRevenue(formData: FormData) {
    const siteId = parseInt(formData.get("siteId") as string, 10);
    const packageId = parseInt(formData.get("packageId") as string, 10);
    const billingCycle = formData.get("billingCycle") as string;
    const amount = parseFloat(formData.get("amount") as string);

    if (isNaN(siteId) || isNaN(packageId) || !billingCycle || isNaN(amount)) {
        throw new Error("Missing required fields");
    }

    await query("ALTER TABLE provider_revenues ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PAID'");
    await query("ALTER TABLE provider_revenues ADD COLUMN IF NOT EXISTS period_start TIMESTAMP");
    await query("ALTER TABLE provider_revenues ADD COLUMN IF NOT EXISTS period_end TIMESTAMP");
    
    const status = formData.get("status") as string || 'PENDING';
    const { startDateStr, endDateStr } = await calculatePackagePeriod(siteId, billingCycle);

    if (status === 'PAID') {
        await applySitePackageUpdate(siteId, packageId, billingCycle, endDateStr);
    }

    await query(
        "INSERT INTO provider_revenues (site_id, package_id, billing_cycle, amount, status, period_start, period_end) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [siteId, packageId, billingCycle, amount, status, startDateStr, endDateStr]
    );

    if (status === 'PAID') {
        await syncSiteExpiration(siteId);
    }

    revalidatePath("/provider-revenues");
    redirect("/provider-revenues");
}

export async function calculatePackagePeriod(siteId: number, billingCycle: string) {
    // Always calculate starting from the ACTUAL latest paid period_end to ensure it matches real bills
    const siteQuery = await query("SELECT MAX(period_end) as max_end FROM provider_revenues WHERE site_id = $1 AND status = 'PAID'", [siteId]);
    const currentExpStr = siteQuery.rows[0]?.max_end;

    let periodStart = new Date();
    let periodEnd = new Date();
    const isActive = currentExpStr && new Date(currentExpStr) > new Date();

    if (isActive) {
        let tempStart = new Date(currentExpStr);
        tempStart.setDate(tempStart.getDate() + 1); // Push past 23:59:59 to next day

        periodStart = new Date(tempStart.getFullYear(), tempStart.getMonth(), 1, 0, 0, 0, 0);
        
        if (billingCycle === 'YEARLY') {
            periodEnd = new Date(periodStart.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else {
            periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0, 23, 59, 59, 999);
        }
    } else {
        // If no active package, start from today
        periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0);
        if (billingCycle === 'YEARLY') {
            periodEnd = new Date(periodStart.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else {
            periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0, 23, 59, 59, 999);
        }
    }

    return {
        startDateStr: periodStart.toISOString(),
        endDateStr: periodEnd.toISOString()
    };
}

export async function syncSiteExpiration(siteId: number) {
    const result = await query(
        "SELECT MAX(period_end) as max_end FROM provider_revenues WHERE site_id = $1 AND status = 'PAID'", 
        [siteId]
    );
    const maxEnd = result.rows[0]?.max_end;
    
    await query("ALTER TABLE sites ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMP");
    
    if (maxEnd) {
        await query("UPDATE sites SET package_expires_at = $1 WHERE id = $2", [maxEnd, siteId]);
    } else {
        await query("UPDATE sites SET package_expires_at = NULL WHERE id = $1", [siteId]);
    }
}

export async function applySitePackageUpdate(siteId: number, packageId: number, billingCycle: string, targetExpStr: string) {
    await query("ALTER TABLE sites ADD COLUMN IF NOT EXISTS package_id INT REFERENCES packages(id) ON DELETE SET NULL");
    await query("ALTER TABLE sites ADD COLUMN IF NOT EXISTS package_cycle VARCHAR(20) DEFAULT 'MONTHLY'");
    await query("ALTER TABLE sites ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMP");

    await query(
        "UPDATE sites SET package_id = $1, package_cycle = $2, package_expires_at = $3 WHERE id = $4",
        [packageId, billingCycle, targetExpStr, siteId]
    );
}

export async function markProviderRevenueAsPaid(id: number) {
    const revQuery = await query("SELECT * FROM provider_revenues WHERE id = $1", [id]);
    const rev = revQuery.rows[0];
    if (!rev || rev.status === 'PAID') return;

    await applySitePackageUpdate(rev.site_id, rev.package_id, rev.billing_cycle, rev.period_end);
    await query("UPDATE provider_revenues SET status = 'PAID' WHERE id = $1", [id]);
    await syncSiteExpiration(rev.site_id);
    
    revalidatePath("/provider-revenues");
}

export async function deleteProviderRevenue(id: number) {
    const revQuery = await query("SELECT site_id FROM provider_revenues WHERE id = $1", [id]);
    const siteId = revQuery.rows[0]?.site_id;
    
    await query("DELETE FROM provider_revenues WHERE id = $1", [id]);
    
    if (siteId) {
        await syncSiteExpiration(siteId);
    }
    
    revalidatePath("/provider-revenues");
    revalidatePath("/sites");
}
