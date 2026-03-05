"use client";

import { useEffect, useRef, useState } from "react";

type VocabAudioButtonProps = {
  audioUrl: string;
  term?: string | null;
};

export default function VocabAudioButton({
  audioUrl,
  term,
}: VocabAudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const clearLoadTimeout = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearLoadTimeout();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopPlayback = () => {
    clearLoadTimeout();
    if (!audioRef.current) {
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handlePlay = async () => {
    if (isPlaying || isLoading) {
      stopPlayback();
      return;
    }

    if (audioRef.current) {
      stopPlayback();
    }

    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    setHasError(false);
    setIsLoading(true);

    audio.onplaying = () => {
      clearLoadTimeout();
      setIsPlaying(true);
      setIsLoading(false);
    };
    audio.onpause = () => {
      clearLoadTimeout();
      setIsPlaying(false);
      setIsLoading(false);
    };
    audio.onended = () => {
      clearLoadTimeout();
      setIsPlaying(false);
      setIsLoading(false);
      audioRef.current = null;
    };
    audio.onerror = () => {
      clearLoadTimeout();
      setIsPlaying(false);
      setIsLoading(false);
      setHasError(true);
      audioRef.current = null;
    };

    audioRef.current = audio;
    loadTimeoutRef.current = setTimeout(() => {
      if (audioRef.current === audio && audio.paused) {
        audio.pause();
        audioRef.current = null;
        setIsLoading(false);
        setHasError(true);
      }
    }, 8000);

    try {
      await audio.play();
    } catch {
      clearLoadTimeout();
      setHasError(true);
      setIsPlaying(false);
      setIsLoading(false);
      audioRef.current = null;
    }
  };

  const label = term ? `Phát âm từ ${term}` : "Phát âm từ vựng";
  const title = hasError
    ? `${label} (không phát được audio)`
    : isLoading
      ? `${label} (đang tải)`
      : isPlaying
        ? `${label} (nhấn để dừng)`
        : label;

  return (
    <div className="inline-flex items-center">
      <button
        type="button"
        onClick={() => {
          void handlePlay();
        }}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
          hasError
            ? "border-[#fecaca] bg-[#fff1f2] text-[#be123c] hover:border-[#be123c]"
            : isPlaying
              ? "border-[#86efac] bg-[#ecfdf5] text-[#166534] hover:border-[#166534]"
              : "border-[#e5e7eb] bg-white text-[#334155] hover:border-[#0b0f14] hover:text-[#0b0f14]"
        } disabled:cursor-not-allowed disabled:opacity-70`}
        aria-label={title}
        title={title}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M7 7h10v10H7z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M8 6.5a1 1 0 0 1 1.53-.848l9 5.5a1 1 0 0 1 0 1.696l-9 5.5A1 1 0 0 1 8 17.5v-11Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
