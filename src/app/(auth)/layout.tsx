import type { Metadata } from "next";
import AppLogo from "@/components/app-logo";

export const metadata: Metadata = {
  title: {
    template: "%s | Learning App",
    default: "Learning App",
  },
  description: "Đăng nhập hoặc tạo tài khoản để bắt đầu học từ vựng.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ef] text-[#0b0f14]">
      <div className="pointer-events-none absolute -top-36 right-[-8%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,_#f9d27c,_transparent_70%)] opacity-70" />
      <div className="pointer-events-none absolute -bottom-44 left-[-14%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,_#8bd6c8,_transparent_70%)] opacity-70" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <section className="w-full">
          <div className="mx-auto mb-5 w-fit rounded-full bg-white/85 px-4 py-2 text-sm font-medium shadow-sm">
            <span className="inline-flex items-center gap-2">
              <AppLogo size={18} className="rounded-md border-0 bg-transparent" />
              Learning App
            </span>
          </div>
          <p className="mb-6 text-center text-sm text-[#64748b]">
            Đăng nhập hoặc tạo tài khoản để tiếp tục học.
          </p>
          <div className="mx-auto max-w-[440px]">{children}</div>
        </section>
      </main>
    </div>
  );
}
