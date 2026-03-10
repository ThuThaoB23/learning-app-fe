"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import UserMenu from "@/components/user-menu";
import { usePathname } from "next/navigation";
import AppLogo from "@/components/app-logo";

type AdminNavItem = {
  label: string;
  href: string;
};

type AdminHeaderProps = {
  navItems: AdminNavItem[];
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

const headerDescriptions: Record<string, string> = {
  "/admin": "Tổng quan hệ thống",
  "/admin/users": "Quản lý tài khoản",
  "/admin/topics": "Danh mục chủ đề",
  "/admin/vocab": "Kho dữ liệu từ vựng",
  "/admin/feedback": "Hộp thư người dùng",
  "/admin/reviews": "Hàng đợi duyệt",
  "/admin/activity-logs": "Lịch sử thao tác",
  "/admin/reports": "Báo cáo vận hành",
  "/admin/settings": "Thiết lập hệ thống",
};

function resolveNavItem(pathname: string, navItems: AdminNavItem[]) {
  const sortedItems = [...navItems].sort((a, b) => b.href.length - a.href.length);
  return (
    sortedItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? navItems[0]
  );
}

export default function AdminHeader({
  navItems,
  displayName,
  email,
  avatarUrl,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeItem = resolveNavItem(pathname, navItems);
  const description = headerDescriptions[activeItem.href];
  const currentDateLabel = new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
  const activeHref = activeItem.href;

  const drawerItems = useMemo(
    () =>
      navItems.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return { ...item, active };
      }),
    [navItems, pathname],
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
      <header className="fixed inset-x-0 top-0 z-20 border-b border-[#1e293b] bg-[#0b0f14]/88 backdrop-blur lg:sticky lg:inset-x-auto">
        <div className="flex h-[84px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#e2e8f0] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] lg:hidden"
              aria-label="Mở menu điều hướng admin"
              aria-controls="admin-mobile-drawer"
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
                Admin / {description}
              </p>
              <h1 className="truncate text-2xl font-semibold tracking-tight text-[#e2e8f0]">
                {activeItem.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#94a3b8] md:block">
              {currentDateLabel}
            </div>
            <UserMenu
              variant="admin"
              displayName={displayName}
              email={email}
              avatarUrl={avatarUrl}
            />
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-[#020617]/70 transition-opacity duration-300 lg:hidden ${
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden
      />

      <aside
        id="admin-mobile-drawer"
        className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[#1e293b] bg-[#0a1120]/98 p-3 shadow-[0_24px_80px_rgba(2,6,23,0.55)] transition-transform duration-300 lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#e2e8f0]">
            <AppLogo size={18} className="rounded-md border-0 bg-transparent" />
            Learning Admin
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#cbd5e1] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1120]"
            aria-label="Đóng menu điều hướng admin"
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
              className={`flex h-11 items-center rounded-xl px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1120] ${
                item.active
                  ? "border border-[#264a70]/45 bg-[#17314e] text-[#f8fafc]"
                  : "border border-transparent text-[#b1c1d4] hover:border-[#294463]/35 hover:bg-[#1a2f49] hover:text-[#f8fafc]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[#94a3b8]">
          Đang ở: <span className="font-semibold text-[#e2e8f0]">{activeHref}</span>
        </div>
      </aside>
    </>
  );
}
