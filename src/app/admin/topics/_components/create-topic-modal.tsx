"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminTopic } from "@/lib/admin-topics-client";
import LoadingOverlay from "@/components/loading-overlay";

export default function CreateTopicModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setStatus(null);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const result = await createAdminTopic({
      name: form.name,
      description: form.description,
    });

    if (!result.ok) {
      setStatus({
        type: "error",
        message: result.message,
      });
      setIsLoading(false);
      return;
    }

    setStatus({ type: "success", message: "Tạo chủ đề thành công." });
    setForm({ name: "", description: "" });
    router.refresh();
    setTimeout(handleClose, 600);
    setIsLoading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#e7edf3] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5"
      >
        Tạo chủ đề
      </button>

      {open && mounted
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={handleClose}
              />
              <div
                role="dialog"
                aria-modal="true"
                className="relative z-[101] w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]"
              >
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#e7edf3]">
                      Tạo chủ đề mới
                    </h2>
                  </div>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                    Tên chủ đề
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      placeholder="Ví dụ: Basic English"
                    />
                  </label>

                  <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                    Mô tả
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="min-h-[120px] w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      placeholder="Mô tả ngắn về chủ đề"
                    />
                  </label>

                  {status ? (
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        status.type === "success"
                          ? "bg-[#34d399]/15 text-[#34d399]"
                          : "bg-[#fb7185]/15 text-[#fb7185]"
                      }`}
                    >
                      {status.message}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="rounded-full bg-[#e7edf3] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading ? "Đang tạo..." : "Tạo chủ đề"}
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
