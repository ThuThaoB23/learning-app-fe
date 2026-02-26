"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AddToMyVocabButton from "./add-to-my-vocab-button";
import { createVocabContribution } from "@/lib/admin-vocab-client";
import type { VocabularyContributionResponse } from "@/lib/user-api";
import {
  searchVocabClient,
  type VocabularySearchItem,
} from "@/lib/user-actions-client";

type TopicOption = {
  id: string;
  label: string;
};

type UserVocabContributionFormProps = {
  topics: TopicOption[];
  initialTerm?: string;
};

type FormState = {
  term: string;
  definition: string;
  definitionVi: string;
  examples: string[];
  phonetic: string;
  partOfSpeech: string;
  language: string;
  topicIds: string[];
};

type StatusState =
  | { type: "success" | "error"; message: string }
  | null;

type SearchPhase = "idle" | "typing" | "loading" | "success" | "error";

type TermSearchState = {
  phase: SearchPhase;
  query: string;
  results: VocabularySearchItem[];
  total: number;
  message: string | null;
};

const SEARCH_DEBOUNCE_MS = 700;
const MIN_TERM_SEARCH_LENGTH = 2;

const createInitialForm = (initialTerm?: string): FormState => ({
  term: initialTerm?.trim() || "",
  definition: "",
  definitionVi: "",
  examples: [""],
  phonetic: "",
  partOfSpeech: "",
  language: "en",
  topicIds: [],
});

