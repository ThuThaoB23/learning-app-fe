import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthSessionGuard from "@/components/auth-session-guard";
import { getCurrentUser } from "@/lib/auth";
import AdminHeader from "./_components/admin-header";
import AdminSidebar from "./_components/admin-sidebar";

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
  { label: "Nhật ký hoạt động", href: "/admin/activity-logs" },
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
      <AuthSessionGuard />
      <div className="pointer-events-none absolute -top-48 left-[-20%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_#1d4ed8,_transparent_70%)] opacity-40" />
      <div className="pointer-events-none absolute -bottom-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_#fbbf24,_transparent_70%)] opacity-30" />

      <div className="relative flex min-h-screen w-full">
        <AdminSidebar navItems={navItems} />

        <div className="flex min-h-screen flex-1 flex-col">
          <AdminHeader
            navItems={navItems}
            displayName={user.displayName}
            email={user.email}
            avatarUrl={user.avatarUrl}
          />

          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
