"use client";

import { useState } from "react";
import { updateSelf, requestEmailChangeOTP, verifyEmailChangeOTP } from "@/app/actions/users";

export default function ProfileClient({ user }: { user: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Email Change State
  const [newEmail, setNewEmail] = useState(user.email);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password && password !== confirmPassword) {
      setMessage({ type: "error", text: "รหัสผ่านไม่ตรงกัน" });
      setIsSubmitting(false);
      return;
    }

    // Check if email changed
    if (email !== user.email && !showOtpInput) {
        setMessage({ type: "error", text: "กรุณายืนยันรหัส OTP เพื่อเปลี่ยนอีเมล" });
        setIsSubmitting(false);
        return;
    }

    try {
      const result = await updateSelf(formData);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "เกิดข้อผิดพลาดในการอัปเดต" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!newEmail || newEmail === user.email) return;
    setIsSendingOtp(true);
    setMessage(null);
    try {
      const res = await requestEmailChangeOTP(newEmail);
      if (res.success) {
        setShowOtpInput(true);
        setMessage({ type: "success", text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setIsSubmitting(true);
    try {
      const res = await verifyEmailChangeOTP(otp, newEmail);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        setShowOtpInput(false);
        setOtp("");
        // Reload page or update local user state if needed, 
        // but revalidatePath should handle it if the parent re-renders.
        window.location.reload();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">ข้อมูลส่วนตัว</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            จัดการข้อมูลบัญชีผู้ใช้งานของคุณ และเปลี่ยนรหัสผ่านเพื่อความปลอดภัย
          </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 ring-1 ring-zinc-900/5 dark:ring-white/5">
          {message && (
            <div
              className={`mb-8 p-4 rounded-xl font-semibold text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">ชื่อ (First Name)</label>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={user.first_name}
                  required
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">นามสกุล (Last Name)</label>
                <input
                  type="text"
                  name="lastName"
                  defaultValue={user.last_name}
                  required
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">อีเมล (Email Address)</label>
              <div className="flex gap-3">
                <input
                  type="email"
                  name="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold disabled:opacity-50"
                  disabled={showOtpInput}
                />
                {newEmail !== user.email && !showOtpInput && (
                    <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="bg-indigo-600 text-white px-6 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                    >
                        {isSendingOtp ? "กำลังส่ง..." : "ขอรหัส OTP"}
                    </button>
                )}
              </div>

              {showOtpInput && (
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">ยืนยันรหัส OTP 6 หลัก</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-5 py-3 text-center text-lg font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={isSubmitting || otp.length < 6}
                                className="bg-emerald-600 text-white px-8 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                            >
                                ยืนยันรหัส
                            </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500">ระบบส่งรหัสไปยัง <span className="font-bold text-zinc-800 dark:text-zinc-200">{newEmail}</span> แล้ว (หมดอายุใน 10 นาที)</p>
                      <button 
                        type="button" 
                        onClick={() => { setShowOtpInput(false); setOtp(""); setNewEmail(user.email); }} 
                        className="text-xs text-rose-500 font-bold hover:underline"
                      >
                        ยกเลิกการเปลี่ยนอีเมล
                      </button>
                  </div>
              )}
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
              <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">เปลี่ยนรหัสผ่าน (Change Password)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                  />
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 italic">* เว้นพาสเวิร์ดว่างไว้หากไม่ต้องการเปลี่ยน</p>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-2xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
