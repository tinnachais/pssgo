import { addResident } from "@/app/actions/residents";
import { getSites } from "@/app/actions/sites";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AddResidentPage() {
  const cookieStore = await cookies();
  let selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;

  if (!selectedSiteId || selectedSiteId === "all") {
      const sites = await getSites();
      if (sites.length > 0) {
          selectedSiteId = sites[0].id.toString();
      }
  }

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/residents" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าข้อมูลลูกบ้าน
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">เพิ่มข้อมูลลูกบ้าน</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                บันทึกบ้านเลขที่และผูกข้อมูลเข้ากับโครงการ
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700 pointer-events-none"></div>
            
            <form action={addResident} className="space-y-6 relative z-10">
                <input type="hidden" name="siteId" value={selectedSiteId || ""} />

                <div className="space-y-2">
                    <label htmlFor="houseNumber" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    บ้านเลขที่ / รหัสห้อง <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="houseNumber"
                    id="houseNumber"
                    required
                    placeholder="เช่น 99/99"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="ownerName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ชื่อ-นามสกุล / เจ้าบ้าน <span className="text-zinc-400 font-normal">(ตัวเลือก)</span>
                        </label>
                        <input
                        type="text"
                        name="ownerName"
                        id="ownerName"
                        placeholder="ขื่อผู้ติดต่อหลัก"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        เบอร์โทรติดต่อ <span className="text-zinc-400 font-normal">(ตัวเลือก)</span>
                        </label>
                        <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="08X-XXX-XXXX"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="licensePlate" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ทะเบียนรถ (License Plate) <span className="text-zinc-400 font-normal">(ไม่ระบุตอนนี้ก็ได้)</span>
                    </label>
                    <input
                    type="text"
                    name="licensePlate"
                    id="licensePlate"
                    placeholder="เช่น 1กข-9999 (ปล่อยว่างได้ ถ้ารอเพิ่มผ่าน LIFF)"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-lg font-bold text-zinc-900 dark:text-white uppercase placeholder:text-zinc-400 placeholder:font-normal placeholder:lowercase focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกข้อมูล
                    </button>
                    <Link href="/residents" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
