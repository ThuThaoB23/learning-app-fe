"use client";

import { createPortal } from "react-dom";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createVocabContribution } from "@/lib/admin-vocab-client";
import LoadingOverlay from "@/components/loading-overlay";

type TopicOption = {
  id: string;
  label: string;
};

type CreateVocabModalProps = {
  topics: TopicOption[];
};

type Status = {
  type: "success" | "error";
  message: string;
} | null;

const createInitialForm = () => ({
  term: "",
  definition: "",
  definitionVi: "",
  examples: [""],
  phonetic: "",
  partOfSpeech: "",
  language: "en",
  topicIds: [] as string[],
});

export default function CreateVocabModal({ topics }: CreateVocabModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [form, setForm] = useState(createInitialForm);
  const [topicQuery, setTopicQuery] = useState("");

  const filteredTopics = useMemo(() => {
    const query = topicQuery.trim().toLowerCase();
    if (!query) {
      return topics;
    }
    return topics.filter((topic) => topic.label.toLowerCase().includes(query));
  }, [topicQuery, topics]);

  const selectedTopics = useMemo(
    () =>
      form.topicIds
        .map((topicId) => topics.find((topic) => topic.id === topicId))
        .filter((topic): topic is TopicOption => Boolean(topic)),
    [form.topicIds, topics],
  );

  const handleClose = () => {
    setOpen(false);
    setStatus(null);
    setTopicQuery("");
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
    setForm((prev) => ({
      ...prev,
      examples: [...prev.examples, ""],
    }));
  };

  const updateExample = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      examples: prev.examples.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));
  };

  const removeExample = (index: number) => {
    setForm((prev) => {
      if (prev.examples.length === 1) {
        return {
          ...prev,
          examples: [""],
        };
      }
      return {
        ...prev,
        examples: prev.examples.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    if (form.topicIds.length === 0) {
      setStatus({
        type: "error",
        message: "Vui lòng chọn ít nhất 1 chủ đề.",
      });
      setIsLoading(false);
      return;
    }

    const examples = form.examples
      .map((item) => item.trim())
      .filter(Boolean);

    const result = await createVocabContribution({
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
      setStatus({
        type: "error",
        message: result.message,
      });
      setIsLoading(false);
      return;
    }

    setStatus({
      type: "success",
      message: "Đã tạo từ vựng thành công.",
    });
    setForm(createInitialForm());
    setTopicQuery("");
    router.refresh();
    setTimeout(handleClose, 700);
    setIsLoading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#e7edf3] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5"
      >
        Thêm từ vựng
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={handleClose}
              />
              <div
                role="dialog"
                aria-modal="true"
                className="relative z-[131] w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]"
              >
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#e7edf3]">
                    Thêm từ vựng mới
                  </h2>
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
                      Từ vựng
                      <input
                        name="term"
                        value={form.term}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, term: event.target.value }))
                        }
                        required
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="apple"
                      />
                    </label>

                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Ngôn ngữ
                      <select
                        name="language"
                        value={form.language}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            language: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      >
                        <option value="en">English (en)</option>
                        <option value="vi">Tiếng Việt (vi)</option>
                        <option value="ja">Nhật (ja)</option>
                        <option value="ko">Hàn (ko)</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Định nghĩa (EN)
                      <textarea
                        name="definition"
                        value={form.definition}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            definition: event.target.value,
                          }))
                        }
                        required
                        className="min-h-[96px] w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="A fruit..."
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Định nghĩa (VI)
                      <textarea
                        name="definitionVi"
                        value={form.definitionVi}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            definitionVi: event.target.value,
                          }))
                        }
                        className="min-h-[96px] w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="Một loại trái cây..."
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Phiên âm
                      <input
                        name="phonetic"
                        value={form.phonetic}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            phonetic: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="/ˈae.pl/"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Từ loại
                      <input
                        name="partOfSpeech"
                        value={form.partOfSpeech}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            partOfSpeech: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="noun"
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
                      {form.examples.map((example, index) => (
                        <div key={`example-${index}`} className="flex gap-2">
                          <input
                            value={example}
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
                                key={`selected-${topic.id}`}
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
                              const checked = form.topicIds.includes(topic.id);
                              return (
                                <button
                                  key={topic.id}
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
                          Đã chọn {form.topicIds.length} chủ đề.
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
                      disabled={isLoading || topics.length === 0}
                      className="rounded-full bg-[#e7edf3] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading ? "Đang tạo..." : "Tạo từ vựng"}
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
