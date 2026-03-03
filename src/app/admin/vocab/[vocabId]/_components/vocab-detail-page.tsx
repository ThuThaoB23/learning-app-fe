"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingOverlay from "@/components/loading-overlay";
import type {
  VocabularyAudioResponse,
  VocabularyResponse,
} from "@/lib/admin-vocab";
import {
  deleteVocabAudio,
  refreshVocabAudio,
  uploadVocabAudio,
} from "@/lib/admin-vocab-client";
import {
  VocabPageBadge,
  VocabPageEmpty,
  VocabPageField,
  VocabPageSection,
  VocabPageStat,
  VocabPageStatusBanner,
  formatVocabDateTime,
  getVocabStatusMeta,
  vocabPageCardClassName,
  vocabPageMutedCardClassName,
  vocabPageSurfaceClassName,
  type VocabPageStatus,
} from "./vocab-page-ui";

type TopicOption = {
  id: string;
  label: string;
};

type VocabDetailPageProps = {
  initialVocab: VocabularyResponse;
  topics: TopicOption[];
  returnHref: string;
};

const formatAccentLabel = (accent?: string | null) => {
  const normalizedAccent = accent?.trim().toLowerCase();
  if (!normalizedAccent) {
    return "Không rõ accent";
  }
  if (normalizedAccent === "us") {
    return "US";
  }
  if (normalizedAccent === "uk") {
    return "UK";
  }
  return normalizedAccent.toUpperCase();
};

const sortAudios = (audios?: VocabularyAudioResponse[] | null) => {
  if (!audios || audios.length === 0) {
    return [];
  }

  return [...audios].sort((left, right) => {
    const leftPosition = left.position ?? Number.MAX_SAFE_INTEGER;
    const rightPosition = right.position ?? Number.MAX_SAFE_INTEGER;
    if (leftPosition !== rightPosition) {
      return leftPosition - rightPosition;
    }
    return left.audioUrl.localeCompare(right.audioUrl);
  });
};

