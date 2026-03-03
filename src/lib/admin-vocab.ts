import { cookies } from "next/headers";

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type VocabularyResponse = {
  id: string;
  term?: string | null;
  termNormalized?: string | null;
  definition?: string | null;
  definitionVi?: string | null;
  examples?: Array<string | VocabularyExample> | null;
  audios?: VocabularyAudioResponse[] | null;
  topicIds?: string[] | null;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  language?: string | null;
  status?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

export type VocabularyExample = {
  id?: string | null;
  value: string;
};

export type VocabularyAudioResponse = {
  id: string;
  audioUrl: string;
  accent?: string | null;
  position?: number | null;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export async function fetchVocab(
  page = 0,
  size = 20,
  sort?: string,
  filters?: {
    query?: string;
    topicId?: string;
    language?: string;
    status?: string;
  },
): Promise<PageResponse<VocabularyResponse> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const tokenType = cookieStore.get("tokenType")?.value ?? "Bearer";

  if (!accessToken) {
    return null;
  }

  const url = new URL(`${API_BASE_URL}/admin/vocab`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  if (sort) {
    url.searchParams.set("sort", sort);
  }
  if (filters?.query) {
    url.searchParams.set("query", filters.query);
  }
  if (filters?.topicId) {
    url.searchParams.set("topicId", filters.topicId);
  }
  if (filters?.language) {
    url.searchParams.set("language", filters.language);
  }
  if (filters?.status) {
    url.searchParams.set("status", filters.status);
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `${decodeURIComponent(tokenType)} ${decodeURIComponent(accessToken)}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PageResponse<VocabularyResponse>;
  } catch {
    return null;
  }
}

export async function fetchVocabDetailById(
  id: string,
): Promise<VocabularyResponse | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const tokenType = cookieStore.get("tokenType")?.value ?? "Bearer";

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/vocab/${id}`, {
      headers: {
        Authorization: `${decodeURIComponent(tokenType)} ${decodeURIComponent(accessToken)}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as VocabularyResponse;
  } catch {
    return null;
  }
}

