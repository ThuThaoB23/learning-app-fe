"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type UsersSearchBarProps = {
  email: string;
  username: string;
  displayName: string;
};

export default function UsersSearchBar({
  email,
  username,
  displayName,
}: UsersSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => {
    if (email) return email;
    if (username) return username;
    if (displayName) return displayName;
    return "";
  });

  const placeholder = useMemo(() => {
    if (email) return `Email: ${email}`;
    if (username) return `Username: ${username}`;
    if (displayName) return `Tên: ${displayName}`;
    return "Tìm theo email, username hoặc tên";
  }, [email, username, displayName]);

  const applySearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("email");
    params.delete("username");
    params.delete("displayName");
    params.set("page", "0");

    const trimmed = value.trim();
    if (trimmed.length > 0) {
      if (trimmed.includes("@")) {
        params.set("email", trimmed);
      } else if (trimmed.includes(" ")) {
        params.set("displayName", trimmed);
      } else {
        params.set("username", trimmed);
      }
    }

    router.replace(`/admin/users?${params.toString()}`);
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
