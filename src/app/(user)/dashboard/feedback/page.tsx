import type { Metadata } from "next";
import Link from "next/link";
import { fetchMyFeedback, type UserFeedbackResponse } from "@/lib/user-api";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Theo dõi feedback bạn đã gửi tới hệ thống.",
};

const categoryLabels: Record<string, string> = {
  BUG_REPORT: "Bug report",
  CONTENT_ISSUE: "Lỗi nội dung",
  FEATURE_REQUEST: "Yêu cầu tính năng",
  UX_FEEDBACK: "Trải nghiệm sử dụng",
  GENERAL: "Góp ý chung",
};

const statusLabels: Record<string, string> = {
  NEW: "Mới",
  READ: "Đã đọc",
  ARCHIVED: "Đã lưu trữ",
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const renderAttachmentLinks = (feedback: UserFeedbackResponse) => {
  const attachments = feedback.attachments ?? [];
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.fileUrl ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-[#dbe4ee] bg-white px-3 py-1 text-xs font-medium text-[#475569] transition hover:border-[#0b0f14] hover:text-[#0b0f14]"
        >
          {attachment.fileName || "Tệp đính kèm"}
        </a>
      ))}
    </div>
  );
};

export default async function FeedbackPage() {
  const feedbackPage = await fetchMyFeedback({
    page: 0,
    size: 20,
    sort: "createdAt,desc",
  });
  const feedbackItems = feedbackPage?.content ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#0b0f14]">Feedback của tôi</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              Theo dõi feedback đã gửi và trạng thái xử lý.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#dbe4ee] bg-[#f8fafc] px-3 py-1.5 text-sm font-semibold text-[#334155]">
              {feedbackPage?.totalElements ?? 0} feedback
            </span>
            <Link
              href="/dashboard/feedback/new"
              className="inline-flex items-center justify-center rounded-2xl bg-[#0b0f14] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#111827]"
            >
              Gửi feedback mới
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        {!feedbackPage ? (
          <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">
            Không thể tải danh sách feedback từ API.
          </div>
        ) : feedbackItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-8 text-center text-sm text-[#64748b]">
            Bạn chưa gửi feedback nào.
          </div>
        ) : (
          <div className="space-y-3">
            {feedbackItems.map((feedback) => (
              <article
                key={feedback.id}
                className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#dbe4ee] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#334155]">
                        {categoryLabels[feedback.category || ""] || feedback.category || "Feedback"}
                      </span>
                      <span className="rounded-full border border-[#dbe4ee] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#334155]">
                        {statusLabels[feedback.status || ""] || feedback.status || "NEW"}
                      </span>
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-[#0b0f14]">
                      {feedback.title?.trim() || "Feedback không có tiêu đề"}
                    </h4>
                  </div>

                  <p className="text-xs font-medium text-[#64748b]">
                    {formatDateTime(feedback.createdAt)}
                  </p>
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#475569]">
                  {feedback.message}
                </p>

                {feedback.targetLabelSnapshot || feedback.sourceScreen ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-[#64748b]">
                    {feedback.targetLabelSnapshot ? (
                      <span className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1">
                        {feedback.targetLabelSnapshot}
                      </span>
                    ) : null}
                    {feedback.sourceScreen ? (
                      <span className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1">
                        {feedback.sourceScreen}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {renderAttachmentLinks(feedback)}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
