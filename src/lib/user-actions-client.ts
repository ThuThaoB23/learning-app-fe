import { getAuthHeader } from "@/lib/client-auth";
import type { PageResponse, UserVocabularyResponse } from "@/lib/user-api";

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type MutationResult<T = unknown> =
  | { ok: true; data: T | null }
  | { ok: false; message: string; errorCode?: string };
type QueryResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export type VocabularySearchItem = {
  id: string;
  term?: string | null;
  definition?: string | null;
  definitionVi?: string | null;
  partOfSpeech?: string | null;
  language?: string | null;
  status?: string | null;
  inMyVocab?: boolean | null;
};

export type VocabularySearchPageResponse = {
  content: VocabularySearchItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type UpdateProfileInput = {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  locale?: string;
  timeZone?: string;
  dailyGoal?: number;
};

type UpdateUserVocabularyInput = {
  status?: "NEW" | "LEARNING" | "MASTERED";
  progress?: number;
};

const UNAUTHORIZED_MESSAGE = "Bạn chưa đăng nhập hoặc phiên đã hết hạn.";
const NETWORK_ERROR_MESSAGE = "Không thể kết nối máy chủ. Vui lòng thử lại.";

const parseMutationResponse = async <T>(
  response: Response,
  fallbackMessage: string,
): Promise<MutationResult<T>> => {
  if (response.status === 204) {
    return { ok: true, data: null };
  }

  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string; error?: string; errorCode?: string })
    | null;

  if (!response.ok) {
    return {
      ok: false,
      message: data?.message ?? data?.error ?? fallbackMessage,
      errorCode: data?.errorCode,
    };
  }

  return { ok: true, data };
};

const request = async <T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  fallbackMessage: string,
  payload?: Record<string, unknown>,
): Promise<MutationResult<T>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  const headers: HeadersInit = {
    Authorization: authHeader,
  };

  if (payload) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
    });

    return await parseMutationResponse<T>(response, fallbackMessage);
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};

export const updateMe = async <TResponse = Record<string, unknown>>(
  input: UpdateProfileInput,
) => {
  const payload = {
    username: input.username?.trim() || undefined,
    displayName: input.displayName?.trim() || undefined,
    avatarUrl: input.avatarUrl?.trim() || undefined,
    locale: input.locale?.trim() || undefined,
    timeZone: input.timeZone?.trim() || undefined,
    dailyGoal:
      typeof input.dailyGoal === "number" ? Math.max(1, input.dailyGoal) : undefined,
  };

  return request<TResponse>("/me", "PATCH", "Không thể cập nhật hồ sơ.", payload);
};

