"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TopicResponse } from "@/lib/admin-topics";
import { deleteAdminTopic, updateAdminTopic } from "@/lib/admin-topics-client";
import LoadingOverlay from "@/components/loading-overlay";

type TopicActionsProps = {
  topic: TopicResponse;
};

type MenuPos = {
  top: number;
  right: number;
};

type Status = {
  type: "success" | "error";
  message: string;
} | null;

const statusOptions = ["ACTIVE", "INACTIVE"] as const;

const statusLabels: Record<(typeof statusOptions)[number], string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
};

export default function TopicActions({ topic }: TopicActionsProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: topic.name ?? topic.title ?? "",
    description: topic.description ?? "",
    status: topic.status ?? "ACTIVE",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setForm({
      name: topic.name ?? topic.title ?? "",
      description: topic.description ?? "",
      status: topic.status ?? "ACTIVE",
    });
  }, [topic]);

  useEffect(() => {
    if (!menuPos) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedButton =
        buttonRef.current && buttonRef.current.contains(target);
      const clickedMenu = menuRef.current && menuRef.current.contains(target);
      if (!clickedButton && !clickedMenu) {
        setMenuPos(null);
      }
    };

    const handleScroll = () => setMenuPos(null);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [menuPos]);

  const openMenu = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  };

  const closeAll = () => {
    setShowEdit(false);
    setShowConfirm(false);
    setStatus(null);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const result = await updateAdminTopic(topic.id, {
      name: form.name,
      description: form.description,
      status: form.status,
    });

    if (!result.ok) {
      setStatus({
        type: "error",
        message: result.message,
      });
      setIsLoading(false);
      return;
    }

    setStatus({ type: "success", message: "Cập nhật thành công." });
    router.refresh();
    setTimeout(closeAll, 500);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setStatus(null);

    const result = await deleteAdminTopic(topic.id);
    if (!result.ok) {
      setStatus({
        type: "error",
        message: result.message,
      });
      setIsLoading(false);
      return;
    }

    setStatus({ type: "success", message: "Đã xóa chủ đề." });
    router.refresh();
    setTimeout(closeAll, 500);
    setIsLoading(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (menuPos ? setMenuPos(null) : openMenu())}
        className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
      >
        ...
      </button>

      {mounted && menuPos
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[120] w-48 rounded-2xl border border-white/10 bg-[#0f172a] p-2 shadow-[0_20px_60px_rgba(6,10,18,0.6)]"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuPos(null);
                  setStatus(null);
                  setShowEdit(true);
                }}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#e7edf3] transition hover:bg-white/10"
              >
                Sửa chủ đề
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuPos(null);
                  setStatus(null);
                  setShowConfirm(true);
                }}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#fb7185] transition hover:bg-white/10"
              >
                Xóa chủ đề
              </button>
            </div>,
            document.body,
          )
        : null}

      {mounted && showEdit
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={closeAll}
              />
              <div className="relative z-[131] w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#e7edf3]">
                      Cập nhật chủ đề
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeAll}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleUpdate}>
                  <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                    Tên chủ đề
                    <input
                      name="name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                    />
                  </label>

                  <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                    Mô tả
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      className="min-h-[120px] w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                    />
                  </label>

                  <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                    Trạng thái
                    <select
                      name="status"
                      value={form.status}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {statusLabels[option]}
                        </option>
                      ))}
                    </select>
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
                      onClick={closeAll}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="rounded-full bg-[#e7edf3] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {mounted && showConfirm
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={closeAll}
              />
              <div className="relative z-[131] w-full max-w-md rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#e7edf3]">
                      Xóa chủ đề
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeAll}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <p className="mt-4 text-sm text-[#94a3b8]">
                  Bạn chắc chắn muốn xóa chủ đề{" "}
                  <span className="font-semibold text-[#e7edf3]">
                    {topic.name || topic.title || topic.id}
                  </span>
                  ?
                </p>

                {status ? (
                  <div
                    className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                      status.type === "success"
                        ? "bg-[#34d399]/15 text-[#34d399]"
                        : "bg-[#fb7185]/15 text-[#fb7185]"
                    }`}
                  >
                    {status.message}
                  </div>
                ) : null}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAll}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleDelete}
                    className="rounded-full bg-[#fb7185]/20 px-4 py-2 text-sm font-semibold text-[#fb7185] transition-all duration-200 ease-out hover:bg-[#fb7185]/30 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? "Đang xử lý..." : "Xóa chủ đề"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
