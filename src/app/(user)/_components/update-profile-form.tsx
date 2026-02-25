"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfileResponse } from "@/lib/user-api";
import { updateMe } from "@/lib/user-actions-client";

type UpdateProfileFormProps = {
  profile: UserProfileResponse;
};

export default function UpdateProfileForm({ profile }: UpdateProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [form, setForm] = useState({
    username: profile.username ?? "",
    displayName: profile.displayName ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    locale: profile.locale ?? "vi",
    timeZone: profile.timeZone ?? "Asia/Ho_Chi_Minh",
    dailyGoal: profile.dailyGoal ?? 30,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const result = await updateMe({
      username: form.username,
      displayName: form.displayName,
      avatarUrl: form.avatarUrl,
      locale: form.locale,
      timeZone: form.timeZone,
      dailyGoal: form.dailyGoal,
    });

    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setIsLoading(false);
      return;
    }

    setStatus({ type: "success", message: "Đã cập nhật thông tin tài khoản." });
    router.refresh();
    setIsLoading(false);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium">
          Tên hiển thị
          <input
            value={form.displayName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, displayName: event.target.value }))
            }
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:border-[#0b0f14] focus:outline-none"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          Username
          <input
            value={form.username}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:border-[#0b0f14] focus:outline-none"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium">
        Ảnh đại diện URL
        <input
          value={form.avatarUrl}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))
          }
          className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:border-[#0b0f14] focus:outline-none"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block space-y-2 text-sm font-medium">
          Locale
          <input
            value={form.locale}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, locale: event.target.value }))
            }
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:border-[#0b0f14] focus:outline-none"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium md:col-span-2">
          Timezone
          <input
            value={form.timeZone}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, timeZone: event.target.value }))
            }
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:border-[#0b0f14] focus:outline-none"
          />
        </label>
      </div>

      <label className="block max-w-48 space-y-2 text-sm font-medium">
        Mục tiêu hằng ngày (phút)
        <input
          type="number"
          min={1}
          value={form.dailyGoal}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              dailyGoal: Math.max(1, Number(event.target.value) || 1),
            }))
          }
          className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:border-[#0b0f14] focus:outline-none"
        />
      </label>

      {status ? (
        <p
          className={`text-sm ${status.type === "success" ? "text-[#166534]" : "text-[#be123c]"}`}
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-full bg-[#0b0f14] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:opacity-70"
      >
        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
