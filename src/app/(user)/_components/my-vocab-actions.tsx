"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { removeFromMyVocab, updateMyVocab } from "@/lib/user-actions-client";

type MyVocabActionsProps = {
  vocabularyId?: string;
  currentStatus?: string | null;
};

export default function MyVocabActions({
  vocabularyId,
  currentStatus,
}: MyVocabActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus ?? "NEW");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (!vocabularyId) {
      setMessage("Không tìm thấy vocabularyId để cập nhật.");
      return;
    }
    setIsLoading(true);
    setMessage(null);
    const result = await updateMyVocab(vocabularyId, {
      status: status as "NEW" | "LEARNING" | "MASTERED",
    });
    if (!result.ok) {
      setMessage(result.message);
      setIsLoading(false);
      return;
    }
    setMessage("Đã cập nhật.");
    router.refresh();
    setIsLoading(false);
  };

  const handleRemove = async () => {
    if (!vocabularyId) {
      setMessage("Không tìm thấy vocabularyId để xóa.");
      return;
    }
    setIsLoading(true);
    setMessage(null);
    const result = await removeFromMyVocab(vocabularyId);
    if (!result.ok) {
      setMessage(result.message);
      setIsLoading(false);
      return;
    }
    router.refresh();
    setIsLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-[#e5e7eb] bg-white px-2 py-1 text-xs"
        >
          <option value="NEW">NEW</option>
          <option value="LEARNING">LEARNING</option>
          <option value="MASTERED">MASTERED</option>
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || !vocabularyId}
          className="rounded-lg border border-[#0b0f14]/15 px-2 py-1 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14] disabled:opacity-60"
        >
          Lưu
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isLoading || !vocabularyId}
          className="rounded-lg border border-[#fb7185]/30 px-2 py-1 text-xs font-semibold text-[#be123c] transition hover:bg-[#fff1f2] disabled:opacity-60"
        >
          Xóa
        </button>
      </div>
      {message ? (
        <p className="text-[11px] text-[#64748b]" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  );
}
