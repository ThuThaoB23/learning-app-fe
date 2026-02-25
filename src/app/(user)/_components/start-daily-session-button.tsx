"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createDailySession } from "@/lib/user-actions-client";
import { pushSessionHistoryId } from "@/lib/session-history";

type DailySessionData = {
  id?: string;
};

export default function StartDailySessionButton() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStart = async () => {
    setStatus(null);
    const result = await createDailySession<DailySessionData>();
    if (!result.ok) {
      setStatus(result.message);
      return;
    }

    const sessionId = result.data?.id;
    if (!sessionId) {
      setStatus("Đã tạo phiên nhưng thiếu thông tin phiên học.");
      return;
    }
    pushSessionHistoryId(sessionId);

    startTransition(() => {
      router.push(`/dashboard/practice/${sessionId}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleStart}
        disabled={isPending}
        className="rounded-full bg-[#0b0f14] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Đang mở phiên..." : "Bắt đầu phiên Daily"}
      </button>
      {status ? (
        <p className="text-xs text-[#be123c]" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}
