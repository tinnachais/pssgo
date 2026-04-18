import { getResidents, deleteResident, toggleResidentStatus } from "@/app/actions/residents";
import Link from "next/link";
import HouseRow from "./HouseRow";

export const dynamic = "force-dynamic";

export default async function ResidentsPage() {
  let residents: any[] = [];
  
  try {
    residents = await getResidents();
  } catch (err) {
    console.error("Failed to fetch residents:", err);
  }

  // --- ADD GROUPING LOGIC HERE ---
  const groupedHousesMap = residents.reduce((acc: any, r: any) => {
      const house = r.house_number;
      if (!acc[house]) {
          acc[house] = {
              house_number: house,
              site_name: r.site_name,
              site_id: r.site_id,
              id: r.id, 
              members: [],
              vehicles: []
          };
      }
      acc[house].members.push(r);
      if (r.user_vehicles && r.user_vehicles.length > 0) {
          r.user_vehicles.forEach((uv: any) => {
              if (uv && uv.id && !acc[house].vehicles.find((v:any) => v.id === uv.id)) {
                  acc[house].vehicles.push(uv);
              }
          })
      }
      return acc;
  }, {});
  
  const groupedHouses = Object.values(groupedHousesMap) as any[];

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">ข้อมูลลูกบ้าน / ทะเบียนรถ</h1>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">Residents</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              จัดการโปรไฟล์ลูกบ้าน และบันทึกทะเบียนรถที่ได้รับอนุญาตให้เข้าออกพื้นที่ (Whitelist) แบบรวมกลุ่มตามบ้านเลขที่
            </p>
          </div>
          <Link href="/residents/add" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มข้อมูลบ้านใหม่
          </Link>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest leading-relaxed">ข้อมูลลูกบ้านตามบ้านเลขที่</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/2">ยานพาหนะ (ตรวจสอบสิทธิ์เข้าออก)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {groupedHouses.length === 0 ? (
                    <tr>
                        <td colSpan={2} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีข้อมูลบ้านในระบบ</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 mb-6">บันทึกข้อมูลลูกบ้านและทะเบียนรถเพื่อให้อนุญาตเข้าออกโครงการอัตโนมัติ</p>
                            <Link href="/residents/add" className="text-blue-600 hover:text-blue-700 font-bold border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors">
                                + เพิ่มข้อมูลบ้านแรก
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    groupedHouses.map((house: any) => (
                        <HouseRow key={house.house_number} house={house} />
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
