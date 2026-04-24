import { getSite, updateSite } from "@/app/actions/sites";
import { getProviders } from "@/app/actions/providers";
import { getPackages } from "@/app/actions/packages";
import Link from "next/link";
import { notFound } from "next/navigation";
import MapPicker from "@/app/components/MapPicker";
import SiteTypeLogic from "@/app/sites/SiteTypeLogic";

export default async function SiteDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const site = await getSite(id);
  
  if (!site) {
    notFound();
  }

  const [providers, packages] = await Promise.all([getProviders(), getPackages()]);
  const activeProviders = providers.filter((p: any) => p.is_active || p.id === site.provider_id);
  const activePackages = packages.filter((p: any) => p.is_active !== false || p.id === site.package_id);

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/sites" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                à¸à¸¥à¸±à¸šà¹„à¸›à¸«à¸™à¹‰à¸²à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ
            </Link>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold text-3xl flex-shrink-0">
                    {site.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1">{site.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${site.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${site.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {site.is_active ? 'Active' : 'Disabled'}
                        </span>
                        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
                        <div className="flex flex-wrap gap-1.5">
                            {(() => {
                                const zones = typeof site.zones_data === 'string' ? JSON.parse(site.zones_data) : (site.zones_data || []);
                                return zones.length > 0 ? zones.map((z: any) => (
                                    <span key={z.id} className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                                        {z.name}
                                    </span>
                                )) : <span className="text-[10px] font-bold text-zinc-400">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¹‚à¸‹à¸™</span>;
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                à¹à¸à¹‰à¹„à¸‚à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ
            </h2>
            <form action={async (formData) => {
                "use server";
                await updateSite(id, formData);
            }} className="space-y-6 max-w-2xl">
                
                <div className="space-y-2">
                    <label htmlFor="providerId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    à¸™à¸´à¸•à¸´à¸šà¸¸à¸„à¸„à¸¥à¸—à¸µà¹ˆà¸”à¸¹à¹à¸¥à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                        name="providerId"
                        id="providerId"
                        required
                        defaultValue={site.provider_id || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        >
                        <option value="">-- à¹€à¸¥à¸·à¸­à¸à¸™à¸´à¸•à¸´à¸šà¸¸à¸„à¸„à¸¥ --</option>
                        {activeProviders.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                            {provider.name}
                            </option>
                        ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 system-field">
                    <label htmlFor="packageId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    à¹à¸žà¹‡à¸à¹€à¸à¸ˆ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                        name="packageId"
                        id="packageId"
                        required
                        defaultValue={site.package_id || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        >
                        <option value="">-- à¹€à¸¥à¸·à¸­à¸à¹à¸žà¹‡à¸à¹€à¸à¸ˆ --</option>
                        {activePackages.map((pkg: any) => (
                            <option key={pkg.id} value={pkg.id}>
                            {pkg.name} (à¸ªà¸¹à¸‡à¸ªà¸¸à¸” {pkg.max_vehicles} à¸„à¸±à¸™)
                            </option>
                        ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    à¸Šà¸·à¹ˆà¸­à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={site.name}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="type" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    à¸›à¸£à¸°à¹€à¸ à¸—à¸‚à¸­à¸‡à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ <span className="text-rose-500">*</span>
                    </label>
                    <select
                    name="type"
                    id="type"
                    defaultValue={site.type || 'PRIVATE'}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium appearance-none"
                    >
                        <option value="TIER1_PRIVATE">Tier 1 à¸ªà¹ˆà¸§à¸™à¸•à¸±à¸§ (GP)</option>
                            <option value="TIER2_PUBLIC_CITY">Tier 2 à¸ªà¸²à¸˜à¸²à¸£à¸“à¸° (City Parking)</option>
                            <option value="TIER3_PUBLIC_PSS">Tier 3 à¸ªà¸²à¸˜à¸²à¸£à¸“à¸° (PSS)</option>
                            <option value="TIER4_PUBLIC_OTHERS">Tier 4 à¸ªà¸²à¸˜à¸²à¸£à¸“à¸° (Others)</option>
                    </select>
                </div>

                  <div className="col-span-1 md:col-span-2 space-y-4 mock-field" style={{display: 'none'}}>
                      <div className="bg-purple-50/50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/50 mt-4">
                          <h3 className="text-sm font-bold text-purple-900 dark:text-purple-400 flex items-center gap-2 mb-4">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ˆà¸³à¸¥à¸­à¸‡à¸ªà¸³à¸«à¸£à¸±à¸šà¹à¸ªà¸”à¸‡à¸šà¸™à¹à¸œà¸™à¸—à¸µà¹ˆ
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* à¸£à¸–à¸¢à¸™à¸•à¹Œ */}
                              <div className="space-y-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                      à¸£à¸–à¸¢à¸™à¸•à¹Œ
                                  </h4>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">à¸ˆà¸³à¸™à¸§à¸™à¸Šà¹ˆà¸­à¸‡à¸ˆà¸­à¸”</label>
                                      <input type="number" name="mockSlotsCar" defaultValue={site.mock_slots_car || ""} placeholder="à¹€à¸Šà¹ˆà¸™ 50" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">à¹€à¸§à¸¥à¸²à¸ˆà¸­à¸”à¸Ÿà¸£à¸µ</label>
                                      <input type="text" name="mockFreeTimeCar" defaultValue={site.mock_free_time_car || ""} placeholder="à¹€à¸Šà¹ˆà¸™ 2 à¸Šà¸¡. à¹à¸£à¸" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">à¸„à¹ˆà¸²à¸ˆà¸­à¸”à¸£à¸–</label>
                                      <input type="text" name="mockFeeCar" defaultValue={site.mock_fee_car || ""} placeholder="à¹€à¸Šà¹ˆà¸™ à¸Šà¸¡.à¸¥à¸° 20 à¸šà¸²à¸—" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                              </div>
                  
                              {/* à¸£à¸–à¸ˆà¸±à¸à¸£à¸¢à¸²à¸™à¸¢à¸™à¸•à¹Œ */}
                              <div className="space-y-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                      à¸£à¸–à¸ˆà¸±à¸à¸£à¸¢à¸²à¸™à¸¢à¸™à¸•à¹Œ
                                  </h4>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">à¸ˆà¸³à¸™à¸§à¸™à¸Šà¹ˆà¸­à¸‡à¸ˆà¸­à¸”</label>
                                      <input type="number" name="mockSlotsMotorcycle" defaultValue={site.mock_slots_motorcycle || ""} placeholder="à¹€à¸Šà¹ˆà¸™ 20" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">à¹€à¸§à¸¥à¸²à¸ˆà¸­à¸”à¸Ÿà¸£à¸µ</label>
                                      <input type="text" name="mockFreeTimeMotorcycle" defaultValue={site.mock_free_time_motorcycle || ""} placeholder="à¹€à¸Šà¹ˆà¸™ 30 à¸™à¸²à¸—à¸µà¹à¸£à¸" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">à¸„à¹ˆà¸²à¸ˆà¸­à¸”à¸£à¸–</label>
                                      <input type="text" name="mockFeeMotorcycle" defaultValue={site.mock_fee_motorcycle || ""} placeholder="à¹€à¸Šà¹ˆà¸™ à¸Šà¸¡.à¸¥à¸° 10 à¸šà¸²à¸—" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all font-medium" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                
                <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    à¸—à¸µà¹ˆà¸­à¸¢à¸¹à¹ˆ / à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸‚à¸­à¸‡à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ
                    </label>
                    <textarea
                    name="address"
                    id="address"
                    rows={3}
                    defaultValue={site.address || ''}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                    ></textarea>
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    à¸žà¸´à¸à¸±à¸”à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ (à¸„à¸¥à¸´à¸à¹€à¸žà¸·à¹ˆà¸­à¸›à¸±à¸à¸«à¸¡à¸¸à¸”)
                    </label>
                    <MapPicker defaultLat={site.lat ? parseFloat(site.lat) : undefined} defaultLng={site.lng ? parseFloat(site.lng) : undefined} />
                </div>

                    <div className="space-y-2">
                        <label htmlFor="maxVehicles" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        à¸ˆà¸³à¸™à¸§à¸™à¸£à¸–à¸ªà¸¹à¸‡à¸ªà¸¸à¸”à¸•à¹ˆà¸­à¸šà¹‰à¸²à¸™ <span className="text-rose-500">*</span>
                        </label>
                        <input
                        type="number"
                        name="maxVehicles"
                        id="maxVehicles"
                        required
                        min="0"
                        defaultValue={site.max_vehicles}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        />
                        <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-1.5 flex items-start gap-1">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span><strong className="block mb-0.5">à¸‚à¹‰à¸­à¸„à¸§à¸£à¸£à¸°à¸§à¸±à¸‡:</strong>à¸à¸²à¸£à¸•à¸±à¹‰à¸‡à¸ˆà¸³à¸™à¸§à¸™à¸£à¸–à¸•à¹ˆà¸­à¸šà¹‰à¸²à¸™ à¸„à¸§à¸£à¸„à¸³à¸™à¸§à¸“à¹ƒà¸«à¹‰à¸ªà¸±à¸¡à¸žà¸±à¸™à¸˜à¹Œà¸à¸±à¸šà¹à¸žà¹‡à¸à¹€à¸à¸ˆ (à¹ƒà¸ªà¹ˆà¹€à¸¥à¸‚ 0 à¹€à¸žà¸·à¹ˆà¸­à¹„à¸›à¸à¸³à¸«à¸™à¸”à¹à¸¢à¸à¸•à¸²à¸¡à¹à¸•à¹ˆà¸¥à¸°à¸œà¸¹à¹‰à¹€à¸Šà¹ˆà¸²/à¸£à¹‰à¸²à¸™/à¸šà¸£à¸´à¸©à¸±à¸—à¹€à¸­à¸‡)</span>
                        </p>
                    </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    API Token à¸ªà¸³à¸«à¸£à¸±à¸šà¸­à¸¸à¸›à¸à¸£à¸“à¹Œà¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­ (à¸­à¹ˆà¸²à¸™à¸­à¸¢à¹ˆà¸²à¸‡à¹€à¸”à¸µà¸¢à¸§)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            readOnly
                            value={site.api_token || "à¸£à¸°à¸šà¸šà¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¸ªà¸£à¹‰à¸²à¸‡ Token (à¹‚à¸›à¸£à¸”à¸­à¸±à¸›à¹€à¸”à¸•à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ 1 à¸„à¸£à¸±à¹‰à¸‡à¹€à¸žà¸·à¹ˆà¸­à¸ªà¸£à¹‰à¸²à¸‡)"}
                            className={`w-full rounded-2xl border ${site.api_token ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-400 font-mono tracking-wider' : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500'} px-5 py-3.5 text-sm focus:outline-none transition-all`}
                        />
                        {site.api_token && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-1 rounded">DO NOT SHARE</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1.5">
                        Token à¸™à¸µà¹‰à¹ƒà¸Šà¹‰à¸ªà¸³à¸«à¸£à¸±à¸šà¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­à¸­à¸¸à¸›à¸à¸£à¸“à¹Œ Hardware (à¹€à¸Šà¹ˆà¸™ à¸à¸¥à¹‰à¸­à¸‡ LPR, à¸£à¸°à¸šà¸šà¹„à¸¡à¹‰à¸à¸±à¹‰à¸™) à¸à¸£à¸“à¸µà¹„à¸¡à¹ˆà¸¡à¸µà¸£à¸°à¸šà¸šà¸ˆà¸°à¸ªà¸£à¹‰à¸²à¸‡à¹ƒà¸«à¹‰à¹€à¸¡à¸·à¹ˆà¸­à¸—à¹ˆà¸²à¸™à¸à¸”à¸šà¸±à¸™à¸—à¸¶à¸à¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡
                    </p>
                </div>


                <div className="space-y-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 mt-6 system-field mb-6">
                  <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      à¸à¸²à¸£à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸²à¸£à¸°à¸šà¸šà¹à¸¥à¸°à¸Ÿà¸µà¹€à¸ˆà¸­à¸£à¹Œà¹€à¸žà¸´à¹ˆà¸¡à¹€à¸•à¸´à¸¡
                  </h3>
                  <div className="space-y-3 pt-2">
                      <label className="relative flex items-start gap-3 cursor-pointer group">
                          <div className="flex items-center h-6">
                              <input
                                  type="checkbox"
                                  name="enableAppointments"
                                  defaultChecked={site.enable_appointments !== false}
                                  className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                              />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">à¹€à¸›à¸´à¸”à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¸£à¸°à¸šà¸šà¸™à¸±à¸”à¸«à¸¡à¸²à¸¢à¸¥à¹ˆà¸§à¸‡à¸«à¸™à¹‰à¸² (Appointments)</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">à¸­à¸™à¸¸à¸à¸²à¸•à¹ƒà¸«à¹‰à¸¥à¸¹à¸à¸šà¹‰à¸²à¸™à¸ªà¸£à¹‰à¸²à¸‡à¸„à¸´à¸§à¸­à¸²à¸£à¹Œà¹‚à¸„à¹‰à¸”à¹€à¸žà¸·à¹ˆà¸­à¸™à¸±à¸”à¸«à¸¡à¸²à¸¢à¸œà¸¹à¹‰à¸¡à¸²à¸•à¸´à¸”à¸•à¹ˆà¸­à¸¥à¹ˆà¸§à¸‡à¸«à¸™à¹‰à¸²à¸œà¹ˆà¸²à¸™ LINE</span>
                          </div>
                      </label>
                      <label className="relative flex items-start gap-3 cursor-pointer group">
                          <div className="flex items-center h-6">
                              <input
                                  type="checkbox"
                                  name="enableVisitorIdExchange"
                                  defaultChecked={site.enable_visitor_id_exchange !== false}
                                  className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                              />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">à¹€à¸›à¸´à¸”à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¸à¸²à¸£à¹à¸¥à¸à¸šà¸±à¸•à¸£à¸œà¸¹à¹‰à¸¡à¸²à¸•à¸´à¸”à¸•à¹ˆà¸­ (Visitor ID Exchange)</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">à¸šà¸±à¸‡à¸„à¸±à¸šà¹ƒà¸«à¹‰à¸•à¹‰à¸­à¸‡à¹€à¸ªà¸µà¸¢à¸šà¸šà¸±à¸•à¸£à¸›à¸£à¸°à¸Šà¸²à¸Šà¸™à¹€à¸žà¸·à¹ˆà¸­à¸­à¹ˆà¸²à¸™à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸”à¹‰à¸§à¸¢à¹€à¸„à¸£à¸·à¹ˆà¸­à¸‡à¸­à¹ˆà¸²à¸™à¸šà¸±à¸•à¸£ (Smart Card Reader) à¸ªà¸³à¸«à¸£à¸±à¸šà¸œà¸¹à¹‰à¸¡à¸²à¸•à¸´à¸”à¸•à¹ˆà¸­à¸—à¸µà¹ˆà¹„à¸¡à¹ˆà¹„à¸”à¹‰à¸™à¸±à¸”à¸«à¸¡à¸²à¸¢</span>
                          </div>
                      </label>
                  </div>
                </div>
                <div className="space-y-2 system-field">
                    <label htmlFor="contactLink" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    à¸¥à¸´à¸‡à¸à¹Œà¸•à¸´à¸”à¸•à¹ˆà¸­à¹€à¸ˆà¹‰à¸²à¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆà¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ (à¹€à¸Šà¹ˆà¸™ LINE OA)
                    </label>
                    <input
                    type="url"
                    name="contactLink"
                    id="contactLink"
                    defaultValue={site.contact_link || ""}
                    placeholder="https://lin.ee/..."
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        à¸šà¸±à¸™à¸—à¸¶à¸à¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡
                    </button>
                </div>
                <SiteTypeLogic />
            </form>
        </div>
      </main>
    </div>
  );
}

