"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { submitUserFeedback } from "@/lib/user-actions-client";

const CATEGORY_OPTIONS = [
  { id: "BUG_REPORT", label: "Bug report" },
  { id: "CONTENT_ISSUE", label: "Lỗi nội dung" },
  { id: "FEATURE_REQUEST", label: "Yêu cầu tính năng" },
  { id: "UX_FEEDBACK", label: "Trải nghiệm sử dụng" },
  { id: "GENERAL", label: "Góp ý chung" },
] as const;

const TARGET_TYPE_OPTIONS = [
  { id: "APP", label: "Ứng dụng" },
  { id: "OTHER", label: "Khác" },
  { id: "VOCABULARY", label: "Từ vựng" },
  { id: "TOPIC", label: "Chủ đề" },
  { id: "TEST_SESSION", label: "Phiên luyện tập" },
  { id: "VOCABULARY_AUDIO", label: "Audio từ vựng" },
] as const;

const INPUT_CLASSNAME =
  "w-full rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-sm font-medium text-[#0b0f14] outline-none transition focus:border-[#0b0f14]";

const TEXTAREA_CLASSNAME = `${INPUT_CLASSNAME} min-h-32 resize-y`;

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type FeedbackAttachmentItem = {
  file: File;
  previewUrl: string;
};

type UserFeedbackFormProps = {
  redirectTo?: string;
};

export default function UserFeedbackForm({ redirectTo }: UserFeedbackFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] =
    useState<(typeof CATEGORY_OPTIONS)[number]["id"]>("GENERAL");
  const [targetType, setTargetType] =
    useState<(typeof TARGET_TYPE_OPTIONS)[number]["id"]>("APP");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetLabelSnapshot, setTargetLabelSnapshot] = useState("");
  const [attachments, setAttachments] = useState<FeedbackAttachmentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      for (const attachment of attachments) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    };
  }, [attachments]);

  const handleFileChange = (nextFiles: FileList | null) => {
    if (!nextFiles) {
      setAttachments((currentAttachments) => {
        for (const attachment of currentAttachments) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
        return [];
      });
      return;
    }

    const selectedFiles = Array.from(nextFiles);
    if (selectedFiles.length > MAX_ATTACHMENTS) {
      setError("Tối đa 3 ảnh đính kèm.");
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE,
    );
    if (invalidFile) {
      setError("Chỉ hỗ trợ JPG/PNG/WebP và tối đa 5MB mỗi ảnh.");
      return;
    }

    setError(null);
    setAttachments((currentAttachments) => {
      for (const attachment of currentAttachments) {
        URL.revokeObjectURL(attachment.previewUrl);
      }

      return selectedFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    });
  };

  const removeAttachment = (fileName: string, fileSize: number) => {
    setAttachments((currentAttachments) => {
      const nextAttachments: FeedbackAttachmentItem[] = [];

      for (const attachment of currentAttachments) {
        if (attachment.file.name === fileName && attachment.file.size === fileSize) {
          URL.revokeObjectURL(attachment.previewUrl);
          continue;
        }

        nextAttachments.push(attachment);
      }

      return nextAttachments;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!message.trim()) {
      setError("Nhập nội dung feedback.");
      return;
    }

    const result = await submitUserFeedback({
      category,
      title,
      message,
      targetType,
      targetLabelSnapshot,
      sourceScreen: pathname,
      deviceInfo: typeof navigator === "undefined" ? undefined : navigator.userAgent,
      locale: typeof navigator === "undefined" ? undefined : navigator.language,
      attachments: attachments.map((attachment) => attachment.file),
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setTitle("");
    setMessage("");
    setTargetType("APP");
    setTargetLabelSnapshot("");
    setAttachments((currentAttachments) => {
      for (const attachment of currentAttachments) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return [];
    });
    setSuccessMessage("Đã gửi feedback. Cảm ơn bạn.");
    startTransition(() => {
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
      router.refresh();
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
          Loại feedback
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as (typeof CATEGORY_OPTIONS)[number]["id"])
            }
            className={INPUT_CLASSNAME}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
          Đối tượng
          <select
            value={targetType}
            onChange={(event) =>
              setTargetType(event.target.value as (typeof TARGET_TYPE_OPTIONS)[number]["id"])
            }
            className={INPUT_CLASSNAME}
          >
            {TARGET_TYPE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
        Tiêu đề
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder="Ví dụ: Lỗi audio không phát ở màn Practice"
          className={INPUT_CLASSNAME}
        />
      </label>

      <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
        Nhãn đối tượng
        <input
          type="text"
          value={targetLabelSnapshot}
          onChange={(event) => setTargetLabelSnapshot(event.target.value)}
          maxLength={255}
          placeholder="Tên topic, term, session..."
          className={INPUT_CLASSNAME}
        />
      </label>

      <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
        Nội dung
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={4000}
          placeholder="Mô tả chi tiết lỗi hoặc góp ý của bạn..."
          className={TEXTAREA_CLASSNAME}
        />
      </label>

      <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
        Ảnh đính kèm
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => handleFileChange(event.target.files)}
          className="block w-full rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-3 text-sm text-[#475569] file:mr-3 file:rounded-full file:border-0 file:bg-[#0f172a] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </label>

      {attachments.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {attachments.map((attachment) => (
            <div
              key={`${attachment.file.name}-${attachment.file.size}`}
              className="overflow-hidden rounded-2xl border border-[#dbe4ee] bg-white"
            >
              <div className="relative aspect-[4/3] bg-[#f8fafc]">
                <Image
                  src={attachment.previewUrl}
                  alt={attachment.file.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.file.name, attachment.file.size)}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0f172a]/80 text-white shadow-[0_8px_20px_rgba(15,23,42,0.24)] transition hover:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-label={`Bỏ ảnh ${attachment.file.name}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                    <path
                      d="M7 7l10 10M17 7 7 17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 p-3">
                <div>
                  <p className="truncate text-sm font-semibold text-[#0b0f14]">
                    {attachment.file.name}
                  </p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    {(attachment.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
          {successMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#64748b]">
          Hỗ trợ tối đa 3 ảnh, mỗi ảnh không quá 5MB. Màn hiện tại sẽ tự lưu vào
          `sourceScreen`.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-2xl bg-[#0b0f14] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Đang cập nhật..." : "Gửi feedback"}
        </button>
      </div>
    </form>
  );
}
