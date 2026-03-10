"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  archiveAdminFeedback,
  markAdminFeedbackAsRead,
} from "@/lib/admin-feedback-client";

type AdminFeedbackActionsProps = {
  feedbackId: string;
  status?: string | null;
};

export default function AdminFeedbackActions({
  feedbackId,
  status,
}: AdminFeedbackActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"read" | "archive" | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const normalizedStatus = (status || "NEW").toUpperCase();
  const canMarkRead = normalizedStatus === "NEW";
  const canArchive = normalizedStatus !== "ARCHIVED";

  const handleMarkRead = async () => {
    if (!canMarkRead) {
      return;
    }

    setPendingAction("read");
    setMessage(null);
    const result = await markAdminFeedbackAsRead(feedbackId);

    if (!result.ok) {
      setMessage({ type: "error", text: result.message });
      setPendingAction(null);
      return;
    }

    setMessage({ type: "success", text: "Đã đánh dấu feedback là đã đọc." });
    setPendingAction(null);
    router.refresh();
  };

  const handleArchive = async () => {
    if (!canArchive) {
      return;
    }

    setPendingAction("archive");
    setMessage(null);
    const result = await archiveAdminFeedback(feedbackId);

    if (!result.ok) {
      setMessage({ type: "error", text: result.message });
      setPendingAction(null);
      return;
    }

    setMessage({ type: "success", text: "Đã lưu trữ feedback." });
    setPendingAction(null);
    router.refresh();
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#e7edf3]">Thao tác</h3>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#94a3b8]">
          {normalizedStatus}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleMarkRead}
          disabled={!canMarkRead || Boolean(pendingAction)}
          className="rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-3 py-1.5 text-xs font-semibold text-[#bae6fd] transition hover:bg-[#38bdf8]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "read" ? "Đang cập nhật..." : "Đánh dấu đã đọc"}
        </button>
        <button
          type="button"
          onClick={handleArchive}
          disabled={!canArchive || Boolean(pendingAction)}
          className="rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/10 px-3 py-1.5 text-xs font-semibold text-[#fde68a] transition hover:bg-[#fbbf24]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "archive" ? "Đang lưu..." : "Lưu trữ"}
        </button>
      </div>

      {message ? (
        <p
          className={`mt-3 text-xs ${
            message.type === "success" ? "text-[#86efac]" : "text-[#fda4af]"
          }`}
          aria-live="polite"
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
