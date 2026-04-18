"use client";

import { login } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#121212] p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-[#1A1A1A] p-8 md:p-10 rounded-3xl shadow-xl shadow-zinc-900/5 dark:shadow-black/40 ring-1 ring-zinc-900/5 dark:ring-white/5 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-zinc-200 dark:shadow-black/50 mb-5 relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <img 
              src="/logo.png?v=3" 
              alt="PSS GO Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Sign in to PSS GO</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center">
            ระบบบริหารจัดการลานจอดรถและผู้เข้าใช้งานโครงการ
          </p>
        </div>

        {/* Error message slot */}
        <div className="mb-4">
          {error === 'invalid_credentials' && (
            <div className="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 p-3 rounded-lg text-sm text-center font-bold border border-rose-200 dark:border-rose-500/20">
              อีเมลหรือรหัสผ่านไม่ถูกต้อง!
            </div>
          )}
          {error === 'missing_fields' && (
            <div className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 p-3 rounded-lg text-sm text-center font-bold border border-amber-200 dark:border-amber-500/20">
              กรุณากรอกข้อมูลให้ครบถ้วน
            </div>
          )}
        </div>

        <form action={login} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Email Address / อีเมล
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              placeholder="admin@pssgo.com"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Password / รหัสผ่าน
              </label>
            </div>
            <input
              type="password"
              name="password"
              id="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 hover:shadow-lg active:scale-[0.98]"
          >
            เข้าสู่ระบบ (Sign In)
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <div className="flex flex-col items-center gap-2 mb-4">
            <p className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400">ติดต่อสอบถามการใช้งาน</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>02-xxx-xxxx</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.987 8.868 9.539 9.59.389.051.916.155 1.05.513.125.32-.038.823-.119 1.201-.096.44-0.447 2.158-.543 2.65-.162.83-.815 3.992 3.493 2.193C18.17 23.945 24 16.969 24 10.304z" />
                </svg>
                <span>@pssgo</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 opacity-60">
            PSS GO &copy; Powered by PSS
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]"></div>}>
      <LoginForm />
    </Suspense>
  );
}
