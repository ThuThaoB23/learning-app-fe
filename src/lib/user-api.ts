import { cookies } from "next/headers";

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type UserProfileResponse = {
  id: string;
  email: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  status?: string | null;
  locale?: string | null;
  timeZone?: string | null;
  dailyGoal?: number | null;
  preferences?: Record<string, unknown> | null;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type TopicResponse = {
  id: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE" | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type VocabularyResponse = {
  id: string;
  term?: string | null;
  definition?: string | null;
  definitionVi?: string | null;
  examples?: string[] | null;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  language?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED" | string | null;
  inMyVocab?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type UserVocabularyResponse = {
  id: string;
  term?: string | null;
  userId?: string | null;
  vocabularyId?: string | null;
  status?: "NEW" | "LEARNING" | "MASTERED" | string | null;
  progress?: number | null;
  process?: number | null;
  streak?: number | null;
  rightCount?: number | null;
  wrongCount?: number | null;
  lastReviewedAt?: string | null;
  nextDueAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  vocabulary?: VocabularyResponse | null;
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

export type TestItemResponse = {
  id: string;
  position?: number | null;
  questionType?: string | null;
  questionPayload?: Record<string, unknown> | null;
  status?: "PENDING" | "CORRECT" | "WRONG" | "SKIPPED" | string | null;
  expected?: string | null;
  userAnswer?: string | null;
  timeMs?: number | null;
};

export type TestSessionResponse = {
  id: string;
  type?: string | null;
  status?: "ACTIVE" | "COMPLETED" | "ABANDONED" | string | null;
  title?: string | null;
  scheduleDate?: string | null;
  sourceType?: string | null;
  createdAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  items?: TestItemResponse[] | null;
};

const getAuthorization = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const tokenType = cookieStore.get("tokenType")?.value ?? "Bearer";

  if (!accessToken) {
    return null;
  }

  return `${decodeURIComponent(tokenType)} ${decodeURIComponent(accessToken)}`;
};

const authFetchJson = async <T>(path: string): Promise<T | null> => {
  const authorization = await getAuthorization();
  if (!authorization) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Authorization: authorization,
      },
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

export const fetchMe = () => authFetchJson<UserProfileResponse>("/me");

export const fetchTopics = (params?: {
  query?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 0));
  query.set("size", String(params?.size ?? 20));
  if (params?.sort) {
    query.set("sort", params.sort);
  }
  if (params?.query) {
    query.set("query", params.query);
  }

  return authFetchJson<PageResponse<TopicResponse>>(`/topics?${query.toString()}`);
};

export const fetchVocab = (params?: {
  query?: string;
  topicId?: string;
  language?: string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 0));
  query.set("size", String(params?.size ?? 20));
  if (params?.sort) {
    query.set("sort", params.sort);
  }
  if (params?.query) {
    query.set("query", params.query);
  }
  if (params?.topicId) {
    query.set("topicId", params.topicId);
  }
  if (params?.language) {
    query.set("language", params.language);
  }
  if (params?.status) {
    query.set("status", params.status);
  }

  return authFetchJson<PageResponse<VocabularyResponse>>(`/vocab?${query.toString()}`);
};

export const fetchMyVocab = (params?: {
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
  query?: string;
}) => {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 0));
  query.set("size", String(params?.size ?? 20));
  if (params?.sort) {
    query.set("sort", params.sort);
  }
  if (params?.query) {
    query.set("query", params.query);
  }
  if (params?.status) {
    query.set("status", params.status);
  }

  return authFetchJson<PageResponse<UserVocabularyResponse>>(
    `/me/vocab?${query.toString()}`,
  );
};

export const fetchMyVocabContributions = (params?: {
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 0));
  query.set("size", String(params?.size ?? 20));
  if (params?.sort) {
    query.set("sort", params.sort);
  }
  if (params?.status) {
    query.set("status", params.status);
  }

  return authFetchJson<PageResponse<VocabularyContributionResponse>>(
    `/me/vocab/contributions?${query.toString()}`,
  );
};

export const fetchSessionDetail = (sessionId: string) =>
  authFetchJson<TestSessionResponse>(`/me/sessions/${sessionId}`);

