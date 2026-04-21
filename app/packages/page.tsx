import { getPackages, addPackage, togglePackageStatus, deletePackage } from "@/app/actions/packages";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <div className="min-h-full font-sans selection:bg-indigo-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">แพ็กเกจสถานที่</h1>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                Packages
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              ตั้งค่าโครงสร้างราคาแบบ Subscription สำหรับแต่ละสถานที่ (รายเดือน / รายปี)
            </p>
          </div>
          <Link
            href="/packages/add"
            className="group relative inline-flex items-center gap-2 px-6 py-3 font-bold text-white bg-indigo-600 rounded-xl overflow-hidden hover:bg-indigo-700 transition-all active:scale-95 shadow-sm hover:shadow-indigo-500/20"
          >
            <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative z-10">สร้างแพ็กเกจใหม่</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.length === 0 ? (
            <div className="col-span-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">ยังไม่มีแพ็กเกจในระบบ</p>
            </div>
          ) : (
            packages.map((pkg: any) => (
              <div
                key={pkg.id}
                className="group w-full max-w-sm bg-white dark:bg-[#121212] rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/50 flex flex-col"
              >
                <div className="absolute top-6 right-6">
                  {pkg.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>พร้อมใช้
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      ปิดใช้งาน
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white capitalize pr-20">{pkg.name}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                    รองรับรถสูงสุด <span className="font-bold text-zinc-700 dark:text-zinc-300">{pkg.max_vehicles.toLocaleString()} คัน</span>
                  </p>
                </div>

                <div className="space-y-4 flex-grow border-t border-b border-zinc-100 dark:border-zinc-800/80 py-6 mb-6">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">รายเดือน</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">฿{parseFloat(pkg.monthly_price).toLocaleString()}</span>
                            <span className="text-sm font-medium text-zinc-500">/เดือน</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">รายปี (ประหยัดกว่า)</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">฿{parseFloat(pkg.yearly_price).toLocaleString()}</span>
                            <span className="text-sm font-medium text-zinc-500">/ปี</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                  <form className="flex-1">
                    <button
                      formAction={async () => {
                        "use server";
                        await togglePackageStatus(pkg.id, !pkg.is_active);
                      }}
                      className="w-full h-11 flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      {pkg.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    </button>
                  </form>

                  <Link href={`/packages/${pkg.id}`} className="flex-1 h-11 flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                    แก้ไข
                  </Link>

                  <form>
                    <button
                      formAction={async () => {
                        "use server";
                        await deletePackage(pkg.id);
                      }}
                      className="w-11 h-11 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
