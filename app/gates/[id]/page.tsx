import { getGate, updateGate } from "@/app/actions/gates";
import { getZones } from "@/app/actions/zones";
import { getGateTypes } from "@/app/actions/gate-types";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GateDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const gate = await getGate(id);
  
  if (!gate) {
    notFound();
  }

  const zones = await getZones();
  const activeZones = zones.filter(z => z.is_active || z.id === gate.zone_id);

  const gateTypes = await getGateTypes();
  const activeTypes = gateTypes.filter(t => t.is_active || t.id === gate.type_id);

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/gates" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าอุปกรณ์
            </Link>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 font-bold text-3xl flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1 font-mono">{gate.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${gate.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${gate.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {gate.is_active ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                แก้ไขข้อมูลจุดติดตั้ง / อุปกรณ์
            </h2>
            <form action={async (formData) => {
                "use server";
                await updateGate(id, formData);
            }} className="space-y-6 max-w-2xl">
                
                <div className="space-y-2">
                    <label htmlFor="zoneId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    โซนพื้นที่ที่ติดตั้ง <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                        name="zoneId"
                        id="zoneId"
                        required
                        defaultValue={gate.zone_id || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-medium"
                        >
                        <option value="">-- เลือกโซนพื้นที่ --</option>
                        {activeZones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                            {zone.name} ({zone.site_name})
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
                    ชื่อจุดติดตั้ง / Terminal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={gate.name}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-mono"
                    />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="typeId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ประเภทอุปกรณ์ <span className="text-zinc-400 font-normal">(ไม่บังคับ)</span>
                    </label>
                    <div className="relative">
                        <select
                        name="typeId"
                        id="typeId"
                        defaultValue={gate.type_id || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-medium"
                        >
                        <option value="">-- ไม่ระบุ (อุปกรณ์ทั่วไป) --</option>
                        {activeTypes.map((t) => (
                            <option key={t.id} value={t.id}>
                            {t.code ? `[${t.code}] ` : ''}{t.name}
                            </option>
                        ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ข้อมูลเชิงลึกทางเทคนิค / IP
                    </label>
                    <input
                    type="text"
                    name="description"
                    id="description"
                    defaultValue={gate.description || ''}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                    />
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-sky-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกการเปลี่ยนแปลง
                    </button>
                    <Link href="/gates" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
