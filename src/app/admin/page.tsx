import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tổng quan",
  description: "Bảng điều khiển quản trị tổng quan.",
};

const stats = [
  { label: "Người dùng mới", value: "248", change: "+12%" },
  { label: "Từ vựng chờ duyệt", value: "36", change: "-4%" },
  { label: "Phiên học hôm nay", value: "1,284", change: "+8%" },
  { label: "Tỉ lệ hoàn thành", value: "72%", change: "+3%" },
];

const activities = [
  {
    title: "Nguyễn An đã đăng ký tài khoản mới",
    time: "5 phút trước",
    badge: "User",
  },
  {
    title: "Đã duyệt 12 từ vựng chủ đề Du lịch",
    time: "25 phút trước",
    badge: "Approval",
  },
  {
    title: "Cập nhật mục tiêu học nhóm lớp A1",
    time: "1 giờ trước",
    badge: "Goal",
  },
  {
    title: "Thêm chủ đề mới: Kinh doanh",
    time: "3 giờ trước",
    badge: "Topic",
  },
];

const pending = [
  { term: "engagement", author: "minh.le", status: "PENDING" },
  { term: "curriculum", author: "thao.ng", status: "PENDING" },
  { term: "syllabus", author: "linh.tr", status: "PENDING" },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const isPositive = item.change.startsWith("+");
          return (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-5 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                {item.label}
              </p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold text-[#e7edf3]">
                {item.value}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isPositive
                    ? "bg-[#34d399]/15 text-[#34d399]"
                    : "bg-[#fb7185]/15 text-[#fb7185]"
                }`}
              >
                {item.change}
              </span>
            </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,_1.4fr)_minmax(0,_0.8fr)]">
        <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#e7edf3]">
              Hoạt động gần đây
            </h2>
            <button
              type="button"
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
            >
              Xem tất cả
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.title}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0f172a]/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#e7edf3]">
                    {activity.title}
                  </p>
                  <p className="text-xs text-[#64748b]">{activity.time}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3]">
                  {activity.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
          <h2 className="text-lg font-semibold text-[#e7edf3]">Chờ duyệt</h2>
          <p className="mt-1 text-sm text-[#64748b]">
            Các đóng góp mới cần được kiểm tra.
          </p>
          <div className="mt-4 space-y-3">
            {pending.map((item) => (
              <div
                key={item.term}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f172a]/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#e7edf3]">
                    {item.term}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    bởi {item.author}
                  </p>
                </div>
                <span className="rounded-full bg-[#fbbf24]/15 px-3 py-1 text-xs font-semibold text-[#fbbf24]">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-5 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/20"
          >
            Duyệt nhanh
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#e7edf3]">
              Hiệu suất tuần này
            </h2>
            <p className="text-sm text-[#64748b]">
              Cập nhật theo thời gian thực và mục tiêu lớp học.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
          >
            Tuỳ chỉnh
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: "Hoàn thành bài học", value: "84%" },
            { title: "Tỉ lệ quay lại", value: "61%" },
            { title: "Thời gian học TB", value: "27 phút" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#0f172a]/60 px-4 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                {item.title}
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#e7edf3]">
                {item.value}
              </p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 w-3/4 rounded-full bg-[#34d399]"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
