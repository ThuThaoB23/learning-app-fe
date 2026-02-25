import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StartDailySessionButton from "../../_components/start-daily-session-button";
import RecentSessionsList from "../../_components/recent-sessions-list";

export const metadata: Metadata = {
  title: "Luyện tập",
  description: "Bắt đầu và theo dõi phiên học hằng ngày.",
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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h2 className="text-2xl font-semibold">Phiên luyện tập Daily</h2>
        <p className="mt-2 text-sm text-[#64748b]">
          Bấm bắt đầu để tạo (hoặc lấy phiên đang ACTIVE), sau đó chuyển sang màn làm bài riêng.
        </p>
        <div className="mt-4">
          <StartDailySessionButton />
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-[#d1d5db] bg-white/70 p-6 text-sm text-[#64748b]">
        Mỗi câu hỏi sẽ có giao diện trả lời khác nhau theo `questionType`: chọn đáp án, đúng/sai hoặc nhập tự do.
      </section>

      <RecentSessionsList />
    </div>
  );
}
