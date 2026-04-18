import { getUser, updateUser } from "@/app/actions/users";
import { getProviders } from "@/app/actions/providers";
import { getSites } from "@/app/actions/sites";
import { getRoles } from "@/app/actions/roles";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditUserForm from "./EditUserForm";

export default async function UserDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const user = await getUser(id);
  const providers = await getProviders();
  const sites = await getSites();
  const dbRoles = await getRoles();
  
  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/users" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าผู้ใช้งาน
            </Link>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 font-bold text-3xl flex-shrink-0">
                    {user.first_name?.charAt(0) || 'U'}{user.last_name?.charAt(0) || ''}
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1">{user.first_name} {user.last_name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {user.is_active ? 'Active' : 'Locked'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border 
                            ${user.role === 'Admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' : 
                            (user.role === 'Manager' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' : 
                            'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20')}`}>
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                แก้ไขข้อมูลผู้ใช้งาน
            </h2>
            <EditUserForm user={user} providers={providers} sites={sites} dbRoles={dbRoles} />
        </div>
      </main>
    </div>
  );
}
