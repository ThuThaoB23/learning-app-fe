import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type VocabularyContributionResponse = {
  id: string;
  contributorUserId?: string | null;
  contributorDisplayName?: string | null;
  term?: string | null;
  definition?: string | null;
  definitionVi?: string | null;
  examples?: string[] | null;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  language?: string | null;
  topicIds?: string[] | null;
  status?:
    | "SUBMITTED"
    | "IN_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "CANCELED"
    | string
    | null;
  reviewNote?: string | null;
  rejectReason?: string | null;
  approvedVocabularyId?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AdminVocabularyContributionQueueItemResponse = {
  id: string;
  term?: string | null;
  language?: string | null;
  partOfSpeech?: string | null;
  contributorUserId?: string | null;
  contributorDisplayName?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

export type VocabularyContributionReviewLogResponse = {
  id: string;
  action?: "SUBMIT" | "START_REVIEW" | "APPROVE" | "REJECT" | "REOPEN" | string | null;
  actorUserId?: string | null;
  actorDisplayName?: string | null;
  note?: string | null;
  createdAt?: string | null;
};

export type AdminVocabularyContributionDetailResponse = {
  contribution?: VocabularyContributionResponse | null;
  reviewLogs?: VocabularyContributionReviewLogResponse[] | null;
};

const getAuth = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const tokenType = cookieStore.get("tokenType")?.value ?? "Bearer";
  if (!accessToken) {
    return null;
  }
  return `${decodeURIComponent(tokenType)} ${decodeURIComponent(accessToken)}`;
};

const authFetchJson = async <T>(url: URL | string): Promise<T | null> => {
  const authorization = await getAuth();
  if (!authorization) {
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: { Authorization: authorization },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const fetchAdminVocabContributions = async (
  page = 0,
  size = 20,
  sort?: string,
  filters?: {
    query?: string;
    language?: string;
    status?: string;
  },
): Promise<PageResponse<AdminVocabularyContributionQueueItemResponse> | null> => {
  const url = new URL(`${API_BASE_URL}/admin/vocab-contributions`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  if (sort) {
    url.searchParams.set("sort", sort);
  }
  if (filters?.query) {
    url.searchParams.set("query", filters.query);
  }
  if (filters?.language) {
    url.searchParams.set("language", filters.language);
  }
  if (filters?.status) {
    url.searchParams.set("status", filters.status);
  }
  return authFetchJson<PageResponse<AdminVocabularyContributionQueueItemResponse>>(url);
};

export const fetchAdminVocabContributionDetail = async (
  id: string,
): Promise<AdminVocabularyContributionDetailResponse | null> => {
  if (!id.trim()) {
    return null;
  }
  return authFetchJson<AdminVocabularyContributionDetailResponse>(
    `${API_BASE_URL}/admin/vocab-contributions/${id}`,
  );
};
