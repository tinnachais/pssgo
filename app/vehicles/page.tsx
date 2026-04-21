import { getVehicles, deleteVehicle, toggleVehicleStatus } from "@/app/actions/vehicles";
import Link from "next/link";
import React from "react";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  let vehicles: any[] = [];

  try { 
    vehicles = await getVehicles(); 
  } catch (err) {
    console.error("Failed to fetch vehicles:", err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-rose-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">แฟ้มยานพาหนะ</h1>
              <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-full uppercase tracking-wider">Vehicles</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              จดบันทึกและจัดการข้อมูลยานพาหนะ ทะเบียนรถ และการให้สิทธิ์เข้าถึงพื้นที่
            </p>
          </div>
          <Link href="/vehicles/add" className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-rose-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            ลงทะเบียนรถยนต์
          </Link>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest pl-6">ทะเบียนรถ / ทะเบียน</th>
                    <th className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">สถานที่ลงทะเบียน (Site)</th>
                    <th className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">ประเภท / สิทธิ์จอด</th>
                    <th className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">รายละเอียด (เจ้าของ / บ้าน)</th>
                    <th className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-right pr-6">การจัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {vehicles.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีข้อมูลยานพาหนะที่ลงทะเบียน</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 mb-6">เริ่มลงทะเบียนยานพาหนะและควบคุมสิทธิ์การเข้าถึงพื้นที่</p>
                            <Link href="/vehicles/add" className="text-rose-600 hover:text-rose-700 font-bold border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-lg transition-colors">
                                + ลงทะเบียนคันแรก
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                        Object.entries(
                            vehicles.reduce((acc: Record<string, any[]>, v: any) => {
                                const houseNum = v.house_number || 'ไม่ได้ระบุสถานที่/ห้อง (ผู้มาติดต่อ / อื่นๆ)';
                                if (!acc[houseNum]) acc[houseNum] = [];
                                acc[houseNum].push(v);
                                return acc;
                            }, {})
                        ).map(([house, houseVehicles]) => (
                            <React.Fragment key={house}>
                                <tr className="bg-zinc-100/80 dark:bg-zinc-800/80 border-t-2 border-zinc-200 dark:border-zinc-700">
                                    <td colSpan={5} className="px-6 py-3 text-sm tracking-wide font-bold text-zinc-800 dark:text-zinc-200">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            สถานที่/ห้อง: {house} 
                                            <span className="ml-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
                                                {houseVehicles.length} คัน
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                {houseVehicles.map(v => (
                                    <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                                    <td className="px-4 py-4 pl-6 whitespace-nowrap">
                                        <div className="inline-flex flex-col border border-zinc-300 dark:border-zinc-600 rounded pt-1.5 pb-1.5 px-3 bg-white dark:bg-zinc-800 shadow-sm relative overflow-hidden min-w-[100px] text-center">
                                            <div className="absolute top-0 inset-x-0 h-1 bg-rose-500"></div>
                                            <span className="font-bold text-sm tracking-widest text-zinc-900 dark:text-white uppercase leading-none mt-1">{v.license_plate}</span>
                                            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-1 pb-0.5 border-t border-zinc-100 dark:border-zinc-700/50 leading-tight block w-full text-center">
                                                {v.province || '—'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-200 dark:border-indigo-500/20">
                                            {v.site_name}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 space-y-2 align-middle whitespace-nowrap">
                                        {v.type_name && (
                                            <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 w-[50px] tracking-wider uppercase">ประเภท</span>
                                            <span className="text-xs bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-800/50 font-mono font-medium">
                                                {v.type_code ? `[${v.type_code}] ` : ''}{v.type_name}
                                            </span>
                                            </div>
                                        )}
                                        {v.park_type_name && (
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                            <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 w-[50px] tracking-wider uppercase">สิทธิ์จอด</span>
                                            <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/50 font-mono font-medium">
                                                {v.park_type_code ? `[${v.park_type_code}] ` : ''}{v.park_type_name}
                                            </span>
                                            </div>
                                        )}
                                        {!v.type_name && !v.park_type_name && (
                                            <span className="text-xs text-zinc-400 italic">ไม่ระบุข้อมูล</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex gap-4">
                                            {v.image_url && (
                                                <div className="flex-shrink-0">
                                                    <a href={v.image_url} target="_blank" rel="noreferrer">
                                                        <img src={v.image_url} alt="Vehicle" className="h-16 w-16 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:opacity-80 transition-opacity" />
                                                    </a>
                                                </div>
                                            )}
                                            <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                                                {v.owner_name && <div><span className="text-zinc-400 font-semibold w-16 inline-block">เจ้าของ:</span> {v.owner_name}</div>}
                                                {(v.brand || v.color) && <div><span className="text-zinc-400 font-semibold w-16 inline-block">ยี่ห้อ/สี:</span> {v.brand} {v.color}</div>}
                                                {!v.owner_name && !v.brand && !v.color && <span className="text-zinc-400 italic">ไม่มีข้อมูลเพิ่มเติม</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right pr-6 whitespace-nowrap">
                                        <div className="flex justify-end gap-2 items-center">
                                            <form action={async () => {
                                            "use server";
                                            await toggleVehicleStatus(v.id, !v.is_active);
                                            }}>
                                                <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all hover:opacity-80 ${v.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${v.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                    {v.is_active ? 'Active' : 'Disabled'}
                                                </button>
                                            </form>
                                            <Link href={`/vehicles/${v.id}`} title="ดู/แก้ไขรายละเอียด" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex border border-transparent">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>
                                            <form action={async () => {
                                            "use server";
                                            await deleteVehicle(v.id);
                                            }}>
                                            <button type="submit" title="ลบข้อมูลรถ" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex border border-transparent">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                            </form>
                                        </div>
                                    </td>
                                    </tr>
                                ))}
                            </React.Fragment>
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
