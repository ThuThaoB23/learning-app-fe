import type { Metadata } from "next";
import Link from "next/link";
import SessionStateActions from "../../../_components/session-state-actions";
import PracticeSessionRunner from "../../../_components/practice-session-runner";
import TrackSessionHistory from "../../../_components/track-session-history";
import { fetchSessionDetail } from "@/lib/user-api";
import { extractSessionScore, formatSessionScore } from "@/lib/session-score";

export const metadata: Metadata = {
  title: "Làm bài",
  description: "Trả lời câu hỏi trong phiên luyện tập.",
};

type PracticeSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function PracticeSessionPage({
  params,
}: PracticeSessionPageProps) {
  const { sessionId } = await params;
  const session = await fetchSessionDetail(sessionId);

  if (!session) {
    return (
      <div className="space-y-4">
        <p className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">
          Không tải được phiên học `{sessionId}`.
        </p>
        <Link
          href="/dashboard/practice"
          className="inline-flex rounded-full border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
        >
          Quay lại
        </Link>
      </div>
    );
  }
  const scoreSummary = formatSessionScore(extractSessionScore(session));

  return (
    <div className="space-y-6">
      <TrackSessionHistory sessionId={session.id} />
      <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Làm bài phiên Daily</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              Session ID: <span className="font-medium text-[#0b0f14]">{session.id}</span>
            </p>
            <p className="text-sm text-[#64748b]">
              Trạng thái: {session.status || "ACTIVE"} • Tổng câu:{" "}
              {session.items?.length ?? 0}
            </p>
            {scoreSummary ? (
              <p className="text-sm font-medium text-[#166534]">{scoreSummary}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <SessionStateActions
              sessionId={session.id}
              sessionStatus={session.status}
            />
            <Link
              href="/dashboard/practice"
              className="inline-flex rounded-full border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
            >
              Thoát màn làm bài
            </Link>
          </div>
        </div>
      </section>

      <PracticeSessionRunner sessionId={session.id} items={session.items ?? []} />
    </div>
  );
}
