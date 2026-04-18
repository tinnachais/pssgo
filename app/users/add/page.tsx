import { getProviders } from "@/app/actions/providers";
import { getSites } from "@/app/actions/sites";
import { getRoles } from "@/app/actions/roles";
import Link from "next/link";
import AddUserForm from "./AddUserForm";
import { cookies } from "next/headers";

export default async function AddUserPage() {
  const providers = await getProviders();
  const sites = await getSites();
  const dbRoles = await getRoles();

  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let currentUserLevel = "Level1";
  if (sessionData) {
      const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
      currentUserLevel = decoded.level || "Level1";
  }

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/users" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าผู้ใช้งาน
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">เพิ่มผู้ใช้งานใหม่</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                สร้างบัญชีสำหรับผู้ดูแลระบบ หรือเจ้าหน้าที่โครงการ
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all duration-700 pointer-events-none"></div>
            
            <AddUserForm providers={providers} sites={sites} dbRoles={dbRoles} currentUserLevel={currentUserLevel} />
        </div>
      </main>
    </div>
  );
}
