"use client";

import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppLogo from "@/components/app-logo";

type AdminNavItem = {
  label: string;
  href: string;
};

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";
const iconClassName = "h-5 w-5 shrink-0";

const getNavIcon = (href: string): JSX.Element => {
  switch (href) {
    case "/admin":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M4 4h7v7H4V4Zm9 0h7v5h-7V4Zm0 7h7v9h-7v-9Zm-9 2h7v7H4v-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/admin/users":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M16 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 2c-2.76 0-8 1.38-8 4.13V20h13v-2.87C21 14.38 18.76 13 16 13ZM8 14c-2.3 0-5 1.16-5 3.48V20h3.5v-2.87c0-1.08.5-2.08 1.45-2.86-.3-.17-.63-.27-.95-.27Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/admin/topics":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4l-4 4-4-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/admin/vocab":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M5 3h11a2 2 0 0 1 2 2v16l-3.5-2-3.5 2-3.5-2L4 21V5a2 2 0 0 1 1-2Zm3 5h6m-6 4h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/admin/reviews":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M5 3h14a2 2 0 0 1 2 2v15l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Zm2.5 8.5 2.2 2.2 5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/admin/activity-logs":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M12 7v5l3 2m6-2a9 9 0 1 1-2.64-6.36M7 12h2m-2 4h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/admin/reports":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M3 20h18M6 16V9m6 7V6m6 10v-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/admin/settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M10.7 3h2.6l.5 2.1c.45.16.87.39 1.25.66l2.06-.62 1.3 2.25-1.54 1.5c.05.3.08.6.08.9s-.03.6-.08.9l1.54 1.5-1.3 2.25-2.06-.62c-.38.27-.8.5-1.25.66L13.3 21h-2.6l-.5-2.1a6.8 6.8 0 0 1-1.25-.66l-2.06.62-1.3-2.25 1.54-1.5a6 6 0 0 1-.08-.9c0-.3.03-.6.08-.9L5.59 11.8l1.3-2.25 2.06.62c.38-.27.8-.5 1.25-.66L10.7 3Zm1.3 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
};

export default function AdminSidebar({ navItems }: { navItems: AdminNavItem[] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  const activeHref = useMemo(() => {
    const sortedItems = [...navItems].sort((a, b) => b.href.length - a.href.length);
    const activeItem = sortedItems.find((item) => {
      if (item.href === "/admin") {
        return pathname === "/admin";
      }
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    });
    return activeItem?.href ?? "/admin";
  }, [navItems, pathname]);

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-[#1e293b] bg-[#0a1120]/92 transition-[width] duration-200 lg:flex ${
        collapsed ? "w-[92px]" : "w-[280px]"
      }`}
    >
      <div
        className={`flex h-[84px] items-center border-b border-[#1e293b] px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <AppLogo priority />
          {!collapsed ? (
            <p className="text-base font-semibold tracking-tight text-[#e2e8f0]">
              Learning Admin
            </p>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <div key={item.href} className="relative">
            {activeHref === item.href ? (
              <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-[#38bdf8]" />
            ) : null}
            <Link
              href={item.href}
              aria-current={activeHref === item.href ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={`group flex h-11 items-center rounded-xl border border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1120] ${
                collapsed ? "justify-center px-2" : "gap-3 px-4"
              } ${
                activeHref === item.href
                  ? "border-[#264a70]/40 bg-[#17314e] text-[#f8fafc]"
                  : "text-[#b1c1d4] hover:border-[#294463]/35 hover:bg-[#1a2f49] hover:text-[#f8fafc]"
              }`}
            >
              <span>{getNavIcon(item.href)}</span>
              {!collapsed ? (
                <span className="truncate text-sm font-medium">{item.label}</span>
              ) : null}
            </Link>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className={`flex h-10 items-center rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-[#c3d1df] transition hover:bg-[#1a2e47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1120] ${
            collapsed ? "w-10 justify-center" : "w-full justify-center gap-2"
          }`}
          aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
            {collapsed ? (
              <path
                d="m9 6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="m15 6-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
          {!collapsed ? <span>Thu gọn</span> : null}
        </button>
      </div>
    </aside>
  );
}
