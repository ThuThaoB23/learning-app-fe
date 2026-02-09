import type { Metadata } from "next";
import Link from "next/link";
import type { AdminUser } from "@/lib/admin-users";
import { fetchAdminUsers } from "@/lib/admin-users";
import CreateUserModal from "./_components/create-user-modal";
import UserActions from "./_components/user-actions";
import PageSizeSelect from "./_components/page-size-select";
import RefreshButton from "@/components/refresh-button";
import UsersSearchBar from "./_components/users-search-bar";
import UsersFilterPanel from "./_components/users-filter-panel";
import UsersExportButton from "./_components/users-export-button";

export const metadata: Metadata = {
  title: "Người dùng",
  description: "Quản lý tài khoản người dùng.",
};

const pillBase =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase";

const statusStyles: Record<string, string> = {
  ACTIVE: "border-[#34d399]/35 bg-[#34d399]/15 text-[#6ee7b7]",
  INACTIVE: "border-[#fbbf24]/35 bg-[#fbbf24]/15 text-[#fcd34d]",
  BANNED: "border-[#fb7185]/35 bg-[#fb7185]/15 text-[#fecdd3]",
  PENDING_VERIFICATION: "border-[#3b82f6]/35 bg-[#3b82f6]/15 text-[#93c5fd]",
};

