"use client";

import Link from "next/link";
import {
  startTransition,
  useDeferredValue,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import LoadingOverlay from "@/components/loading-overlay";
import type { VocabularyExample, VocabularyResponse } from "@/lib/admin-vocab";
import { updateVocab } from "@/lib/admin-vocab-client";
import {
  VocabPageBadge,
  VocabPageEmpty,
  VocabPageSection,
  VocabPageStat,
  VocabPageStatusBanner,
  formatVocabDateTime,
  getVocabStatusMeta,
  vocabPageCardClassName,
  vocabPageMutedCardClassName,
  vocabPageSurfaceClassName,
  type VocabPageStatus,
} from "../../_components/vocab-page-ui";

type TopicOption = {
  id: string;
  label: string;
};

type EditExample = {
  id?: string;
  value: string;
};

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

type VocabEditPageProps = {
  initialVocab: VocabularyResponse;
  topics: TopicOption[];
  returnHref: string;
};

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English (en)" },
  { value: "vi", label: "Tiếng Việt (vi)" },
  { value: "ja", label: "Nhật (ja)" },
  { value: "ko", label: "Hàn (ko)" },
];

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

const serializeForm = (form: EditForm) =>
  JSON.stringify({
    ...form,
    term: form.term.trim(),
    definition: form.definition.trim(),
    definitionVi: form.definitionVi.trim(),
    phonetic: form.phonetic.trim(),
    partOfSpeech: form.partOfSpeech.trim(),
    language: form.language.trim(),
    topicIds: [...form.topicIds].sort(),
    examples: form.examples.map((item) => ({
      id: item.id ?? "",
      value: item.value.trim(),
    })),
  });

