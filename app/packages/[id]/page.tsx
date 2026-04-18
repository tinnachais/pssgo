import { updatePackage } from "@/app/actions/packages";
import { query } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const packageId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(packageId)) {
    notFound();
  }

  const result = await query("SELECT * FROM packages WHERE id = $1", [packageId]);
  const pkg = result.rows[0];

  if (!pkg) {
    notFound();
  }

  return (
    <div className="min-h-full font-sans selection:bg-indigo-500/30">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-indigo-600 transition-colors mb-6 group">
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับไปหน้าแพ็กเกจ
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">แก้ไขแพ็กเกจ</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">อัปเดตโครงสร้างราคาและขีดจำกัดสำหรับ {pkg.name}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-500"></div>
            
            <form action={async (formData) => {
              "use server";
              const { updatePackage } = await import("@/app/actions/packages");
              const { redirect } = await import("next/navigation");
              await updatePackage(packageId, formData);
              redirect("/packages");
            }} className="p-8 md:p-10 space-y-8">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      ชื่อแพ็กเกจ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      defaultValue={pkg.name}
                      placeholder="เช่น Starter Plan"
                      className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="maxVehicles" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      ขีดจำกัดจำนวนรถในโครงการ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxVehicles"
                      id="maxVehicles"
                      required
                      min="1"
                      defaultValue={pkg.max_vehicles}
                      placeholder="เช่น 100"
                      className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="monthlyPrice" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          ราคารายเดือน (บาท) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="monthlyPrice"
                          id="monthlyPrice"
                          required
                          min="0"
                          defaultValue={pkg.monthly_price}
                          className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="yearlyPrice" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          ราคารายปี (บาท) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="yearlyPrice"
                          id="yearlyPrice"
                          required
                          min="0"
                          defaultValue={pkg.yearly_price}
                          className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกการเปลี่ยนแปลง
                    </button>
                    <Link
                        href="/packages"
                        className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold py-3.5 px-8 rounded-xl transition-all"
                    >
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
