import { getLiffUserActivityLogs } from "@/app/actions/residents";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/th";

export const dynamic = "force-dynamic";

export default async function LiffUserActivityPage({ params }: { params: { id: string } }) {
    const logs = await getLiffUserActivityLogs(params.id);
    dayjs.locale("th");

    const getIconForType = (type: string) => {
        switch (type) {
            case 'REGISTER':
                return (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                );
            case 'VEHICLE_ADD':
                return (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'VEHICLE_SHARE':
                return (
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </div>
                );
            case 'ACCESS':
                return (
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-full font-sans selection:bg-blue-500/30">
            <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <Link href="/liff-users" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors mb-4">
                        <svg className="mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับไปหน้าผู้ใช้งาน LIFF
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        ประวัติกิจกรรมผู้ใช้งาน
                    </h1>
                    <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                        ข้อมูลการใช้งานระบบ LINE LIFF สำหรับผู้ใช้งาน ID: {params.id}
                    </p>
                </div>

                <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800/50 shadow-sm">
                    {logs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">ไม่พบประวัติกิจกรรม</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">ยังไม่มีประวัติการใช้งานในระบบ</p>
                        </div>
                    ) : (
                        <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-8 pb-4">
                            {logs.map((log: any, idx: number) => (
                                <div key={idx} className="relative pl-6 sm:pl-8">
                                    <div className="absolute -left-4 top-1 bg-white dark:bg-[#121212] p-1 rounded-full">
                                        {getIconForType(log.type)}
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                                                {log.title}
                                            </h4>
                                            {log.detail && (
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                                    {log.detail}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-500 whitespace-nowrap">
                                            {dayjs(log.created_at).format("D MMM YYYY, HH:mm")}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
