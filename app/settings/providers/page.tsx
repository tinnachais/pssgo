import { getProviders, toggleProviderStatus, deleteProvider } from "@/app/actions/providers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  let providers: any[] = [];
  try {
    providers = await getProviders();
  } catch (err) {
    console.error("Failed to fetch providers:", err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">ผู้ให้บริการ</h1>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider">Providers</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              จัดการข้อมูลบริษัท, นิติบุคคล, หรือกลุ่ม รปภ. สำหรับใช้เป็นฐานข้อมูลในการออกใบเสร็จและบัญชี
            </p>
          </div>
          <Link href="/settings/providers/add" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-purple-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มผู้ให้บริการ
          </Link>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[35%]">ข้อมูลบริษัท</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/5">เลขผู้เสียภาษี</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">จำนวนโครงการ</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">สถานะ</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-widest">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {providers.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีข้อมูลผู้ให้บริการ</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 mb-6">เพิ่มข้อมูลบริษัท ยาม หรือ ผู้รับเหมา เพื่อใช้สำหรับผูกกับการทำใบเสร็จและระบบบัญชี</p>
                            <Link href="/settings/providers/add" className="text-purple-600 hover:text-purple-700 font-bold border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg transition-colors">
                                + เพิ่มข้อมูลแรก
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    providers.map((provider: any) => (
                        <tr key={provider.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                            <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-sm font-bold text-lg flex-shrink-0">
                                {provider.name.charAt(0)}
                                </div>
                                <div>
                                <div className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{provider.name}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                                    {provider.contact_name ? `ผู้ติดต่อ: ${provider.contact_name}` : 'ยังไม่ระบุผู้ติดต่อ'}
                                    {provider.phone_number && ` • โทร: ${provider.phone_number}`}
                                </div>
                                <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">{provider.address || 'ไม่มีข้อมูลที่อยู่'}</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {provider.tax_id ? (
                                    <span className="font-mono text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-600 dark:text-zinc-400">
                                        {provider.tax_id}
                                    </span>
                                ) : (
                                    <span className="text-zinc-400 dark:text-zinc-600 text-sm">—</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-zinc-900 dark:text-white">{provider.sites_count || 0}</div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400">โครงการ</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <form action={async () => {
                                "use server";
                                await toggleProviderStatus(provider.id, !provider.is_active);
                            }}>
                                <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-80 ${provider.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${provider.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    {provider.is_active ? 'Active' : 'Disabled'}
                                </button>
                            </form>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1">
                                <Link href={`/settings/providers/${provider.id}`} title="ดู/แก้ไขรายละเอียด" className="text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-500/10 inline-flex">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                </Link>
                                <form action={async () => {
                                "use server";
                                await deleteProvider(provider.id);
                                }}>
                                <button type="submit" title="ลบข้อมูล" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                </form>
                            </div>
                            </td>
                        </tr>
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
