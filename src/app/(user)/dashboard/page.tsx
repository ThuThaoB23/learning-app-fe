import type { Metadata } from "next";
import Link from "next/link";
import StartDailySessionButton from "../_components/start-daily-session-button";
import { fetchMe, fetchMyVocab, fetchTopics } from "@/lib/user-api";

export const metadata: Metadata = {
  title: "Tổng quan",
  description: "Tổng quan học tập cá nhân.",
};

const toNumber = (value?: number | null) => (typeof value === "number" ? value : 0);

export default async function UserDashboardPage() {
  const [profile, myVocab, topics] = await Promise.all([
    fetchMe(),
    fetchMyVocab({ page: 0, size: 100 }),
    fetchTopics({ page: 0, size: 6, sort: "createdAt,desc" }),
  ]);

  const vocabList = myVocab?.content ?? [];
  const total = myVocab?.totalElements ?? vocabList.length;
  const mastered = vocabList.filter((item) => item.status === "MASTERED").length;
  const learning = vocabList.filter((item) => item.status === "LEARNING").length;
  const fresh = vocabList.filter((item) => item.status === "NEW").length;
  const averageProgress =
    vocabList.length === 0
      ? 0
      : Math.round(
          vocabList.reduce(
            (sum, item) => sum + toNumber(item.progress ?? item.process),
            0,
          ) / vocabList.length,
        );
  const overview = [
    { label: "Tổng từ cá nhân", value: String(total), unit: "từ" },
    { label: "Đang học", value: String(learning), unit: "từ" },
    { label: "Đã thuộc", value: String(mastered), unit: "từ" },
    { label: "Mới thêm", value: String(fresh), unit: "từ" },
  ];

  const recentTopics = topics?.content ?? [];
  const hasError = !profile || !myVocab || !topics;

  return (
    <div className="space-y-6">
      {hasError ? (
        <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">
          Một số dữ liệu không tải được từ API. Bạn có thể bấm làm mới để thử lại.
        </div>
      ) : null}

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
                Bắt đầu một phiên daily để lấy bộ câu hỏi theo tiến độ hiện tại.
              </p>
            </div>
            <StartDailySessionButton />
          </div>
          <div className="mt-6 space-y-3">
            {recentTopics.length === 0 ? (
              <p className="text-sm text-[#64748b]">
                Chưa có chủ đề khả dụng. Hãy thêm dữ liệu topic ở admin để bắt đầu.
              </p>
            ) : (
              recentTopics.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-black/5 bg-[#f7f4ef] px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{item.name || "Chủ đề chưa có tên"}</p>
                    <p className="line-clamp-1 text-xs text-[#64748b]">
                      {item.description || "Chưa có mô tả chủ đề."}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#3b82f6]">
                    {item.status || "ACTIVE"}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-black/5">
                  <div className="h-2 w-1/2 rounded-full bg-[#3b82f6]" />
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-semibold">Mục tiêu tuần</h2>
          <p className="mt-1 text-sm text-[#64748b]">
            Dựa trên hồ sơ cá nhân và danh sách từ của bạn.
          </p>
          <div className="mt-6 space-y-4">
            {[
              {
                label: `Mục tiêu ngày: ${profile?.dailyGoal ?? 30} phút`,
                value: `${Math.min(profile?.dailyGoal ?? 30, 24)} phút`,
              },
              { label: "Tiến độ trung bình", value: `${averageProgress}%` },
              { label: "Từ đã nắm vững", value: `${mastered} từ` },
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
          <Link
            href="/dashboard/settings"
            className="mt-6 block w-full rounded-xl bg-[#0b0f14] px-4 py-2 text-center text-xs font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#111827]"
          >
            Cập nhật mục tiêu
          </Link>
        </div>
      </section>
    </div>
  );
}
