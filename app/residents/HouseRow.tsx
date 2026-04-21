"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleResidentStatus, deleteResident, logResidentAccess, deleteHouse, toggleHouseStatus } from "@/app/actions/residents";

export default function HouseRow({ house }: { house: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isHouseActive = house.members.some((m: any) => m.is_active);

  return (
    <>
      <tr className="hover:bg-zinc-50/50 dark:hover:bg-[#1A1A1A]/50 transition-all group items-center border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <td className="px-6 py-4 border-l-4 border-l-transparent group-hover:border-blue-500 transition-colors">
          <div className="flex items-center gap-3">
             <button className="w-6 h-6 rounded flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
             </button>
             <div className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-3">
                {house.house_number}
                {house.site_name && (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-500/20 shadow-sm">{house.site_name}</span>
                )}
             </div>
          </div>
        </td>
        <td className="px-6 py-4">
             <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full shadow-sm">
                    สมาชิก: {house.members.length} ท่าน
                </span>
                 <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full shadow-sm">
                    ยานพาหนะ: {house.vehicles ? house.vehicles.length : 0} คัน
                </span>
                
                <form action={async () => { await toggleHouseStatus(house.house_number, house.site_id, !isHouseActive); }} onClick={(e) => e.stopPropagation()}>
                    <button type="submit" onClick={(e) => { if(isHouseActive && !confirm('ยืนยันการระงับการใช้งานบ้านหลังนี้ รวมถึงจะถูกระงับและคืนสิทธิ์ยานพาหนะทั้งหมด?')) e.preventDefault(); }} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:opacity-80 shadow-sm ${isHouseActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`} title={isHouseActive ? 'กำลังใช้งาน (คลิกเพื่อระงับและคืนสิทธิ์รถ)' : 'ถูกระงับ (คลิกเพื่อเปิดใช้งานบ้านและรถทั้งหมด)'}>
                        <span className={`w-2 h-2 rounded-full ${isHouseActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {isHouseActive ? 'Active' : 'Suspended'}
                    </button>
                </form>

                <form action={async () => { await deleteHouse(house.house_number, house.site_id); }} onClick={(e) => e.stopPropagation()}>
                    <button type="submit" onClick={(e) => { if(!confirm('ยืนยันการลบบ้านหลังนี้ รวมถึงสมาชิกและยานพาหนะทั้งหมด?')) e.preventDefault(); }} className="text-zinc-400 hover:text-white border border-transparent hover:bg-rose-500 p-1.5 rounded-lg transition-colors flex items-center justify-center hover:shadow-md" title="ลบบ้านนี้">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </form>
             </div>
        </td>
      </tr>
      
      {isExpanded && (
        <tr className="bg-zinc-50/30 dark:bg-black/10 shadow-[inset_0px_11px_8px_-10px_rgba(0,0,0,0.05)] border-b border-zinc-200 dark:border-zinc-800">
          <td colSpan={2} className="px-6 py-5 align-top border-r border-zinc-100 dark:border-zinc-800/50">
            <div className="flex flex-col gap-3 pl-2 md:pl-8 border-l-[3px] border-indigo-100 dark:border-indigo-900/50 md:ml-10">
                {house.members.map((member: any) => {
                    const vehicles = member.user_vehicles ? member.user_vehicles.filter((v: any) => v && v.id) : [];
                    return (
                    <div key={member.id} className="flex flex-col lg:flex-row lg:items-stretch gap-0 rounded-2xl bg-white dark:bg-[#18181A] shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden relative">
                        {/* Member Data Side */}
                        <div className="flex items-start gap-4 p-4 lg:w-7/12 border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-800/80">
                            {member.line_picture_url ? (
                            <img src={member.line_picture_url} title={member.line_display_name} alt="Profile" className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm object-cover flex-shrink-0" />
                            ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shadow-inner font-bold flex-shrink-0">
                            HM
                            </div>
                            )}
                            
                            <div className="flex-1 flex flex-col min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    {member.is_owner ? (
                                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">เจ้าบ้าน</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-pink-700 bg-pink-100 dark:bg-pink-900 dark:text-pink-300 px-2.5 py-0.5 rounded-full border border-pink-200 dark:border-pink-800">สมาชิกย่อย</span>
                                    )}
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] truncate">{member.owner_name || "ไม่ระบุชื่อ"}</span>
                                    
                                    <form className="ml-auto" action={async () => { await toggleResidentStatus(member.id, !member.is_active); }}>
                                        <button type="submit" className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all hover:opacity-80 shadow-sm ${member.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${member.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                            {member.is_active ? 'Active' : 'Disabled'}
                                        </button>
                                    </form>
                                </div>

                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                    {member.phone_number && (
                                        <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{member.phone_number}</span>
                                    )}
                                    {member.line_user_id ? (
                                        <span className="flex items-center gap-1.5 text-[#06C755] font-semibold bg-[#06C755]/10 px-2 py-0.5 rounded-md" title={member.line_display_name}>
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.288 11.08c0-4.996-4.966-9.055-11.055-9.055-6.096 0-11.054 4.059-11.054 9.055 0 4.417 3.753 8.163 8.877 8.924.346.074.815.228.937.525.109.263.072.673.033.945l-.176 1.055c-.055.334-.258 1.258 1.103.684s7.332-4.316 9.544-7.147c1.171-1.488 1.791-3.13 1.791-4.986z" /></svg>
                                            <span className="truncate max-w-[100px] block">{member.line_display_name}</span>
                                        </span>
                                    ) : (
                                        member.invite_code && (
                                        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400">
                                            <span className="font-mono font-bold tracking-wider text-blue-600 dark:text-blue-400 select-all">{member.invite_code}</span>
                                            <a 
                                                href={`https://line.me/R/msg/text/?${encodeURIComponent(`แจ้งเตือนจากนิติบุคคล สถานที่ ${house.site_name || "PSS GO"} 🏢\nขอเรียนเชิญสถานที่รหัส/เลขที่ ${house.house_number} ลงทะเบียนใช้งานระบบ\nรหัสเชิญของคุณคือ: ${member.invite_code}\n\nกรุณากดลิงก์นี้เพื่อดำเนินการ:\nhttps://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || "1234567890-AbcdEfgh"}?inviteCode=${member.invite_code}`)}`}
                                                target="_blank"
                                                title="แชร์โค้ดไปที่ LINE"
                                                className="p-0.5 relative z-10"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-4 h-4 text-[#06C755] hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M22.288 11.08c0-4.996-4.966-9.055-11.055-9.055-6.096 0-11.054 4.059-11.054 9.055 0 4.417 3.753 8.163 8.877 8.924.346.074.815.228.937.525.109.263.072.673.033.945l-.176 1.055c-.055.334-.258 1.258 1.103.684s7.332-4.316 9.544-7.147c1.171-1.488 1.791-3.13 1.791-4.986z" /></svg>
                                            </a>
                                        </div>
                                        )
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-1.5 mt-auto pt-2">
                                    <Link href={`/residents/${member.id}`} className="text-[11px] font-bold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 relative z-10" title="แก้ไขประวัติผู้เช่า/ร้าน/บริษัท">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        แก้ไขโปรไฟล์
                                    </Link>
                                    <form action={async () => { await deleteResident(member.id); }}>
                                        <button type="submit" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-lg transition-colors relative z-10" title="ลบข้อมูล">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-50/50 dark:bg-black/20 lg:w-5/12 flex flex-col justify-center border-l-4 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest bg-white dark:bg-zinc-800 px-2 py-1 rounded shadow-sm border border-zinc-100 dark:border-zinc-700/50">ยานพาหนะส่วนตัว ({vehicles.length})</span>
                                <Link href={`/vehicles?resident=${member.id}`} className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline relative z-10 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    จัดการรถ
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                            
                            {vehicles.length > 0 ? (
                                <div className="flex items-start gap-2 flex-wrap">
                                    {vehicles.map((uv: any) => (
                                        <div key={uv.id} className={`inline-flex flex-col border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-2 bg-white dark:bg-[#1C1C1E] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md group min-w-[120px] ${uv.is_active === false || !isHouseActive ? 'opacity-50 grayscale' : ''}`}>
                                            <Link href={`/vehicles/${uv.id}`} className="font-bold text-sm tracking-widest text-zinc-900 dark:text-white uppercase leading-none text-center block mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {uv.license_plate}
                                            </Link>
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1 pb-1 border-b border-zinc-100 dark:border-zinc-800 leading-tight block w-full text-center">
                                                {uv.province || '—'}
                                            </span>
                                            <div className="flex gap-1.5 w-full mt-1.5 relative z-10">
                                                <form className="flex-1" action={async () => { await logResidentAccess(uv.license_plate, house.house_number, 'IN'); }}>
                                                    <button onClick={(e) => { e.stopPropagation(); if (uv.is_active === false || !isHouseActive) { e.preventDefault(); alert('รถคันนี้ถูกระงับสิทธิ์การใช้งาน (Inactive)'); } }} type="submit" className="w-full text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 font-bold py-1 rounded-lg transition-colors shadow-sm">IN</button>
                                                </form>
                                                <form className="flex-1" action={async () => { await logResidentAccess(uv.license_plate, house.house_number, 'OUT'); }}>
                                                    <button onClick={(e) => { e.stopPropagation(); if (uv.is_active === false || !isHouseActive) { e.preventDefault(); alert('รถคันนี้ถูกระงับสิทธิ์การใช้งาน (Inactive)'); } }} type="submit" className="w-full text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 font-bold py-1 rounded-lg transition-colors shadow-sm">OUT</button>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-left">
                                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500/80 bg-white/50 dark:bg-zinc-800/30 px-3 py-1.5 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 inline-block">ไม่มีข้อมูลรถยนต์</span>
                                </div>
                            )}
                        </div>
                    </div>
                )})}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
