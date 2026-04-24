import { query } from "@/lib/db";
import { addProvider } from "@/app/actions/providers";
import { addSite } from "@/app/actions/sites";
import { addZone } from "@/app/actions/zones";
import { addGate } from "@/app/actions/gates";

// บังคับให้โหลดข้อมูลใหม่เสมอ ไม่จำแคช
export const dynamic = "force-dynamic";

export default async function TopologyPage() {
  let providers: any[] = [];
  let sites: any[] = [];
  let zones: any[] = [];
  let gates: any[] = [];
  let types: any[] = [];

const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("pssgo_session")?.value;
  let allowedProviderIds: number[] | null = null;
  let allowedSiteIds: number[] | null = null;
  let isAdmin = false;
  let isLevel3 = false;

  if (sessionData) {
      try {
          const decoded = JSON.parse(Buffer.from(sessionData, 'base64').toString('utf8'));
          if (decoded.userId === "admin") {
             isAdmin = true;
          } else if (decoded.userId) {
              const { getUser } = await import("@/app/actions/users");
              const u = await getUser(Number(decoded.userId));
              if (u) {
                  if (u.level === "Level3") {
                      isLevel3 = true;
                      allowedSiteIds = Array.isArray(u.site_ids) ? u.site_ids : [];
                  } else if (u.level === "Level2") {
                      allowedProviderIds = Array.isArray(u.provider_ids) ? u.provider_ids : [];
                  } else if (u.level === "Level1") {
                      isAdmin = true;
                  } else {
                      // Fallback for older users without explicit level
                      if (Array.isArray(u.provider_ids) && u.provider_ids.length > 0) {
                          allowedProviderIds = u.provider_ids;
                      } else {
                          // No explicit permissions, assume restricted
                      }
                  }
              }
          }
      } catch (e) {}
  }

  try {
    let pQueryStr = "SELECT * FROM providers ORDER BY created_at ASC";
    let pParams: any[] = [];
    if (!isAdmin) {
        if (isLevel3) {
            if (allowedSiteIds && allowedSiteIds.length > 0) {
                 pQueryStr = "SELECT * FROM providers WHERE id IN (SELECT provider_id FROM sites WHERE id = ANY($1::int[])) ORDER BY created_at ASC";
                 pParams = [allowedSiteIds];
            } else {
                 pQueryStr = "SELECT * FROM providers WHERE 1=0";
            }
        } else if (allowedProviderIds) {
            if (allowedProviderIds.length > 0) {
                 pQueryStr = "SELECT * FROM providers WHERE id = ANY($1::int[]) ORDER BY created_at ASC";
                 pParams = [allowedProviderIds];
            } else {
                 pQueryStr = "SELECT * FROM providers WHERE 1=0";
            }
        } else {
             pQueryStr = "SELECT * FROM providers WHERE 1=0";
        }
    }
    const pRes = await query(pQueryStr, pParams);
    providers = pRes.rows;
  } catch (err) {}

  try {
    let sQueryStr = "SELECT * FROM sites ORDER BY created_at ASC";
    let sParams: any[] = [];
    if (!isAdmin) {
        if (isLevel3) {
            if (allowedSiteIds && allowedSiteIds.length > 0) {
                 sQueryStr = "SELECT * FROM sites WHERE id = ANY($1::int[]) ORDER BY created_at ASC";
                 sParams = [allowedSiteIds];
            } else {
                 sQueryStr = "SELECT * FROM sites WHERE 1=0";
            }
        } else if (allowedProviderIds) {
            if (allowedProviderIds.length > 0) {
                 sQueryStr = "SELECT * FROM sites WHERE provider_id = ANY($1::int[]) ORDER BY created_at ASC";
                 sParams = [allowedProviderIds];
            } else {
                 sQueryStr = "SELECT * FROM sites WHERE 1=0";
            }
        } else {
             sQueryStr = "SELECT * FROM sites WHERE 1=0";
        }
    }
    const sRes = await query(sQueryStr, sParams);
    sites = sRes.rows;
  } catch (err) {}

  try {
    const zRes = await query("SELECT * FROM zones ORDER BY created_at ASC");
    zones = zRes.rows;
  } catch (err) {}

  try {
    const gRes = await query("SELECT * FROM gates ORDER BY created_at ASC");
    gates = gRes.rows;
  } catch (err) {}

  try {
    const tRes = await query("SELECT * FROM gate_types ORDER BY created_at ASC");
    types = tRes.rows;
  } catch (err) {}

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              Network Topology Matrix
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Visualizes and manages your entire infrastructure hierarchy from Top-Level Providers down to Camera Gates.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-6 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* New Provider Quick Add */}
          {isAdmin && (
            <div className="bg-zinc-50 dark:bg-zinc-800/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                 <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                 Instantiate New Provider
              </h3>
              <form action={addProvider} className="flex gap-2 items-center">
                <input type="text" name="name" required placeholder="Provider Name (e.g. Acme Corp)" className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap shadow-sm">Add Provider</button>
              </form>
            </div>
          )}

          {providers.length === 0 && (
             <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
               No hierarchy exists yet. Add your first Provider above.
             </div>
          )}

          {/* The Tree */}
          <div className="space-y-6">
            {providers.map((provider) => {
              const providerSites = sites.filter(s => s.provider_id === provider.id);
              return (
                <div key={provider.id} className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl border border-purple-200 dark:border-purple-900/30 shadow-sm overflow-hidden group">
                  
                  {/* Provider Header */}
                  <div className="px-6 py-4 bg-purple-50 dark:bg-purple-500/10 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
                        {provider.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-0.5">L1 Provider</span>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{provider.name}</h2>
                      </div>
                    </div>
                  </div>

                  {/* Sites Container */}
                  <div className="p-6 space-y-6">
                    {providerSites.length === 0 && (
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 italic pl-14">No Sites allocated yet.</div>
                    )}
                    {providerSites.map((site) => {
                      const siteZones = zones.filter(z => z.site_id === site.id);
                      return (
                        <div key={site.id} className="ml-6 md:ml-12 border-l-2 border-indigo-200 dark:border-indigo-800 pl-6 pb-2 relative">
                          {/* Connection line */}
                          <div className="absolute w-6 h-0.5 bg-indigo-200 dark:bg-indigo-800 -left-0.5 top-6"></div>
                          
                          <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-indigo-100 dark:border-indigo-900/30 p-5">
                            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-700/50 pb-3 mb-4">
                              <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                              </span>
                              <div>
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-0.5">L2 Site</span>
                                <h3 className="font-bold text-zinc-900 dark:text-white">{site.name}</h3>
                              </div>
                            </div>

                            {/* Zones Container */}
                            <div className="space-y-4">
                              {siteZones.length === 0 && (
                                <div className="text-sm text-zinc-500 dark:text-zinc-400 italic pl-8">No Zones defined yet.</div>
                              )}
                              {siteZones.map((zone) => {
                                const zoneGates = gates.filter(g => g.zone_id === zone.id);
                                return (
                                  <div key={zone.id} className="ml-4 md:ml-8 border-l-2 border-teal-200 dark:border-teal-800 pl-6 relative">
                                    <div className="absolute w-6 h-0.5 bg-teal-200 dark:bg-teal-800 -left-0.5 top-5"></div>
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-teal-100 dark:border-teal-900/30 p-4">
                                      <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">L3 Zone:</span>
                                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{zone.name}</h4>
                                      </div>

                                      {/* Gates Container */}
                                      <div className="pl-6 space-y-2">
                                        {zoneGates.length === 0 && (
                                          <div className="text-xs text-zinc-400 italic">No Gates linked.</div>
                                        )}
                                        {zoneGates.map(gate => (
                                          <div key={gate.id} className="flex items-center gap-2 text-sm bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 py-1.5 px-3 rounded-md border border-sky-100 dark:border-sky-800/50 w-fit">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            <span className="font-mono text-xs">{gate.name}</span>
                                          </div>
                                        ))}

                                        {/* Quick Add Gate */}
                                        <form action={addGate} className="flex gap-2 items-center mt-2 relative before:content-['└'] before:text-zinc-300 before:dark:text-zinc-700 before:absolute before:-left-4 before:top-1.5 pl-1">
                                          <input type="hidden" name="zoneId" value={zone.id} />
                                          <select name="typeId" className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-[10px] focus:ring-1 focus:ring-sky-500 outline-none w-28 text-zinc-600 dark:text-zinc-400">
                                            <option value="">Generic Type</option>
                                            {types.map(t => <option key={t.id} value={t.id}>{t.code ? `[${t.code}] ` : ''}{t.name}</option>)}
                                          </select>
                                          <input type="text" name="name" required placeholder="+ Add new LPR Gate (e.g. CAM-01)" className="w-48 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs focus:ring-1 focus:ring-sky-500 outline-none" />
                                          <button type="submit" className="bg-sky-100 hover:bg-sky-200 text-sky-700 dark:bg-sky-900/40 dark:hover:bg-sky-800/50 dark:text-sky-300 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap">Bind Gate</button>
                                        </form>
                                      </div>

                                    </div>
                                  </div>
                                );
                              })}

                              {/* Quick Add Zone */}
                              <form action={addZone} className="flex gap-2 items-center ml-4 md:ml-8 pl-6 relative before:content-['└'] before:text-teal-200 before:dark:text-teal-800 before:absolute before:left-0 before:-top-2">
                                <input type="hidden" name="siteId" value={site.id} />
                                <input type="text" name="name" required placeholder="+ Expand new Zone (e.g. VIP Parking)" className="w-48 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 outline-none" />
                                <button type="submit" className="bg-teal-100 hover:bg-teal-200 text-teal-700 dark:bg-teal-900/40 dark:hover:bg-teal-800/50 dark:text-teal-300 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap">Add Zone</button>
                              </form>

                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Quick Add Site */}
                    <form action={addSite} className="flex gap-2 items-center ml-12 relative before:content-['└'] before:text-indigo-200 before:dark:text-indigo-800 before:absolute before:-left-6 before:-top-2">
                      <input type="hidden" name="providerId" value={provider.id} />
                      <input type="text" name="name" required placeholder="+ Deploy new Site Concept" className="w-64 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
                      <button type="submit" className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-800/50 dark:text-indigo-300 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap">Setup Site</button>
                    </form>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
