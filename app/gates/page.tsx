import { getGates, toggleGateStatus, deleteGate } from "@/app/actions/gates";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GatesPage() {
  let gates: any[] = [];
  
  try {
    gates = await getGates();
  } catch (err) {
    console.error("Failed to fetch gates:", err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">จุดผ่านเข้าออก / อุปกรณ์</h1>
              <span className="px-3 py-1 bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-full uppercase tracking-wider">Gates & Devices</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              จดการกล้องตรวจจับป้ายทะเบียน เครื่องกั้น หรืออุปกรณ์ต่างๆ ในแต่ละโซน
            </p>
          </div>
          <Link href="/gates/add" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-sky-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มอุปกรณ์ใหม่
          </Link>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/3">ชื่ออุปกรณ์และรายละเอียด</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/3">ข้อมูลพื้นที่ (สถานที่ / โซน)</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">สถานะการทำงาน</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-widest">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {gates.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีข้อมูลอุปกรณ์</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 mb-6">เริ่มติดตั้งและกำหนดจุดอุปกรณ์ เช่น กล้อง LPR หรือไม้กั้น</p>
                            <Link href="/gates/add" className="text-sky-600 hover:text-sky-700 font-bold border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 px-4 py-2 rounded-lg transition-colors">
                                + เพิ่มอุปกรณ์แรก
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    gates.map((gate: any) => (
                        <tr key={gate.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-500/20 shadow-sm font-bold flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                </div>
                                <div>
                                <div className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 font-mono">{gate.name}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{gate.description || '—'}</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-full text-[10px] font-semibold border border-teal-200 dark:border-teal-500/20 w-fit">
                                {gate.zone_name || '—'}
                                </span>
                                <span className="text-[11px] text-zinc-500 ml-1.5 font-semibold">{gate.site_name}</span>
                                {gate.type_name && (
                                <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 px-2 py-0.5 rounded-md ml-1 w-fit mt-0.5">
                                    {gate.type_name}
                                </span>
                                )}
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <form action={async () => {
                                "use server";
                                await toggleGateStatus(gate.id, !gate.is_active);
                                }}>
                                <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-80 ${gate.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${gate.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    {gate.is_active ? 'Online' : 'Offline'}
                                </button>
                                </form>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1">
                                <Link href={`/gates/${gate.id}`} title="ดู/แก้ไขรายละเอียด" className="text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-500/10 inline-flex">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                </Link>
                                <form action={async () => {
                                "use server";
                                await deleteGate(gate.id);
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
