import type { Metadata } from "next";
import Link from "next/link";
import SessionStateActions from "../../../_components/session-state-actions";
import PracticeSessionRunner from "../../../_components/practice-session-runner";
import TrackSessionHistory from "../../../_components/track-session-history";
import { fetchSessionDetail } from "@/lib/user-api";
import { extractSessionScore } from "@/lib/session-score";

export const metadata: Metadata = {
  title: "Làm bài",
  description: "Trả lời câu hỏi trong phiên luyện tập.",
};

type PracticeSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false,
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const hour = getPart("hour");
  const minute = getPart("minute");
  const day = getPart("day");
  const month = getPart("month");
  const year = getPart("year");

  if (!hour || !minute || !day || !month || !year) {
    return null;
  }

  return `${hour}:${minute} ${day}/${month}/${year}`;
};

const toStatusLabel = (status?: string | null) => {
  const normalized = (status || "ACTIVE").toUpperCase();
  if (normalized === "COMPLETED") {
    return "Đã nộp";
  }
  if (normalized === "ABANDONED") {
    return "Đã hủy";
  }
  return "Đang làm";
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
  const score = extractSessionScore(session);
  const startedAtLabel =
    formatDateTime(session.startedAt) || formatDateTime(session.createdAt);
  const completedAtLabel = formatDateTime(session.completedAt);

  return (
    <div className="space-y-6">
      <TrackSessionHistory sessionId={session.id} />
      <section className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Làm bài</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#334155]">
                {toStatusLabel(session.status)}
              </span>
              <span className="inline-flex rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#334155]">
                {session.items?.length ?? 0} câu
              </span>
              {typeof score?.score === "number" ? (
                <span className="inline-flex rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-1 text-xs font-medium text-[#166534]">
                  Điểm {score.score}
                </span>
              ) : null}
              {typeof score?.correct === "number" && typeof score?.total === "number" ? (
                <span className="inline-flex rounded-full border border-[#dbeafe] bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#1d4ed8]">
                  Đúng {score.correct}/{score.total}
                </span>
              ) : null}
              {typeof score?.accuracyPercent === "number" ? (
                <span className="inline-flex rounded-full border border-[#dbeafe] bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#1d4ed8]">
                  Chính xác {score.accuracyPercent}%
                </span>
              ) : null}
              {startedAtLabel ? (
                <span className="inline-flex rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#334155]">
                  Bắt đầu {startedAtLabel}
                </span>
              ) : null}
              {completedAtLabel ? (
                <span className="inline-flex rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#334155]">
                  Nộp {completedAtLabel}
                </span>
              ) : null}
            </div>
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
