import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import AIChatbot from "./components/AIChatbot";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PSS GO",
  description: "Property Security System GO - Live LPR Management",
  referrer: "no-referrer",
  icons: {
    icon: "/favicon.ico",
  },
};

import { headers, cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("pssgo_session");
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isLiff = pathname === "/liff" || pathname.startsWith("/liff/");
  const isPreregister = pathname.startsWith("/visitor/preregister");
  const isWebPay = pathname.startsWith("/webpay");
  const isTicket = pathname.startsWith("/ticket");
  const isReceipt = pathname.startsWith("/receipt");
  const showSidebar = hasSession && !isLiff && !isPreregister && !isWebPay && !isTicket && !isReceipt;
  
  let userData: any = null;
  if (hasSession) {
    try {
        const sessionData = cookieStore.get("pssgo_session")?.value;
        if (sessionData) {
            const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
            if (decoded.userId === "admin") {
                userData = { first_name: "Admin", email: decoded.email, permissions: ["*"] };
            } else if (decoded.userId) {
                const { getUser } = await import("./actions/users");
                const u = await getUser(Number(decoded.userId));
                if (u) {
                    userData = u;
                    const { query } = await import("@/lib/db");
                    const roleRes = await query("SELECT permissions FROM roles WHERE name = $1", [u.role]);
                    if (roleRes.rows.length > 0) {
                        userData.permissions = roleRes.rows[0].permissions;
                    } else {
                        // Fallback if role is not found in database but they are known admin types
                        if (u.role === "Admin" || u.level === "Level1") {
                            userData.permissions = ["*"];
                        } else {
                            userData.permissions = [];
                        }
                    }
                }
            }
        }
    } catch(e) {}
  }

  const { getSites } = await import("./actions/sites");
  const sites = hasSession ? await getSites() : [];
  const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value || "";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansThai.variable} ${geistMono.variable} antialiased h-full`}
    >
      <body suppressHydrationWarning className="flex h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] overflow-hidden text-zinc-900 dark:text-zinc-50 font-sans selection:bg-blue-500/30">
        {showSidebar && <Sidebar user={userData} sites={sites} selectedSiteId={selectedSiteId} />}
        <div className={`flex-1 overflow-y-auto ${!showSidebar ? "w-full" : ""}`}>
          {children}
        </div>
        <AIChatbot />
      </body>
    </html>
  );
}
