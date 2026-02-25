type ScoreView = {
  score?: number;
  correct?: number;
  wrong?: number;
  total?: number;
  accuracyPercent?: number;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const pickNumber = (
  source: Record<string, unknown>,
  keys: string[],
): number | undefined => {
  for (const key of keys) {
    const value = toNumber(source[key]);
    if (typeof value === "number") {
      return value;
    }
  }
  return undefined;
};

export const extractSessionScore = (input: unknown): ScoreView | null => {
  const record = toRecord(input);
  if (!Object.keys(record).length) {
    return null;
  }

  const score = pickNumber(record, ["score", "sessionScore", "totalScore", "point", "points"]);
  const correct = pickNumber(record, ["correct", "correctCount", "correctAnswers", "rightCount"]);
  const wrong = pickNumber(record, ["wrong", "wrongCount", "wrongAnswers"]);
  const totalDirect = pickNumber(record, ["total", "totalCount", "totalQuestions", "questionCount"]);
  const accuracyRaw = pickNumber(record, ["accuracy", "accuracyRate", "accuracyPercent", "rate"]);
  const totalFromItems = Array.isArray(record.items) ? record.items.length : undefined;
  const total = totalDirect ?? totalFromItems;
  const accuracyPercent =
    typeof accuracyRaw === "number"
      ? accuracyRaw <= 1
        ? Math.round(accuracyRaw * 100)
        : Math.round(accuracyRaw)
      : typeof correct === "number" && typeof total === "number" && total > 0
        ? Math.round((correct / total) * 100)
        : undefined;

  if (
    typeof score !== "number" &&
    typeof correct !== "number" &&
    typeof wrong !== "number" &&
    typeof total !== "number" &&
    typeof accuracyPercent !== "number"
  ) {
    return null;
  }

  return { score, correct, wrong, total, accuracyPercent };
};

export const formatSessionScore = (score: ScoreView | null): string | null => {
  if (!score) {
    return null;
  }

  const parts: string[] = [];

  if (typeof score.score === "number") {
    parts.push(`Điểm: ${score.score}`);
  }
  if (typeof score.correct === "number" && typeof score.total === "number") {
    parts.push(`Đúng: ${score.correct}/${score.total}`);
  } else if (typeof score.correct === "number") {
    parts.push(`Đúng: ${score.correct}`);
  }
  if (typeof score.wrong === "number") {
    parts.push(`Sai: ${score.wrong}`);
  }
  if (typeof score.accuracyPercent === "number") {
    parts.push(`Chính xác: ${score.accuracyPercent}%`);
  }

  return parts.length ? parts.join(" • ") : null;
};
