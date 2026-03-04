"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/user-menu";
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
  const activeItem = resolveActiveItem(pathname, items);
  const description = routeDescriptions[activeItem.href] ?? activeItem.label;
  const currentDateLabel = new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-[#d6dfeb] bg-[#f3f7fc]/90 backdrop-blur">
      <div className="flex h-[84px] items-center justify-between gap-4 px-6 lg:px-10">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            Learning / {description}
          </p>
          <h1 className="truncate text-2xl font-semibold tracking-tight text-[#0f172a]">
            {activeItem.label}
          </h1>
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
  );
}
