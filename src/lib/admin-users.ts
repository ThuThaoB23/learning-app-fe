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

export type UserActivityType =
  | "REGISTER_ACCOUNT"
  | "COMPLETE_STUDY_SESSION"
  | "ADD_MYVOCAB"
  | "SUBMIT_VOCAB_CONTRIBUTION"
  | "APPROVE_VOCAB_CONTRIBUTION"
  | "REJECT_VOCAB_CONTRIBUTION";

export type UserActivityTargetType =
  | "ACCOUNT"
  | "TEST_SESSION"
  | "VOCABULARY"
  | "VOCABULARY_CONTRIBUTION";

export type UserActivityLogResponse = {
  id: string;
  userId: string;
  userDisplayName?: string | null;
  activityType?: UserActivityType | string | null;
  targetType?: UserActivityTargetType | string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string | null;
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
  filters?: {
    email?: string;
    username?: string;
    displayName?: string;
    role?: string;
    status?: string;
  },
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
  if (filters?.email) {
    url.searchParams.set("email", filters.email);
  }
  if (filters?.username) {
    url.searchParams.set("username", filters.username);
  }
  if (filters?.displayName) {
    url.searchParams.set("displayName", filters.displayName);
  }
  if (filters?.role) {
    url.searchParams.set("role", filters.role);
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

    return (await response.json()) as PageResponse<AdminUser>;
  } catch {
    return null;
  }
}

export async function fetchAdminUserActivityLogs(
  userId: string,
  params?: {
    activityType?: string;
    targetType?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
    sort?: string;
  },
): Promise<PageResponse<UserActivityLogResponse> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const tokenType = cookieStore.get("tokenType")?.value ?? "Bearer";

  if (!accessToken || !userId.trim()) {
    return null;
  }

  const url = new URL(`${API_BASE_URL}/admin/users/${userId}/activity-logs`);
  url.searchParams.set("page", String(params?.page ?? 0));
  url.searchParams.set("size", String(params?.size ?? 20));
  if (params?.sort) {
    url.searchParams.set("sort", params.sort);
  }
  if (params?.activityType) {
    url.searchParams.set("activityType", params.activityType);
  }
  if (params?.targetType) {
    url.searchParams.set("targetType", params.targetType);
  }
  if (params?.from) {
    url.searchParams.set("from", params.from);
  }
  if (params?.to) {
    url.searchParams.set("to", params.to);
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

    return (await response.json()) as PageResponse<UserActivityLogResponse>;
  } catch {
    return null;
  }
}

export async function fetchAdminActivityLogs(params?: {
  userId?: string;
  activityType?: string;
  targetType?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<PageResponse<UserActivityLogResponse> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const tokenType = cookieStore.get("tokenType")?.value ?? "Bearer";

  if (!accessToken) {
    return null;
  }

  const url = new URL(`${API_BASE_URL}/admin/activity-logs`);
  url.searchParams.set("page", String(params?.page ?? 0));
  url.searchParams.set("size", String(params?.size ?? 20));
  if (params?.sort) {
    url.searchParams.set("sort", params.sort);
  }
  if (params?.userId) {
    url.searchParams.set("userId", params.userId);
  }
  if (params?.activityType) {
    url.searchParams.set("activityType", params.activityType);
  }
  if (params?.targetType) {
    url.searchParams.set("targetType", params.targetType);
  }
  if (params?.from) {
    url.searchParams.set("from", params.from);
  }
  if (params?.to) {
    url.searchParams.set("to", params.to);
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

    return (await response.json()) as PageResponse<UserActivityLogResponse>;
  } catch {
    return null;
  }
}
