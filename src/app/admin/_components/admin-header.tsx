"use client";

import UserMenu from "@/components/user-menu";
import { usePathname } from "next/navigation";

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
  const activeItem = resolveNavItem(pathname, navItems);
  const description = headerDescriptions[activeItem.href];
  const currentDateLabel = new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-[#1e293b] bg-[#0b0f14]/88 backdrop-blur">
      <div className="flex h-[84px] items-center justify-between gap-4 px-6 lg:px-10">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            Admin / {description}
          </p>
          <h1 className="truncate text-2xl font-semibold tracking-tight text-[#e2e8f0]">
            {activeItem.label}
          </h1>
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
  );
}
