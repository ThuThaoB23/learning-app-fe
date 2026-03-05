"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { UserProfileResponse } from "@/lib/user-api";
import { updateMe, updateMyAvatar } from "@/lib/user-actions-client";

type UpdateProfileFormProps = {
  profile: UserProfileResponse;
};

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export default function UpdateProfileForm({ profile }: UpdateProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(
    profile.avatarUrl ?? "",
  );
  const [form, setForm] = useState({
    username: profile.username ?? "",
    displayName: profile.displayName ?? "",
    locale: profile.locale ?? "vi",
    timeZone: profile.timeZone ?? "Asia/Ho_Chi_Minh",
    dailyGoal: profile.dailyGoal ?? 30,
  });

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const previewAvatar = avatarPreviewUrl ?? currentAvatarUrl;

  const mapAvatarErrorMessage = (errorCode?: string, fallback?: string) => {
    switch (errorCode) {
      case "INVALID_FILE":
        return "Vui lòng chọn một tệp ảnh hợp lệ.";
      case "FILE_TOO_LARGE":
        return "Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.";
      case "INVALID_FILE_TYPE":
        return "Định dạng không hỗ trợ. Chỉ nhận JPG, PNG, WEBP hoặc GIF.";
      case "AVATAR_UPLOAD_FAILED":
        return "Không thể upload avatar lên hệ thống lưu trữ. Vui lòng thử lại.";
      default:
        return fallback ?? "Không thể cập nhật ảnh đại diện.";
    }
  };

  const resetAvatarInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarStatus({
        type: "error",
        message: "Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.",
      });
      resetAvatarInput();
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setAvatarStatus({
        type: "error",
        message: "Định dạng không hỗ trợ. Chỉ nhận JPG, PNG, WEBP hoặc GIF.",
      });
      resetAvatarInput();
      return;
    }

    setAvatarPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
    setSelectedAvatar(file);
    setAvatarStatus({
      type: "info",
      message: `Đã chọn ${file.name}. Bấm "Upload ảnh" để áp dụng.`,
    });
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatar) {
      setAvatarStatus({
        type: "error",
        message: "Vui lòng chọn ảnh trước khi upload.",
      });
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarStatus(null);

    const result = await updateMyAvatar<UserProfileResponse>(selectedAvatar);
    if (!result.ok) {
      setAvatarStatus({
        type: "error",
        message: mapAvatarErrorMessage(result.errorCode, result.message),
      });
      setIsUploadingAvatar(false);
      return;
    }

    const nextAvatarUrl = result.data?.avatarUrl ?? currentAvatarUrl;
    setCurrentAvatarUrl(nextAvatarUrl ?? "");
    setAvatarPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setSelectedAvatar(null);
    resetAvatarInput();
    setAvatarStatus({
      type: "success",
      message: "Cập nhật ảnh đại diện thành công.",
    });
    router.refresh();
    setIsUploadingAvatar(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const result = await updateMe({
      username: form.username,
      displayName: form.displayName,
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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {previewAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewAvatar}
              alt="Avatar preview"
              className="h-20 w-20 rounded-full border border-[#cbd5e1] object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-[#cbd5e1] bg-white text-xs text-[#64748b]">
              Chưa có ảnh
            </div>
          )}

          <div className="flex-1 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarFileChange}
              className="sr-only"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="rounded-full border border-[#0b0f14] px-3 py-1.5 text-xs font-semibold text-[#0b0f14] transition hover:bg-[#0b0f14] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Chọn ảnh
              </button>
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={isUploadingAvatar || !selectedAvatar}
                className="rounded-full bg-[#0b0f14] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingAvatar ? "Đang tải..." : "Cập nhật ảnh"}
              </button>
              <span className="text-xs text-[#64748b]">
                {selectedAvatar?.name || "JPG/PNG/WEBP/GIF • tối đa 5MB"}
              </span>
            </div>
          </div>
        </div>

        {avatarStatus ? (
          <p
            className={`mt-3 text-sm ${
              avatarStatus.type === "success"
                ? "text-[#166534]"
                : avatarStatus.type === "info"
                  ? "text-[#1d4ed8]"
                  : "text-[#be123c]"
            }`}
            aria-live="polite"
          >
            {avatarStatus.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium">
          Tên hiển thị
          <input
            value={form.displayName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, displayName: event.target.value }))
            }
            placeholder="Tên bạn muốn hiển thị"
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
            placeholder="username"
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:border-[#0b0f14] focus:outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="block space-y-2 text-sm font-medium md:col-span-1">
          Mục tiêu/ngày (phút)
          <input
            type="number"
            min={0}
            value={form.dailyGoal}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                dailyGoal: Math.max(0, Number(event.target.value) || 0),
              }))
            }
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:border-[#0b0f14] focus:outline-none"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium md:col-span-1">
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

      <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
        <p className="text-sm font-semibold text-[#0f172a]">Thông tin chỉ xem</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="block space-y-1.5 text-sm">
            <span className="text-xs text-[#64748b]">Email</span>
            <input
              readOnly
              disabled
              value={profile.email ?? ""}
              className="w-full rounded-xl border border-[#e5e7eb] bg-[#f1f5f9] px-3 py-2 text-sm text-[#475569]"
            />
          </label>
          <label className="block space-y-1.5 text-sm md:col-span-1">
            <span className="text-xs text-[#64748b]">Vai trò</span>
            <input
              readOnly
              disabled
              value={profile.role ?? ""}
              className="w-full rounded-xl border border-[#e5e7eb] bg-[#f1f5f9] px-3 py-2 text-sm text-[#475569]"
            />
          </label>
          <label className="block space-y-1.5 text-sm md:col-span-1">
            <span className="text-xs text-[#64748b]">Trạng thái</span>
            <input
              readOnly
              disabled
              value={profile.status ?? ""}
              className="w-full rounded-xl border border-[#e5e7eb] bg-[#f1f5f9] px-3 py-2 text-sm text-[#475569]"
            />
          </label>
        </div>
        <details className="mt-3 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-[#64748b]">
            Preferences
          </summary>
          <textarea
            readOnly
            disabled
            rows={4}
            value={
              profile.preferences
                ? JSON.stringify(profile.preferences, null, 2)
                : ""
            }
            className="mt-2 w-full rounded-xl border border-[#e5e7eb] bg-[#f1f5f9] px-3 py-2 font-mono text-xs text-[#475569]"
          />
        </details>
      </div>

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
