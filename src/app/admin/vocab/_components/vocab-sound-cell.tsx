"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  VocabularyAudioResponse,
  VocabularyResponse,
} from "@/lib/admin-vocab";
import { refreshVocabAudio } from "@/lib/admin-vocab-client";

const manualSoundMessage = "Sound hiện ko có, hãy thêm thủ công...";

const getAudioCount = (audios?: VocabularyAudioResponse[] | null) =>
  audios?.length ?? 0;

const canAutoRefreshSound = (language?: string | null) =>
  (language ?? "").trim().toLowerCase() === "en";

type VocabSoundCellProps = {
  vocabId: string;
  language?: string | null;
  initialAudios?: VocabularyAudioResponse[] | null;
};

export default function VocabSoundCell({
  vocabId,
  language,
  initialAudios,
}: VocabSoundCellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [audios, setAudios] = useState(initialAudios);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showManualMessage, setShowManualMessage] = useState(false);
  const [needsManualAdd, setNeedsManualAdd] = useState(!canAutoRefreshSound(language));

  const audioCount = getAudioCount(audios);
  const hasSound = audioCount > 0;
  const canRefresh = !hasSound && canAutoRefreshSound(language);
  const currentListHref = `${pathname}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const detailHref = `${pathname}/${vocabId}?returnTo=${encodeURIComponent(
    currentListHref,
  )}`;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setShowManualMessage(false);
    setNeedsManualAdd(false);

    const result = await refreshVocabAudio<VocabularyResponse>(vocabId);
    if (!result.ok) {
      setShowManualMessage(true);
      setNeedsManualAdd(true);
      setIsRefreshing(false);
      return;
    }

    const nextAudios = result.data?.audios ?? null;
    const nextAudioCount = getAudioCount(nextAudios);
    setAudios(nextAudios);
    setShowManualMessage(nextAudioCount === 0);
    setNeedsManualAdd(nextAudioCount === 0);
    setIsRefreshing(false);
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {hasSound ? (
        <p className="text-sm font-medium text-[#86efac]">{audioCount} bản ghi</p>
      ) : needsManualAdd ? (
        <Link
          href={detailHref}
          className="inline-flex rounded-full border border-[#67e8f9]/25 bg-[#67e8f9]/10 px-3 py-1 text-xs font-semibold text-[#a5f3fc] transition hover:bg-[#67e8f9]/20"
        >
          Add sound
        </Link>
      ) : canRefresh ? (
        <button
          type="button"
          disabled={isRefreshing}
          onClick={() => {
            void handleRefresh();
          }}
          className="rounded-full border border-[#67e8f9]/25 bg-[#67e8f9]/10 px-3 py-1 text-xs font-semibold text-[#a5f3fc] transition hover:bg-[#67e8f9]/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRefreshing ? "Đang refresh..." : "Add sound"}
        </button>
      ) : null}

      {!hasSound && showManualMessage ? (
        <p className="max-w-[220px] text-xs leading-5 text-[#fbbf24]">
          {manualSoundMessage}
        </p>
      ) : null}
    </div>
  );
}
