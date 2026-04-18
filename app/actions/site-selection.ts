"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setSelectedSite(siteId: string) {
    const cookieStore = await cookies();
    if (siteId === "all" || !siteId) {
        cookieStore.delete("pssgo_selected_site_id");
    } else {
        cookieStore.set("pssgo_selected_site_id", siteId, { path: "/", maxAge: 60 * 60 * 24 * 30 }); // 30 days
    }
    revalidatePath("/", "layout");
}
