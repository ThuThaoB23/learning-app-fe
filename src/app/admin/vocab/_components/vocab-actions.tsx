"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { VocabularyExample, VocabularyResponse } from "@/lib/admin-vocab";
import { getAuthHeader } from "@/lib/client-auth";
import {
  deleteVocab,
  fetchAdminVocabDetail,
  updateVocab,
} from "@/lib/admin-vocab-client";
import LoadingOverlay from "@/components/loading-overlay";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English (en)" },
  { value: "vi", label: "Tiếng Việt (vi)" },
  { value: "ja", label: "Nhật (ja)" },
  { value: "ko", label: "Hàn (ko)" },
];

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
  right: number;
};

type Status = {
  type: "success" | "error";
  message: string;
} | null;

type EditForm = {
  term: string;
  definition: string;
  definitionVi: string;
  examples: EditExample[];
  phonetic: string;
  partOfSpeech: string;
  language: string;
  topicIds: string[];
};

type EditExample = {
  id?: string;
  value: string;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

const canModerateStatus = (status?: string | null) =>
  !status || status === "PENDING";

const normalizeExamples = (
  examples?: Array<string | VocabularyExample> | null,
): EditExample[] => {
  if (!examples || examples.length === 0) {
    return [{ value: "" }];
  }

  const mapped = examples.map((item) => {
    if (typeof item === "string") {
      return { value: item };
    }
    return {
      id: item.id ?? undefined,
      value: item.value ?? "",
    };
  });

  return mapped.length > 0 ? mapped : [{ value: "" }];
};

const createEditForm = (item: VocabularyResponse): EditForm => ({
  term: item.term ?? "",
  definition: item.definition ?? "",
  definitionVi: item.definitionVi ?? "",
  examples: normalizeExamples(item.examples),
  phonetic: item.phonetic ?? "",
  partOfSpeech: item.partOfSpeech ?? "",
  language: item.language ?? "en",
  topicIds: item.topicIds ?? [],
});

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatExamples = (examples?: Array<string | VocabularyExample> | null) => {
  if (!examples || examples.length === 0) {
    return "—";
  }
  return examples
    .map((item) => (typeof item === "string" ? item : item.value))
    .filter((item) => item.trim().length > 0)
    .join(" • ");
};

export default function VocabActions({ vocab, topics }: VocabActionsProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailVocab, setDetailVocab] = useState<VocabularyResponse | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(() => createEditForm(vocab));
  const [topicQuery, setTopicQuery] = useState("");
  const modalVocab = detailVocab ?? vocab;

  const filteredTopics = useMemo(() => {
    const query = topicQuery.trim().toLowerCase();
    if (!query) {
      return topics;
    }
    return topics.filter((topic) => topic.label.toLowerCase().includes(query));
  }, [topicQuery, topics]);

  const selectedTopics = useMemo(
    () =>
      editForm.topicIds
        .map((topicId) => topics.find((topic) => topic.id === topicId))
        .filter((topic): topic is TopicOption => Boolean(topic)),
    [editForm.topicIds, topics],
  );

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
    setShowApprove(false);
    setShowReject(false);
    setShowDelete(false);
    setShowDetail(false);
    setShowEdit(false);
    setStatus(null);
    setDetailVocab(null);
    setEditForm(createEditForm(vocab));
    setTopicQuery("");
  };

  const loadDetail = async () => {
    const result = await fetchAdminVocabDetail<VocabularyResponse>(vocab.id);
    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      return null;
    }
    setDetailVocab(result.data);
    return result.data;
  };

  const handleOpenDetail = async () => {
    setMenuPos(null);
    setStatus(null);
    setShowDetail(true);
    setIsLoading(true);

    const detail = await loadDetail();
    if (!detail) {
      setDetailVocab(vocab);
    }
    setIsLoading(false);
  };

  const handleOpenEdit = async () => {
    setMenuPos(null);
    setStatus(null);
    setEditForm(createEditForm(vocab));
    setTopicQuery("");
    setShowEdit(true);
    setIsLoading(true);

    const detail = await loadDetail();
    if (detail) {
      setEditForm(createEditForm(detail));
    }
    setIsLoading(false);
  };

  const toggleTopic = (topicId: string) => {
    setEditForm((prev) => {
      const exists = prev.topicIds.includes(topicId);
      return {
        ...prev,
        topicIds: exists
          ? prev.topicIds.filter((id) => id !== topicId)
          : [...prev.topicIds, topicId],
      };
    });
  };

  const addExample = () => {
    setEditForm((prev) => ({
      ...prev,
      examples: [...prev.examples, { value: "" }],
    }));
  };

  const updateExample = (index: number, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      examples: prev.examples.map((item, itemIndex) =>
        itemIndex === index ? { ...item, value } : item,
      ),
    }));
  };

  const removeExample = (index: number) => {
    setEditForm((prev) => {
      if (prev.examples.length === 1) {
        return {
          ...prev,
          examples: [{ value: "" }],
        };
      }
      return {
        ...prev,
        examples: prev.examples.filter((_, itemIndex) => itemIndex !== index),
      };
    });
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

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    if (editForm.topicIds.length === 0) {
      setStatus({
        type: "error",
        message: "Vui lòng chọn ít nhất 1 chủ đề.",
      });
      setIsLoading(false);
      return;
    }

    const result = await updateVocab<VocabularyResponse>(vocab.id, editForm);
    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setIsLoading(false);
      return;
    }

    setStatus({
      type: "success",
      message: "Đã cập nhật từ vựng.",
    });
    if (result.data) {
      setDetailVocab(result.data);
    }
    router.refresh();
    setTimeout(closeAll, 600);
    setIsLoading(false);
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

  const canModerate = canModerateStatus(modalVocab.status);
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
              className="fixed z-[120] w-56 rounded-2xl border border-white/10 bg-[#0f172a] p-2 shadow-[0_20px_60px_rgba(6,10,18,0.6)]"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <button
                type="button"
                onClick={handleOpenDetail}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#e7edf3] transition hover:bg-white/10"
              >
                Xem chi tiết
              </button>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#93c5fd] transition hover:bg-white/10"
              >
                Cập nhật
              </button>
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
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={closeAll}
              />
              <div className="relative z-[131] w-full max-w-md rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#e7edf3]">
                    Xóa từ vựng
                  </h2>
                  <button
                    type="button"
                    onClick={closeAll}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <p className="mt-4 text-sm text-[#94a3b8]">
                  Bạn có chắc muốn xóa từ{" "}
                  <span className="font-semibold text-[#e7edf3]">
                    {vocab.term ?? vocab.id}
                  </span>
                  ? Thao tác này sẽ soft delete.
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
                    {isLoading ? "Đang xử lý..." : "Xóa"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {canPortal && showDetail
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={closeAll}
              />
              <div className="relative z-[131] w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#e7edf3]">
                    Chi tiết từ vựng
                  </h2>
                  <button
                    type="button"
                    onClick={closeAll}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <div className="mt-6 space-y-4 text-sm text-[#94a3b8]">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#e7edf3]">Từ vựng</p>
                      <p className="rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3">
                        {modalVocab.term ?? "—"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#e7edf3]">Ngôn ngữ</p>
                      <p className="rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3">
                        {modalVocab.language ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#e7edf3]">Định nghĩa (EN)</p>
                      <p className="min-h-[96px] rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3">
                        {modalVocab.definition ?? "—"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#e7edf3]">Định nghĩa (VI)</p>
                      <p className="min-h-[96px] rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3">
                        {modalVocab.definitionVi ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#e7edf3]">Phiên âm</p>
                      <p className="rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3">
                        {modalVocab.phonetic ?? "—"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#e7edf3]">Từ loại</p>
                      <p className="rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3">
                        {modalVocab.partOfSpeech ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#e7edf3]">Ví dụ</p>
                    <p className="rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3">
                      {formatExamples(modalVocab.examples)}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#e7edf3]">Trạng thái</p>
                      <p className="rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3">
                        {modalVocab.status ?? "—"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#e7edf3]">Cập nhật</p>
                      <p className="rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3">
                        {formatDateTime(modalVocab.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {canPortal && showEdit
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={closeAll}
              />
              <div className="relative z-[131] w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#e7edf3]">
                    Cập nhật từ vựng
                  </h2>
                  <button
                    type="button"
                    onClick={closeAll}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleUpdate}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Từ vựng
                      <input
                        value={editForm.term}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            term: event.target.value,
                          }))
                        }
                        required
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Ngôn ngữ
                      <select
                        value={editForm.language}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            language: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      >
                        {LANGUAGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Định nghĩa (EN)
                      <textarea
                        value={editForm.definition}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            definition: event.target.value,
                          }))
                        }
                        required
                        className="min-h-[96px] w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Định nghĩa (VI)
                      <textarea
                        value={editForm.definitionVi}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            definitionVi: event.target.value,
                          }))
                        }
                        className="min-h-[96px] w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Phiên âm
                      <input
                        value={editForm.phonetic}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            phonetic: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Từ loại
                      <input
                        value={editForm.partOfSpeech}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            partOfSpeech: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#e7edf3]">Ví dụ</p>
                      <button
                        type="button"
                        onClick={addExample}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                      >
                        <span className="text-sm leading-none">+</span>
                        Thêm ví dụ
                      </button>
                    </div>
                    <div className="space-y-2 rounded-xl border border-white/10 bg-[#0b0f14]/60 p-3">
                      {editForm.examples.map((example, index) => (
                        <div key={`edit-example-${index}`} className="flex gap-2">
                          <input
                            value={example.value}
                            onChange={(event) =>
                              updateExample(index, event.target.value)
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                            placeholder={`Ví dụ ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeExample(index)}
                            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                            aria-label={`Xóa ví dụ ${index + 1}`}
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#e7edf3]">Chủ đề</p>
                    {topics.length === 0 ? (
                      <p className="rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-xs text-[#94a3b8]">
                        Không có chủ đề nào đang hoạt động.
                      </p>
                    ) : (
                      <div className="space-y-3 rounded-xl border border-white/10 bg-[#0b0f14]/60 p-3">
                        <div className="flex flex-wrap gap-2">
                          {selectedTopics.length === 0 ? (
                            <span className="text-xs text-[#64748b]">
                              Chưa chọn chủ đề nào
                            </span>
                          ) : (
                            selectedTopics.map((topic) => (
                              <button
                                key={`edit-selected-${topic.id}`}
                                type="button"
                                onClick={() => toggleTopic(topic.id)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#34d399]/30 bg-[#34d399]/10 px-3 py-1 text-xs font-semibold text-[#86efac] transition hover:bg-[#34d399]/20"
                              >
                                <span className="max-w-[180px] truncate">{topic.label}</span>
                                <span aria-hidden>x</span>
                              </button>
                            ))
                          )}
                        </div>

                        <input
                          value={topicQuery}
                          onChange={(event) => setTopicQuery(event.target.value)}
                          placeholder="Tìm chủ đề để chọn..."
                          className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-2 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        />

                        <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-[#0b0f14]/40 p-2">
                          {filteredTopics.length === 0 ? (
                            <p className="px-2 py-2 text-xs text-[#64748b]">
                              Không tìm thấy chủ đề phù hợp.
                            </p>
                          ) : (
                            filteredTopics.map((topic) => {
                              const checked = editForm.topicIds.includes(topic.id);
                              return (
                                <button
                                  key={`edit-topic-${topic.id}`}
                                  type="button"
                                  onClick={() => toggleTopic(topic.id)}
                                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                                    checked
                                      ? "border border-[#34d399]/35 bg-[#34d399]/12 text-[#d1fae5]"
                                      : "border border-transparent text-[#e7edf3] hover:bg-white/10"
                                  }`}
                                >
                                  <span className="truncate">{topic.label}</span>
                                  <span
                                    className={`ml-3 text-xs font-semibold ${
                                      checked ? "text-[#86efac]" : "text-[#64748b]"
                                    }`}
                                  >
                                    {checked ? "Đã chọn" : "Chọn"}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                        <p className="text-xs text-[#64748b]">
                          Đã chọn {editForm.topicIds.length} chủ đề.
                        </p>
                      </div>
                    )}
                  </div>

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

                  <div className="flex items-center justify-end gap-3">
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
                      {isLoading ? "Đang lưu..." : "Lưu cập nhật"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {canPortal && showApprove
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
                      Duyệt từ vựng
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
                  Bạn có chắc muốn duyệt từ{" "}
                  <span className="font-semibold text-[#e7edf3]">
                    {vocab.term ?? vocab.id}
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
                    onClick={() => handleModerate("approve")}
                    className="rounded-full bg-[#34d399]/20 px-4 py-2 text-sm font-semibold text-[#34d399] transition-all duration-200 ease-out hover:bg-[#34d399]/30 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? "Đang xử lý..." : "Duyệt"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {canPortal && showReject
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
                      Từ chối từ vựng
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
                  Bạn có chắc muốn từ chối{" "}
                  <span className="font-semibold text-[#e7edf3]">
                    {vocab.term ?? vocab.id}
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
                    onClick={() => handleModerate("reject")}
                    className="rounded-full bg-[#fb7185]/20 px-4 py-2 text-sm font-semibold text-[#fb7185] transition-all duration-200 ease-out hover:bg-[#fb7185]/30 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? "Đang xử lý..." : "Từ chối"}
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
