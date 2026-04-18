import { getSpecialDays, toggleSpecialDayStatus, deleteSpecialDay } from "@/app/actions/special-days";
import Link from "next/link";
import SpecialDayCalendar from "./components/SpecialDayCalendar";

export const dynamic = "force-dynamic";

export default async function SpecialDaysPage() {
  let specialDays: any[] = [];
  
  try {
    specialDays = await getSpecialDays();
  } catch (err) {
    console.error("Failed to fetch special days:", err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-amber-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">วันหยุดพิเศษ</h1>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">Special Days</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              จัดการวันหยุดนักขัตฤกษ์ หรือวันหยุดพิเศษ เพื่อนำไปใช้กับเงื่อนไขการคิดค่าจอดรถ
            </p>
          </div>
          <Link href="/special-days/add" className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-amber-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มวันหยุด
          </Link>
        </div>

        <div className="flex flex-col gap-10">
            {/* Calendar Section */}
            <div className="w-full">
                <SpecialDayCalendar specialDays={specialDays} />
            </div>

            {/* List Section */}
            <div className="w-full space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        รายการวันหยุดทั้งหมด
                    </h3>
                </div>
                
                <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                            <th className="px-6 py-5 text-left text-[11px] font-bold text-zinc-500 uppercase tracking-widest w-1/4">วันที่</th>
                            <th className="px-6 py-5 text-left text-[11px] font-bold text-zinc-500 uppercase tracking-widest">ข้อมูลวันหยุด</th>
                            <th className="px-6 py-5 text-left text-[11px] font-bold text-zinc-500 uppercase tracking-widest w-1/4">สถานะ</th>
                            <th className="px-6 py-5 text-right text-[11px] font-bold text-zinc-500 uppercase tracking-widest">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {specialDays.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-24 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    </div>
                                    <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีการเพิ่มวันหยุดพิเศษ</p>
                                </div>
                                </td>
                            </tr>
                            ) : (
                                specialDays.map((day: any) => {
                                    const dateObj = new Date(day.date);
                                    return (
                                    <tr key={day.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex flex-col items-center justify-center text-white shadow-sm font-bold flex-shrink-0">
                                                    <span className="text-[10px] leading-none opacity-80 uppercase">{dateObj.toLocaleString('en', { month: 'short' })}</span>
                                                    <span className="text-sm leading-none">{dateObj.getDate()}</span>
                                                </div>
                                                <div className="text-xs font-bold text-zinc-900 dark:text-white">
                                                    {dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{day.name}</span>
                                                    {day.is_recurring && <span className="inline-flex border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">ทุกปี</span>}
                                                </div>
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{day.description || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <form action={async () => {
                                                "use server";
                                                await toggleSpecialDayStatus(day.id, !day.is_active);
                                            }}>
                                                <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all hover:opacity-80 ${day.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${day.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                    {day.is_active ? 'Active' : 'Disabled'}
                                                </button>
                                            </form>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/special-days/${day.id}`} title="แก้ไข" className="text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 inline-flex ring-1 ring-zinc-200 dark:ring-zinc-800">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteSpecialDay(day.id);
                                                }}>
                                                    <button type="submit" title="ลบ" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex ring-1 ring-zinc-200 dark:ring-zinc-800">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            </div>
        </div>
      </main>
    </div>
  );
}
