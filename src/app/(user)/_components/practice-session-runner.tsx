"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TestItemResponse } from "@/lib/user-api";
import {
  completeSession,
  submitSessionAnswers,
  submitSessionItemAnswer,
} from "@/lib/user-actions-client";

type PracticeSessionRunnerProps = {
  sessionId: string;
  items: TestItemResponse[];
};

type ItemResult = {
  status?: string;
  message?: string;
  expected?: string;
};

type OptionItem = {
  label: string;
  value: string;
};

type FillMissingConfig = {
  maskedTerm: string;
  missingIndexes: number[];
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const getNested = (payload: Record<string, unknown>, paths: string[]) => {
  for (const path of paths) {
    const steps = path.split(".");
    let cursor: unknown = payload;
    let ok = true;
    for (const step of steps) {
      const record = toRecord(cursor);
      if (!(step in record)) {
        ok = false;
        break;
      }
      cursor = record[step];
    }
    if (ok) {
      return cursor;
    }
  }
  return undefined;
};

const pickText = (payload: Record<string, unknown>) => {
  const keys = [
    "question",
    "prompt",
    "text",
    "questionText",
    "stem",
    "sentence",
    "definition",
    "definitionVi",
    "clue",
    "content",
    "displayText",
    "title",
    "instruction",
  ];
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  const nested = getNested(payload, [
    "question.text",
    "question.prompt",
    "question.questionText",
    "data.question",
    "data.prompt",
    "meta.question",
  ]);
  if (typeof nested === "string" && nested.trim()) {
    return nested.trim();
  }
  return "Hãy đọc câu hỏi và trả lời.";
};

const extractOptions = (payload: Record<string, unknown>, questionType?: string | null) => {
  const raw =
    (Array.isArray(payload.options) && payload.options) ||
    (Array.isArray(payload.choices) && payload.choices) ||
    (Array.isArray(payload.candidates) && payload.candidates) ||
    (Array.isArray(getNested(payload, ["question.options", "question.choices"])) &&
      (getNested(payload, ["question.options", "question.choices"]) as unknown[])) ||
    null;

  if (Array.isArray(raw)) {
    const mapped = raw
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") {
          const text = String(item).trim();
          return text ? { label: text, value: text } : null;
        }
        const record = toRecord(item);
        const label =
          (typeof record.label === "string" && record.label) ||
          (typeof record.text === "string" && record.text) ||
          (typeof record.content === "string" && record.content) ||
          (typeof record.optionText === "string" && record.optionText) ||
          (typeof record.value === "string" && record.value) ||
          "";
        const value =
          (typeof record.value === "string" && record.value) ||
          (typeof record.key === "string" && record.key) ||
          (typeof record.code === "string" && record.code) ||
          (typeof record.id === "string" && record.id) ||
          label;
        return label && value ? { label, value } : null;
      })
      .filter((item): item is OptionItem => Boolean(item));
    if (mapped.length) {
      return mapped;
    }
  }

  if (questionType === "TRUE_FALSE") {
    return [
      { label: "Đúng", value: "true" },
      { label: "Sai", value: "false" },
    ];
  }

  return [];
};

