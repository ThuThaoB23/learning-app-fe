"use client";

import Link from "next/link";
import { useState } from "react";
import VocabAudioButton from "./vocab-audio-button";
import type {
  FlashcardDeckBucket,
  FlashcardDeckResponse,
  FlashcardItemResponse,
} from "@/lib/user-api";
import { updateMyVocab } from "@/lib/user-actions-client";

type MyVocabFlashCardDeckProps = {
  deck: FlashcardDeckResponse | null;
  errorMessage?: string | null;
  errorCode?: string | null;
};

const bucketMeta: Record<
  FlashcardDeckBucket,
  { label: string; className: string }
> = {
  DUE: {
    label: "Đến hạn",
    className: "border-[#fbcfe8] bg-[#fff1f2] text-[#be123c]",
  },
  WEAK: {
    label: "Còn yếu",
    className: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
  },
  NEW: {
    label: "Mới",
    className: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]",
  },
  REVIEW: {
    label: "Review",
    className: "border-[#d8b4fe] bg-[#faf5ff] text-[#7c3aed]",
  },
};

const pickAudioUrl = (item: FlashcardItemResponse) =>
  item.audios?.find((audio) => Boolean(audio?.audioUrl))?.audioUrl?.trim() ?? "";

export default function MyVocabFlashCardDeck({
  deck,
  errorMessage,
  errorCode,
}: MyVocabFlashCardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submittingCardId, setSubmittingCardId] = useState<string | null>(null);

  const cards = deck?.items ?? [];
  const currentCard = cards[currentIndex];
  const currentBucket = currentCard ? bucketMeta[currentCard.bucket] : null;
  const statusForCard = (card: FlashcardItemResponse) =>
    localStatuses[card.userVocabularyId] || card.status || "NEW";

  const goToIndex = (index: number) => {
    if (!cards.length) {
      return;
    }
    const safeIndex = Math.min(cards.length - 1, Math.max(0, index));
    setCurrentIndex(safeIndex);
    setRevealed(false);
    setMessage(null);
  };

  const handleUpdateStatus = async (nextStatus: "LEARNING" | "MASTERED") => {
    if (!currentCard) {
      return;
    }

    setMessage(null);
    setLocalStatuses((prev) => ({
      ...prev,
      [currentCard.userVocabularyId]: nextStatus,
    }));
    setSubmittingCardId(currentCard.userVocabularyId);

    const result = await updateMyVocab(currentCard.vocabularyId, { status: nextStatus });
    setSubmittingCardId(null);

    if (!result.ok) {
      setLocalStatuses((prev) => ({
        ...prev,
        [currentCard.userVocabularyId]: currentCard.status || "NEW",
      }));
      setMessage(result.message);
      return;
    }

    const nextMessage =
      nextStatus === "MASTERED"
        ? "Đã lưu là đã nhớ. Bạn có thể tiếp tục sang thẻ kế."
        : "Đã lưu là đang học. Tiếp tục ôn thẻ kế tiếp.";

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRevealed(false);
    }

    setMessage(nextMessage);
  };

  if (!deck) {
    const isNoDeck =
      errorCode === "NO_USER_VOCAB" || errorCode === "NO_ELIGIBLE_VOCAB";

    return (
      <section className="rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,#fffdf8_0%,#eef6ff_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
          Flash Card
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#0f172a]">
          Deck thông minh từ My Vocab
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#475569]">
          API `/me/vocab/flashcards` sẽ tự chọn các từ đến hạn, còn yếu, mới và
          review để tạo một deck ôn tập ngắn gọn.
        </p>

        <div className="mt-6 rounded-[28px] border border-dashed border-[#cbd5e1] bg-white/80 p-6">
          <p className="text-base font-semibold text-[#0f172a]">
            {isNoDeck ? "Chưa tạo được deck flash card." : "Không tải được deck flash card."}
          </p>
          <p className="mt-2 text-sm text-[#64748b]">
            {errorMessage || "Vui lòng thử tải lại sau."}
          </p>
          {isNoDeck ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dashboard/library"
                className="rounded-full bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e293b]"
              >
                Thêm từ vào My Vocab
              </Link>
              <Link
                href="/dashboard/vocab/new"
                className="rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] transition hover:border-[#0f172a]"
              >
                Đóng góp từ mới
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (!cards.length || !currentCard || !currentBucket) {
    return null;
  }

  const audioUrl = pickAudioUrl(currentCard);
  const currentStatus = statusForCard(currentCard);
  const progressPercent = Math.min(100, Math.max(0, currentCard.progress ?? 0));
  const hasBackDetails = Boolean(
    currentCard.definitionVi?.trim() || currentCard.definition?.trim(),
  );
  const frontText = currentCard.definitionVi?.trim() || currentCard.definition;
  const backText = currentCard.term;
  const detailText = currentCard.definitionVi?.trim() || currentCard.definition;

  return (
    <section className="rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,#fffdf8_0%,#eef6ff_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#0f172a]">Flash Card</h2>
        </div>

        <div className="min-w-[180px] rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-sm text-[#475569]">
          <p>
            Thẻ <span className="font-semibold text-[#0f172a]">{currentIndex + 1}</span> /{" "}
            <span className="font-semibold text-[#0f172a]">{deck.totalItems}</span>
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-2 overflow-hidden rounded-full bg-white/90">
          <div
            className="h-full rounded-full bg-[#0f172a] transition-all"
            style={{ width: `${((currentIndex + 1) / Math.max(deck.totalItems, 1)) * 100}%` }}
          />
        </div>

        <div className="mx-auto mt-6 max-w-4xl rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${currentBucket.className}`}
            >
              {currentBucket.label}
            </span>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748b]">
              {audioUrl ? <VocabAudioButton audioUrl={audioUrl} term={currentCard.term} /> : null}
              <span>{revealed ? currentStatus : `${progressPercent}%`}</span>
            </div>
          </div>

          <div className="mt-5" style={{ perspective: "1400px" }}>
            <button
              type="button"
              onClick={() => setRevealed((prev) => !prev)}
              disabled={Boolean(submittingCardId)}
              className="block w-full rounded-[28px] text-left disabled:pointer-events-none"
              aria-label={revealed ? "Lật về mặt trước" : "Lật sang mặt sau"}
            >
              <div
                className="relative min-h-[320px] w-full transition-transform duration-500 [transform-style:preserve-3d] sm:min-h-[360px]"
                style={{
                  transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-[28px] border border-[#fde68a] bg-[radial-gradient(circle_at_top_right,#fff8e1,transparent_40%),linear-gradient(135deg,#fffef7_0%,#fff7ed_100%)] p-6 sm:p-8"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b]">
                    Gợi nhớ
                  </p>
                  <div className="flex min-h-[240px] flex-col items-center justify-center sm:min-h-[280px]">
                    <p className="text-center text-3xl font-semibold leading-tight text-[#0f172a] sm:text-4xl">
                      {frontText}
                    </p>
                    <p className="mt-6 text-center text-sm leading-6 text-[#475569]">
                      Chạm vào thẻ để lật
                    </p>
                  </div>
                </div>

                <div
                  className="absolute inset-0 rounded-[28px] border border-[#bfdbfe] bg-[radial-gradient(circle_at_top_left,#eff6ff,transparent_42%),linear-gradient(135deg,#f8fbff_0%,#eef2ff_100%)] p-6 sm:p-8"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b]">
                    Đáp án
                  </p>
                  <div className="flex min-h-[240px] flex-col items-center justify-center sm:min-h-[280px]">
                    <p className="text-center text-3xl font-semibold leading-tight text-[#0f172a] sm:text-4xl">
                      {backText}
                    </p>
                    {hasBackDetails ? (
                      <p className="mt-6 text-center text-sm leading-6 text-[#475569]">
                        {detailText}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {message ? (
            <p className="mt-4 text-sm text-[#166534]" aria-live="polite">
              {message}
            </p>
          ) : null}
          {errorMessage && !message ? (
            <p className="mt-4 text-sm text-[#be123c]">{errorMessage}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => goToIndex(currentIndex - 1)}
              disabled={currentIndex === 0 || Boolean(submittingCardId)}
              className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#0f172a] transition hover:border-[#0f172a] disabled:pointer-events-none disabled:opacity-50"
            >
              Thẻ trước
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("LEARNING")}
              disabled={!revealed || Boolean(submittingCardId)}
              className="rounded-full border border-[#93c5fd] bg-[#eff6ff] px-4 py-2 text-sm font-semibold text-[#1d4ed8] transition hover:border-[#60a5fa] disabled:pointer-events-none disabled:opacity-50"
            >
              {submittingCardId === currentCard.userVocabularyId
                ? "Đang lưu..."
                : "Chưa nhớ"}
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("MASTERED")}
              disabled={!revealed || Boolean(submittingCardId)}
              className="rounded-full bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:pointer-events-none disabled:opacity-50"
            >
              {submittingCardId === currentCard.userVocabularyId
                ? "Đang lưu..."
                : "Đã nhớ"}
            </button>
            <button
              type="button"
              onClick={() => goToIndex(currentIndex + 1)}
              disabled={currentIndex >= cards.length - 1 || Boolean(submittingCardId)}
              className="rounded-full border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#0f172a] transition hover:border-[#0f172a] disabled:pointer-events-none disabled:opacity-50"
            >
              Thẻ sau
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
