import type { Metadata } from "next";
import Link from "next/link";
import RefreshButton from "@/components/refresh-button";
import MyVocabFlashCardDeck from "../../../_components/my-vocab-flash-card-deck";
import { fetchMyVocabFlashcards } from "@/lib/user-api";

export const metadata: Metadata = {
  title: "Flash Card",
  description: "Ôn tập từ vựng bằng deck flash card được tạo từ My Vocab.",
};

type MyVocabFlashcardsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyVocabFlashcardsPage({
  searchParams,
}: MyVocabFlashcardsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const limitParam = Array.isArray(resolvedSearchParams?.limit)
    ? resolvedSearchParams.limit[0]
    : resolvedSearchParams?.limit;
  const limit = Math.min(100, Math.max(1, Number(limitParam ?? 20) || 20));

  const flashcardDeckResult = await fetchMyVocabFlashcards({ limit });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
              My Vocab
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#0f172a]">
              Flash Card
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
              API sẽ tự build deck từ `/me/vocab/flashcards`. Bạn có thể đổi số
              lượng thẻ bằng query `limit`, hiện tại đang dùng {limit} thẻ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/vocab"
              className="rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] transition hover:border-[#0f172a]"
            >
              Quay lại My Vocab
            </Link>
            <RefreshButton className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]" />
          </div>
        </div>
      </section>

      <MyVocabFlashCardDeck
        deck={flashcardDeckResult.ok ? flashcardDeckResult.data : null}
        errorMessage={flashcardDeckResult.ok ? null : flashcardDeckResult.message}
        errorCode={flashcardDeckResult.ok ? null : flashcardDeckResult.errorCode}
      />
    </div>
  );
}
