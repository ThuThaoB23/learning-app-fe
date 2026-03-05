"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/user-menu";
import AppLogo from "@/components/app-logo";
import type { UserNavItem } from "./user-nav";

type UserHeaderProps = {
  items: UserNavItem[];
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

const routeDescriptions: Record<string, string> = {
  "/dashboard": "Không gian học tập",
  "/dashboard/library": "Khám phá từ mới",
  "/dashboard/vocab": "Theo dõi từ đã lưu",
  "/dashboard/topics": "Lộ trình theo chủ đề",
  "/dashboard/practice": "Luyện tập hằng ngày",
  "/dashboard/settings": "Tùy chỉnh tài khoản",
};

function resolveActiveItem(pathname: string, items: UserNavItem[]) {
  const sorted = [...items].sort((a, b) => b.href.length - a.href.length);
  return (
    sorted.find((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? items[0]
  );
}

export default function UserHeader({
  items,
  displayName,
  email,
  avatarUrl,
}: UserHeaderProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeItem = resolveActiveItem(pathname, items);
  const description = routeDescriptions[activeItem.href] ?? activeItem.label;
  const currentDateLabel = new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  const drawerItems = useMemo(
    () =>
      items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return { ...item, active };
      }),
    [items, pathname],
  );

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-[#d6dfeb] bg-[#f3f7fc]/90 backdrop-blur lg:sticky lg:inset-x-auto">
        <div className="flex h-[84px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d6dfeb] bg-white text-[#0f172a] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f7fc] lg:hidden"
              aria-label="Mở menu điều hướng"
              aria-controls="user-mobile-drawer"
              aria-expanded={mobileNavOpen}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                Learning / {description}
              </p>
              <h1 className="truncate text-2xl font-semibold tracking-tight text-[#0f172a]">
                {activeItem.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-[#d6dfeb] bg-white px-3 py-1.5 text-xs font-medium text-[#516173] md:block">
              {currentDateLabel}
            </div>
            <Link
              href="/dashboard/practice"
              className="hidden rounded-full border border-[#0f172a] bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e293b] sm:block"
            >
              Bắt đầu học
            </Link>
            <UserMenu
              displayName={displayName}
              email={email}
              avatarUrl={avatarUrl}
            />
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-[#0f172a]/45 transition-opacity duration-300 lg:hidden ${
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden
      />

      <aside
        id="user-mobile-drawer"
        className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[#d6dfeb] bg-[#f7fbff] p-3 shadow-[0_24px_80px_rgba(15,23,42,0.28)] transition-transform duration-300 lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between rounded-xl border border-[#d6dfeb] bg-white px-3">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
            <AppLogo size={18} className="rounded-md border-0 bg-transparent" />
            Learning App
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d6dfeb] bg-white text-[#334155] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7fbff]"
            aria-label="Đóng menu điều hướng"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="mt-3 space-y-1">
          {drawerItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              aria-current={item.active ? "page" : undefined}
              className={`flex h-11 items-center rounded-xl px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7fbff] ${
                item.active
                  ? "border border-[#0f2746]/20 bg-[#0f2746] text-[#f8fafc]"
                  : "border border-transparent text-[#334155] hover:border-[#d1dbea] hover:bg-[#e8eef7] hover:text-[#0f172a]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
