"use client";

import { useRouter, useSearchParams } from "next/navigation";

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

type TopicOption = {
  id: string;
  label: string;
};

type VocabFilterPanelProps = {
  status: string;
  language: string;
  topicId: string;
  topics: TopicOption[];
};

export default function VocabFilterPanel({
  status,
  language,
  topicId,
  topics,
}: VocabFilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateStatus = (nextStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    if (nextStatus) {
      params.set("status", nextStatus);
    } else {
      params.delete("status");
    }
    router.replace(`/admin/vocab?${params.toString()}`);
  };

  const updateFilters = (nextLanguage: string, nextTopicId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    if (nextLanguage) {
      params.set("language", nextLanguage);
    } else {
      params.delete("language");
    }
    if (nextTopicId) {
      params.set("topicId", nextTopicId);
    } else {
      params.delete("topicId");
    }
    router.replace(`/admin/vocab?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={(event) => updateStatus(event.target.value)}
        className="rounded-full border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-xs font-semibold text-[#e7edf3] outline-none transition focus:border-white/30"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={language}
        onChange={(event) => updateFilters(event.target.value, topicId)}
        className="rounded-full border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-xs font-semibold text-[#e7edf3] outline-none transition focus:border-white/30"
      >
        <option value="">Tất cả ngôn ngữ</option>
        <option value="vi">Tiếng Việt</option>
        <option value="en">Tiếng Anh</option>
        <option value="ja">Tiếng Nhật</option>
        <option value="ko">Tiếng Hàn</option>
      </select>
      <select
        value={topicId}
        onChange={(event) => updateFilters(language, event.target.value)}
        className="min-w-[200px] rounded-full border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-xs font-semibold text-[#e7edf3] outline-none transition focus:border-white/30"
      >
        <option value="">Tất cả chủ đề</option>
        {topics.map((topic) => (
          <option key={topic.id} value={topic.id}>
            {topic.label}
          </option>
        ))}
      </select>
    </div>
  );
}
