"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type VocabSearchBarProps = {
  query: string;
};

export default function VocabSearchBar({ query }: VocabSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(query);

  const applySearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    if (value.trim()) {
      params.set("query", value.trim());
    } else {
      params.delete("query");
    }
    router.replace(`/admin/vocab?${params.toString()}`);
  };

  return (
    <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-sm text-[#e7edf3]">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            applySearch();
          }
        }}
        placeholder="Tìm theo từ hoặc định nghĩa"
        className="w-full bg-transparent text-sm text-[#e7edf3] outline-none placeholder:text-[#64748b]"
      />
      <button
        type="button"
        onClick={applySearch}
        className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
      >
        Tìm
      </button>
    </div>
  );
}
