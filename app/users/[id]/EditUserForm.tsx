"use client";

import { useState } from "react";
import Link from "next/link";
import { updateUser } from "@/app/actions/users";

interface Provider {
    id: number;
    name: string;
}

interface Site {
    id: number;
    name: string;
    provider_id: number;
}

export default function EditUserForm({ user, providers, sites, dbRoles = [] }: { user: any, providers: Provider[], sites: Site[], dbRoles?: any[] }) {
    const [level, setLevel] = useState(user.level || "Level1");
    // State to keep track of which providers are checked.
    const [selectedProviders, setSelectedProviders] = useState<number[]>(Array.isArray(user.provider_ids) ? user.provider_ids : []);
    const [selectedSites, setSelectedSites] = useState<number[]>(Array.isArray(user.site_ids) ? user.site_ids : []);

    // Filter sites based on selected providers (only if providers are selected)
    const availableSites = selectedProviders.length > 0 
        ? sites.filter(s => selectedProviders.includes(s.provider_id))
        : sites;

    const handleProviderToggle = (id: number) => {
        setSelectedProviders(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSiteToggle = (id: number) => {
        setSelectedSites(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const submitAction = async (formData: FormData) => {
        await updateUser(user.id, formData);
    };

    return (
        <form action={submitAction} className="space-y-6 relative z-10 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อ <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    defaultValue={user.first_name}
                    placeholder="สมชาย"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    defaultValue={user.last_name}
                    placeholder="ระบบดี"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-medium"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    อีเมล (ใช้เข้าสู่ระบบ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    defaultValue={user.email}
                    placeholder="somchai@example.com"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    รหัสผ่าน (ปล่อยว่างหากไม่ต้องการเปลี่ยน)
                    </label>
                    <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                สิทธิ์การเข้าถึงเมนู (Role) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                    <select
                    name="role"
                    id="role"
                    required
                    defaultValue={user.role}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-medium"
                    >
                    <option value="">-- เลือกกลุ่มสิทธิ์ --</option>
                    {dbRoles.map(r => (
                        <option key={r.id} value={r.name}>{r.name} - {r.description}</option>
                    ))}
                    {!dbRoles.length && (
                        <>
                           <option value="Admin">แอดมิน (Admin) - จัดการได้ทุกส่วน</option>
                           <option value="Manager">ผู้จัดการ (Manager) - จัดการข้อมูลและดูรายงาน</option>
                        </>
                    )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                <div className="space-y-2">
                    <label htmlFor="level" className="block text-sm font-semibold text-zinc-900 dark:text-white">
                    ระดับโครงสร้างควบคุม (Hierarchy Level) <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-zinc-500 mb-2">กำหนดความกว้างในการมองเห็นข้อมูลตามสาขาที่รับผิดชอบ</p>
                    <div className="relative">
                        <select
                        name="level"
                        id="level"
                        required
                        value={level}
                        onChange={e => setLevel(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-3 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-medium"
                        >
                            <option value="Level1">Level 1 - ผู้ดูแลระบบส่วนกลาง (เห็นข้อมูลทั้งหมด)</option>
                            <option value="Level2">Level 2 - ผู้ให้บริการลานจอด (Provider Admin)</option>
                            <option value="Level3">Level 3 - เจ้าหน้าที่สถานที่ (Site User)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                {(level === "Level2" || level === "Level3") && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        กำหนดสิทธิ์การเข้าถึงผู้ให้บริการ (Providers)
                        </label>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                            ขอบเขตการเข้าถึงระดับ Provider
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                            {providers.map(provider => (
                                <label key={provider.id} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        name="provider_ids" 
                                        value={provider.id} 
                                        checked={selectedProviders.includes(provider.id)}
                                        onChange={() => handleProviderToggle(provider.id)}
                                        className="w-4 h-4 text-sky-600 rounded" 
                                    />
                                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">{provider.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {level === "Level3" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    กำหนดสิทธิ์การเข้าถึงสถานที่ (Sites)
                    </label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                        เลือกเฉพาะสถานที่ที่รับผิดชอบ {selectedProviders.length > 0 && "(กรองจาก Provider ที่เลือกไว้บนสุด)"}
                    </p>
                    {availableSites.length === 0 ? (
                        <div className="text-sm text-zinc-500 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">ไม่พบข้อมูลสถานที่ กรุณาเลือก Provider ก่อน หรือเพิ่มสถานที่ในระบบ</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                            {availableSites.map(site => (
                                <label key={site.id} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        name="site_ids" 
                                        value={site.id} 
                                        checked={selectedSites.includes(site.id)}
                                        onChange={() => handleSiteToggle(site.id)}
                                        className="w-4 h-4 text-sky-600 rounded" 
                                    />
                                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">{site.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            <div className="pt-4 flex items-center gap-3">
                <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-sky-600/20 hover:shadow-lg active:scale-[0.98]"
                >
                    อัปเดตข้อมูลผู้ใช้งาน
                </button>
                <Link href="/users" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                    ยกเลิก
                </Link>
            </div>
        </form>
    );
}
