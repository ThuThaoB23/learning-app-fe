"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createSelectedVocabularySession,
  fetchMyVocabClient,
} from "@/lib/user-actions-client";
import { pushSessionHistoryId } from "@/lib/session-history";

type UserVocabularyItem = {
  id: string;
  term?: string | null;
  vocabularyId?: string | null;
  status?: string | null;
  progress?: number | null;
  process?: number | null;
  vocabulary?: {
    id?: string | null;
    term?: string | null;
    definition?: string | null;
    definitionVi?: string | null;
    phonetic?: string | null;
    language?: string | null;
  } | null;
};

type SelectedVocabularyMeta = {
  vocabularyId: string;
  term: string;
};

type SelectedVocabularySessionData = {
  id?: string;
};

const STATUS_FILTERS = [
  { id: "ALL", label: "Tất cả" },
  { id: "NEW", label: "Mới" },
  { id: "LEARNING", label: "Đang học" },
  { id: "MASTERED", label: "Đã nhớ" },
] as const;

const QUESTION_TYPE_OPTIONS = [
  {
    id: "MULTIPLE_CHOICE",
    label: "Trắc nghiệm",
  },
  {
    id: "LISTEN_AND_CHOOSE",
    label: "Nghe và chọn",
  },
  {
    id: "FILL_MISSING_CHARS",
    label: "Điền ký tự",
  },
  {
    id: "TRANSLATE_TO_VI",
    label: "Dịch sang Việt",
  },
  {
    id: "TRANSLATE_TO_EN",
    label: "Dịch sang Anh",
  },
  {
    id: "ACTIVE_RECALL_FULL_WORD",
    label: "Gõ lại từ",
  },
] as const;

const PAGE_SIZE = 12;

const resolveVocabularyId = (item: UserVocabularyItem) =>
  item.vocabularyId?.trim() || item.vocabulary?.id?.trim() || "";

const resolveTerm = (item: UserVocabularyItem) =>
  item.term?.trim() || item.vocabulary?.term?.trim() || resolveVocabularyId(item) || "--";

const resolveDefinition = (item: UserVocabularyItem) =>
  item.vocabulary?.definitionVi?.trim() ||
  item.vocabulary?.definition?.trim() ||
  "Chưa có mô tả cho từ này.";

const normalizeSearchValue = (value?: string | null) => value?.trim().toLowerCase() || "";

const matchesQuery = (item: UserVocabularyItem, query: string) => {
  if (!query) {
    return true;
  }

  const haystacks = [
    item.term,
    item.vocabulary?.term,
    item.vocabulary?.definition,
    item.vocabulary?.definitionVi,
    item.vocabulary?.phonetic,
  ];

  return haystacks.some((value) => normalizeSearchValue(value).includes(query));
};

const resolveStatusLabel = (item: UserVocabularyItem) => {
  const normalized = (item.status || "NEW").toUpperCase();
  if (normalized === "MASTERED") {
    return "Đã nhớ";
  }
  if (normalized === "LEARNING") {
    return "Đang học";
  }
  return "Mới";
};

export default function StartSelectedVocabSessionForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = useMemo(
    () => normalizeSearchValue(deferredQuery),
    [deferredQuery],
  );
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]["id"]>("ALL");
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<UserVocabularyItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<UserVocabularyItem[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedVocab, setSelectedVocab] = useState<Record<string, SelectedVocabularyMeta>>({});
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([
    "MULTIPLE_CHOICE",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (normalizedQuery) {
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      setFilteredItems(null);

      const result = await fetchMyVocabClient({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        size: PAGE_SIZE,
        sort: "updatedAt,desc",
      });

      if (!active) {
        return;
      }

      if (!result.ok) {
        setItems([]);
        setTotalPages(1);
        setTotalElements(0);
        setLoadError(result.message);
        setLoading(false);
        return;
      }

      setItems(result.data.content ?? []);
      setTotalPages(Math.max(1, result.data.totalPages ?? 1));
      setTotalElements(result.data.totalElements ?? 0);
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [normalizedQuery, page, statusFilter]);

  useEffect(() => {
    if (!normalizedQuery) {
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setLoadError(null);

      const firstPage = await fetchMyVocabClient({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page: 0,
        size: 100,
        sort: "updatedAt,desc",
      });

      if (!active) {
        return;
      }

      if (!firstPage.ok) {
        setItems([]);
        setFilteredItems([]);
        setTotalPages(1);
        setTotalElements(0);
        setLoadError(firstPage.message);
        setLoading(false);
        return;
      }

      const totalRemotePages = Math.max(1, firstPage.data.totalPages ?? 1);
      const remainingPageIndexes = Array.from(
        { length: Math.max(0, totalRemotePages - 1) },
        (_, index) => index + 1,
      );

      const remainingPages = await Promise.all(
        remainingPageIndexes.map((pageIndex) =>
          fetchMyVocabClient({
            status: statusFilter === "ALL" ? undefined : statusFilter,
            page: pageIndex,
            size: 100,
            sort: "updatedAt,desc",
          }),
        ),
      );

      if (!active) {
        return;
      }

      const failedPage = remainingPages.find((result) => !result.ok);
      if (failedPage && !failedPage.ok) {
        setItems([]);
        setFilteredItems([]);
        setTotalPages(1);
        setTotalElements(0);
        setLoadError(failedPage.message);
        setLoading(false);
        return;
      }

      const allItems = [
        ...(firstPage.data.content ?? []),
        ...remainingPages.flatMap((result) => (result.ok ? result.data.content ?? [] : [])),
      ];
      const nextFilteredItems = allItems.filter((item) => matchesQuery(item, normalizedQuery));

      setItems([]);
      setFilteredItems(nextFilteredItems);
      setTotalElements(nextFilteredItems.length);
      setTotalPages(Math.max(1, Math.ceil(nextFilteredItems.length / PAGE_SIZE)));
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [normalizedQuery, statusFilter]);

  const visibleItems = useMemo(() => {
    if (!filteredItems) {
      return items;
    }

    const startIndex = page * PAGE_SIZE;
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredItems, items, page]);

  const selectedCount = useMemo(() => Object.keys(selectedVocab).length, [selectedVocab]);
  const selectedPreview = useMemo(
    () => Object.values(selectedVocab).slice(0, 6),
    [selectedVocab],
  );

  const visibleSelectableItems = useMemo(
    () =>
      visibleItems
        .map((item) => ({
          vocabularyId: resolveVocabularyId(item),
          term: resolveTerm(item),
        }))
        .filter((item) => Boolean(item.vocabularyId)),
    [visibleItems],
  );

  const allVisibleSelected =
    visibleSelectableItems.length > 0 &&
    visibleSelectableItems.every((item) => Boolean(selectedVocab[item.vocabularyId]));

  const toggleVocabulary = (item: UserVocabularyItem) => {
    const vocabularyId = resolveVocabularyId(item);
    if (!vocabularyId) {
      return;
    }

    const term = resolveTerm(item);
    setSelectedVocab((prev) => {
      if (prev[vocabularyId]) {
        const next = { ...prev };
        delete next[vocabularyId];
        return next;
      }

      return {
        ...prev,
        [vocabularyId]: {
          vocabularyId,
          term,
        },
      };
    });
  };

  const toggleQuestionType = (questionType: string) => {
    setSelectedQuestionTypes((prev) =>
      prev.includes(questionType)
        ? prev.filter((item) => item !== questionType)
        : [...prev, questionType],
    );
  };

  const toggleVisibleSelection = () => {
    setSelectedVocab((prev) => {
      const next = { ...prev };
      if (allVisibleSelected) {
        for (const item of visibleSelectableItems) {
          delete next[item.vocabularyId];
        }
        return next;
      }

      for (const item of visibleSelectableItems) {
        next[item.vocabularyId] = item;
      }
      return next;
    });
  };

  const handleStart = async () => {
    setSubmitError(null);

    if (selectedCount === 0) {
      setSubmitError("Chọn ít nhất 1 từ vựng để tạo phiên.");
      return;
    }

    if (selectedQuestionTypes.length === 0) {
      setSubmitError("Chọn ít nhất 1 dạng câu hỏi.");
      return;
    }

    setIsSubmitting(true);
    const result = await createSelectedVocabularySession<SelectedVocabularySessionData>({
      vocabularyIds: Object.keys(selectedVocab),
      questionTypes: selectedQuestionTypes,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    const sessionId = result.data?.id;
    if (!sessionId) {
      setSubmitError("Đã tạo phiên nhưng thiếu mã session.");
      return;
    }

    pushSessionHistoryId(sessionId);
    startTransition(() => {
      router.push(`/dashboard/practice/${sessionId}`);
      router.refresh();
    });
  };

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,_1fr)_320px]">
      <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-3 border-b border-[#e2e8f0] pb-4 md:flex-row md:items-end md:justify-between">
          <label className="block flex-1 space-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
            Chọn từ
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Nhập term hoặc nghĩa..."
              className="w-full rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-sm font-medium normal-case tracking-normal text-[#0b0f14] outline-none transition focus:border-[#0b0f14]"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setStatusFilter(item.id);
                  setPage(0);
                }}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  statusFilter === item.id
                    ? "border-[#0b0f14] bg-[#0b0f14] text-white"
                    : "border-[#cbd5e1] bg-white text-[#475569] hover:border-[#0b0f14]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-[#64748b]">
            {loading ? "Đang tải danh sách..." : `Tìm thấy ${totalElements} từ phù hợp`}
          </p>
          <button
            type="button"
            onClick={toggleVisibleSelection}
            disabled={loading || visibleSelectableItems.length === 0}
            className="rounded-full border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {allVisibleSelected ? "Bỏ chọn trang này" : "Chọn trang này"}
          </button>
        </div>

        {loadError ? (
          <p className="mt-4 rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">
            {loadError}
          </p>
        ) : null}

        <div className="mt-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-8 text-center text-sm text-[#64748b]">
              Đang tải danh sách từ của bạn...
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-8 text-center text-sm text-[#64748b]">
              {normalizedQuery || statusFilter !== "ALL"
                ? "Không có từ nào khớp bộ lọc hiện tại."
                : "Bạn chưa có từ nào trong danh sách cá nhân."}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
              <div className="grid grid-cols-[auto_minmax(0,_1fr)_auto] gap-3 border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                <span>Chọn</span>
                <span>Từ vựng</span>
                <span>Trạng thái</span>
              </div>

              <div className="divide-y divide-[#e2e8f0]">
                {visibleItems.map((item) => {
                  const vocabularyId = resolveVocabularyId(item);
                  const term = resolveTerm(item);
                  const definition = resolveDefinition(item);
                  const checked = Boolean(selectedVocab[vocabularyId]);
                  const statusLabel = resolveStatusLabel(item);

                  return (
                    <label
                      key={item.id}
                      className={`grid cursor-pointer grid-cols-[auto_minmax(0,_1fr)_auto] items-center gap-3 px-4 py-3 transition ${
                        checked ? "bg-[#f8fafc]" : "bg-white hover:bg-[#fcfcfd]"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleVocabulary(item)}
                          disabled={!vocabularyId}
                          className="h-4 w-4 rounded border-[#cbd5e1] text-[#0b0f14] focus:ring-[#0b0f14]"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-[#0b0f14]">
                            {term}
                          </p>
                          {checked ? (
                            <span className="rounded-full bg-[#0f172a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                              Chọn
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-[#64748b]">{definition}</p>
                      </div>

                      <span className="text-xs font-medium text-[#64748b]">
                        {statusLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] pt-4">
          <p className="text-sm text-[#64748b]">
            Trang <span className="font-semibold text-[#0b0f14]">{page + 1}</span> /{" "}
            <span className="font-semibold text-[#0b0f14]">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={loading || page === 0}
              className="rounded-full border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={loading || page >= totalPages - 1}
              className="rounded-full border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sau
            </button>
          </div>
        </div>
      </section>

      <aside className="xl:sticky xl:top-24">
        <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#0b0f14]">
              {selectedCount} từ • {selectedQuestionTypes.length} dạng
            </p>
            <button
              type="button"
              onClick={() => setSelectedQuestionTypes([])}
              disabled={selectedQuestionTypes.length === 0}
              className="text-xs font-semibold text-[#475569] transition hover:text-[#0b0f14] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Bỏ hết dạng
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUESTION_TYPE_OPTIONS.map((item) => {
              const active = selectedQuestionTypes.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleQuestionType(item.id)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "border-[#0b0f14] bg-[#0b0f14] text-white"
                      : "border-[#cbd5e1] bg-white text-[#0b0f14] hover:border-[#0b0f14]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
            {selectedPreview.length === 0 ? (
              <p className="text-sm text-[#64748b]">
                Chưa có từ nào được chọn cho phiên này.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedPreview.map((item) => (
                  <button
                    key={item.vocabularyId}
                    type="button"
                    onClick={() =>
                      setSelectedVocab((prev) => {
                        const next = { ...prev };
                        delete next[item.vocabularyId];
                        return next;
                      })
                    }
                    className="rounded-full border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
                  >
                    {item.term}
                  </button>
                ))}
                {selectedCount > selectedPreview.length ? (
                  <span className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748b]">
                    +{selectedCount - selectedPreview.length} từ
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {submitError ? (
            <p className="mt-4 rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">
              {submitError}
            </p>
          ) : null}

          <Link
            href="/dashboard/vocab"
            className="mt-4 inline-flex text-xs font-semibold text-[#475569] underline-offset-4 hover:text-[#0b0f14] hover:underline"
          >
            Mở My Vocab
          </Link>

          <button
            type="button"
            onClick={handleStart}
            disabled={loading || isSubmitting || isPending}
            className="mt-4 w-full rounded-2xl bg-[#0b0f14] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting || isPending ? "Đang tạo phiên..." : "Bắt đầu phiên tự chọn"}
          </button>
        </section>
      </aside>
    </div>
  );
}
