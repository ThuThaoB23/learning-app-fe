import { getAuthHeader } from "@/lib/client-auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type TopicMutationInput = {
  name: string;
  description?: string;
  status?: string;
};

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

const requestTopicMutation = async <T>(
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

export const createAdminTopic = async (input: TopicMutationInput) => {
  const payload = {
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
  };

  return requestTopicMutation("/admin/topics", "POST", "Không thể tạo chủ đề.", payload);
};

export const updateAdminTopic = async (
  topicId: string,
  input: TopicMutationInput,
) => {
  const payload: Record<string, unknown> = {
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
  };

  if (input.status) {
    payload.status = input.status;
  }

  return requestTopicMutation(
    `/admin/topics/${topicId}`,
    "PATCH",
    "Không thể cập nhật chủ đề.",
    payload,
  );
};

export const deleteAdminTopic = async (topicId: string) => {
  return requestTopicMutation(
    `/admin/topics/${topicId}`,
    "DELETE",
    "Không thể xóa chủ đề.",
  );
};
