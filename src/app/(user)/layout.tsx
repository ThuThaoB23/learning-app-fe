import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AppLogo from "@/components/app-logo";
import UserMenu from "@/components/user-menu";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    template: "%s | Learning App",
    default: "Bảng điều khiển",
  },
  description: "Khu vực người dùng Learning App.",
};

const navItems = [
  { label: "Tổng quan", href: "/dashboard" },
  { label: "Từ vựng của tôi", href: "/dashboard/vocab" },
  { label: "Mục tiêu", href: "/dashboard/goals" },
  { label: "Tiến độ", href: "/dashboard/progress" },
  { label: "Chủ đề", href: "/dashboard/topics" },
  { label: "Cài đặt", href: "/dashboard/settings" },
];

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#0b0f14]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px]">
        <aside className="hidden w-72 flex-col gap-8 border-r border-black/5 bg-white/80 px-6 py-8 backdrop-blur lg:flex">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppLogo priority />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Workspace
                </p>
                <p className="text-lg font-semibold">Learning App</p>
              </div>
            </div>
            <span className="rounded-full border border-[#34d399]/30 bg-[#34d399]/10 px-3 py-1 text-xs font-semibold text-[#34d399]">
              ACTIVE
            </span>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              Mục tiêu hôm nay
            </p>
            <p className="mt-3 text-3xl font-semibold">24</p>
            <p className="text-sm text-[#64748b]">từ cần ôn tập</p>
            <div className="mt-4 h-2 rounded-full bg-black/5">
              <div className="h-2 w-2/3 rounded-full bg-[#34d399]" />
            </div>
          </div>

          <nav className="space-y-1 text-sm font-medium text-[#64748b]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-200 ease-out hover:bg-black/5 hover:text-[#0b0f14]"
              >
                <span>{item.label}</span>
                <span className="text-xs text-[#64748b]">→</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/70 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              Tips
            </p>
            <p className="mt-2 text-sm text-[#0b0f14]">
              Ôn lại 10 phút mỗi ngày giúp nhớ lâu hơn.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-xl bg-[#0b0f14] px-3 py-2 text-xs font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#111827]"
            >
              Mở lịch học
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/5 bg-[#f7f4ef]/80 px-6 py-4 backdrop-blur lg:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                Dashboard
              </p>
              <h1 className="text-2xl font-semibold">Không gian học tập</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#64748b] md:flex">
                <span className="text-xs text-[#64748b]">⌘ K</span>
                Tìm kiếm nhanh
              </div>
              <button
                type="button"
                className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#0b0f14]"
              >
                Bắt đầu học
              </button>
              <UserMenu displayName={user.displayName} />
            </div>
          </header>

          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
