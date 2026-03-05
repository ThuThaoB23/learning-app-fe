"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { VocabularyResponse } from "@/lib/admin-vocab";
import { getAuthHeader } from "@/lib/client-auth";
import { deleteVocab } from "@/lib/admin-vocab-client";
import LoadingOverlay from "@/components/loading-overlay";

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type VocabActionsProps = {
  vocab: VocabularyResponse;
  topics: TopicOption[];
};

type TopicOption = {
  id: string;
  label: string;
};

type MenuPos = {
  top: number;
  left: number;
  width: number;
};

type Status = {
  type: "success" | "error";
  message: string;
} | null;

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

type ConfirmDialogProps = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmTone: "danger" | "success" | "warning";
  isLoading: boolean;
  status: Status;
  onClose: () => void;
  onConfirm: () => void;
};

const canModerateStatus = (status?: string | null) =>
  !status || status === "PENDING";

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmTone,
  isLoading,
  status,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const confirmClassName =
    confirmTone === "danger"
      ? "bg-[#fb7185]/20 text-[#fb7185] hover:bg-[#fb7185]/30"
      : confirmTone === "success"
        ? "bg-[#34d399]/20 text-[#34d399] hover:bg-[#34d399]/30"
        : "bg-[#fbbf24]/20 text-[#fbbf24] hover:bg-[#fbbf24]/30";

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-[131] w-full max-w-md rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
        <LoadingOverlay show={isLoading} />
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[#e7edf3]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
          >
            Đóng
          </button>
        </div>

        <div className="mt-4 text-sm text-[#94a3b8]">{description}</div>

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
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition hover:bg-white/10"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${confirmClassName}`}
          >
            {isLoading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VocabActions({ vocab }: VocabActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailVocab, setDetailVocab] = useState<VocabularyResponse | null>(null);

  const currentListHref = `${pathname}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const detailHref = `${pathname}/${vocab.id}?returnTo=${encodeURIComponent(
    currentListHref,
  )}`;
  const editHref = `${pathname}/${vocab.id}/edit?returnTo=${encodeURIComponent(
    currentListHref,
  )}`;

  useEffect(() => {
    if (!menuPos) {
      return;
    }

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
    if (!buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const screenPadding = 8;
    const maxMenuWidth = Math.max(160, viewportWidth - screenPadding * 2);
    const menuWidth = Math.min(224, maxMenuWidth);
    const preferredLeft = rect.right - menuWidth;
    const maxLeft = viewportWidth - menuWidth - screenPadding;
    const left = Math.min(
      Math.max(preferredLeft, screenPadding),
      Math.max(screenPadding, maxLeft),
    );

    setMenuPos({
      top: rect.bottom + 8,
      left,
      width: menuWidth,
    });
  };

  const closeAll = () => {
    setMenuPos(null);
    setShowApprove(false);
    setShowReject(false);
    setShowDelete(false);
    setStatus(null);
    setDetailVocab(null);
  };

  const requireAuth = () => {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      setStatus({
        type: "error",
        message: "Bạn chưa đăng nhập hoặc phiên đã hết hạn.",
      });
      return null;
    }
    return authHeader;
  };

  const handleModerate = async (action: "approve" | "reject") => {
    setIsLoading(true);
    setStatus(null);
    const authHeader = requireAuth();
    if (!authHeader) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/vocab/${vocab.id}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: authHeader,
          },
        },
      );

      const data = (await response.json().catch(() => null)) as
        | (VocabularyResponse & ApiErrorResponse)
        | null;

      if (!response.ok) {
        setStatus({
          type: "error",
          message:
            data?.message ?? data?.error ?? "Không thể cập nhật từ vựng.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: action === "approve" ? "Đã duyệt từ vựng." : "Đã từ chối.",
      });
      if (data) {
        setDetailVocab(data);
      }
      router.refresh();
      setTimeout(closeAll, 500);
    } catch {
      setStatus({
        type: "error",
        message: "Không thể kết nối máy chủ. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setStatus(null);

    const result = await deleteVocab(vocab.id);
    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setIsLoading(false);
      return;
    }

    setStatus({
      type: "success",
      message: "Đã xóa từ vựng.",
    });
    router.refresh();
    setTimeout(closeAll, 500);
    setIsLoading(false);
  };

  const canModerate = canModerateStatus(detailVocab?.status ?? vocab.status);
  const canPortal = typeof document !== "undefined";

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

      {canPortal && menuPos
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[120] rounded-2xl border border-white/10 bg-[#0f172a] p-2 shadow-[0_20px_60px_rgba(6,10,18,0.6)]"
              style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
            >
              <Link
                href={detailHref}
                onClick={() => setMenuPos(null)}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#e7edf3] transition hover:bg-white/10"
              >
                Xem chi tiết
              </Link>
              <Link
                href={editHref}
                onClick={() => setMenuPos(null)}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#93c5fd] transition hover:bg-white/10"
              >
                Cập nhật
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuPos(null);
                  setStatus(null);
                  setShowDelete(true);
                }}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#f87171] transition hover:bg-white/10"
              >
                Xóa từ vựng
              </button>
              <button
                type="button"
                disabled={!canModerate}
                onClick={() => {
                  setMenuPos(null);
                  setStatus(null);
                  setShowApprove(true);
                }}
                className={`flex w-full items-center rounded-xl px-3 py-2 text-sm transition ${
                  canModerate
                    ? "text-[#34d399] hover:bg-white/10"
                    : "cursor-not-allowed text-[#475569]"
                }`}
              >
                Duyệt từ vựng
              </button>
              <button
                type="button"
                disabled={!canModerate}
                onClick={() => {
                  setMenuPos(null);
                  setStatus(null);
                  setShowReject(true);
                }}
                className={`flex w-full items-center rounded-xl px-3 py-2 text-sm transition ${
                  canModerate
                    ? "text-[#fb7185] hover:bg-white/10"
                    : "cursor-not-allowed text-[#475569]"
                }`}
              >
                Từ chối
              </button>
            </div>,
            document.body,
          )
        : null}

      {canPortal && showDelete
        ? createPortal(
            <ConfirmDialog
              title="Xóa từ vựng"
              description={
                <p>
                  Bạn có chắc muốn xóa từ{" "}
                  <span className="font-semibold text-[#e7edf3]">
                    {vocab.term ?? vocab.id}
                  </span>
                  ? Thao tác này sẽ soft delete.
                </p>
              }
              confirmLabel="Xóa"
              confirmTone="danger"
              isLoading={isLoading}
              status={status}
              onClose={closeAll}
              onConfirm={() => {
                void handleDelete();
              }}
            />,
            document.body,
          )
        : null}

      {canPortal && showApprove
        ? createPortal(
            <ConfirmDialog
              title="Duyệt từ vựng"
              description={
                <p>
                  Sau khi duyệt, từ{" "}
                  <span className="font-semibold text-[#e7edf3]">
                    {vocab.term ?? vocab.id}
                  </span>{" "}
                  sẽ chuyển sang trạng thái <strong>APPROVED</strong>.
                </p>
              }
              confirmLabel="Duyệt"
              confirmTone="success"
              isLoading={isLoading}
              status={status}
              onClose={closeAll}
              onConfirm={() => {
                void handleModerate("approve");
              }}
            />,
            document.body,
          )
        : null}

      {canPortal && showReject
        ? createPortal(
            <ConfirmDialog
              title="Từ chối từ vựng"
              description={
                <p>
                  Từ{" "}
                  <span className="font-semibold text-[#e7edf3]">
                    {vocab.term ?? vocab.id}
                  </span>{" "}
                  sẽ bị chuyển sang trạng thái <strong>REJECTED</strong>.
                </p>
              }
              confirmLabel="Từ chối"
              confirmTone="warning"
              isLoading={isLoading}
              status={status}
              onClose={closeAll}
              onConfirm={() => {
                void handleModerate("reject");
              }}
            />,
            document.body,
          )
        : null}
    </>
  );
}
