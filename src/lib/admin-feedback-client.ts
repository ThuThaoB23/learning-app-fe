import { getAuthHeader } from "@/lib/client-auth";

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type MutationResult<T = unknown> =
  | { ok: true; data: T | null }
  | { ok: false; message: string };

const UNAUTHORIZED_MESSAGE = "Bạn chưa đăng nhập hoặc phiên đã hết hạn.";
const NETWORK_ERROR_MESSAGE = "Không thể kết nối máy chủ. Vui lòng thử lại.";

const parseMutationResponse = async <T>(
  response: Response,
  fallbackMessage: string,
): Promise<MutationResult<T>> => {
  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string; error?: string })
    | null;

  if (!response.ok) {
    return {
      ok: false,
      message: data?.message ?? data?.error ?? fallbackMessage,
    };
  }

  return {
    ok: true,
    data,
  };
};

const patch = async <T>(
  path: string,
  fallbackMessage: string,
): Promise<MutationResult<T>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader,
      },
    });

    return await parseMutationResponse<T>(response, fallbackMessage);
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};

export const markAdminFeedbackAsRead = async <TResponse = Record<string, unknown>>(
  id: string,
) => {
  return patch<TResponse>(`/admin/feedback/${id}/read`, "Không thể đánh dấu feedback đã đọc.");
};

export const archiveAdminFeedback = async <TResponse = Record<string, unknown>>(
  id: string,
) => {
  return patch<TResponse>(`/admin/feedback/${id}/archive`, "Không thể lưu trữ feedback.");
};