export default function UserVocabContributionForm({
  topics,
  initialTerm,
}: UserVocabContributionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => createInitialForm(initialTerm));
  const [topicQuery, setTopicQuery] = useState("");
  const deferredTopicQuery = useDeferredValue(topicQuery);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);
  const [termSearch, setTermSearch] = useState<TermSearchState>({
    phase: "idle",
    query: "",
    results: [],
    total: 0,
    message: null,
  });
  const latestSearchRequestId = useRef(0);

  const filteredTopics = useMemo(() => {
    const query = deferredTopicQuery.trim().toLowerCase();
    if (!query) {
      return topics;
    }
    return topics.filter((topic) => topic.label.toLowerCase().includes(query));
  }, [deferredTopicQuery, topics]);

  const selectedTopics = useMemo(
    () =>
      form.topicIds
        .map((topicId) => topics.find((topic) => topic.id === topicId))
        .filter((topic): topic is TopicOption => Boolean(topic)),
    [form.topicIds, topics],
  );

  const normalizedTerm = form.term.trim().toLowerCase();
  const exactMatch = useMemo(() => {
    if (!normalizedTerm) {
      return null;
    }
    return (
      termSearch.results.find(
        (item) => (item.term || "").trim().toLowerCase() === normalizedTerm,
      ) || null
    );
  }, [normalizedTerm, termSearch.results]);
  const canSubmitContribution = !exactMatch;

  useEffect(() => {
    const query = form.term.trim();
    if (query.length < MIN_TERM_SEARCH_LENGTH) {
      latestSearchRequestId.current += 1;
      setTermSearch({
        phase: "idle",
        query,
        results: [],
        total: 0,
        message: null,
      });
      return;
    }

    const requestId = latestSearchRequestId.current + 1;
    latestSearchRequestId.current = requestId;

    setTermSearch((prev) => ({
      ...prev,
      phase: "typing",
      query,
      message: null,
    }));

    const timeoutId = window.setTimeout(async () => {
      setTermSearch((prev) => ({
        ...prev,
        phase: "loading",
        query,
        message: null,
      }));

      const result = await searchVocabClient({
        query,
        language: form.language,
        page: 0,
        size: 6,
        includeMyVocab: true,
      });

      if (latestSearchRequestId.current !== requestId) {
        return;
      }

      if (!result.ok) {
        setTermSearch({
          phase: "error",
          query,
          results: [],
          total: 0,
          message: result.message,
        });
        return;
      }

      setTermSearch({
        phase: "success",
        query,
        results: result.data.content ?? [],
        total: result.data.totalElements ?? 0,
        message: null,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [form.term, form.language]);

  const updateField = <K extends keyof FormState,>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTopic = (topicId: string) => {
    setForm((prev) => {
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
    setForm((prev) => ({ ...prev, examples: [...prev.examples, ""] }));
  };

  const updateExample = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      examples: prev.examples.map((example, i) => (i === index ? value : example)),
    }));
  };

  const removeExample = (index: number) => {
    setForm((prev) => {
      if (prev.examples.length === 1) {
        return { ...prev, examples: [""] };
      }
      return {
        ...prev,
        examples: prev.examples.filter((_, i) => i !== index),
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!canSubmitContribution) {
      setStatus({
        type: "error",
        message: "Từ này đã có trong hệ thống. Bạn không cần gửi đề xuất mới.",
      });
      return;
    }

    const examples = form.examples.map((item) => item.trim()).filter(Boolean);
    if (!form.term.trim()) {
      setStatus({ type: "error", message: "Vui lòng nhập từ vựng." });
      return;
    }
    if (!form.definition.trim()) {
      setStatus({ type: "error", message: "Vui lòng nhập định nghĩa chính." });
      return;
    }

    setIsSubmitting(true);
    const result = await createVocabContribution<VocabularyContributionResponse>({
      term: form.term,
      definition: form.definition,
      definitionVi: form.definitionVi,
      examples,
      phonetic: form.phonetic,
      partOfSpeech: form.partOfSpeech,
      language: form.language,
      topicIds: form.topicIds,
    });

    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setIsSubmitting(false);
      return;
    }

    const contribution = result.data;
    const statusText = contribution?.status ? ` (${contribution.status})` : "";
    const codeText = contribution?.id ? ` #${contribution.id.slice(0, 8)}` : "";
    setStatus({
      type: "success",
      message: `Đã gửi đề xuất${codeText}${statusText}.`,
    });
    setForm(createInitialForm(form.term));
    setTopicQuery("");
    router.refresh();
    setIsSubmitting(false);
  };

  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#0b0f14]">Thêm từ vựng mới</h2>
        </div>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="space-y-2 text-sm font-medium text-[#0b0f14]">
              <span>Từ vựng</span>
              <input
                value={form.term}
                onChange={(event) => updateField("term", event.target.value)}
                required
                placeholder="apple"
                className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#0b0f14] focus:border-[#0b0f14] focus:outline-none"
              />
            </label>
            {termSearch.phase === "loading" ||
            (termSearch.phase === "error" && termSearch.message) ? (
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2">
                {termSearch.phase === "loading" ? (
                  <p className="text-xs text-[#1d4ed8]">
                    Đang tìm "{termSearch.query}" trong hệ thống...
                  </p>
                ) : null}
                {termSearch.phase === "error" && termSearch.message ? (
                  <p className="text-xs text-[#be123c]">{termSearch.message}</p>
                ) : null}
              </div>
            ) : null}

            {exactMatch ? (
              <div className="rounded-2xl border border-[#34d399]/35 bg-[#ecfdf5] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#166534]">
                      Từ này đã có trong hệ thống
                    </p>
                    <p className="mt-1 text-xs text-[#166534]/90">
                      {exactMatch.term}
                      {exactMatch.partOfSpeech ? ` • ${exactMatch.partOfSpeech}` : ""}
                      {exactMatch.language ? ` • ${exactMatch.language}` : ""}
                      {exactMatch.inMyVocab ? " • đã có trong My Vocab" : ""}
                    </p>
                    {exactMatch.definition ? (
                      <p className="mt-2 text-sm text-[#166534]">{exactMatch.definition}</p>
                    ) : null}
                  </div>
                  <AddToMyVocabButton
                    vocabularyId={exactMatch.id}
                    inMyVocab={exactMatch.inMyVocab}
                  />
                </div>
              </div>
            ) : null}

            {termSearch.phase === "success" &&
            termSearch.results.length > 0 &&
            !exactMatch ? (
              <div className="space-y-2 rounded-2xl border border-[#e5e7eb] bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                  Kết quả gần giống
                </p>
                {termSearch.results.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0b0f14]">
                        {item.term || "(không có term)"}
                      </p>
                      <p className="mt-1 text-xs text-[#64748b]">
                        {[item.language, item.partOfSpeech, item.status]
                          .filter(Boolean)
                          .join(" • ") || "--"}
                        {item.inMyVocab ? " • đã có trong My Vocab" : ""}
                      </p>
                      {item.definition ? (
                        <p className="mt-1 line-clamp-2 text-xs text-[#475569]">
                          {item.definition}
                        </p>
                      ) : null}
                    </div>
                    <AddToMyVocabButton
                      vocabularyId={item.id}
                      inMyVocab={item.inMyVocab}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <label className="space-y-2 text-sm font-medium text-[#0b0f14]">
            Ngôn ngữ
            <select
              value={form.language}
              onChange={(event) => updateField("language", event.target.value)}
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#0b0f14] focus:border-[#0b0f14] focus:outline-none"
            >
              <option value="en">English (en)</option>
              <option value="vi">Tiếng Việt (vi)</option>
              <option value="ja">Nhật (ja)</option>
              <option value="ko">Hàn (ko)</option>
            </select>
          </label>
        </div>

        {!canSubmitContribution ? (
          <div className="rounded-2xl border border-[#34d399]/35 bg-[#ecfdf5] p-4">
            <p className="text-sm font-semibold text-[#166534]">
              Từ này đã tồn tại. Đã ẩn form đề xuất để tránh gửi trùng.
            </p>
          </div>
        ) : null}

        {canSubmitContribution ? (
          <>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[#0b0f14]">
            Định nghĩa (bắt buộc)
            <textarea
              value={form.definition}
              onChange={(event) => updateField("definition", event.target.value)}
              required
              rows={4}
              placeholder="A fruit with red/green skin..."
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#0b0f14] focus:border-[#0b0f14] focus:outline-none"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-[#0b0f14]">
            Định nghĩa tiếng Việt
            <textarea
              value={form.definitionVi}
              onChange={(event) => updateField("definitionVi", event.target.value)}
              rows={4}
              placeholder="Một loại trái cây..."
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#0b0f14] focus:border-[#0b0f14] focus:outline-none"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[#0b0f14]">
            Phiên âm
            <input
              value={form.phonetic}
              onChange={(event) => updateField("phonetic", event.target.value)}
              placeholder="/ˈae.pl/"
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#0b0f14] focus:border-[#0b0f14] focus:outline-none"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-[#0b0f14]">
            Từ loại
            <input
              value={form.partOfSpeech}
              onChange={(event) => updateField("partOfSpeech", event.target.value)}
              placeholder="noun"
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#0b0f14] focus:border-[#0b0f14] focus:outline-none"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-[#0b0f14]">Ví dụ sử dụng</p>
            <button
              type="button"
              onClick={addExample}
              className="rounded-full border border-[#e5e7eb] px-3 py-1.5 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
            >
              + Thêm ví dụ
            </button>
          </div>
          <div className="space-y-2 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-3">
            {form.examples.map((example, index) => (
              <div key={`example-${index}`} className="flex gap-2">
                <input
                  value={example}
                  onChange={(event) => updateExample(index, event.target.value)}
                  placeholder={`Ví dụ ${index + 1}`}
                  className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#0b0f14] focus:border-[#0b0f14] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeExample(index)}
                  className="rounded-xl border border-[#e5e7eb] px-3 py-2 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
                  aria-label={`Xóa ví dụ ${index + 1}`}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-[#0b0f14]">Chủ đề</p>
          </div>

          {topics.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#e5e7eb] bg-white px-4 py-3 text-xs text-[#64748b]">
              Hiện chưa tải được danh sách chủ đề. Bạn vẫn có thể gửi đề xuất không kèm chủ đề.
            </p>
          ) : (
            <div className="space-y-3 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-3">
              <div className="flex flex-wrap gap-2">
                {selectedTopics.length === 0 ? (
                  <span className="text-xs text-[#64748b]">Chưa chọn chủ đề nào</span>
                ) : (
                  selectedTopics.map((topic) => (
                    <button
                      key={`selected-${topic.id}`}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#34d399]/35 bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#166534] transition hover:bg-[#dcfce7]"
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
                placeholder="Tìm chủ đề..."
                className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm text-[#0b0f14] focus:border-[#0b0f14] focus:outline-none"
              />

              <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white p-2">
                {filteredTopics.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-[#64748b]">
                    Không tìm thấy chủ đề phù hợp.
                  </p>
                ) : (
                  filteredTopics.map((topic) => {
                    const checked = form.topicIds.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                          checked
                            ? "border-[#34d399]/35 bg-[#ecfdf5] text-[#166534]"
                            : "border-transparent text-[#0b0f14] hover:border-[#e5e7eb] hover:bg-[#f8fafc]"
                        }`}
                      >
                        <span className="truncate">{topic.label}</span>
                        <span className="ml-3 text-xs font-semibold">
                          {checked ? "Đã chọn" : "Chọn"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

          </>
        ) : null}

        {status ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              status.type === "success"
                ? "bg-[#ecfdf5] text-[#166534]"
                : "bg-[#fff1f2] text-[#be123c]"
            }`}
            aria-live="polite"
          >
            {status.message}
          </p>
        ) : null}

        {canSubmitContribution ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              latestSearchRequestId.current += 1;
              setForm(createInitialForm(initialTerm));
              setTopicQuery("");
              setStatus(null);
            }}
            className="rounded-full border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
          >
            Đặt lại
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#0b0f14] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đề xuất"}
          </button>
          </div>
        ) : null}
      </form>
    </section>
  );
}
