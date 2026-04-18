"use client";

import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import Link from "next/link";

dayjs.locale("th");

export default function SpecialDayCalendar({ specialDays }: { specialDays: any[] }) {
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    
    // Days of week in Thai
    const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    
    // Get first day of month and total days
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const daysInMonth = currentMonth.daysInMonth();
    const firstDayIndex = startOfMonth.day(); // 0 (Sun) to 6 (Sat)
    
    // Create rows for calendar
    const days = [];
    // Padding for first week
    for (let i = 0; i < firstDayIndex; i++) {
        days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(startOfMonth.date(i));
    }
    
    const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
    const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
    
    return (
        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-6 ring-1 ring-zinc-900/5 dark:ring-white/5 h-full">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Side: Calendar Grid */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {currentMonth.format("MMMM YYYY")}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors border border-zinc-200 dark:border-zinc-800">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors border border-zinc-200 dark:border-zinc-800">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {daysOfWeek.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest py-2">
                                {d}
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} className="h-20 sm:h-32" />;
                            
                            const dateStr = date.format("YYYY-MM-DD");
                            const specialDay = specialDays.find(sd => {
                                if (!sd.is_active) return false;
                                const sdDate = dayjs(sd.date);
                                if (sd.is_recurring) {
                                    return sdDate.date() === date.date() && sdDate.month() === date.month();
                                }
                                return sdDate.format("YYYY-MM-DD") === dateStr;
                            });
                            
                            return (
                                <div key={dateStr} className={`relative h-20 sm:h-32 border border-zinc-100 dark:border-zinc-800/50 rounded-xl p-1.5 transition-all ${specialDay ? 'bg-amber-50/50 dark:bg-amber-500/5 ring-1 ring-amber-500/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}>
                                    <span className={`text-xs font-bold ${specialDay ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                        {date.date()}
                                    </span>
                                    
                                    {specialDay && (
                                        <div className="mt-1">
                                            <div className="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-400 line-clamp-2 leading-tight bg-white/60 dark:bg-zinc-900/40 p-1 rounded shadow-sm border border-amber-200/30">
                                                {specialDay.name}
                                            </div>
                                            <Link href={`/special-days/${specialDay.id}`} className="absolute inset-0 opacity-0 bg-transparent" title={specialDay.name} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: Monthly Summary */}
                <div className="w-full lg:w-72 mt-8 lg:mt-0 lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800 lg:pl-10">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">วันหยุดในเดือนนี้:</h4>
                    <div className="space-y-3">
                        {specialDays
                            .filter(sd => {
                                if (!sd.is_active) return false;
                                const sdDate = dayjs(sd.date);
                                if (sd.is_recurring) return sdDate.month() === currentMonth.month();
                                return sdDate.month() === currentMonth.month() && sdDate.year() === currentMonth.year();
                            })
                            .sort((a,b) => dayjs(a.date).date() - dayjs(b.date).date())
                            .map(sd => (
                                <Link key={sd.id} href={`/special-days/${sd.id}`} className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/50 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-200 dark:hover:border-amber-500/20 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-500 flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 group-hover:ring-amber-500/30 flex-shrink-0">
                                        {dayjs(sd.date).date()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{sd.name}</div>
                                        <div className="text-[10px] text-zinc-500 font-medium">{sd.is_recurring ? 'ทุกปี' : dayjs(sd.date).format('D MMM YYYY')}</div>
                                    </div>
                                </Link>
                            ))
                        }
                        {specialDays.filter(sd => {
                            const sdDate = dayjs(sd.date);
                            if (sd.is_recurring) return sdDate.month() === currentMonth.month();
                            return sdDate.month() === currentMonth.month() && sdDate.year() === currentMonth.year();
                        }).length === 0 && (
                            <div className="text-center py-10 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                <p className="text-xs text-zinc-500 italic">ไม่มีวันหยุดพิเศษในเดือนนี้</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
