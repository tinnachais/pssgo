"use client";

import { useState, useRef, useEffect } from "react";

export function HouseSelect({ houses }: { houses: { house: string; isPrivate: boolean }[] }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredHouses = houses.filter(h => h.house.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        name="houseNumber"
        id="houseNumber"
        required
        autoComplete="off"
        placeholder="ค้นหาตามสถานที่/ห้อง (เช่น 99/99)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value) setIsOpen(true);
        }}
        onClick={() => {
          if (query || houses.length < 50) setIsOpen(true);
        }}
        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono"
      />
      {isOpen && filteredHouses.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-2 custom-scrollbar">
          {filteredHouses.map((item, idx) => (
            <li
              key={idx}
              className={`px-5 py-2.5 text-sm font-mono transition-colors border-b border-zinc-50 dark:border-zinc-800/50 last:border-b-0 flex justify-between items-center ${item.isPrivate ? 'bg-zinc-50 text-zinc-400 cursor-not-allowed' : 'cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 text-zinc-800 dark:text-zinc-200'}`}
              onClick={() => {
                if (!item.isPrivate) {
                  setQuery(item.house);
                  setIsOpen(false);
                }
              }}
            >
              <div className="flex items-center gap-3 w-full justify-between">
                <span>{item.house}</span>
                {item.isPrivate && (
                  <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    ไม่รับแขก
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {isOpen && filteredHouses.length === 0 && query && (
         <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-4 text-center">
            <p className="text-zinc-500 text-sm">ไม่พบรหัสสถานที่/ห้องระบบ (สามารถพิมพ์ใส่ลงไปได้เลย)</p>
         </div>
      )}
    </div>
  );
}
