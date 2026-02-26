"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  approveVocabContribution,
  rejectVocabContribution,
} from "@/lib/admin-vocab-client";
import {
  vocabularyContributionRejectReasonOptions,
  vocabularyContributionRejectReasonLabels,
} from "@/lib/vocab-contribution-reject-reason";

type ContributionReviewActionsProps = {
  contributionId: string;
  status?: string | null;
};

export default function ContributionReviewActions({
  contributionId,
  status,
}: ContributionReviewActionsProps) {
  const router = useRouter();
  const [reviewNote, setReviewNote] = useState("");
  const [rejectReason, setRejectReason] = useState<
    (typeof vocabularyContributionRejectReasonOptions)[number]
  >("DUPLICATE");
  const [isLoading, setIsLoading] = useState<"approve" | "reject" | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const normalizedStatus = (status || "SUBMITTED").toUpperCase();
  const canReview = normalizedStatus === "SUBMITTED" || normalizedStatus === "IN_REVIEW";

  const handleApprove = async () => {
    if (!canReview) {
      return;
    }
    setIsLoading("approve");
    setMessage(null);
    const result = await approveVocabContribution(contributionId, { reviewNote });
    if (!result.ok) {
      setMessage({ type: "error", text: result.message });
      setIsLoading(null);
      return;
    }
    setMessage({ type: "success", text: "Đã duyệt đóng góp." });
    setIsLoading(null);
    router.refresh();
  };

  const handleReject = async () => {
    if (!canReview) {
      return;
    }
    setIsLoading("reject");
    setMessage(null);
    const result = await rejectVocabContribution(contributionId, {
      rejectReason,
      reviewNote,
    });
    if (!result.ok) {
      setMessage({ type: "error", text: result.message });
      setIsLoading(null);
      return;
    }
    setMessage({ type: "success", text: "Đã từ chối đóng góp." });
    setIsLoading(null);
    router.refresh();
  };

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#e7edf3]">Thao tác duyệt</h3>
        {!canReview ? (
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#94a3b8]">
            Đã khóa
          </span>
        ) : null}
      </div>

      <label className="block space-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
        Review Note
        <textarea
          value={reviewNote}
          onChange={(event) => setReviewNote(event.target.value)}
          rows={3}
          disabled={!canReview || Boolean(isLoading)}
          className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-sm font-normal tracking-normal text-[#e7edf3] focus:border-white/20 focus:outline-none"
          placeholder="Ghi chú cho quá trình duyệt..."
        />
      </label>

      <label className="block space-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
        Lý Do Từ Chối
        <select
          value={rejectReason}
          onChange={(event) =>
            setRejectReason(
              event.target.value as (typeof vocabularyContributionRejectReasonOptions)[number],
            )
          }
          disabled={!canReview || Boolean(isLoading)}
          className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-sm font-normal tracking-normal text-[#e7edf3] focus:border-white/20 focus:outline-none"
        >
          {vocabularyContributionRejectReasonOptions.map((reason) => (
            <option key={reason} value={reason}>
              {vocabularyContributionRejectReasonLabels[reason] ?? reason}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={!canReview || Boolean(isLoading)}
          className="rounded-full bg-[#34d399] px-3 py-1.5 text-xs font-semibold text-[#052e2b] transition hover:bg-[#6ee7b7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading === "approve" ? "Đang duyệt..." : "Duyệt"}
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={!canReview || Boolean(isLoading)}
          className="rounded-full border border-[#fb7185]/30 bg-[#fb7185]/10 px-3 py-1.5 text-xs font-semibold text-[#fda4af] transition hover:bg-[#fb7185]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading === "reject" ? "Đang từ chối..." : "Từ chối"}
        </button>
      </div>

      {message ? (
        <p
          className={`text-xs ${message.type === "success" ? "text-[#86efac]" : "text-[#fda4af]"}`}
          aria-live="polite"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
