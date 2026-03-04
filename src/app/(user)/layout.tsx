import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthSessionGuard from "@/components/auth-session-guard";
import { getCurrentUser } from "@/lib/auth";
import UserHeader from "./_components/user-header";
import UserNav from "./_components/user-nav";
import UserSidebar from "./_components/user-sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | Learning App",
    default: "Dashboard",
  },
  description: "Khu vực người dùng Learning App.",
};

const navItems = [
  { label: "Tổng quan", href: "/dashboard" },
  { label: "Khám phá từ", href: "/dashboard/library" },
  { label: "Từ vựng của tôi", href: "/dashboard/vocab" },
  { label: "Chủ đề", href: "/dashboard/topics" },
  { label: "Luyện tập", href: "/dashboard/practice" },
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
    <div className="min-h-screen bg-[#f3f7fc] text-[#0f172a]">
      <AuthSessionGuard />
      <div className="relative flex min-h-screen w-full">
        <UserSidebar items={navItems} />

        <div className="flex min-h-screen flex-1 flex-col">
          <UserHeader
            items={navItems}
            displayName={user.displayName}
            email={user.email}
            avatarUrl={user.avatarUrl}
          />

          <main className="flex-1 px-6 py-8 lg:px-10">
            <div className="mb-6 lg:hidden">
              <UserNav items={navItems} mobile />
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
