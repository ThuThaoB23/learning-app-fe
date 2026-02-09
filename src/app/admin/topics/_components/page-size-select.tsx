"use client";

import { useRouter, useSearchParams } from "next/navigation";

type PageSizeSelectProps = {
  value: number;
  options?: number[];
};

export default function PageSizeSelect({
  value,
  options = [10, 20, 30, 50],
}: PageSizeSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSize = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("size", nextSize);
    params.set("page", "0");
    router.replace(`/admin/topics?${params.toString()}`);
  };

  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-[#64748b]">
      Hiển thị
      <select
        value={value}
        onChange={handleChange}
        className="rounded-full border border-white/10 bg-[#0b0f14]/60 px-3 py-1 text-xs font-semibold text-[#e7edf3] outline-none transition focus:border-white/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      / trang
    </label>
  );
}
