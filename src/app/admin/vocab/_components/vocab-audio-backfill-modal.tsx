"use client";

import { createPortal } from "react-dom";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/loading-overlay";
import {
  backfillVocabAudio,
  type VocabularyAudioBackfillResponse,
} from "@/lib/admin-vocab-client";

type Status = {
  type: "success" | "error";
  message: string;
} | null;

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

const createInitialForm = () => ({
  language: "en",
  status: "",
  forceRefresh: false,
  batchSize: "100",
  limit: "",
});

export default function VocabAudioBackfillModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [form, setForm] = useState(createInitialForm);
  const [result, setResult] = useState<VocabularyAudioBackfillResponse | null>(
    null,
  );

  const handleClose = () => {
    setOpen(false);
    setStatus(null);
    setResult(null);
    setForm(createInitialForm());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);
    setResult(null);

    const batchSize = Number(form.batchSize);
    const limit = form.limit.trim() ? Number(form.limit) : undefined;

    if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 500) {
      setStatus({
        type: "error",
        message: "Batch size phải là số nguyên trong khoảng 1 đến 500.",
      });
      setIsLoading(false);
      return;
    }

    if (
      limit !== undefined &&
      (!Number.isInteger(limit) || limit < 1)
    ) {
      setStatus({
        type: "error",
        message: "Limit phải là số nguyên lớn hơn 0.",
      });
      setIsLoading(false);
      return;
    }

    const response = await backfillVocabAudio({
      language: form.language,
      status: form.status || undefined,
      forceRefresh: form.forceRefresh,
      batchSize,
      limit,
    });

    if (!response.ok) {
      setStatus({ type: "error", message: response.message });
      setIsLoading(false);
      return;
    }

    if (!response.data) {
      setStatus({
        type: "error",
        message: "API không trả về kết quả cập nhật sound.",
      });
      setIsLoading(false);
      return;
    }

    setResult(response.data);
    setStatus({
      type: "success",
      message: `Đã xử lý ${response.data.processed} từ vựng, cập nhật ${response.data.updated} sound.`,
    });
    router.refresh();
    setIsLoading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-[#38bdf8]/25 bg-[#38bdf8]/10 px-4 py-2 text-sm font-semibold text-[#bae6fd] transition-all duration-200 ease-out hover:bg-[#38bdf8]/20"
      >
        Cập nhật sound
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={handleClose}
              />
              <div className="relative z-[131] w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#e7edf3]">
                      Cập nhật sound hệ thống
                    </h2>
                    <p className="mt-1 text-sm text-[#94a3b8]">
                      Backfill audio cho vocab cũ từ dictionary API.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Ngôn ngữ
                      <input
                        value={form.language}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            language: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="en"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Trạng thái vocab
                      <select
                        value={form.status}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            status: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value || "all"} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Batch size
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={form.batchSize}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            batchSize: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Limit
                      <input
                        type="number"
                        min={1}
                        value={form.limit}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            limit: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="Để trống để chạy hết"
                      />
                    </label>
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#cbd5e1]">
                    <input
                      type="checkbox"
                      checked={form.forceRefresh}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          forceRefresh: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#38bdf8] focus:ring-[#38bdf8]/30"
                    />
                    <span>
                      Force refresh để quét lại cả vocab đã có audio. Nếu tắt,
                      hệ thống chỉ xử lý vocab chưa có sound.
                    </span>
                  </label>

                  {status ? (
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        status.type === "success"
                          ? "bg-[#34d399]/15 text-[#86efac]"
                          : "bg-[#fb7185]/15 text-[#fda4af]"
                      }`}
                    >
                      {status.message}
                    </div>
                  ) : null}

                  {result ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">
                          Processed
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#e7edf3]">
                          {result.processed}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#34d399]/20 bg-[#34d399]/10 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#86efac]">
                          Updated
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#dcfce7]">
                          {result.updated}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#fbbf24]/20 bg-[#fbbf24]/10 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#fde68a]">
                          Skipped
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#fef3c7]">
                          {result.skipped}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#fb7185]/20 bg-[#fb7185]/10 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#fda4af]">
                          Failed
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#ffe4e6]">
                          {result.failed}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition hover:bg-white/10"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="rounded-full bg-[#38bdf8] px-4 py-2 text-sm font-semibold text-[#082f49] transition-all duration-200 ease-out hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading ? "Đang xử lý..." : "Chạy cập nhật"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