export default function VocabDetailPage({
  initialVocab,
  topics,
  returnHref,
}: VocabDetailPageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [vocab, setVocab] = useState(initialVocab);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<VocabPageStatus>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [uploadAccent, setUploadAccent] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  const detailTopics = (vocab.topicIds ?? [])
    .map((topicId) => topics.find((topic) => topic.id === topicId))
    .filter((topic): topic is TopicOption => Boolean(topic));
  const detailExamples = (vocab.examples ?? [])
    .map((item) => (typeof item === "string" ? item : item.value))
    .map((item) => item.trim())
    .filter(Boolean);
  const audioList = sortAudios(vocab.audios);
  const canRefreshAudio = (vocab.language ?? "").trim().toLowerCase() === "en";
  const canUploadManualAudio = vocab.status === "APPROVED";
  const detailStatusMeta = getVocabStatusMeta(vocab.status);
  const editReturnHref = `${pathname}?returnTo=${encodeURIComponent(returnHref)}`;
  const editHref = `/admin/vocab/${vocab.id}/edit?returnTo=${encodeURIComponent(
    editReturnHref,
  )}`;

  const handleRefreshAudio = async () => {
    setIsLoading(true);
    setStatus(null);

    const result = await refreshVocabAudio<VocabularyResponse>(vocab.id);
    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setIsLoading(false);
      return;
    }

    if (result.data) {
      setVocab(result.data);
    }

    setStatus({
      type: "success",
      message: "Đã làm mới sound cho từ vựng.",
    });
    router.refresh();
    setIsLoading(false);
  };

  const handleUploadAudio = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!selectedAudioFile) {
      setStatus({
        type: "error",
        message: "Vui lòng chọn file audio trước khi upload.",
      });
      return;
    }

    setIsLoading(true);
    const result = await uploadVocabAudio<VocabularyResponse>(vocab.id, {
      file: selectedAudioFile,
      accent: uploadAccent,
    });

    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setIsLoading(false);
      return;
    }

    if (result.data) {
      setVocab(result.data);
    }

    setSelectedAudioFile(null);
    setUploadAccent("");
    setFileInputKey((current) => current + 1);
    setStatus({
      type: "success",
      message: "Đã upload audio thủ công.",
    });
    router.refresh();
    setIsLoading(false);
  };

  const handleDeleteAudio = async (audioId: string) => {
    if (!window.confirm("Bạn có chắc muốn xoá audio này?")) {
      return;
    }

    setIsLoading(true);
    setStatus(null);

    const result = await deleteVocabAudio(vocab.id, audioId);
    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setIsLoading(false);
      return;
    }

    setVocab((current) => {
      const nextAudios = sortAudios(
        (current.audios ?? []).filter((audio) => audio.id !== audioId),
      ).map((audio, index) => ({
        ...audio,
        position: index + 1,
      }));

      return {
        ...current,
        audios: nextAudios,
      };
    });
    setStatus({
      type: "success",
      message: "Đã xoá audio khỏi vocabulary.",
    });
    router.refresh();
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
                <VocabPageBadge tone="accent">Vocabulary detail</VocabPageBadge>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${detailStatusMeta.className}`}
                >
                  {detailStatusMeta.label}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#f8fafc]">
                  {vocab.term?.trim() || "Chưa đặt từ"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                  {vocab.definition?.trim() ||
                    vocab.definitionVi?.trim() ||
                    "Chưa có định nghĩa cho vocabulary này."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#94a3b8]">
                  <span>{vocab.phonetic?.trim() || "Không có phiên âm"}</span>
                  <span className="text-[#475569]">•</span>
                  <span className="uppercase">{vocab.language ?? "—"}</span>
                  <span className="text-[#475569]">•</span>
                  <span>{vocab.partOfSpeech?.trim() || "Chưa có từ loại"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={editHref}
                className="rounded-full border border-[#67e8f9]/25 bg-[#67e8f9]/10 px-4 py-2 text-sm font-semibold text-[#a5f3fc] transition hover:bg-[#67e8f9]/20"
              >
                Chỉnh sửa
              </Link>
              <button
                type="button"
                disabled={!canRefreshAudio || isLoading}
                onClick={() => {
                  void handleRefreshAudio();
                }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  canRefreshAudio && !isLoading
                    ? "border-[#67e8f9]/25 bg-[#67e8f9]/10 text-[#a5f3fc] hover:bg-[#67e8f9]/20"
                    : "cursor-not-allowed border-white/10 text-[#475569]"
                }`}
              >
                {isLoading ? "Đang refresh..." : "Refresh sound"}
              </button>
              <Link
                href={returnHref}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition hover:bg-white/10"
              >
                Quay lại
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <VocabPageStat
              label="Ngôn ngữ"
              value={(vocab.language ?? "—").toUpperCase()}
            />
            <VocabPageStat label="Ví dụ" value={String(detailExamples.length)} />
            <VocabPageStat
              label="Audio"
              value={String(audioList.length)}
              tone="accent"
            />
            <VocabPageStat
              label="Cập nhật"
              value={formatVocabDateTime(vocab.updatedAt)}
            />
          </div>
        </div>
      </section>

      <VocabPageStatusBanner status={status} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="space-y-6">
          <VocabPageSection
            eyebrow="Meaning"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <VocabPageField
                label="Định nghĩa (EN)"
                value={vocab.definition?.trim() || "—"}
              />
              <VocabPageField
                label="Định nghĩa (VI)"
                value={vocab.definitionVi?.trim() || "—"}
              />
            </div>

            <div className="mt-5">
              {detailExamples.length === 0 ? (
                <VocabPageEmpty message="Chưa có ví dụ cho từ này." />
              ) : (
                <div className="grid gap-3">
                  {detailExamples.map((example, index) => (
                    <div
                      key={`detail-example-${index}`}
                      className={`${vocabPageMutedCardClassName} px-4 py-4`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#475569]">
                        Ví dụ {index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#d6deeb]">
                        {example}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </VocabPageSection>

          <VocabPageSection
            eyebrow="Audio"
            actions={
              <div className="flex items-center gap-3">
                <VocabPageBadge>{audioList.length} bản ghi</VocabPageBadge>
                <button
                  type="button"
                  disabled={!canRefreshAudio || isLoading}
                  onClick={() => {
                    void handleRefreshAudio();
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    canRefreshAudio && !isLoading
                      ? "border-[#67e8f9]/25 bg-[#67e8f9]/10 text-[#a5f3fc] hover:bg-[#67e8f9]/20"
                      : "cursor-not-allowed border-white/10 text-[#475569]"
                  }`}
                >
                  {isLoading ? "Đang refresh..." : "Refresh sound"}
                </button>
              </div>
            }
          >
            {!canRefreshAudio ? (
              <p className="mb-4 text-xs text-[#64748b]">
                API refresh sound hiện chỉ hỗ trợ vocabulary tiếng Anh.
              </p>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <form
                onSubmit={handleUploadAudio}
                className={`${vocabPageMutedCardClassName} p-4`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#e7edf3]">
                      Upload audio thủ công
                    </p>
                    <p className="mt-1 text-xs text-[#64748b]">
                      Hỗ trợ `mp3`, `wav`, `ogg`, `webm`, tối đa 10MB.
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      canUploadManualAudio
                        ? "border-[#34d399]/20 bg-[#34d399]/10 text-[#86efac]"
                        : "border-white/10 bg-white/5 text-[#64748b]"
                    }`}
                  >
                    {canUploadManualAudio ? "Approved only" : "Disabled"}
                  </span>
                </div>

                {!canUploadManualAudio ? (
                  <p className="mt-4 rounded-xl border border-dashed border-white/10 bg-[#0b0f14]/40 px-4 py-3 text-sm text-[#64748b]">
                    Upload thủ công chỉ áp dụng cho vocabulary đang ở trạng thái
                    `APPROVED`.
                  </p>
                ) : null}

                <div className="mt-4 space-y-4">
                  <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                    File audio
                    <input
                      key={fileInputKey}
                      type="file"
                      accept=".mp3,.wav,.ogg,.webm,audio/*"
                      disabled={!canUploadManualAudio || isLoading}
                      onChange={(event) =>
                        setSelectedAudioFile(event.target.files?.[0] ?? null)
                      }
                      className="block w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#cbd5e1] file:mr-4 file:rounded-full file:border-0 file:bg-[#67e8f9]/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#a5f3fc]"
                    />
                  </label>

                  <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                    Accent
                    <input
                      value={uploadAccent}
                      disabled={!canUploadManualAudio || isLoading}
                      onChange={(event) => setUploadAccent(event.target.value)}
                      placeholder="us / uk / custom"
                      className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                    />
                  </label>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-[#64748b]">
                    {selectedAudioFile
                      ? `Đã chọn: ${selectedAudioFile.name}`
                      : "Chưa chọn file nào"}
                  </p>
                  <button
                    type="submit"
                    disabled={!canUploadManualAudio || isLoading}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      canUploadManualAudio && !isLoading
                        ? "bg-[#e7edf3] text-[#0b0f14] hover:-translate-y-0.5"
                        : "cursor-not-allowed bg-white/10 text-[#64748b]"
                    }`}
                  >
                    {isLoading ? "Đang upload..." : "Upload audio"}
                  </button>
                </div>
              </form>

              <div className={`${vocabPageMutedCardClassName} p-4`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#e7edf3]">
                      Audio hiện có
                    </p>
                    <p className="mt-1 text-xs text-[#64748b]">
                      Nghe thử và xoá từng bản ghi.
                    </p>
                  </div>
                  <VocabPageBadge>{audioList.length} items</VocabPageBadge>
                </div>

                {audioList.length === 0 ? (
                  <div className="mt-4">
                    <VocabPageEmpty message="Chưa có sound cho từ này." />
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {audioList.map((audio, index) => (
                      <div
                        key={audio.id}
                        className={`${vocabPageCardClassName} p-4`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-[#e7edf3]">
                              Audio #{audio.position ?? index + 1}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#64748b]">
                              {formatAccentLabel(audio.accent)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => {
                                void handleDeleteAudio(audio.id);
                              }}
                              className="rounded-full border border-[#fb7185]/20 bg-[#fb7185]/10 px-3 py-1 text-xs font-semibold text-[#fda4af] transition hover:bg-[#fb7185]/20 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              Xoá
                            </button>
                          </div>
                        </div>

                        <audio
                          controls
                          preload="none"
                          className="mt-3 w-full"
                          src={audio.audioUrl}
                        >
                          Trình duyệt không hỗ trợ phát audio.
                        </audio>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </VocabPageSection>
        </div>

        <aside className="space-y-6">
          <VocabPageSection
            eyebrow="Metadata"
          >
            <div className="space-y-4">
              <VocabPageField
                label="Phiên âm"
                value={vocab.phonetic?.trim() || "—"}
              />
              <VocabPageField
                label="Từ loại"
                value={vocab.partOfSpeech?.trim() || "—"}
              />
              <VocabPageField label="Trạng thái" value={detailStatusMeta.label} />
              <VocabPageField
                label="Ngày tạo"
                value={formatVocabDateTime(vocab.createdAt)}
              />
              <VocabPageField
                label="Cập nhật gần nhất"
                value={formatVocabDateTime(vocab.updatedAt)}
              />
            </div>
          </VocabPageSection>

          <VocabPageSection
            eyebrow="Topics"
          >
            {detailTopics.length === 0 ? (
              <VocabPageEmpty message="Chưa gắn chủ đề nào." />
            ) : (
              <div className="flex flex-wrap gap-2">
                {detailTopics.map((topic) => (
                  <span
                    key={`detail-topic-${topic.id}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#cbd5e1]"
                  >
                    {topic.label}
                  </span>
                ))}
              </div>
            )}
          </VocabPageSection>
        </aside>
      </div>
    </div>
  );
}
