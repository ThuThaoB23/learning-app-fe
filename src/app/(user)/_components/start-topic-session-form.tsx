"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createTopicSession } from "@/lib/user-actions-client";
import { pushSessionHistoryId } from "@/lib/session-history";

type TopicOption = {
  id: string;
  name?: string | null;
  status?: string | null;
};

type TopicSessionData = {
  id?: string;
};

type StartTopicSessionFormProps = {
  topics: TopicOption[];
};

export default function StartTopicSessionForm({
  topics,
}: StartTopicSessionFormProps) {
  const router = useRouter();
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [totalItemsInput, setTotalItemsInput] = useState("20");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableTopics = topics.filter((topic) => {
    const normalized = (topic.status || "ACTIVE").toUpperCase();
    return normalized !== "INACTIVE";
  });

  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  };

  const handleStart = async () => {
    setStatus(null);
    if (!selectedTopicIds.length) {
      setStatus("Chọn ít nhất 1 chủ đề.");
      return;
    }

    const normalizedInput = totalItemsInput.trim();
    const parsed = normalizedInput ? Number(normalizedInput) : undefined;
    if (
      typeof parsed === "number" &&
      (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0)
    ) {
      setStatus("Số câu phải là số nguyên dương.");
      return;
    }

    const result = await createTopicSession<TopicSessionData>({
      topicIds: selectedTopicIds,
      totalItems: parsed,
    });
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

  if (!availableTopics.length) {
    return (
      <p className="text-sm text-[#64748b]">
        Chưa có chủ đề khả dụng để tạo phiên.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
          Chọn chủ đề
        </p>
        <span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
          {selectedTopicIds.length} đã chọn
        </span>
      </div>

      <div className="flex max-h-44 flex-wrap gap-2 overflow-auto rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-2 pr-1">
        {availableTopics.map((topic) => {
          const active = selectedTopicIds.includes(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => toggleTopic(topic.id)}
              disabled={isPending}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                active
                  ? "border-[#0b0f14] bg-[#0b0f14] text-white shadow-[0_8px_20px_rgba(15,23,42,0.2)]"
                  : "border-[#cbd5e1] bg-white text-[#334155] hover:border-[#0b0f14]"
              }`}
            >
              {topic.name || "Chủ đề chưa đặt tên"}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-[110px_minmax(0,_1fr)] sm:items-end">
        <label
          className="block space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]"
          htmlFor="topic-total-items"
        >
          Số câu
          <input
            id="topic-total-items"
            type="number"
            min={1}
            step={1}
            value={totalItemsInput}
            onChange={(event) => setTotalItemsInput(event.target.value)}
            disabled={isPending}
            className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[#0b0f14] focus:border-[#0b0f14] focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          className="w-full rounded-xl bg-[#0b0f14] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#111827] sm:w-auto sm:justify-self-start sm:rounded-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Đang mở phiên..." : "Bắt đầu theo chủ đề"}
        </button>
      </div>

      {status ? (
        <p className="text-xs text-[#be123c]" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}
