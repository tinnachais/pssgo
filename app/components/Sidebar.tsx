"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { logout } from "@/app/actions/auth";
import { setSelectedSite } from "@/app/actions/site-selection";
import Image from "next/image";

const allLinks = [
    { id: "topology", name: "ผังสถานที่", href: "/topology", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" },
    { id: "site-map", name: "แผนที่สถานที่", href: "/site-map", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
    { id: "monitor", name: "รายการเข้าออก", href: "/monitor", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    {
      id: "sites",
      name: "ที่จอดรถ",
      icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      children: [
        { name: "สถานที่", href: "/sites" },
        { name: "โซน", href: "/zones" },
        { name: "จุดบริการ", href: "/gates" },
      ]
    },
    {
      id: "packages",
      name: "แพ็กเกจ & บิลลิ่ง",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      children: [
        { name: "ระบบแพ็กเกจ", href: "/packages" },
        { name: "รายรับ Provider (บิลลิ่ง)", href: "/provider-revenues" },
      ]
    },
    { id: "residents", name: "ผู้เช่า/ร้าน/บริษัท", href: "/residents", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { id: "vehicles", name: "จัดการรถ", href: "/vehicles", icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" },
    { id: "visitor", name: "ผู้มาติดต่อ", href: "/visitor", icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" },
    {
      id: "parking-fees",
      name: "ค่าจอดรถ",
      icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
      children: [
        { name: "อัตราค่าจอดรถ", href: "/parking-fees" },
        { name: "ส่วนลด", href: "/parking-fees/discount" },
        { name: "ค่าปรับ", href: "/parking-fees/fine" },
        { name: "วันหยุดพิเศษ", href: "/special-days" },
      ]
    },
    { 
      id: "revenues",
      name: "บิลและรายรับ", 
      href: "/revenues", 
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    { 
      id: "news",
      name: "ข่าวสาร", 
      href: "/news", 
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
    },
    { 
      id: "users",
      name: "ผู้ใช้งานระบบ", 
      href: "/users", 
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
    },
    {
      id: "roles",
      name: "สิทธิ์การใช้งาน",
      href: "/roles",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    },
    { 
      id: "settings",
      name: "ตั้งค่า", 
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      children: [
        { name: "ผู้ให้บริการ", href: "/settings/providers" },
        { name: "กลุ่มรายรับ", href: "/settings/revenue-groups" },
        { name: "วิธีรับชำระ", href: "/settings/revenue-methods" },
        { name: "ประเภทรายรับ", href: "/settings/revenue-types" },
        { name: "ประเภทรถ", href: "/settings/vehicle-types" },
        { name: "ประเภทจุดบริการ", href: "/settings/gate-types" },
        { name: "ประเภทจอดรถ", href: "/settings/park-types" },
        { name: "เครื่องมือทดสอบ (Simulator)", href: "/settings/simulator" },
      ]
    },
  ];

export default function Sidebar({ user, sites = [], selectedSiteId }: { user?: any, sites?: any[], selectedSiteId?: string }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOpenMenus(prev => {
      const newOpenMenus = { ...prev };
      let hasChanges = false;
      
      allLinks.forEach(link => {
        if (link.children) {
          const isChildActive = link.children.some(child => pathname === child.href || pathname.startsWith(child.href + "/"));
          if (isChildActive && !prev[link.name]) {
            newOpenMenus[link.name] = true;
            hasChanges = true;
          }
        }
      });

      return hasChanges ? newOpenMenus : prev;
    });
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  let userPerms: string[] = [];
  try {
      if (typeof user?.permissions === 'string') {
          userPerms = JSON.parse(user.permissions);
      } else if (Array.isArray(user?.permissions)) {
          userPerms = user.permissions;
      }
  } catch(e) {}

  const hasPerm = (id: string) => userPerms.includes("*") || userPerms.includes(id);

  const links = allLinks.filter(link => hasPerm(link.id));

  return (
    <div className="w-64 flex-shrink-0 bg-white dark:bg-[#121212] border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col h-full sticky top-0 rounded-r-3xl">
      <div className="h-20 flex items-center px-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-blue-500/10 relative">
            <Image 
              src="/logo.png" 
              alt="PSS GO Logo" 
              width={40}
              height={40}
              unoptimized
              className="object-contain"
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
            PSS GO
          </span>
        </Link>
      </div>
      <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        {sites && sites.length > 0 && (
          <div className="mb-6 px-1">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              ระบุสถานที่
            </label>
            <div className="relative">
              <select
                value={selectedSiteId || "all"}
                disabled={isPending}
                onChange={(e) => {
                  startTransition(() => {
                    setSelectedSite(e.target.value);
                  });
                }}
                className="w-full appearance-none bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 text-sm font-semibold rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
              >
                <option value="all">🌐 แดชบอร์ดภาพรวม (All Sites)</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id?.toString()}>
                    🏢 {site.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {isPending && <div className="text-xs text-blue-500 mt-2 font-medium flex items-center gap-1.5 animate-pulse"><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Switching context...</div>}
          </div>
        )}
        <p className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 mt-4">เมนู</p>
        {links.map((link) => {
          
          if (link.children) {
            const isOpen = openMenus[link.name] || false;
            const isChildActive = link.children.some(child => pathname === child.href);
            return (
              <div key={link.name} className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMenu(link.name);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                    isChildActive && !isOpen
                      ? "bg-zinc-100 dark:bg-zinc-800/80 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isChildActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                    </svg>
                    {link.name}
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isChildActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500'}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-1 pl-11 rtl:pl-0 rtl:pr-11 pr-3 mt-1 pb-1">
                    {link.children.map(child => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          pathname === child.href
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? "bg-zinc-100 dark:bg-zinc-800/80 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              <svg className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
              </svg>
              {link.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
         <div className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Link href="/profile" className="flex items-center gap-3 line-clamp-1 group/user hover:opacity-80 transition-all">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-600 dark:text-zinc-300 group-hover/user:scale-110 transition-transform">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col">
                  <span className="font-semibold text-zinc-900 dark:text-white line-clamp-1 group-hover/user:text-blue-600 transition-colors">
                      {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : "Unknown User"}
                  </span>
                  {user?.role && <span className="text-[10px] uppercase font-bold text-zinc-400">{user.role}</span>}
              </div>
            </Link>
            
            <form action={logout}>
                <button type="submit" title="Logout" className="p-2 text-zinc-400 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
            </form>
         </div>
      </div>
    </div>
  );
}
