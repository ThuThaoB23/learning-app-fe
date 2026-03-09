import type { TestItemResponse } from "@/lib/user-api";

export type ItemResult = {
  status?: string;
  message?: string;
  expected?: string;
};

export type OptionItem = {
  label: string;
  value: string;
};

export type FillMissingConfig = {
  maskedTerm: string;
  missingIndexes: number[];
};

export type AudioPromptConfig = {
  audioUrl?: string;
  accent?: string;
};

export const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

export const getNested = (payload: Record<string, unknown>, paths: string[]) => {
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

export const pickText = (payload: Record<string, unknown>) => {
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

export const extractOptions = (
  payload: Record<string, unknown>,
  questionType?: string | null,
) => {
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

export const extractExpectedFromPayload = (
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

export const normalizeResult = (data: unknown): ItemResult => {
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

export const normalizeStatus = (status?: string | null) =>
  (status || "PENDING").toUpperCase();

export const isCorrectStatus = (status?: string | null) => {
  const normalized = normalizeStatus(status);
  return normalized === "CORRECT" || normalized === "RIGHT";
};

export const isWrongStatus = (status?: string | null) => {
  const normalized = normalizeStatus(status);
  return normalized === "WRONG" || normalized === "INCORRECT";
};

export const isAnsweredStatus = (status?: string | null) =>
  normalizeStatus(status) !== "PENDING";

export const getFillMissingConfig = (
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

export const splitFillMissingAnswer = (
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

export const extractAudioPromptConfig = (
  payload: Record<string, unknown>,
): AudioPromptConfig => {
  const audioUrlCandidates = [
    payload.audioUrl,
    payload.audio,
    getNested(payload, [
      "question.audioUrl",
      "question.audio",
      "data.audioUrl",
      "data.audio",
      "meta.audioUrl",
    ]),
  ];

  const accentCandidates = [
    payload.accent,
    payload.voice,
    getNested(payload, [
      "question.accent",
      "question.voice",
      "data.accent",
      "data.voice",
      "meta.accent",
    ]),
  ];

  const audioUrl = audioUrlCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  )?.trim();

  const accent = accentCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  )?.trim();

  return { audioUrl, accent };
};

export const getQuestionTypeLabel = (
  questionType?: string | null,
  uiLanguage: "vi" | "en" = "vi",
) => {
  const labels: Record<string, { vi: string; en: string }> = {
    MULTIPLE_CHOICE: {
      vi: "Trắc nghiệm",
      en: "Multiple choice",
    },
    TRUE_FALSE: {
      vi: "Đúng / Sai",
      en: "True / False",
    },
    LISTEN_AND_CHOOSE: {
      vi: "Nghe và chọn",
      en: "Listen and choose",
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

  const normalized = (questionType || "").toUpperCase();
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
};

export const resolveItemExpectedAnswer = (item?: TestItemResponse | null) => {
  if (!item) {
    return undefined;
  }

  const itemRecord = toRecord(item);
  const itemExpected =
    (typeof itemRecord.expected === "string" && itemRecord.expected) ||
    (typeof itemRecord.expectedAnswer === "string" && itemRecord.expectedAnswer) ||
    (typeof itemRecord.correctAnswer === "string" && itemRecord.correctAnswer) ||
    "";
  if (itemExpected.trim()) {
    const payload = toRecord(item.questionPayload);
    const options = extractOptions(payload, item.questionType);
    return normalizeExpectedToAnswerValue(itemExpected.trim(), options);
  }

  const payload = toRecord(item.questionPayload);
  const options = extractOptions(payload, item.questionType);
  const expected = extractExpectedFromPayload(payload, item.questionType, options);
  return normalizeExpectedToAnswerValue(expected, options);
};

export const normalizeExpectedToAnswerValue = (
  expected?: string | null,
  options: OptionItem[] = [],
) => {
  const normalized = expected?.trim();
  if (!normalized) {
    return undefined;
  }
  const matched = options.find(
    (option) => option.value === normalized || option.label === normalized,
  );
  return matched?.value || normalized;
};

export const formatExpectedAnswer = (
  expected?: string | null,
  options: OptionItem[] = [],
) => {
  const normalized = expected?.trim();
  if (!normalized) {
    return null;
  }
  const matched = options.find(
    (option) => option.value === normalized || option.label === normalized,
  );
  return matched?.label || normalized;
};
