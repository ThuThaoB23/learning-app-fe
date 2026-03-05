import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StartDailySessionButton from "../../_components/start-daily-session-button";
import StartTopicSessionForm from "../../_components/start-topic-session-form";
import RecentSessionsList from "../../_components/recent-sessions-list";
import { fetchTopics } from "@/lib/user-api";

export const metadata: Metadata = {
  title: "Luyện tập",
  description: "Bắt đầu phiên luyện tập hằng ngày hoặc theo chủ đề.",
};

type PracticePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const sessionId = Array.isArray(resolvedSearchParams?.sessionId)
    ? resolvedSearchParams.sessionId[0]
    : resolvedSearchParams?.sessionId;

  if (sessionId) {
    redirect(`/dashboard/practice/${sessionId}`);
  }

  const topicPage = await fetchTopics({
    page: 0,
    size: 50,
    sort: "createdAt,desc",
  });
  const topics = topicPage?.content ?? [];

  return (
    <div className="space-y-6">
      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,_0.9fr)_minmax(0,_1.1fr)]">
        <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#0b0f14]">Phiên Daily</h2>
              <p className="mt-1 text-sm text-[#64748b]">
                Lấy bộ câu hỏi theo tiến độ hiện tại để ôn tập nhanh mỗi ngày.
              </p>
            </div>
            <span className="rounded-full border border-[#dbeafe] bg-[#eff6ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1d4ed8]">
              Daily
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                Thời lượng
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0f172a]">10-15 phút</p>
            </div>
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                Mục tiêu
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                Củng cố từ trọng tâm
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white p-4">
            <StartDailySessionButton />
          </div>
        </article>

        <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#0b0f14]">Phiên theo chủ đề</h2>
              <p className="mt-1 text-sm text-[#64748b]">
                Chọn chủ đề cần tập trung và tùy chỉnh số câu theo mục tiêu học.
              </p>
            </div>
            <span className="rounded-full border border-[#dcfce7] bg-[#ecfdf5] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#047857]">
              Topic
            </span>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e2e8f0] bg-white p-4">
            <StartTopicSessionForm topics={topics} />
          </div>
        </article>
      </section>

      <RecentSessionsList />
    </div>
  );
}
