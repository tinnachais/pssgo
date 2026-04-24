import { getPlatformUser } from "@/app/actions/residents";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import EditPlatformUserForm from "./EditPlatformUserForm";

export const dynamic = "force-dynamic";

export default async function EditPlatformUserPage({ params }: { params: { id: string } }) {
    const user = await getPlatformUser(params.id);
    
    if (!user) {
        notFound();
    }

    return (
        <div className="min-h-full font-sans">
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <Link href="/liff-users" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับไปหน้าผู้ใช้แพลตฟอร์ม
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 p-2.5 rounded-2xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </span>
                        แก้ไขข้อมูลผู้ใช้แพลตฟอร์ม
                    </h1>
                </div>

                <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5 p-8">
                    
                    {/* User Profile Summary */}
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="w-16 h-16 shrink-0 relative rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                            {user.line_picture_url ? (
                                <Image
                                    src={user.line_picture_url}
                                    alt={user.line_display_name || "LINE User"}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {user.line_display_name || "ไม่ระบุชื่อ LINE"}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                                LINE ID: {user.line_user_id}
                            </p>
                        </div>
                    </div>

                    <EditPlatformUserForm user={user} />

                </div>
            </main>
        </div>
    );
}
