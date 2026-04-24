import ExcelImportSites from "./ExcelImportSites";
import { getSites, toggleSiteStatus, deleteSite } from "@/app/actions/sites";
import { getProviders } from "@/app/actions/providers";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function SitesPage() {
  let sites: any[] = [];
  let providers: any[] = [];
  
  try {
    sites = await getSites();
  } catch (err) {
    console.error("Failed to fetch sites:", err);
  }

  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let userLevel = "admin";

  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId && decoded.userId !== "admin") {
              const { getUser } = await import("@/app/actions/users");
              const u = await getUser(Number(decoded.userId));
              if (u) {
                  userLevel = u.level || "Level1";
              }
          }
      } catch (e) {}
  }

  try {
    providers = await getProviders();
  } catch (err) {
    console.error("Failed to fetch providers:", err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ</h1>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">Projects</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸²à¹à¸¥à¸°à¸ˆà¸±à¸”à¸à¸²à¸£à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¸•à¹ˆà¸²à¸‡à¹† à¸£à¸§à¸¡à¸–à¸¶à¸‡à¸„à¸­à¸™à¹‚à¸” à¸«à¸£à¸·à¸­à¸«à¸¡à¸¹à¹ˆà¸šà¹‰à¸²à¸™à¹ƒà¸™à¸£à¸°à¸šà¸š
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap justify-end w-full sm:w-auto">
            <ExcelImportSites />
            <Link href="/sites/add" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            à¹€à¸žà¸´à¹ˆà¸¡à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¹ƒà¸«à¸¡à¹ˆ
          </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[35%]">à¸Šà¸·à¹ˆà¸­à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¹à¸¥à¸°à¹‚à¸‹à¸™</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[20%]">à¸ªà¸–à¸´à¸•à¸´à¸ à¸²à¸žà¸£à¸§à¸¡</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[15%]">à¸œà¸¹à¹‰à¹ƒà¸«à¹‰à¸šà¸£à¸´à¸à¸²à¸£</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[15%]">à¹à¸žà¹‡à¸à¹€à¸à¸ˆ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[10%]">à¸ªà¸–à¸²à¸™à¸°</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-widest">à¸ˆà¸±à¸”à¸à¸²à¸£</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {sites.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1m-6 0h6" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-xs">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1 mb-6">à¹€à¸£à¸´à¹ˆà¸¡à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸²à¸£à¸°à¸šà¸šà¹‚à¸”à¸¢à¸à¸²à¸£à¹€à¸žà¸´à¹ˆà¸¡à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¹€à¸žà¸·à¹ˆà¸­à¹à¸šà¹ˆà¸‡à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆà¸à¸²à¸£à¸šà¸£à¸´à¸à¸²à¸£</p>
                            <Link href="/sites/add" className="text-indigo-600 hover:text-indigo-700 font-bold border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg transition-colors">
                                + à¹€à¸žà¸´à¹ˆà¸¡à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¹à¸£à¸
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    sites.map((site: any) => {
                        const zonesData = typeof site.zones_data === 'string' ? JSON.parse(site.zones_data) : (site.zones_data || []);
                        return (
                        <tr key={site.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                            <td className="px-4 py-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm font-bold text-xs flex-shrink-0">
                                {site.name.charAt(0)}
                                </div>
                                <div>
                                <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    {site.name}
                                    {site.type === 'TIER1_PRIVATE' ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">Tier 1 à¸ªà¹ˆà¸§à¸™à¸•à¸±à¸§ (GP)</span>
                                    ) : site.type === 'TIER2_PUBLIC_CITY' ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">Tier 2 à¸ªà¸²à¸˜à¸²à¸£à¸“à¸° (City Parking)</span>
                                    ) : site.type === 'TIER3_PUBLIC_PSS' ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">Tier 3 à¸ªà¸²à¸˜à¸²à¸£à¸“à¸° (PSS)</span>
                                    ) : site.type === 'TIER4_PUBLIC_OTHERS' ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">Tier 4 à¸ªà¸²à¸˜à¸²à¸£à¸“à¸° (Others)</span>
                                    ) : null}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {zonesData.length > 0 ? (
                                    zonesData.map((z: any) => (
                                        <span key={z.id} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                                        {z.name}
                                        </span>
                                    ))
                                    ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¹‚à¸‹à¸™</span>
                                    )}
                                </div>
                                </div>
                            </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50 min-w-[40px]">
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-0.5">à¸šà¹‰à¸²à¸™</span>
                                        <span className="text-xs font-black text-blue-700 dark:text-blue-300">{site.total_houses || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center px-2 py-1 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-100 dark:border-pink-800/50 min-w-[40px]">
                                        <span className="text-xs text-pink-600 dark:text-pink-400 font-semibold mb-0.5">à¸œà¸¹à¹‰à¹€à¸Šà¹ˆà¸²/à¸£à¹‰à¸²à¸™/à¸šà¸£à¸´à¸©à¸±à¸—</span>
                                        <span className="text-xs font-black text-pink-700 dark:text-pink-300 flex items-baseline gap-0.5">
                                            {site.total_residents || 0}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/50 min-w-[40px]">
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">à¸£à¸–à¸¢à¸™à¸•à¹Œ</span>
                                        <div className="text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-baseline gap-0.5">
                                            <span>{site.total_vehicles || 0}</span>
                                            {(site.package_max_vehicles || site.max_vehicles) ? (
                                                <span className="text-[10px] font-bold text-emerald-500/70">/ {site.package_max_vehicles || site.max_vehicles}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold border border-purple-200 dark:border-purple-500/20">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    {site.provider_name || 'à¹„à¸¡à¹ˆà¸¡à¸µà¸™à¸´à¸•à¸´à¸šà¸¸à¸„à¸„à¸¥'}
                                </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                                {(site.package_name || site.package_expires_at) ? (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            {site.package_name || 'à¹„à¸¡à¹ˆà¸£à¸°à¸šà¸¸à¹à¸žà¹‡à¸à¹€à¸à¸ˆ'}
                                        </div>
                                        {site.package_expires_at && (
                                            <div className={`text-[11px] font-bold px-2 py-0.5 rounded inline-flex w-fit ${new Date(site.package_expires_at).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                                {new Date(site.package_expires_at).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? 'à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸à¹€à¸¡à¸·à¹ˆà¸­: ' : 'à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸: '}
                                                {new Intl.DateTimeFormat('th-TH', { year: '2-digit', month: 'short', day: 'numeric' }).format(new Date(site.package_expires_at))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-xs text-zinc-400 font-medium">à¹„à¸¡à¹ˆà¸¡à¸µà¹à¸žà¹‡à¸à¹€à¸à¸ˆ</span>
                                )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                            <form action={async () => {
                                "use server";
                                await toggleSiteStatus(site.id, !site.is_active);
                            }}>
                                <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-80 ${site.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${site.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    {site.is_active ? 'Online' : 'Offline'}
                                </button>
                            </form>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1">
                                <Link href={`/sites/${site.id}`} title="à¸”à¸¹/à¹à¸à¹‰à¹„à¸‚à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”" className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 inline-flex">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                </Link>
                                {userLevel !== "Level3" && (
                                <form action={async () => {
                                "use server";
                                await deleteSite(site.id);
                                }}>
                                <button type="submit" title="à¸¥à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                </form>
                                )}
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
      </main>
    </div>
  );
}
