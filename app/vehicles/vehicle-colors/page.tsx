import { getVehicleColors, toggleVehicleColorStatus, deleteVehicleColor } from "@/app/actions/vehicle-colors";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VehicleColorsPage() {
  let vehicleColors: any[] = [];
  
  try {
    vehicleColors = await getVehicleColors();
  } catch (err) {
    console.error("Failed to fetch vehicle colors:", err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-indigo-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">สีรถยนต์</h1>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">Colors</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              กำหนดหมวดสีรถยนต์ เพื่อเป็นตัวเลือกเวลาเพิ่มข้อมูลรถในระบบ
            </p>
          </div>
          <Link href="/vehicles/vehicle-colors/add" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มสีรถ
          </Link>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/3">สีรถ (Code/Name)</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/3">รายละเอียด</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">สถานะ</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-widest">การจัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {vehicleColors.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีการกำหนดสีรถ</p>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    vehicleColors.map((color: any) => (
                        <tr key={color.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20 shadow-sm font-bold flex-shrink-0">
                                <span className="font-mono text-xs">{color.code?.substring(0, 2).toUpperCase() || color.name.substring(0,2).toUpperCase()}</span>
                                </div>
                                <div>
                                <div className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 font-mono">
                                    {color.code && <span className="text-indigo-600 dark:text-indigo-500 mr-2">[{color.code}]</span>}
                                    {color.name}
                                </div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{color.description || '—'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <form action={async () => {
                                "use server";
                                await toggleVehicleColorStatus(color.id, !color.is_active);
                                }}>
                                <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-80 ${color.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${color.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    {color.is_active ? 'ใช้งาน' : 'ระงับ'}
                                </button>
                                </form>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1">
                                <Link href={`/vehicles/vehicle-colors/${color.id}`} title="แก้ไขสี" className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-500 transition-colors p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 inline-flex">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                </Link>
                                <form action={async () => {
                                "use server";
                                await deleteVehicleColor(color.id);
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
                    ))
                    )}
                </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}
