"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function initNewsTables() {
    await query(`
        CREATE TABLE IF NOT EXISTS news (
            id SERIAL PRIMARY KEY,
            site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            image_url VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    await query("ALTER TABLE news ADD COLUMN IF NOT EXISTS provider_id INT DEFAULT NULL");

    await query(`
        CREATE TABLE IF NOT EXISTS news_reads (
            id SERIAL PRIMARY KEY,
            news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
            resident_id INTEGER REFERENCES residents(id) ON DELETE CASCADE,
            read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(news_id, resident_id)
        );
    `);
}

export async function getAdminNews() {
    await initNewsTables();
    
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
                   return []; // Not authorized
                }
            }
        } catch (e) {}
    }

    const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;

    let queryStr = `
        SELECT n.*, s.name as site_name 
        FROM news n 
        LEFT JOIN sites s ON n.site_id = s.id 
        WHERE 1=1
    `;
    const params: any[] = [];

    if (!isAdmin && allowedProviderIds && allowedProviderIds.length > 0) {
        params.push(allowedProviderIds);
        queryStr += ` AND (n.provider_id = ANY($${params.length}::int[]) OR s.provider_id = ANY($${params.length}::int[])) `;
    }

    if (selectedSiteId && selectedSiteId !== "all") {
        params.push(parseInt(selectedSiteId, 10));
        queryStr += ` AND n.site_id = $${params.length} `;
    }

    queryStr += ` ORDER BY n.created_at DESC `;

    const result = await query(queryStr, params);
    return result.rows;
}

export async function getNews(id: number) {
    const result = await query("SELECT * FROM news WHERE id = $1", [id]);
    return result.rows[0] || null;
}

export async function addNews(formData: FormData) {
    await initNewsTables();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const siteId = formData.get("siteId") as string;

    if (!title || !siteId) {
        throw new Error("Missing required fields");
    }

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("pssgo_session")?.value;
    
    let providerToAssign: number | null = null;
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

    let image_url: string | null = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
        const { promises: fs } = await import("fs");
        const path = await import("path");
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const ext = imageFile.name.split('.').pop() || 'png';
        const filename = `news-${Date.now()}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "news");
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        image_url = `/uploads/news/${filename}`;
    }

    await query(
        `INSERT INTO news (site_id, provider_id, title, content, image_url, is_active) VALUES ($1, $2, $3, $4, $5, true)`,
        [parseInt(siteId), providerToAssign, title, content || null, image_url]
    );

    revalidatePath("/news");
}

export async function updateNews(id: number, formData: FormData) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const siteId = formData.get("siteId") as string;

    if (!title || !siteId) {
        throw new Error("Missing required fields");
    }

    let image_url = formData.get("existing_image_url") as string | null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
        const { promises: fs } = await import("fs");
        const path = await import("path");
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const ext = imageFile.name.split('.').pop() || 'png';
        const filename = `news-${Date.now()}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "news");
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        image_url = `/uploads/news/${filename}`;
    }

    await query(
        `UPDATE news SET site_id = $1, title = $2, content = $3, image_url = $4 WHERE id = $5`,
        [parseInt(siteId), title, content || null, image_url, id]
    );

    revalidatePath("/news");
}

export async function deleteNews(id: number) {
    await query("DELETE FROM news WHERE id = $1", [id]);
    revalidatePath("/news");
}

export async function getLiffNews(residentId: number, siteId: number) {
    await initNewsTables();
    // Fetch all news for this site, and join with news_reads to check if read
    const result = await query(`
        SELECT n.id, n.title, n.content, n.image_url, n.created_at,
               CASE WHEN r.id IS NOT NULL THEN true ELSE false END as is_read
        FROM news n
        LEFT JOIN news_reads r ON n.id = r.news_id AND r.resident_id = $1
        WHERE n.site_id = $2 AND n.is_active = true
        ORDER BY n.created_at DESC
    `, [residentId, siteId]);
    return result.rows;
}

export async function markNewsAsRead(newsId: number, residentId: number) {
    await query(
        `INSERT INTO news_reads (news_id, resident_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [newsId, residentId]
    );
}
