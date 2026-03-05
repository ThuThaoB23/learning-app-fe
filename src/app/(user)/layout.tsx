import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthSessionGuard from "@/components/auth-session-guard";
import { getCurrentUser } from "@/lib/auth";
import UserHeader from "./_components/user-header";
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
    <div className="min-h-screen overflow-x-hidden bg-[#f3f7fc] text-[#0f172a]">
      <AuthSessionGuard />
      <div className="relative flex min-h-screen w-full overflow-x-hidden">
        <UserSidebar items={navItems} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <UserHeader
            items={navItems}
            displayName={user.displayName}
            email={user.email}
            avatarUrl={user.avatarUrl}
          />

          <main className="min-w-0 flex-1 px-4 pb-6 pt-28 sm:px-6 sm:pb-8 sm:pt-32 lg:px-10 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
