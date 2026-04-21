import { getZones, toggleZoneStatus, deleteZone } from "@/app/actions/zones";
import { getSites } from "@/app/actions/sites";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ZonesPage() {
  let zones: any[] = [];
  let sites: any[] = [];

  try {
    zones = await getZones();
  } catch (err) {
    console.error("Failed to fetch zones:", err);
  }

  try {
    sites = await getSites();
  } catch (err) {
    console.error("Failed to fetch sites:", err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">โซนพื้นที่</h1>
              <span className="px-3 py-1 bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-bold rounded-full uppercase tracking-wider">Zones</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              จดการโซนพื้นที่ย่อยในแต่ละสถานที่ เพื่อใช้กำหนดทางเข้าออกและสิทธิ์
            </p>
          </div>
          <Link href="/zones/add" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-teal-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มโซนใหม่
          </Link>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[40%]">ข้อมูลโซนและประตูทางเข้า</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/4">สถานที่</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">สถานะ</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-widest">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {zones.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีข้อมูลโซน</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 mb-6">สร้างโซนเพื่อจัดกลุ่มจุดผ่านเข้าออก (Gates) ในสถานที่</p>
                            <Link href="/zones/add" className="text-teal-600 hover:text-teal-700 font-bold border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-lg transition-colors">
                                + สร้างโซนแรก
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    zones.map((zone: any) => {
                        const gatesData = typeof zone.gates_data === 'string' ? JSON.parse(zone.gates_data) : (zone.gates_data || []);
                        return (
                        <tr key={zone.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                            <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-sm font-bold text-lg flex-shrink-0">
                                {zone.name.charAt(0)}
                                </div>
                                <div>
                                <div className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{zone.name}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {gatesData.length > 0 ? (
                                    gatesData.map((g: any) => (
                                        <span key={g.id} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                        {g.name}
                                        </span>
                                    ))
                                    ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">ไม่มีจุดเข้าออก</span>
                                    )}
                                </div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-500/20">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                {zone.site_name || 'ไม่มีสถานที่'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <form action={async () => {
                                "use server";
                                await toggleZoneStatus(zone.id, !zone.is_active);
                            }}>
                                <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-80 ${zone.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${zone.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    {zone.is_active ? 'Active' : 'Disabled'}
                                </button>
                            </form>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1">
                                <Link href={`/zones/${zone.id}`} title="ดู/แก้ไขรายละเอียด" className="text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-500/10 inline-flex">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                </Link>
                                <form action={async () => {
                                "use server";
                                await deleteZone(zone.id);
                                }}>
                                <button type="submit" title="ลบข้อมูล" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                </form>
                            </div>
                            </td>
                        </tr>
                        );
                    })
                    )}
                </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}