export const updateMyAvatar = async <TResponse = Record<string, unknown>>(
  file: File,
) => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false as const, message: UNAUTHORIZED_MESSAGE };
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/me/avatar`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    return await parseMutationResponse<TResponse>(
      response,
      "Không thể cập nhật ảnh đại diện.",
    );
  } catch {
    return { ok: false as const, message: NETWORK_ERROR_MESSAGE };
  }
};

export const addToMyVocab = async <TResponse = Record<string, unknown>>(
  vocabularyId: string,
) => {
  return request<TResponse>("/me/vocab", "POST", "Không thể thêm từ vào danh sách.", {
    vocabularyId,
  });
};

export const updateMyVocab = async <TResponse = Record<string, unknown>>(
  vocabularyId: string,
  input: UpdateUserVocabularyInput,
) => {
  const payload = {
    status: input.status,
    progress:
      typeof input.progress === "number"
        ? Math.min(100, Math.max(0, input.progress))
        : undefined,
  };

  return request<TResponse>(
    `/me/vocab/${vocabularyId}`,
    "PATCH",
    "Không thể cập nhật tiến độ từ vựng.",
    payload,
  );
};

export const removeFromMyVocab = async (vocabularyId: string) => {
  return request<null>(
    `/me/vocab/${vocabularyId}`,
    "DELETE",
    "Không thể xóa từ khỏi danh sách cá nhân.",
  );
};

export const createDailySession = async <TResponse = Record<string, unknown>>() => {
  return request<TResponse>(
    "/me/sessions/daily",
    "POST",
    "Không thể tạo phiên học hằng ngày.",
  );
};

type CreateTopicSessionInput = {
  topicIds: string[];
  totalItems?: number;
};

type CreateSelectedVocabularySessionInput = {
  vocabularyIds: string[];
  questionTypes: string[];
};

export const createTopicSession = async <TResponse = Record<string, unknown>>(
  input: CreateTopicSessionInput,
) => {
  const topicIds = input.topicIds
    .map((item) => item.trim())
    .filter((item, index, array) => item && array.indexOf(item) === index);

  const rawTotal = input.totalItems;
  const totalItems =
    typeof rawTotal === "number" && Number.isFinite(rawTotal)
      ? Math.max(1, Math.floor(rawTotal))
      : undefined;

  return request<TResponse>(
    "/me/sessions/topic",
    "POST",
    "Không thể tạo phiên theo chủ đề.",
    {
      topicIds,
      totalItems,
    },
  );
};

export const createSelectedVocabularySession = async <
  TResponse = Record<string, unknown>,
>(
  input: CreateSelectedVocabularySessionInput,
) => {
  const vocabularyIds = input.vocabularyIds
    .map((item) => item.trim())
    .filter((item, index, array) => item && array.indexOf(item) === index);
  const questionTypes = input.questionTypes
    .map((item) => item.trim().toUpperCase())
    .filter((item, index, array) => item && array.indexOf(item) === index);

  return request<TResponse>(
    "/me/sessions/vocab",
    "POST",
    "Không thể tạo phiên từ danh sách từ đã chọn.",
    {
      vocabularyIds,
      questionTypes,
    },
  );
};

export const completeSession = async <TResponse = Record<string, unknown>>(
  sessionId: string,
) => {
  return request<TResponse>(
    `/me/sessions/${sessionId}/complete`,
    "POST",
    "Không thể hoàn thành phiên học.",
  );
};

export const abandonSession = async <TResponse = Record<string, unknown>>(
  sessionId: string,
) => {
  return request<TResponse>(
    `/me/sessions/${sessionId}/abandon`,
    "POST",
    "Không thể hủy phiên học.",
  );
};

export const fetchSessionDetailClient = async <
  TResponse = Record<string, unknown>,
>(
  sessionId: string,
) => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false as const, message: UNAUTHORIZED_MESSAGE };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/me/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | (TResponse & { message?: string; error?: string })
      | null;

    if (!response.ok || !data) {
      return {
        ok: false as const,
        message: data?.message ?? data?.error ?? "Không thể tải session.",
      };
    }

    return { ok: true as const, data };
  } catch {
    return { ok: false as const, message: NETWORK_ERROR_MESSAGE };
  }
};

export const searchVocabClient = async (
  params: {
    query: string;
    language?: string;
    page?: number;
    size?: number;
    status?: string;
    includeMyVocab?: boolean;
  },
): Promise<QueryResult<VocabularySearchPageResponse>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  const query = new URLSearchParams();
  query.set("query", params.query.trim());
  query.set("page", String(Math.max(0, params.page ?? 0)));
  query.set("size", String(Math.min(20, Math.max(1, params.size ?? 8))));
  if (params.language?.trim()) {
    query.set("language", params.language.trim());
  }
  if (params.status?.trim()) {
    query.set("status", params.status.trim());
  }
  if (typeof params.includeMyVocab === "boolean") {
    query.set("includeMyVocab", String(params.includeMyVocab));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/vocab?${query.toString()}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | (VocabularySearchPageResponse & { message?: string; error?: string })
      | null;

    if (!response.ok || !data) {
      return {
        ok: false,
        message:
          data?.message ?? data?.error ?? "Không thể tìm từ vựng trong hệ thống.",
      };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};

export const fetchMyVocabClient = async (params?: {
  query?: string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<QueryResult<PageResponse<UserVocabularyResponse>>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  const query = new URLSearchParams();
  query.set("page", String(Math.max(0, params?.page ?? 0)));
  query.set("size", String(Math.min(100, Math.max(1, params?.size ?? 12))));
  query.set("sort", params?.sort?.trim() || "updatedAt,desc");
  if (params?.status?.trim()) {
    query.set("status", params.status.trim());
  }

  try {
    const response = await fetch(`${API_BASE_URL}/me/vocab?${query.toString()}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | (PageResponse<UserVocabularyResponse> & { message?: string; error?: string })
      | null;

    if (!response.ok || !data) {
      return {
        ok: false,
        message:
          data?.message ?? data?.error ?? "Không thể tải danh sách từ cá nhân.",
      };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};

export const submitSessionItemAnswer = async <
  TResponse = Record<string, unknown>,
>(
  sessionId: string,
  itemId: string,
  input: { answer: string; timeMs: number },
) => {
  return request<TResponse>(
    `/me/sessions/${sessionId}/items/${itemId}/answer`,
    "POST",
    "Không thể gửi câu trả lời.",
    {
      answer: input.answer,
      timeMs: Math.max(0, input.timeMs),
    },
  );
};

export type SubmitSessionAnswersInput = {
  answers: Array<{
    itemId: string;
    answer: string;
    timeMs: number;
  }>;
};

export const submitSessionAnswers = async <
  TResponse = Record<string, unknown>,
>(
  sessionId: string,
  input: SubmitSessionAnswersInput,
) => {
  return request<TResponse>(
    `/me/sessions/${sessionId}/answers`,
    "POST",
    "Không thể nộp toàn bộ đáp án.",
    {
      answers: input.answers.map((item) => ({
        itemId: item.itemId,
        answer: item.answer,
        timeMs: Math.max(0, item.timeMs),
      })),
    },
  );
};

