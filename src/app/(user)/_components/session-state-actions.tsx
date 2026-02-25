"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { abandonSession, completeSession } from "@/lib/user-actions-client";
import { extractSessionScore, formatSessionScore } from "@/lib/session-score";

type SessionStateActionsProps = {
  sessionId: string;
};

export default function SessionStateActions({
  sessionId,
}: SessionStateActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleComplete = async () => {
    setIsLoading(true);
    setMessage(null);
    const result = await completeSession(sessionId);
    if (!result.ok) {
      setMessage(result.message);
      setIsLoading(false);
      return;
    }
    const scoreText = formatSessionScore(extractSessionScore(result.data));
    setMessage(
      scoreText
        ? `Đã hoàn thành phiên học. ${scoreText}`
        : "Đã hoàn thành phiên học.",
    );
    router.refresh();
    setIsLoading(false);
  };

  const handleAbandon = async () => {
    setIsLoading(true);
    setMessage(null);
    const result = await abandonSession(sessionId);
    if (!result.ok) {
      setMessage(result.message);
      setIsLoading(false);
      return;
    }
    const scoreText = formatSessionScore(extractSessionScore(result.data));
    setMessage(
      scoreText
        ? `Đã đánh dấu hủy phiên học. ${scoreText}`
        : "Đã đánh dấu hủy phiên học.",
    );
    router.refresh();
    setIsLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleComplete}
          disabled={isLoading}
          className="rounded-full bg-[#0b0f14] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#111827] disabled:opacity-70"
        >
          Hoàn thành phiên
        </button>
        <button
          type="button"
          onClick={handleAbandon}
          disabled={isLoading}
          className="rounded-full border border-[#fb7185]/40 px-3 py-1.5 text-xs font-semibold text-[#be123c] transition hover:bg-[#fff1f2] disabled:opacity-70"
        >
          Hủy phiên
        </button>
      </div>
      {message ? (
        <p className="text-xs text-[#64748b]" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  );
}
