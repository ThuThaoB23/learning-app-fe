import type { Metadata } from "next";

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
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_#f9d27c,_transparent_70%)] opacity-70" />
      <div className="pointer-events-none absolute -bottom-40 left-[-15%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_#8bd6c8,_transparent_70%)] opacity-70" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16 lg:px-10">
        <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_0.9fr)]">
          <section className="flex flex-col justify-center gap-8">
            <div className="inline-flex w-fit items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#0b0f14] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#34d399]" />
              Learning App
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Học từ vựng có mục tiêu, rõ tiến độ.
              </h2>
              <p className="max-w-xl text-lg text-[#64748b]">
                Kết hợp lộ trình cá nhân, chủ đề yêu thích và thống kê tiến bộ
                để biến việc học thành thói quen bền vững.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Chủ đề thông minh",
                  desc: "Duyệt theo chủ đề và ngôn ngữ bạn quan tâm.",
                },
                {
                  title: "Theo dõi tiến độ",
                  desc: "Cập nhật trạng thái học và mục tiêu mỗi ngày.",
                },
                {
                  title: "Đề xuất cá nhân",
                  desc: "Nhận gợi ý từ vựng phù hợp trình độ.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                  <p className="text-sm font-semibold text-[#0b0f14]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-[#64748b]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center lg:justify-end">
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
