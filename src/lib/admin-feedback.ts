import { cookies } from "next/headers";
import type { PageResponse, UserFeedbackAttachmentResponse } from "@/lib/user-api";

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type AdminFeedbackStatus = "NEW" | "READ" | "ARCHIVED" | string;
export type AdminFeedbackCategory =
  | "BUG_REPORT"
  | "CONTENT_ISSUE"
  | "FEATURE_REQUEST"
  | "UX_FEEDBACK"
  | "GENERAL"
  | string;

export type AdminUserFeedbackQueueItemResponse = {
  id: string;
  userId?: string | null;
  userDisplayName?: string | null;
  category?: AdminFeedbackCategory | null;
  title?: string | null;
  status?: AdminFeedbackStatus | null;
  attachmentCount?: number | null;
  createdAt?: string | null;
};

export type AdminUserFeedbackDetailResponse = {
  id: string;
  userId?: string | null;
  userDisplayName?: string | null;
  category?: AdminFeedbackCategory | null;
  title?: string | null;
  message?: string | null;
  status?: AdminFeedbackStatus | null;
  sourceScreen?: string | null;
  appVersion?: string | null;
  deviceInfo?: string | null;
  locale?: string | null;
  readBy?: string | null;
  readByDisplayName?: string | null;
  readAt?: string | null;
  archivedBy?: string | null;
  archivedByDisplayName?: string | null;
  archivedAt?: string | null;
  attachments?: UserFeedbackAttachmentResponse[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
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

const authFetchJson = async <T>(url: URL | string): Promise<T | null> => {
  const authorization = await getAuthorization();
  if (!authorization) {
    return null;
  }

  try {
    const response = await fetch(url, {
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

export const fetchAdminFeedback = async (
  page = 0,
  size = 15,
  sort?: string,
  filters?: {
    query?: string;
    status?: string;
    category?: string;
  },
): Promise<PageResponse<AdminUserFeedbackQueueItemResponse> | null> => {
  const url = new URL(`${API_BASE_URL}/admin/feedback`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));

  if (sort) {
    url.searchParams.set("sort", sort);
  }
  if (filters?.query) {
    url.searchParams.set("query", filters.query);
  }
  if (filters?.status) {
    url.searchParams.set("status", filters.status);
  }
  if (filters?.category) {
    url.searchParams.set("category", filters.category);
  }

  return authFetchJson<PageResponse<AdminUserFeedbackQueueItemResponse>>(url);
};

export const fetchAdminFeedbackDetail = async (
  id: string,
): Promise<AdminUserFeedbackDetailResponse | null> => {
  if (!id.trim()) {
    return null;
  }

  return authFetchJson<AdminUserFeedbackDetailResponse>(`${API_BASE_URL}/admin/feedback/${id}`);
};
