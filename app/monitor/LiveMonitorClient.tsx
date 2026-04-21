"use client";

import { useState, useEffect } from "react";
import { getAccessLogs, getMonitorStats, clearAccessLogs } from "@/app/actions/monitor";
import Link from "next/link";
import dayjs from "dayjs";
import 'dayjs/locale/th';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('th');

const formatDuration = (start: string | Date, end: string | Date) => {
    const diffMinutes = dayjs(end).diff(dayjs(start), 'minute');
    if (diffMinutes < 0) return '0 นาที';
    if (diffMinutes < 60) return `${diffMinutes} นาที`;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours} ชม. ${mins > 0 ? `${mins} นาที` : ''}`.trim();
};

export default function LiveMonitorClient({ initialLogs, initialStats }: { initialLogs: any[], initialStats?: any }) {
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const [stats, setStats] = useState<any>(initialStats || { total_in: 0, total_out: 0, currently_inside: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto Refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      fetchLatestLogs(true);
    }, 15000); // 15 seconds poll for monitor

    return () => clearInterval(interval);
  }, []);

  const fetchLatestLogs = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const freshData = await getAccessLogs(50);
      const freshStats = await getMonitorStats();
      setLogs(freshData);
      setStats(freshStats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Poll fail", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลรถเข้าออกทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    setIsRefreshing(true);
    try {
      const result = await clearAccessLogs();
      if (result && result.error) {
        alert(result.error);
      } else {
        fetchLatestLogs(false);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการล้างข้อมูล");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-50 via-white to-zinc-50 dark:from-zinc-900 dark:via-[#121212] dark:to-[#121212]">
      
      {/* Header Panel */}
      <div className="bg-zinc-900 px-6 py-4 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <h2 className="text-white font-black text-lg tracking-wide uppercase">Gate Monitor</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all border border-rose-500/20 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            ล้างข้อมูล
          </button>
          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block">Last Sync: {dayjs(lastUpdated).format('HH:mm:ss')}</span>
          <button 
            onClick={() => fetchLatestLogs(false)}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-all disabled:opacity-50"
            disabled={isRefreshing}
          >
            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181A]">
         <div className="px-6 py-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            </div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">รถเข้า (วันนี้)</div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono mb-2">{stats.total_in}</div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>ผู้เช่า/ร้าน/บริษัท: {stats.in_resident || 0}</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>ผู้มาติดต่อ: {stats.in_visitor || 0}</span>
            </div>
         </div>
         <div className="px-6 py-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">รถออก (วันนี้)</div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono mb-2">{stats.total_out}</div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>ผู้เช่า/ร้าน/บริษัท: {stats.out_resident || 0}</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>ผู้มาติดต่อ: {stats.out_visitor || 0}</span>
            </div>
         </div>
         <div className="px-6 py-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
            </div>
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">รอดำเนินการ / คงค้าง</div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono mb-2">{stats.currently_inside}</div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>ผู้เช่า/ร้าน/บริษัท: {stats.inside_resident || 0}</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>ผู้มาติดต่อ: {stats.inside_visitor || 0}</span>
            </div>
         </div>
      </div>

      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800/80">
                    <th className="px-5 py-3.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-6 w-32">สถานะ</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">ข้อมูลรถ</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">ประเภท</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">เวลาเข้า</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">เวลาออก</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right pr-6">เวลาจอด / รายได้</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {logs.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">ยังไม่มีข้อมูลผ่านเข้าออกในระบบ</p>
                    </td>
                </tr>
                ) : (
                logs.map((log: any, idx: number) => {
                    const isResident = log.type === 'RESIDENT';
                    const isVisitor = log.type === 'VISITOR';
                    const isBlacklist = log.type === 'BLACKLIST';
                    
                    return (
                    <tr key={log.id} className={`hover:bg-zinc-50/50 dark:hover:bg-[#1A1A1A]/80 transition-colors ${idx === 0 ? 'bg-blue-50/20 dark:bg-indigo-900/10' : ''}`}>
                        <td className="px-5 py-4 pl-6 align-top whitespace-nowrap">
                            {!log.time_out ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold tracking-wider rounded-md text-xs border border-emerald-200 dark:border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    อยู่ในสถานที่
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-bold tracking-wider rounded-md text-xs border border-zinc-200 dark:border-zinc-700/50">
                                    ออกแล้ว
                                </span>
                            )}
                        </td>
                        <td className="px-5 py-4 align-top">
                            <div className="flex items-start gap-4">
                                {(log.image_in || log.image_out) ? (
                                    <a href={log.image_in || log.image_out} target="_blank" rel="noreferrer" className="flex-shrink-0 group">
                                        <div className="w-20 h-14 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative ring-1 ring-zinc-300 dark:ring-zinc-700/50 group-hover:ring-blue-500 transition-all shadow-sm">
                                            <img src={log.image_in || log.image_out} alt="LPR Capture" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                            </div>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="w-20 h-14 rounded-lg bg-zinc-100 dark:bg-[#1A1A1A] border border-dashed border-zinc-300 dark:border-zinc-700/50 flex flex-col items-center justify-center text-zinc-400 flex-shrink-0">
                                        <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="text-[9px] font-bold">NO CAMERA</span>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <div className="font-black text-lg tracking-widest text-zinc-900 dark:text-white uppercase leading-none">{log.license_plate}</div>
                                    {(log.vehicle_brand || log.vehicle_color) && (
                                        <div className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded inline-block font-semibold">
                                            {log.vehicle_brand} {" "} {log.vehicle_color}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <div className="flex flex-col gap-1.5 items-start">
                                {isResident ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-md text-[11px] font-black tracking-widest uppercase border border-blue-200 dark:border-blue-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                        {log.park_type_name || 'ผู้เช่า/ร้าน/บริษัท'}
                                    </span>
                                ) : isVisitor ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded-md text-[11px] font-black tracking-widest uppercase border border-amber-200 dark:border-amber-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        {log.park_type_name || 'ผู้มาติดต่อ'}
                                    </span>
                                ) : isBlacklist ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 rounded-md text-[11px] font-black tracking-widest uppercase border border-red-200 dark:border-red-500/30">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                        Blacklist
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400 rounded-md text-[11px] font-black tracking-widest uppercase border border-zinc-200 dark:border-zinc-500/30">
                                        Unknown
                                    </span>
                                )}

                                {log.house_number && (
                                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                        สถานที่/ห้อง {log.house_number}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                            {log.time_in ? (
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-zinc-500 font-medium">
                                            {dayjs(log.time_in).format('D MMM YY')}
                                        </span>
                                        <span className="font-bold text-sm text-zinc-900 dark:text-white">
                                            {dayjs(log.time_in).format('HH:mm')} น.
                                        </span>
                                    </div>
                                    <div className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded inline-flex w-max font-semibold truncate max-w-[100px]">
                                        {log.gate_in || 'Gate 1'}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-zinc-400 text-xs">-</span>
                            )}
                        </td>
                        <td className="px-5 py-4 align-top">
                            {log.time_out ? (
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-zinc-500 font-medium">
                                            {dayjs(log.time_out).format('D MMM YY')}
                                        </span>
                                        <span className="font-bold text-sm text-zinc-900 dark:text-white">
                                            {dayjs(log.time_out).format('HH:mm')} น.
                                        </span>
                                    </div>
                                    <div className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded inline-flex font-semibold truncate max-w-[100px]">
                                        {log.gate_out || 'Gate 2'}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-zinc-400 text-xs">-</span>
                            )}
                        </td>
                        <td className="px-5 py-4 text-right pr-6 align-top">
                            <div className="flex flex-col items-end gap-1">
                                {log.time_in ? (
                                    log.time_out ? (
                                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded">
                                            {formatDuration(log.time_in, log.time_out)}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">
                                            {formatDuration(log.time_in, new Date())}
                                        </span>
                                    )
                                ) : (
                                    <span className="text-zinc-400 text-xs">-</span>
                                )}
                                
                                {parseFloat(log.total_revenue || '0') > 0 && (
                                    <div className="mt-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 inline-flex items-center gap-1">
                                        + ฿{parseFloat(log.total_revenue).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </td>
                    </tr>
                    );
                })
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
