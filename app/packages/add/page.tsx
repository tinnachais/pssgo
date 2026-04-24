import { addPackage } from "@/app/actions/packages";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AddPackagePage() {
  return (
    <div className="min-h-full font-sans selection:bg-indigo-500/30">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-indigo-600 transition-colors mb-6 group">
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            à¸à¸¥à¸±à¸šà¹„à¸›à¸«à¸™à¹‰à¸²à¹à¸žà¹‡à¸à¹€à¸à¸ˆ
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">à¹€à¸žà¸´à¹ˆà¸¡à¹à¸žà¹‡à¸à¹€à¸à¸ˆà¹ƒà¸«à¸¡à¹ˆ</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">à¸à¸³à¸«à¸™à¸”à¹‚à¸„à¸£à¸‡à¸ªà¸£à¹‰à¸²à¸‡à¸£à¸²à¸„à¸²à¹à¸¥à¸°à¸‚à¸µà¸”à¸ˆà¸³à¸à¸±à¸”à¸ªà¸³à¸«à¸£à¸±à¸šà¸£à¸°à¸šà¸š GP</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-500"></div>
            
            <form action={addPackage} className="p-8 md:p-10 space-y-8">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      à¸Šà¸·à¹ˆà¸­à¹à¸žà¹‡à¸à¹€à¸à¸ˆ (à¹€à¸Šà¹ˆà¸™ Basic, Pro, Enterprise) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="à¹€à¸Šà¹ˆà¸™ Starter Plan"
                      className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="maxVehicles" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      à¸‚à¸µà¸”à¸ˆà¸³à¸à¸±à¸”à¸ˆà¸³à¸™à¸§à¸™à¸£à¸–à¹ƒà¸™à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxVehicles"
                      id="maxVehicles"
                      required
                      min="1"
                      placeholder="à¹€à¸Šà¹ˆà¸™ 100"
                      className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-1">à¸›à¸£à¸´à¸¡à¸²à¸“à¸£à¸–à¸ªà¸¹à¸‡à¸ªà¸¸à¸”à¸‚à¸­à¸‡à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¸—à¸µà¹ˆà¹€à¸¥à¸·à¸­à¸à¹ƒà¸Šà¹‰à¹à¸žà¹‡à¸à¹€à¸à¸ˆà¸™à¸µà¹‰</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="monthlyPrice" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          à¸£à¸²à¸„à¸²à¸£à¸²à¸¢à¹€à¸”à¸·à¸­à¸™ (à¸šà¸²à¸—) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="monthlyPrice"
                          id="monthlyPrice"
                          required
                          min="0"
                          placeholder="à¹€à¸Šà¹ˆà¸™ 1000"
                          className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="yearlyPrice" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          à¸£à¸²à¸„à¸²à¸£à¸²à¸¢à¸›à¸µ (à¸šà¸²à¸—) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="yearlyPrice"
                          id="yearlyPrice"
                          required
                          min="0"
                          placeholder="à¹€à¸Šà¹ˆà¸™ 10000"
                          className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        à¸šà¸±à¸™à¸—à¸¶à¸à¹à¸žà¹‡à¸à¹€à¸à¸ˆ
                    </button>
                    <Link
                        href="/packages"
                        className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold py-3.5 px-8 rounded-xl transition-all"
                    >
                        à¸¢à¸à¹€à¸¥à¸´à¸
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