const pickExpectedString = (payload: Record<string, unknown>) => {
  const directKeys = [
    "expected",
    "expectedAnswer",
    "correctAnswer",
    "answerKey",
    "solution",
    "target",
    "targetWord",
    "fullAnswer",
    "term",
    "word",
    "translation",
  ];
  for (const key of directKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const nested = getNested(payload, [
    "question.expected",
    "question.expectedAnswer",
    "question.correctAnswer",
    "question.answerKey",
    "question.solution",
    "question.term",
    "question.word",
    "data.expected",
    "data.expectedAnswer",
    "data.correctAnswer",
    "data.term",
    "meta.expected",
  ]);
  if (typeof nested === "string" && nested.trim()) {
    return nested.trim();
  }

  return undefined;
};

const extractExpectedFromPayload = (
  payload: Record<string, unknown>,
  questionType?: string | null,
  options?: OptionItem[],
) => {
  const normalizedType = (questionType || "").toUpperCase();

  const booleanCorrect =
    typeof payload.correct === "boolean"
      ? String(payload.correct)
      : typeof payload.isCorrect === "boolean"
        ? String(payload.isCorrect)
        : typeof getNested(payload, ["question.correct", "data.correct"]) === "boolean"
          ? String(getNested(payload, ["question.correct", "data.correct"]))
          : undefined;
  if (normalizedType === "TRUE_FALSE" && booleanCorrect) {
    return booleanCorrect;
  }

  const optionIndexCandidates = [
    payload.correctIndex,
    payload.answerIndex,
    payload.correctOptionIndex,
    payload.expectedIndex,
    getNested(payload, [
      "question.correctIndex",
      "question.answerIndex",
      "data.correctIndex",
      "data.answerIndex",
    ]),
  ];
  for (const candidate of optionIndexCandidates) {
    if (typeof candidate === "number" && Number.isInteger(candidate) && options?.length) {
      const option = options[candidate];
      if (option?.value) {
        return option.value;
      }
    }
  }

  const optionValueCandidates = [
    payload.correctOption,
    payload.correctValue,
    payload.answerValue,
    payload.expected,
    getNested(payload, [
      "question.correctOption",
      "question.correctValue",
      "data.correctOption",
      "data.correctValue",
    ]),
  ];
  for (const candidate of optionValueCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  const rawOptions =
    (Array.isArray(payload.options) && payload.options) ||
    (Array.isArray(payload.choices) && payload.choices) ||
    (Array.isArray(payload.candidates) && payload.candidates) ||
    (Array.isArray(getNested(payload, ["question.options", "question.choices"])) &&
      (getNested(payload, ["question.options", "question.choices"]) as unknown[])) ||
    null;

  if (Array.isArray(rawOptions)) {
    for (const raw of rawOptions) {
      const record = toRecord(raw);
      const isCorrectOption =
        record.correct === true ||
        record.isCorrect === true ||
        record.answer === true;
      if (!isCorrectOption) {
        continue;
      }
      const value =
        (typeof record.value === "string" && record.value) ||
        (typeof record.key === "string" && record.key) ||
        (typeof record.code === "string" && record.code) ||
        (typeof record.id === "string" && record.id) ||
        (typeof record.label === "string" && record.label) ||
        (typeof record.text === "string" && record.text) ||
        (typeof record.content === "string" && record.content) ||
        "";
      if (value.trim()) {
        return value.trim();
      }
    }
  }

  return pickExpectedString(payload);
};

const normalizeResult = (data: unknown): ItemResult => {
  const record = toRecord(data);
  const status =
    (typeof record.status === "string" && record.status) ||
    (typeof record.itemStatus === "string" && record.itemStatus) ||
    undefined;
  const message =
    (typeof record.message === "string" && record.message) ||
    (typeof record.feedback === "string" && record.feedback) ||
    undefined;
  const expected =
    (typeof record.expected === "string" && record.expected) ||
    (typeof record.expectedAnswer === "string" && record.expectedAnswer) ||
    (typeof record.correctAnswer === "string" && record.correctAnswer) ||
    undefined;
  return { status, message, expected };
};

const normalizeStatus = (status?: string | null) =>
  (status || "PENDING").toUpperCase();

const isCorrectStatus = (status?: string | null) => {
  const normalized = normalizeStatus(status);
  return normalized === "CORRECT" || normalized === "RIGHT";
};

const isWrongStatus = (status?: string | null) => {
  const normalized = normalizeStatus(status);
  return normalized === "WRONG" || normalized === "INCORRECT";
};

const isAnsweredStatus = (status?: string | null) =>
  normalizeStatus(status) !== "PENDING";

const getFillMissingConfig = (
  payload: Record<string, unknown>,
  questionType?: string | null,
): FillMissingConfig | null => {
  if ((questionType || "").toUpperCase() !== "FILL_MISSING_CHARS") {
    return null;
  }

  const maskedRaw =
    (typeof payload.maskedTerm === "string" && payload.maskedTerm) ||
    (typeof payload.masked === "string" && payload.masked) ||
    (typeof payload.maskedWord === "string" && payload.maskedWord) ||
    (typeof getNested(payload, ["question.maskedTerm", "data.maskedTerm"]) === "string" &&
      (getNested(payload, ["question.maskedTerm", "data.maskedTerm"]) as string)) ||
    "";

  const maskedTerm = maskedRaw.trim();
  if (!maskedTerm) {
    return null;
  }

  const missingIndexes: number[] = [];
  for (let i = 0; i < maskedTerm.length; i += 1) {
    if (maskedTerm[i] === "_") {
      missingIndexes.push(i);
    }
  }

  if (!missingIndexes.length) {
    return null;
  }

  return { maskedTerm, missingIndexes };
};

const splitFillMissingAnswer = (
  maskedTerm: string,
  missingIndexes: number[],
  fullAnswer?: string | null,
) => {
  const normalized = (fullAnswer || "").trim();
  if (!normalized || normalized.length !== maskedTerm.length) {
    return Array(missingIndexes.length).fill("");
  }
  return missingIndexes.map((index) => normalized[index] || "");
};

export default function PracticeSessionRunner({
  sessionId,
  items,
}: PracticeSessionRunnerProps) {
  const router = useRouter();
  const questionCardRef = useRef<HTMLElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fillMissingAnswers, setFillMissingAnswers] = useState<
    Record<string, string[]>
  >({});
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [hasSubmittedAll, setHasSubmittedAll] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmMissingCount, setConfirmMissingCount] = useState(0);
  const [maxQuestionCardHeight, setMaxQuestionCardHeight] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const currentItem = items[currentIndex];
  const payload = useMemo(
    () => toRecord(currentItem?.questionPayload),
    [currentItem?.questionPayload],
  );
  const options = useMemo(
    () => extractOptions(payload, currentItem?.questionType),
    [payload, currentItem?.questionType],
  );
  const promptText = useMemo(() => pickText(payload), [payload]);
  const questionType = (currentItem?.questionType || "").toUpperCase();
  const isMultipleChoice = questionType === "MULTIPLE_CHOICE";
  const fillMissingConfig = useMemo(
    () => getFillMissingConfig(payload, currentItem?.questionType),
    [payload, currentItem?.questionType],
  );

  const goToIndex = (index: number) => {
    const safeIndex = Math.min(items.length - 1, Math.max(0, index));
    setCurrentIndex(safeIndex);
    setError(null);
  };

  const resolveDraftAnswer = (item: TestItemResponse): string | null => {
    const itemPayload = toRecord(item.questionPayload);
    const itemFillConfig = getFillMissingConfig(itemPayload, item.questionType);
    if (itemFillConfig) {
      const filledChars =
        fillMissingAnswers[item.id] ??
        splitFillMissingAnswer(
          itemFillConfig.maskedTerm,
          itemFillConfig.missingIndexes,
          item.userAnswer,
        );
      if (filledChars.some((char) => !char.trim())) {
        return null;
      }
      const chars = itemFillConfig.maskedTerm.split("");
      itemFillConfig.missingIndexes.forEach((index, idx) => {
        chars[index] = (filledChars[idx] || "").trim();
      });
      const combined = chars.join("").trim();
      return combined || null;
    }
    const raw = (answers[item.id] ?? item.userAnswer ?? "").trim();
    return raw || null;
  };

  const currentAnswer = currentItem
    ? answers[currentItem.id] ?? currentItem.userAnswer?.trim() ?? ""
    : "";
  const currentResult = currentItem ? results[currentItem.id] : undefined;
  const currentStatus = normalizeStatus(
    currentResult?.status || currentItem?.status || "PENDING",
  );
  const currentStatusIsCorrect = isCorrectStatus(currentStatus);
  const currentStatusIsWrong = isWrongStatus(currentStatus);
  const isCurrentAnswered = isAnsweredStatus(currentStatus);
  const expectedFromItem = useMemo(() => {
    const itemRecord = toRecord(currentItem);
    const expected =
      (typeof itemRecord.expected === "string" && itemRecord.expected) ||
      (typeof itemRecord.expectedAnswer === "string" && itemRecord.expectedAnswer) ||
      (typeof itemRecord.correctAnswer === "string" && itemRecord.correctAnswer) ||
      "";
    return expected.trim() || undefined;
  }, [currentItem]);
  const expectedFromPayload = useMemo(
    () => extractExpectedFromPayload(payload, currentItem?.questionType, options),
    [payload, currentItem?.questionType, options],
  );
  const currentExpectedAnswer =
    currentStatusIsWrong
      ? (() => {
          const rawExpected =
            currentResult?.expected || expectedFromItem || expectedFromPayload;
          if (!rawExpected) {
            return null;
          }
          const mappedLabel =
            options.find((option) => option.value === rawExpected)?.label ||
            options.find((option) => option.label === rawExpected)?.label;
          return mappedLabel || rawExpected;
        })()
      : null;
  const hasCurrentDraft = currentItem ? Boolean(resolveDraftAnswer(currentItem)) : false;
  const currentFillMissingValues =
    currentItem && fillMissingConfig
      ? fillMissingAnswers[currentItem.id] ??
        splitFillMissingAnswer(
          fillMissingConfig.maskedTerm,
          fillMissingConfig.missingIndexes,
          currentItem.userAnswer,
        )
      : [];

  const pendingItems = items.filter((item) => {
    const status = normalizeStatus(results[item.id]?.status || item.status || "PENDING");
    return status === "PENDING";
  });
  const readyCount = pendingItems.reduce((count, item) => {
    return count + (resolveDraftAnswer(item) ? 1 : 0);
  }, 0);

  const collectPendingAnswers = () => {
    const answeredItems: Array<{ item: TestItemResponse; answer: string }> = [];
    const unansweredItems: TestItemResponse[] = [];
    for (const item of pendingItems) {
      const answer = resolveDraftAnswer(item);
      if (!answer) {
        unansweredItems.push(item);
        continue;
      }
      answeredItems.push({ item, answer });
    }
    return { answeredItems, unansweredItems };
  };

  const uiLanguage: "vi" | "en" = "vi";

  useEffect(() => {
    const element = questionCardRef.current;
    if (!element) {
      return;
    }

    const updateHeight = () => {
      const nextHeight = Math.ceil(element.getBoundingClientRect().height);
      if (!nextHeight) {
        return;
      }
      setMaxQuestionCardHeight((prev) => (nextHeight > prev ? nextHeight : prev));
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [currentIndex]);

  const syncedMinHeightStyle =
    maxQuestionCardHeight > 0 ? { minHeight: `${maxQuestionCardHeight}px` } : undefined;

  const questionTypeLabel = useMemo(() => {
    const labels: Record<string, { vi: string; en: string }> = {
      MULTIPLE_CHOICE: {
        vi: "Trắc nghiệm",
        en: "Multiple choice",
      },
      TRUE_FALSE: {
        vi: "Đúng / Sai",
        en: "True / False",
      },
      FILL_MISSING_CHARS: {
        vi: "Điền ký tự còn thiếu",
        en: "Fill missing characters",
      },
      FILL_IN_BLANK: {
        vi: "Điền vào chỗ trống",
        en: "Fill in the blank",
      },
      SHORT_ANSWER: {
        vi: "Trả lời ngắn",
        en: "Short answer",
      },
      MATCHING: {
        vi: "Nối đáp án",
        en: "Matching",
      },
    };

    const normalized = (currentItem?.questionType || "").toUpperCase();
    const matched = labels[normalized];
    if (matched) {
      return matched[uiLanguage];
    }

    if (!normalized) {
      return uiLanguage === "vi" ? "Chưa xác định" : "Unknown";
    }

    const friendly = normalized
      .toLowerCase()
      .split("_")
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");

    return friendly || (uiLanguage === "vi" ? "Chưa xác định" : "Unknown");
  }, [currentItem?.questionType, uiLanguage]);

  const processSubmit = async (
    answeredItems: Array<{ item: TestItemResponse; answer: string }>,
    unansweredItems: TestItemResponse[],
  ) => {
    if (!pendingItems.length) {
      setError("Không còn câu hỏi chờ chấm.");
      return;
    }

    setError(null);
    setIsSubmittingAll(true);
    const nextResults: Record<string, ItemResult> = {};

    if (unansweredItems.length === 0) {
      const response = await submitSessionAnswers(sessionId, {
        answers: answeredItems.map((entry) => ({
          itemId: entry.item.id,
          answer: entry.answer,
          timeMs: 0,
        })),
      });

      if (!response.ok) {
        setIsSubmittingAll(false);
        setError(response.message);
        return;
      }

      const responseRecord = toRecord(response.data);
      const rawResults = Array.isArray(responseRecord.results)
        ? responseRecord.results
        : [];
      for (const rawResult of rawResults) {
        const resultRecord = toRecord(rawResult);
        const itemId =
          (typeof resultRecord.itemId === "string" && resultRecord.itemId) ||
          (typeof resultRecord.id === "string" && resultRecord.id) ||
          "";
        if (!itemId) {
          continue;
        }
        nextResults[itemId] = normalizeResult(resultRecord);
      }
    } else {
      for (const entry of answeredItems) {
        const response = await submitSessionItemAnswer(sessionId, entry.item.id, {
          answer: entry.answer,
          timeMs: 0,
        });
        if (!response.ok) {
          setIsSubmittingAll(false);
          setError(response.message);
          return;
        }
        nextResults[entry.item.id] = normalizeResult(response.data);
      }
    }

    const completeResponse = await completeSession(sessionId);
    if (!completeResponse.ok) {
      setIsSubmittingAll(false);
      setResults((prev) => ({ ...prev, ...nextResults }));
      setHasSubmittedAll(true);
      setError(`Đã nộp đáp án nhưng chưa thể hoàn thành phiên: ${completeResponse.message}`);
      return;
    }

    setResults((prev) => ({ ...prev, ...nextResults }));
    setHasSubmittedAll(true);
    setIsSubmittingAll(false);
    router.refresh();
  };

  const submitAllAnswers = async () => {
    if (!pendingItems.length) {
      setError("Không còn câu hỏi chờ chấm.");
      return;
    }

    const { answeredItems, unansweredItems } = collectPendingAnswers();
    if (unansweredItems.length > 0) {
      setConfirmMissingCount(unansweredItems.length);
      setConfirmSubmitOpen(true);
      return;
    }

    await processSubmit(answeredItems, unansweredItems);
  };

  const confirmSubmitWithMissing = async () => {
    setConfirmSubmitOpen(false);
    const { answeredItems, unansweredItems } = collectPendingAnswers();
    await processSubmit(answeredItems, unansweredItems);
  };

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white/70 p-6 text-sm text-[#64748b]">
        Session chưa có câu hỏi.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section
          style={syncedMinHeightStyle}
          className="h-full rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] lg:order-1"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            Danh sách câu hỏi
          </p>
          <div className="grid grid-cols-5 gap-2">
            {items.map((item, index) => {
              const itemStatus = normalizeStatus(
                results[item.id]?.status || item.status || "PENDING",
              );
              const isCurrent = index === currentIndex;
              const isCorrect = isCorrectStatus(itemStatus);
              const isWrong = isWrongStatus(itemStatus);
              const done = isAnsweredStatus(itemStatus);
              const hasDraft = !done && Boolean(resolveDraftAnswer(item));
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToIndex(index)}
                  className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${
                    isCurrent
                      ? "border-[#0b0f14] bg-[#0b0f14] text-white"
                      : isCorrect
                        ? "border-[#34d399]/40 bg-[#ecfdf5] text-[#166534]"
                        : isWrong
                          ? "border-[#fb7185]/40 bg-[#fff1f2] text-[#be123c]"
                          : hasDraft
                            ? "border-[#60a5fa]/40 bg-[#eff6ff] text-[#1d4ed8]"
                            : done
                              ? "border-[#cbd5e1] bg-[#f8fafc] text-[#475569]"
                              : "border-[#e5e7eb] bg-white text-[#64748b]"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </section>

        <article
          ref={questionCardRef}
          style={syncedMinHeightStyle}
          className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:order-2"
        >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#0b0f14]">
            {uiLanguage === "vi" ? "Câu" : "Question"} {currentIndex + 1}: {questionTypeLabel}
          </h3>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              currentStatusIsCorrect
                ? "border-[#34d399]/40 bg-[#ecfdf5] text-[#166534]"
                : currentStatusIsWrong
                  ? "border-[#fb7185]/40 bg-[#fff1f2] text-[#be123c]"
                  : hasCurrentDraft
                    ? "border-[#60a5fa]/40 bg-[#eff6ff] text-[#1d4ed8]"
                  : "border-[#e5e7eb] text-[#64748b]"
            }`}
          >
            {hasCurrentDraft && !isCurrentAnswered
              ? "ĐÃ CHỌN"
              : currentResult?.status || currentItem.status || "PENDING"}
          </span>
        </div>

        <p className="mt-4 text-base text-[#0f172a]">{promptText}</p>
        {promptText === "Hãy đọc câu hỏi và trả lời." ? (
          <p className="mt-1 text-xs text-[#be123c]">
            Chưa nhận diện được nội dung câu hỏi từ payload.
          </p>
        ) : null}

        <div className="mt-5">
          {fillMissingConfig ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#334155]">
                Điền các ký tự còn thiếu
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {fillMissingConfig.maskedTerm.split("").map((char, charIndex) => {
                  const missingOrder = fillMissingConfig.missingIndexes.indexOf(charIndex);
                  if (missingOrder === -1) {
                    return (
                      <span
                        key={`${currentItem.id}-fixed-${charIndex}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#e5e7eb] bg-[#f8fafc] text-base font-semibold text-[#0b0f14]"
                      >
                        {char}
                      </span>
                    );
                  }

                  const filled =
                    currentFillMissingValues[missingOrder] || "";
                  return (
                    <input
                      key={`${currentItem.id}-missing-${charIndex}`}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={filled}
                      disabled={isCurrentAnswered}
                      onChange={(event) => {
                        const value = event.target.value.slice(-1);
                        setFillMissingAnswers((prev) => {
                          const next = [...(prev[currentItem.id] ?? Array(fillMissingConfig.missingIndexes.length).fill(""))];
                          next[missingOrder] = value;
                          return { ...prev, [currentItem.id]: next };
                        });
                      }}
                      className="h-11 w-11 rounded-lg border border-[#0b0f14]/25 bg-white text-center text-base font-semibold text-[#0b0f14] focus:border-[#0b0f14] focus:outline-none"
                    />
                  );
                })}
              </div>
            </div>
          ) : options.length && isMultipleChoice ? (
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-semibold text-[#334155]">
                Chọn 1 đáp án đúng
              </legend>
              {options.map((option, index) => (
                <label
                  key={`${currentItem.id}-${option.value}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    currentAnswer === option.value
                      ? "border-[#0b0f14] bg-[#0b0f14] text-white"
                      : "border-[#e5e7eb] bg-white text-[#0b0f14] hover:border-[#0b0f14]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`mcq-${currentItem.id}`}
                    checked={currentAnswer === option.value}
                    disabled={isCurrentAnswered}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [currentItem.id]: option.value }))
                    }
                    className="h-4 w-4"
                  />
                  <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>
          ) : options.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((option) => {
                const active = currentAnswer === option.value;
                return (
                  <button
                    key={`${currentItem.id}-${option.value}`}
                    type="button"
                    disabled={isCurrentAnswered}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [currentItem.id]: option.value }))
                    }
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? "border-[#0b0f14] bg-[#0b0f14] text-white"
                        : "border-[#e5e7eb] bg-white text-[#0b0f14] hover:border-[#0b0f14]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={currentAnswer}
                disabled={isCurrentAnswered}
                onChange={(event) =>
                  setAnswers((prev) => ({ ...prev, [currentItem.id]: event.target.value }))
                }
                rows={4}
                placeholder="Nhập câu trả lời của bạn..."
                className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:border-[#0b0f14] focus:outline-none"
              />
              <details className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3">
                <summary className="cursor-pointer text-xs font-semibold text-[#475569]">
                  Xem questionPayload (debug)
                </summary>
                <pre className="mt-2 overflow-x-auto text-xs text-[#334155]">
                  {JSON.stringify(payload, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {error ? <p className="mt-3 text-sm text-[#be123c]">{error}</p> : null}
        {hasSubmittedAll && pendingItems.length === 0 ? (
          <p className="mt-3 text-sm text-[#166534]">
            Đã nộp toàn bộ đáp án, hệ thống đã chấm xong.
          </p>
        ) : null}
        {currentResult?.message ? (
          <p
            className={`mt-3 text-sm ${
              currentStatusIsCorrect
                ? "text-[#166534]"
                : currentStatusIsWrong
                  ? "text-[#be123c]"
                  : "text-[#475569]"
            }`}
          >
            {currentResult.message}
          </p>
        ) : null}
        {currentExpectedAnswer ? (
          <p className="mt-2 text-sm font-medium text-[#be123c]">
            Đáp án đúng: <span className="font-semibold">{currentExpectedAnswer}</span>
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => goToIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="rounded-full border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14] disabled:pointer-events-none disabled:opacity-50"
          >
            Câu trước
          </button>
          <button
            type="button"
            onClick={submitAllAnswers}
            disabled={isSubmittingAll || pendingItems.length === 0}
            className="rounded-full bg-[#0b0f14] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:opacity-70"
          >
            {isSubmittingAll
              ? "Đang nộp bài..."
              : pendingItems.length === 0
                ? "Không còn câu chờ chấm"
                : `Nộp bài (${readyCount}/${pendingItems.length})`}
          </button>
          <button
            type="button"
            onClick={() => goToIndex(currentIndex + 1)}
            disabled={currentIndex >= items.length - 1}
            className="rounded-full border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14] disabled:pointer-events-none disabled:opacity-50"
          >
            Câu sau
          </button>
        </div>
        </article>
      </div>

      {confirmSubmitOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/55 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-[0_30px_80px_rgba(2,6,23,0.3)]">
            <h4 className="text-base font-semibold text-[#0f172a]">Xác nhận nộp bài</h4>
            <p className="mt-2 text-sm text-[#475569]">
              Bạn còn <span className="font-semibold">{confirmMissingCount}</span> câu
              chưa trả lời. Nếu nộp ngay, các câu này sẽ bị bỏ qua.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(false)}
                disabled={isSubmittingAll}
                className="rounded-full border border-[#d6dfeb] px-4 py-2 text-sm font-semibold text-[#334155] transition hover:border-[#94a3b8] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Quay lại làm tiếp
              </button>
              <button
                type="button"
                onClick={confirmSubmitWithMissing}
                disabled={isSubmittingAll}
                className="rounded-full bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
