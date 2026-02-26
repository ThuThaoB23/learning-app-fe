export const vocabularyContributionRejectReasonLabels: Record<string, string> = {
  DUPLICATE: "Trùng từ đã có",
  INVALID_DEFINITION: "Định nghĩa không hợp lệ",
  WRONG_LANGUAGE: "Sai ngôn ngữ",
  LOW_QUALITY: "Chất lượng thấp",
  INAPPROPRIATE_CONTENT: "Nội dung không phù hợp",
  OTHER: "Lý do khác",
};

export const vocabularyContributionRejectReasonOptions = [
  "DUPLICATE",
  "INVALID_DEFINITION",
  "WRONG_LANGUAGE",
  "LOW_QUALITY",
  "INAPPROPRIATE_CONTENT",
  "OTHER",
] as const;

export const formatVocabularyContributionRejectReason = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  return vocabularyContributionRejectReasonLabels[value] ?? value;
};
