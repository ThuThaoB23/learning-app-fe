"use client";

import { useRouter, useSearchParams } from "next/navigation";

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
];

type TopicsFilterPanelProps = {
  status: string;
};

export default function TopicsFilterPanel({ status }: TopicsFilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (nextStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    if (nextStatus) {
      params.set("status", nextStatus);
    } else {
      params.delete("status");
    }
    router.replace(`/admin/topics?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={(event) => updateParams(event.target.value)}
        className="rounded-full border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-xs font-semibold text-[#e7edf3] outline-none transition focus:border-white/30"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
