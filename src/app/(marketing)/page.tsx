import type { Metadata } from "next";
import Link from "next/link";
import AppLogo from "@/components/app-logo";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Khám phá trải nghiệm học từ vựng cá nhân hóa.",
};

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_#f9d27c,_transparent_70%)] opacity-70" />
      <div className="pointer-events-none absolute -bottom-40 left-[-15%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_#8bd6c8,_transparent_70%)] opacity-70" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 lg:px-10">
        <div className="inline-flex w-fit items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#0b0f14] shadow-sm">
          <AppLogo size={20} className="rounded-md border-0 bg-transparent" />
          Learning App
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_0.9fr)]">
          <section className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Học từ vựng có định hướng, giữ nhịp mỗi ngày.
            </h1>
            <p className="max-w-xl text-lg text-[#64748b]">
              Lộ trình cá nhân, chủ đề ưu tiên và nhắc nhở thông minh giúp bạn
              hình thành thói quen học bền vững.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-[#0b0f14] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#111827]"
              >
                Bắt đầu miễn phí
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-[#e5e7eb] bg-white px-6 py-3 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#0b0f14]"
              >
                Đăng nhập
              </Link>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Chủ đề chọn lọc",
                desc: "Lọc theo ngôn ngữ, cấp độ và sở thích học tập.",
              },
              {
                title: "Mục tiêu mỗi ngày",
                desc: "Theo dõi số phút học và nhịp tiến bộ đều đặn.",
              },
              {
                title: "Từ vựng cá nhân",
                desc: "Lưu lại từ mới và phân loại theo trạng thái học.",
              },
              {
                title: "Gợi ý thông minh",
                desc: "Hệ thống đề xuất dựa trên lịch sử học.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-200 ease-out hover:-translate-y-0.5"
              >
                <p className="text-sm font-semibold text-[#0b0f14]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-[#64748b]">{item.desc}</p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
