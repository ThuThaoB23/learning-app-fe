import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tổng quan",
  description: "Tổng quan học tập cá nhân.",
};

const overview = [
  { label: "Ngày học liên tiếp", value: "12", unit: "ngày" },
  { label: "Từ đã học", value: "1,280", unit: "từ" },
  { label: "Đang học", value: "84", unit: "từ" },
  { label: "Đã thuộc", value: "312", unit: "từ" },
];

const nextUp = [
  { title: "Chủ đề: Du lịch", detail: "15 từ mới", progress: "60%" },
  { title: "Chủ đề: Công việc", detail: "10 từ mới", progress: "40%" },
  { title: "Ôn tập: Từ khó", detail: "8 từ mới", progress: "25%" },
];

export default function UserDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              {item.label}
            </p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold text-[#0b0f14]">
                {item.value}
              </p>
              <span className="text-xs text-[#64748b]">{item.unit}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,_1.2fr)_minmax(0,_0.8fr)]">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Lịch học hôm nay</h2>
              <p className="text-sm text-[#64748b]">
                Chia nhỏ mục tiêu để giữ nhịp mỗi ngày.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-xs font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#0b0f14]"
            >
              Tuỳ chỉnh
            </button>
          </div>
          <div className="mt-6 space-y-3">
            {nextUp.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-black/5 bg-[#f7f4ef] px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-[#64748b]">{item.detail}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#3b82f6]">
                    {item.progress}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-black/5">
                  <div className="h-2 w-2/3 rounded-full bg-[#3b82f6]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-semibold">Mục tiêu tuần</h2>
          <p className="mt-1 text-sm text-[#64748b]">
            3/5 ngày đã hoàn thành mục tiêu.
          </p>
          <div className="mt-6 space-y-4">
            {[
              { label: "Học 60 phút", value: "48 phút" },
              { label: "Ôn lại 40 từ", value: "30 từ" },
              { label: "Nghe 20 phút", value: "12 phút" },
            ].map((goal) => (
              <div key={goal.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{goal.label}</span>
                  <span className="text-[#64748b]">{goal.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-black/5">
                  <div className="h-2 w-1/2 rounded-full bg-[#34d399]" />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-[#0b0f14] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#111827]"
          >
            Cập nhật mục tiêu
          </button>
        </div>
      </section>
    </div>
  );
}
