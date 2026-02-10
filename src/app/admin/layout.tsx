import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import UserMenu from "@/components/user-menu";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin | Learning App",
    default: "Admin Dashboard",
  },
  description: "Khu vực quản trị Learning App.",
};

const navItems = [
  { label: "Tổng quan", href: "/admin" },
  { label: "Người dùng", href: "/admin/users" },
  { label: "Chủ đề", href: "/admin/topics" },
  { label: "Từ vựng", href: "/admin/vocab" },
  { label: "Duyệt đóng góp", href: "/admin/reviews" },
  { label: "Báo cáo", href: "/admin/reports" },
  { label: "Thiết lập", href: "/admin/settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f14] text-[#e7edf3]">
      <div className="pointer-events-none absolute -top-48 left-[-20%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_#1d4ed8,_transparent_70%)] opacity-40" />
      <div className="pointer-events-none absolute -bottom-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_#fbbf24,_transparent_70%)] opacity-30" />

      <div className="relative flex min-h-screen w-full">
        <aside className="hidden w-72 flex-col gap-8 border-r border-white/10 bg-[#0f172a]/90 px-6 py-8 backdrop-blur lg:flex">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#60a5fa] to-[#fbbf24] text-sm font-semibold text-[#0b0f14]">
                LA
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Admin Console
                </p>
                <p className="text-lg font-semibold text-[#e7edf3]">
                  Learning App
                </p>
              </div>
            </div>
            <span className="rounded-full border border-[#34d399]/30 bg-[#34d399]/10 px-3 py-1 text-xs font-semibold text-[#34d399]">
              ACTIVE
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-4 shadow-[0_18px_50px_rgba(6,10,18,0.4)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              Hôm nay
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#e7edf3]">
              120
            </p>
            <p className="text-sm text-[#64748b]">từ mới được học</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#64748b]">
              <span className="h-2 w-2 rounded-full bg-[#34d399]" />
              18 lớp học đang hoạt động
            </div>
          </div>

          <nav className="space-y-1 text-sm font-medium text-[#64748b]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-200 ease-out hover:bg-white/10 hover:text-[#e7edf3]"
              >
                <span>{item.label}</span>
                <span className="text-xs text-[#64748b]">→</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-[#0f172a]/80 p-4 shadow-[0_18px_50px_rgba(6,10,18,0.4)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              Support
            </p>
            <p className="mt-2 text-sm text-[#e7edf3]">
              Cần trợ giúp? Liên hệ đội kỹ thuật.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/20"
            >
              Gửi yêu cầu
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0b0f14]/85 px-6 py-4 backdrop-blur lg:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                Dashboard
              </p>
              <h1 className="text-2xl font-semibold text-[#e7edf3]">
                Bảng điều khiển
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#e7edf3] md:flex">
                <span className="text-xs text-[#64748b]">⌘ K</span>
                Tìm kiếm nhanh
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/20"
              >
                Xuất báo cáo
              </button>
              <UserMenu variant="admin" displayName={user.displayName} />
            </div>
          </header>

          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
