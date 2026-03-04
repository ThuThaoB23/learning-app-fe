"use client";

import { useEffect, useState } from "react";
import AppLogo from "@/components/app-logo";
import UserNav, { type UserNavItem } from "./user-nav";

const SIDEBAR_STORAGE_KEY = "user-sidebar-collapsed";

export default function UserSidebar({ items }: { items: UserNavItem[] }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-[#d6dfeb] bg-[#f7fbff] transition-[width] duration-200 lg:flex ${
        collapsed ? "w-[92px]" : "w-[280px]"
      }`}
    >
      <div
        className={`flex h-[84px] items-center border-b border-[#d6dfeb] px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <AppLogo priority />
          {!collapsed ? (
            <p className="text-base font-semibold tracking-tight text-[#0f172a]">
              Learning App
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex-1 px-3 py-4">
        <UserNav items={items} collapsed={collapsed} />
      </div>

      <div className="border-t border-[#d6dfeb] p-3">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className={`flex h-10 items-center rounded-xl border border-[#d6dfeb] bg-white text-sm font-medium text-[#334155] transition hover:border-[#94a3b8] hover:bg-[#eef3fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7fbff] ${
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
