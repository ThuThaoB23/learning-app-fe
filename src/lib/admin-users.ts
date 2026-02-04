import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type AdminUser = {
  id: string;
  email: string;
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  role: "USER" | "ADMIN" | string;
  status?: string | null;
  locale?: string | null;
  timeZone?: string | null;
  dailyGoal?: number | null;
  lastLoginAt?: string | null;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export async function fetchAdminUsers(
  page = 0,
  size = 20,
  sort?: string,
): Promise<PageResponse<AdminUser> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const tokenType = cookieStore.get("tokenType")?.value ?? "Bearer";

  if (!accessToken) {
    return null;
  }

  const url = new URL(`${API_BASE_URL}/admin/users`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  if (sort) {
    url.searchParams.set("sort", sort);
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

    return (await response.json()) as PageResponse<AdminUser>;
  } catch {
    return null;
  }
}