const roleStyles: Record<string, string> = {
  ADMIN: "border-[#3b82f6]/35 bg-[#3b82f6]/15 text-[#93c5fd]",
  USER: "border-[#34d399]/35 bg-[#34d399]/15 text-[#6ee7b7]",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
  BANNED: "Bị khóa",
  PENDING_VERIFICATION: "Chờ xác minh",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị",
  USER: "Người dùng",
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

type AdminUsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams?.page[0]
    : resolvedSearchParams?.page;
  const sizeParam = Array.isArray(resolvedSearchParams?.size)
    ? resolvedSearchParams?.size[0]
    : resolvedSearchParams?.size;
  const sortParam = Array.isArray(resolvedSearchParams?.sort)
    ? resolvedSearchParams?.sort[0]
    : resolvedSearchParams?.sort;
  const emailParam = Array.isArray(resolvedSearchParams?.email)
    ? resolvedSearchParams?.email[0]
    : resolvedSearchParams?.email;
  const usernameParam = Array.isArray(resolvedSearchParams?.username)
    ? resolvedSearchParams?.username[0]
    : resolvedSearchParams?.username;
  const displayNameParam = Array.isArray(resolvedSearchParams?.displayName)
    ? resolvedSearchParams?.displayName[0]
    : resolvedSearchParams?.displayName;
  const roleParam = Array.isArray(resolvedSearchParams?.role)
    ? resolvedSearchParams?.role[0]
    : resolvedSearchParams?.role;
  const statusParam = Array.isArray(resolvedSearchParams?.status)
    ? resolvedSearchParams?.status[0]
    : resolvedSearchParams?.status;

  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const size = Math.min(50, Math.max(1, Number(sizeParam ?? 20) || 20));

  const data = await fetchAdminUsers(page, size, sortParam, {
    email: emailParam,
    username: usernameParam,
    displayName: displayNameParam,
    role: roleParam,
    status: statusParam,
  });
  const users = data?.content ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const currentPage = Math.min(Math.max(0, data?.number ?? page), totalPages - 1);
  const hasError = !data;

  const buildHref = (pageIndex: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageIndex));
    params.set("size", String(size));
    if (sortParam) {
      params.set("sort", String(sortParam));
    }
    if (emailParam) {
      params.set("email", String(emailParam));
    }
    if (usernameParam) {
      params.set("username", String(usernameParam));
    }
    if (displayNameParam) {
      params.set("displayName", String(displayNameParam));
    }
    if (roleParam) {
      params.set("role", String(roleParam));
    }
    if (statusParam) {
      params.set("status", String(statusParam));
    }
    return `/admin/users?${params.toString()}`;
  };

  const rangeStart = Math.max(0, currentPage - 2);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 2);
  const pageRange = Array.from(
    { length: rangeEnd - rangeStart + 1 },
    (_, index) => rangeStart + index,
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
            User Management
          </p>
          <h1 className="text-2xl font-semibold text-[#e7edf3]">
            Quản lý người dùng
          </h1>
          <p className="mt-2 text-sm text-[#64748b]">
            Theo dõi vai trò, trạng thái và hoạt động đăng nhập.
          </p>
          {hasError ? (
            <p className="mt-2 text-xs text-[#fb7185]">
              Không thể tải danh sách người dùng từ API.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <UsersExportButton />
          <CreateUserModal />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <UsersSearchBar
              email={emailParam ?? ""}
              displayName={displayNameParam ?? ""}
              username={usernameParam ?? ""}
            />
            <UsersFilterPanel
              role={roleParam ?? ""}
              status={statusParam ?? ""}
            />
          </div>
          <RefreshButton className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/15 disabled:opacity-60" />
        </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[minmax(0,_1.4fr)_minmax(0,_1.6fr)_140px_140px_170px_80px] gap-4 bg-[#0b0f14]/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                <span>Người dùng</span>
                <span>Email</span>
                <span>Vai trò</span>
                <span>Trạng thái</span>
                <span>Đăng nhập</span>
                <span>Thao tác</span>
              </div>
              <div className="divide-y divide-white/10">
                {users.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-[#64748b]">
                    Chưa có dữ liệu người dùng.
                  </div>
                ) : (
                  users.map((user: AdminUser) => (
                    <div
                      key={user.id}
                      className="grid grid-cols-[minmax(0,_1.4fr)_minmax(0,_1.6fr)_140px_140px_170px_80px] gap-4 px-4 py-4 text-sm text-[#e7edf3]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {user.displayName || user.email}
                        </p>
                        <p className="truncate text-xs text-[#64748b]">
                          {user.id}
                        </p>
                      </div>
                      <p className="truncate text-sm text-[#94a3b8]">
                        {user.email}
                      </p>
                      <span
                        className={`${pillBase} ${
                          roleStyles[user.role] ??
                          "border-white/10 bg-white/5 text-[#e7edf3]"
                        }`}
                      >
                        {roleLabels[user.role] ?? user.role}
                      </span>
                      <span
                        className={`${pillBase} ${
                          statusStyles[user.status ?? ""] ??
                          "border-white/10 bg-white/5 text-[#e7edf3]"
                        }`}
                      >
                        {statusLabels[user.status ?? ""] ??
                          user.status ??
                          "Không rõ"}
                      </span>
                      <p className="text-sm text-[#94a3b8]">
                        {formatDate(user.lastLoginAt)}
                      </p>
                      <UserActions user={user} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-[#94a3b8]">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                Trang {currentPage + 1} / {totalPages}
              </span>
              <PageSizeSelect value={size} />
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={buildHref(Math.max(0, currentPage - 1))}
                aria-disabled={currentPage === 0}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  currentPage === 0
                    ? "pointer-events-none border-white/10 text-[#475569]"
                    : "border-white/10 text-[#e7edf3] hover:bg-white/10"
                }`}
              >
                Trước
              </Link>
              {rangeStart > 0 ? (
                <>
                  <Link
                    href={buildHref(0)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    1
                  </Link>
                  <span className="px-1 text-xs text-[#64748b]">…</span>
                </>
              ) : null}
              {pageRange.map((pageIndex) => (
                <Link
                  key={pageIndex}
                  href={buildHref(pageIndex)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    pageIndex === currentPage
                      ? "border-white/30 bg-white/10 text-[#e7edf3]"
                      : "border-white/10 text-[#e7edf3] hover:bg-white/10"
                  }`}
                >
                  {pageIndex + 1}
                </Link>
              ))}
              {rangeEnd < totalPages - 1 ? (
                <>
                  <span className="px-1 text-xs text-[#64748b]">…</span>
                  <Link
                    href={buildHref(totalPages - 1)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    {totalPages}
                  </Link>
                </>
              ) : null}
              <Link
                href={buildHref(Math.min(totalPages - 1, currentPage + 1))}
                aria-disabled={currentPage >= totalPages - 1}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  currentPage >= totalPages - 1
                    ? "pointer-events-none border-white/10 text-[#475569]"
                    : "border-white/10 text-[#e7edf3] hover:bg-white/10"
                }`}
              >
                Sau
              </Link>
            </div>
          </div>
      </section>
    </div>
  );
}
