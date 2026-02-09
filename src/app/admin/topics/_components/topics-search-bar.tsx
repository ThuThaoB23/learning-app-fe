"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type TopicsSearchBarProps = {
  name: string;
  slug: string;
};

export default function TopicsSearchBar({ name, slug }: TopicsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => name || slug || "");

  const placeholder = useMemo(() => {
    if (name) return `Tên: ${name}`;
    if (slug) return `Slug: ${slug}`;
    return "Tìm theo tên hoặc slug";
  }, [name, slug]);

  const applySearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("name");
    params.delete("slug");
    params.set("page", "0");

    const trimmed = value.trim();
    if (trimmed.length > 0) {
      if (trimmed.includes("-")) {
        params.set("slug", trimmed);
      } else {
        params.set("name", trimmed);
      }
    }

    router.replace(`/admin/topics?${params.toString()}`);
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
        placeholder={placeholder}
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
