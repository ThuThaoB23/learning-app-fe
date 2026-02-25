import { getAuthHeader } from "@/lib/client-auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type MutationResult<T = unknown> =
  | { ok: true; data: T | null }
  | { ok: false; message: string };

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
    | (T & { message?: string; error?: string })
    | null;

  if (!response.ok) {
    return {
      ok: false,
      message: data?.message ?? data?.error ?? fallbackMessage,
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
