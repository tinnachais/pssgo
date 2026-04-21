import { updateNews, getNews } from "@/app/actions/news";
import { query } from "@/lib/db";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function EditNewsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
        notFound();
    }

    const news = await getNews(id);
    if (!news) {
        notFound();
    }

    let sites: any[] = [];
    try {
        const res = await query("SELECT id, name FROM sites ORDER BY name ASC");
        sites = res.rows;
    } catch { }

    return (
        <div className="min-h-full font-sans selection:bg-orange-500/30">
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10">
                    <Link href="/news" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6 group">
                        <svg className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับไปจัดการข่าวสาร
                    </Link>
                    
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
                        แก้ไขประกาศ
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
                        แก้ไขเนื้อหา หรือเปลี่ยนรูปภาพแนบ
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1E1E24] shadow-sm border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden relative isolate">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                    
                    <form action={async (formData) => {
                        "use server";
                        await updateNews(id, formData);
                        redirect("/news");
                    }} className="p-8 space-y-8">
                        <input type="hidden" name="existing_image_url" value={news.image_url || ''} />

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">สถานที่เป้าหมาย (Site) <span className="text-rose-500">*</span></label>
                                <select 
                                    name="siteId" 
                                    required 
                                    defaultValue={news.site_id}
                                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 transition-all block p-3.5 shadow-sm"
                                >
                                    <option value="">-- เลือกสถานที่ --</option>
                                    {sites.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">หัวข้อประกาศ <span className="text-rose-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    required 
                                    defaultValue={news.title}
                                    placeholder="เช่น แจ้งฉีดปลวกประจำเดือน, แจ้งหยุดจ่ายน้ำ"
                                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 transition-all block p-3.5 shadow-sm placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">เนื้อหารายละเอียด</label>
                                <textarea 
                                    name="content" 
                                    rows={6}
                                    defaultValue={news.content || ''}
                                    placeholder="อธิบายรายละเอียดประกาศเพิ่มเติม..."
                                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 transition-all block p-3.5 shadow-sm placeholder:text-slate-400 resize-y"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">รูปภาพแนบ (อัพโหลดใหม่เพื่อเปลี่ยน)</label>
                                {news.image_url && (
                                    <div className="mb-4 relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={news.image_url} alt="Current attachment" className="w-full h-auto object-cover" />
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    name="image" 
                                    accept="image/*"
                                    className="w-full bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 transition-all block p-3 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80 flex justify-end gap-3">
                            <Link href="/news" className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                ยกเลิก
                            </Link>
                            <button type="submit" className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                                ยืนยันการแก้ไข
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
