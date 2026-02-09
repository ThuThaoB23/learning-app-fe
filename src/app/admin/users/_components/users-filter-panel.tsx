"use client";

import { useRouter, useSearchParams } from "next/navigation";

const roleOptions = [
  { value: "", label: "Tất cả vai trò" },
  { value: "ADMIN", label: "Quản trị" },
  { value: "USER", label: "Người dùng" },
];

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
  { value: "BANNED", label: "Bị khóa" },
  { value: "PENDING_VERIFICATION", label: "Chờ xác minh" },
];

type UsersFilterPanelProps = {
  role: string;
  status: string;
};

export default function UsersFilterPanel({
  role,
  status,
}: UsersFilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (nextRole: string, nextStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    if (nextRole) {
      params.set("role", nextRole);
    } else {
      params.delete("role");
    }
    if (nextStatus) {
      params.set("status", nextStatus);
    } else {
      params.delete("status");
    }
    router.replace(`/admin/users?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={role}
        onChange={(event) => updateParams(event.target.value, status)}
        className="rounded-full border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-xs font-semibold text-[#e7edf3] outline-none transition focus:border-white/30"
      >
        {roleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(event) => updateParams(role, event.target.value)}
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
