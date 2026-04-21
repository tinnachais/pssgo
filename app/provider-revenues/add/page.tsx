import { addProviderRevenue } from "@/app/actions/provider_revenues";
import { getSites } from "@/app/actions/sites";
import { getPackages } from "@/app/actions/packages";
import Link from "next/link";
import AddBillingForm from "./AddBillingForm";

export const dynamic = "force-dynamic";

export default async function AddProviderRevenuePage() {
  const sites = await getSites();
  const packages = await getPackages();
  const activePackages = packages.filter((p: any) => p.is_active);

  return (
    <div className="min-h-full font-sans selection:bg-emerald-500/30">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/provider-revenues" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-emerald-600 transition-colors mb-6 group">
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับไปหน้ารายรับ
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">ออกบิลเรียกเก็บสถานที่</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">รับชำระค่าบริการและกำหนดแพ็กเกจให้สถานที่</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
            
            <AddBillingForm sites={sites} activePackages={activePackages} addProviderRevenue={addProviderRevenue} />
        </div>
      </main>
    </div>
  );
}
