import { getAuthHeader } from "@/lib/client-auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type MutationResult<T = unknown> =
  | { ok: true; data: T | null }
  | { ok: false; message: string };
type QueryResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export type CreateVocabContributionInput = {
  term: string;
  definition: string;
  definitionVi?: string;
  examples: string[];
  phonetic?: string;
  partOfSpeech?: string;
  language: string;
  topicIds: string[];
};

export type UpdateVocabInput = {
  term: string;
  definition: string;
  definitionVi?: string;
  examples: UpdateVocabExampleInput[];
  phonetic?: string;
  partOfSpeech?: string;
  language: string;
  topicIds: string[];
};

export type UpdateVocabExampleInput = {
  id?: string;
  value: string;
};

export type VocabularyImportError = {
  row: number;
  message: string;
};

export type VocabularyImportResultResponse = {
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors?: VocabularyImportError[];
};

export type VocabularyContributionResponse = {
  id: string;
  term?: string | null;
  definition?: string | null;
  definitionVi?: string | null;
  examples?: string[] | null;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  language?: string | null;
  topicIds?: string[] | null;
  status?: string | null;
  reviewNote?: string | null;
  rejectReason?: string | null;
  approvedVocabularyId?: string | null;
  reviewedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

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

export const createVocabContribution = async <
  TResponse = Record<string, unknown>,
>(
  input: CreateVocabContributionInput,
): Promise<MutationResult<TResponse>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  const payload = {
    term: input.term.trim(),
    definition: input.definition.trim(),
    definitionVi: input.definitionVi?.trim() || undefined,
    examples: input.examples
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
    phonetic: input.phonetic?.trim() || undefined,
    partOfSpeech: input.partOfSpeech?.trim() || undefined,
    language: input.language.trim(),
    topicIds: input.topicIds,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/vocab/contributions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    return await parseMutationResponse<TResponse>(
      response,
      "Không thể tạo từ vựng.",
    );
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};

export const updateVocab = async <TResponse = Record<string, unknown>>(
  id: string,
  input: UpdateVocabInput,
): Promise<MutationResult<TResponse>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  const payload = {
    term: input.term.trim(),
    definition: input.definition.trim(),
    definitionVi: input.definitionVi?.trim() || undefined,
    examples: input.examples
      .map((item) => {
        const value = item.value.trim();
        if (!value) {
          return null;
        }
        return {
          id: item.id?.trim() || undefined,
          value,
        };
      })
      .filter((item): item is { id?: string; value: string } => Boolean(item)),
    phonetic: input.phonetic?.trim() || undefined,
    partOfSpeech: input.partOfSpeech?.trim() || undefined,
    language: input.language.trim(),
    topicIds: input.topicIds,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/admin/vocab/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    return await parseMutationResponse<TResponse>(
      response,
      "Không thể cập nhật từ vựng.",
    );
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};

export const fetchAdminVocabDetail = async <
  TResponse = Record<string, unknown>,
>(
  id: string,
): Promise<QueryResult<TResponse>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/vocab/${id}`, {
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
        ok: false,
        message:
          data?.message ?? data?.error ?? "Không thể tải chi tiết từ vựng.",
      };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};

export const importVocabCsv = async (
  file: File,
): Promise<MutationResult<VocabularyImportResultResponse>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/admin/vocab/import`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    return await parseMutationResponse<VocabularyImportResultResponse>(
      response,
      "Không thể import file CSV.",
    );
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};

export const deleteVocab = async (
  id: string,
): Promise<MutationResult<null>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/vocab/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    });

    return await parseMutationResponse<null>(response, "Không thể xóa từ vựng.");
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};

export const approveVocabContribution = async <
  TResponse = VocabularyContributionResponse,
>(
  id: string,
  input?: { reviewNote?: string },
): Promise<MutationResult<TResponse>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  const payload =
    input?.reviewNote && input.reviewNote.trim()
      ? { reviewNote: input.reviewNote.trim() }
      : undefined;

  try {
    const response = await fetch(`${API_BASE_URL}/admin/vocab-contributions/${id}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload ?? {}),
    });

    return await parseMutationResponse<TResponse>(
      response,
      "Không thể duyệt đóng góp từ vựng.",
    );
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};

export const rejectVocabContribution = async <
  TResponse = VocabularyContributionResponse,
>(
  id: string,
  input: { rejectReason: string; reviewNote?: string },
): Promise<MutationResult<TResponse>> => {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return { ok: false, message: UNAUTHORIZED_MESSAGE };
  }

  const payload = {
    rejectReason: input.rejectReason.trim(),
    reviewNote: input.reviewNote?.trim() || undefined,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/admin/vocab-contributions/${id}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    return await parseMutationResponse<TResponse>(
      response,
      "Không thể từ chối đóng góp từ vựng.",
    );
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
};