function EditField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function VocabEditPage({
  initialVocab,
  topics,
  returnHref,
}: VocabEditPageProps) {
  const [vocab, setVocab] = useState(initialVocab);
  const [form, setForm] = useState<EditForm>(() => createEditForm(initialVocab));
  const [topicQuery, setTopicQuery] = useState("");
  const [status, setStatus] = useState<VocabPageStatus>(null);
  const [isLoading, setIsLoading] = useState(false);

  const deferredTopicQuery = useDeferredValue(topicQuery);
  const normalizedTopicQuery = deferredTopicQuery.trim().toLowerCase();
  const topicMap = new Map(topics.map((topic) => [topic.id, topic]));
  const selectedTopics = form.topicIds
    .map((topicId) => topicMap.get(topicId))
    .filter((topic): topic is TopicOption => Boolean(topic));
  const filteredTopics = normalizedTopicQuery
    ? topics.filter((topic) => topic.label.toLowerCase().includes(normalizedTopicQuery))
    : topics;
  const detailHref = `/admin/vocab/${vocab.id}?returnTo=${encodeURIComponent(
    returnHref,
  )}`;
  const statusMeta = getVocabStatusMeta(vocab.status);
  const savedForm = createEditForm(vocab);
  const isDirty = serializeForm(form) !== serializeForm(savedForm);
  const filledExamplesCount = form.examples.filter((item) => item.value.trim()).length;

  const updateField = <T extends keyof EditForm,>(
    key: T,
    value: EditForm[T],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleTopic = (topicId: string) => {
    setForm((current) => {
      const exists = current.topicIds.includes(topicId);
      return {
        ...current,
        topicIds: exists
          ? current.topicIds.filter((id) => id !== topicId)
          : [...current.topicIds, topicId],
      };
    });
  };

  const addExample = () => {
    setForm((current) => ({
      ...current,
      examples: [...current.examples, { value: "" }],
    }));
  };

  const updateExample = (index: number, value: string) => {
    setForm((current) => ({
      ...current,
      examples: current.examples.map((item, itemIndex) =>
        itemIndex === index ? { ...item, value } : item,
      ),
    }));
  };

  const removeExample = (index: number) => {
    setForm((current) => {
      if (current.examples.length === 1) {
        return {
          ...current,
          examples: [{ value: "" }],
        };
      }

      return {
        ...current,
        examples: current.examples.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const resetForm = () => {
    setForm(createEditForm(vocab));
    setTopicQuery("");
    setStatus(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (form.topicIds.length === 0) {
      setStatus({
        type: "error",
        message: "Vui lòng chọn ít nhất 1 chủ đề.",
      });
      return;
    }

    setIsLoading(true);
    const result = await updateVocab<VocabularyResponse>(vocab.id, form);
    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setIsLoading(false);
      return;
    }

    if (result.data) {
      setVocab(result.data);
      setForm(createEditForm(result.data));
    }

    setStatus({
      type: "success",
      message: "Đã cập nhật từ vựng.",
    });
    startTransition(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <section className={`relative overflow-hidden p-6 ${vocabPageSurfaceClassName}`}>
        <LoadingOverlay show={isLoading} />
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <VocabPageBadge tone="accent">Vocabulary edit</VocabPageBadge>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
                {isDirty ? (
                  <VocabPageBadge>Unsaved changes</VocabPageBadge>
                ) : null}
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#f8fafc]">
                  {form.term.trim() || vocab.term?.trim() || "Chưa đặt từ"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                  Chỉnh sửa nội dung, metadata và topic của vocabulary trong một
                  bố cục ngắn gọn hơn.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#94a3b8]">
                  <span>{form.phonetic.trim() || "Không có phiên âm"}</span>
                  <span className="text-[#475569]">•</span>
                  <span className="uppercase">{form.language || "—"}</span>
                  <span className="text-[#475569]">•</span>
                  <span>{form.partOfSpeech.trim() || "Chưa có từ loại"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                form="vocab-edit-form"
                disabled={isLoading}
                className="rounded-full border border-[#67e8f9]/25 bg-[#67e8f9]/10 px-4 py-2 text-sm font-semibold text-[#a5f3fc] transition hover:bg-[#67e8f9]/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                disabled={!isDirty || isLoading}
                onClick={resetForm}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isDirty && !isLoading
                    ? "border-white/10 text-[#e7edf3] hover:bg-white/10"
                    : "cursor-not-allowed border-white/10 text-[#64748b]"
                }`}
              >
                Khôi phục form
              </button>
              <Link
                href={detailHref}
                className="rounded-full border border-[#67e8f9]/25 bg-[#67e8f9]/10 px-4 py-2 text-sm font-semibold text-[#a5f3fc] transition hover:bg-[#67e8f9]/20"
              >
                Xem chi tiết
              </Link>
              <Link
                href={returnHref}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition hover:bg-white/10"
              >
                Quay lại
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <VocabPageStat label="Ngôn ngữ" value={form.language.toUpperCase() || "—"} />
            <VocabPageStat label="Chủ đề" value={String(form.topicIds.length)} />
            <VocabPageStat
              label="Ví dụ"
              value={String(filledExamplesCount)}
              tone="accent"
            />
            <VocabPageStat
              label="Cập nhật gần nhất"
              value={formatVocabDateTime(vocab.updatedAt)}
            />
          </div>
        </div>
      </section>

      <VocabPageStatusBanner status={status} />

      <form
        id="vocab-edit-form"
        className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]"
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          <VocabPageSection
            eyebrow="Content"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <EditField label="Từ vựng">
                <input
                  value={form.term}
                  onChange={(event) => updateField("term", event.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </EditField>
              <EditField label="Ngôn ngữ">
                <select
                  value={form.language}
                  onChange={(event) => updateField("language", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </EditField>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <EditField label="Định nghĩa (EN)">
                <textarea
                  value={form.definition}
                  onChange={(event) => updateField("definition", event.target.value)}
                  required
                  className="min-h-[120px] w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </EditField>
              <EditField label="Định nghĩa (VI)">
                <textarea
                  value={form.definitionVi}
                  onChange={(event) => updateField("definitionVi", event.target.value)}
                  className="min-h-[120px] w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </EditField>
            </div>
          </VocabPageSection>

          <VocabPageSection
            eyebrow="Examples"
            actions={
              <button
                type="button"
                onClick={addExample}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
              >
                <span className="text-sm leading-none">+</span>
                Thêm ví dụ
              </button>
            }
          >
            <div className="space-y-3">
              {form.examples.map((example, index) => (
                <div
                  key={`edit-example-${index}`}
                  className={`${vocabPageMutedCardClassName} p-4`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#475569]">
                      Ví dụ {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                      aria-label={`Xóa ví dụ ${index + 1}`}
                    >
                      Xóa
                    </button>
                  </div>
                  <textarea
                    value={example.value}
                    onChange={(event) => updateExample(index, event.target.value)}
                    placeholder={`Nhập ví dụ ${index + 1}`}
                    className="mt-3 min-h-[96px] w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
              ))}
            </div>
          </VocabPageSection>
        </div>

        <aside className="space-y-6">
          <VocabPageSection
            eyebrow="Metadata"
          >
            <div className="space-y-4">
              <EditField label="Phiên âm">
                <input
                  value={form.phonetic}
                  onChange={(event) => updateField("phonetic", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </EditField>
              <EditField label="Từ loại">
                <input
                  value={form.partOfSpeech}
                  onChange={(event) =>
                    updateField("partOfSpeech", event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </EditField>
              <div className={`${vocabPageCardClassName} px-4 py-3`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  Trạng thái hiện tại
                </p>
                <p className="mt-2 text-sm text-[#d6deeb]">{statusMeta.label}</p>
              </div>
              <div className={`${vocabPageMutedCardClassName} px-4 py-3`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  Tạo lúc
                </p>
                <p className="mt-2 text-sm text-[#d6deeb]">
                  {formatVocabDateTime(vocab.createdAt)}
                </p>
              </div>
              <div className={`${vocabPageMutedCardClassName} px-4 py-3`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  Cập nhật gần nhất
                </p>
                <p className="mt-2 text-sm text-[#d6deeb]">
                  {formatVocabDateTime(vocab.updatedAt)}
                </p>
              </div>
            </div>
          </VocabPageSection>

          <VocabPageSection
            eyebrow="Topics"
          >
            {topics.length === 0 ? (
              <VocabPageEmpty message="Không có chủ đề nào đang hoạt động." />
            ) : (
              <div className="space-y-4">
                <div className={`${vocabPageMutedCardClassName} p-4`}>
                  <p className="text-sm font-medium text-[#e7edf3]">Đã chọn</p>
                  {selectedTopics.length === 0 ? (
                    <p className="mt-3 text-sm text-[#64748b]">
                      Chưa chọn chủ đề nào.
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedTopics.map((topic) => (
                        <button
                          key={`edit-selected-${topic.id}`}
                          type="button"
                          onClick={() => toggleTopic(topic.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#34d399]/30 bg-[#34d399]/10 px-3 py-1 text-xs font-semibold text-[#86efac] transition hover:bg-[#34d399]/20"
                        >
                          <span className="max-w-[180px] truncate">{topic.label}</span>
                          <span aria-hidden>x</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`${vocabPageMutedCardClassName} p-4`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[#e7edf3]">
                      Danh sách chủ đề
                    </p>
                    <span className="text-xs text-[#64748b]">
                      {filteredTopics.length} kết quả
                    </span>
                  </div>
                  <input
                    value={topicQuery}
                    onChange={(event) => setTopicQuery(event.target.value)}
                    placeholder="Tìm chủ đề để chọn..."
                    className="mt-3 w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                  <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-[#0b0f14]/40 p-2">
                    {filteredTopics.length === 0 ? (
                      <p className="px-2 py-2 text-xs text-[#64748b]">
                        Không tìm thấy chủ đề phù hợp.
                      </p>
                    ) : (
                      filteredTopics.map((topic) => {
                        const checked = form.topicIds.includes(topic.id);
                        return (
                          <button
                            key={`edit-topic-${topic.id}`}
                            type="button"
                            onClick={() => toggleTopic(topic.id)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition ${
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
                </div>
              </div>
            )}
          </VocabPageSection>

        </aside>
      </form>
    </div>
  );
}
