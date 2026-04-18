import { addVisitor } from "@/app/actions/visitors";
import { getResidents } from "@/app/actions/residents";
import Link from "next/link";
import AddVisitorClient from "./AddVisitorClient";

export default async function AddVisitorPage() {
  const residentsData = await getResidents();
  
  // Create a map to ensure house numbers are unique and capture if ANY resident in the house has privacy mode on
  const houseMap = new Map<string, boolean>();
  residentsData.forEach(r => {
      if (r.house_number) {
          const currentPrivacy = houseMap.get(r.house_number) || false;
          houseMap.set(r.house_number, currentPrivacy || !!r.privacy_mode);
      }
  });

  const houses = Array.from(houseMap.entries()).map(([house, isPrivate]) => ({ house, isPrivate }));

  return (
    <div className="min-h-full font-sans selection:bg-purple-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/visitor" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าผู้มาติดต่อ
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">บันทึกแลกบัตรเข้าหมู่บ้าน</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                กรอกข้อมูลผู้มาติดต่อเพื่อบันทึกลงระบบและตรวจสอบเมื่อมีการเข้าออกพื้นที่
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700 pointer-events-none"></div>
            
            <AddVisitorClient houses={houses} />
        </div>
      </main>
    </div>
  );
}
