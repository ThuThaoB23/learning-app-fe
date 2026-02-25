"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToMyVocab } from "@/lib/user-actions-client";

type AddToMyVocabButtonProps = {
  vocabularyId: string;
};

export default function AddToMyVocabButton({
  vocabularyId,
}: AddToMyVocabButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleAdd = async () => {
    setIsLoading(true);
    setStatus(null);

    const result = await addToMyVocab(vocabularyId);
    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setIsLoading(false);
      return;
    }

    setStatus({
      type: "success",
      message: "Đã thêm vào danh sách từ vựng cá nhân.",
    });
    router.refresh();
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleAdd}
        disabled={isLoading}
        className="rounded-full border border-[#0b0f14]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Đang thêm..." : "Thêm vào My Vocab"}
      </button>
      {status ? (
        <span
          className={`text-[11px] ${status.type === "success" ? "text-[#166534]" : "text-[#be123c]"}`}
          aria-live="polite"
        >
          {status.message}
        </span>
      ) : null}
    </div>
  );
}
