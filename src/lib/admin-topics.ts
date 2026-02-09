import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type TopicResponse = {
  id: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  language?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export async function fetchTopics(
  page = 0,
  size = 20,
  sort?: string,
  filters?: {
    name?: string;
    slug?: string;
    status?: string;
  },
): Promise<PageResponse<TopicResponse> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const tokenType = cookieStore.get("tokenType")?.value ?? "Bearer";

  if (!accessToken) {
    return null;
  }

  const url = new URL(`${API_BASE_URL}/admin/topics`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  if (sort) {
    url.searchParams.set("sort", sort);
  }
  if (filters?.name) {
    url.searchParams.set("name", filters.name);
  }
  if (filters?.slug) {
    url.searchParams.set("slug", filters.slug);
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

    return (await response.json()) as PageResponse<TopicResponse>;
  } catch {
    return null;
  }
}
