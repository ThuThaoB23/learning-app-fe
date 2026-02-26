import type { Metadata } from "next";
import Link from "next/link";
import AutoSubmitSelect from "@/components/auto-submit-select";
import RefreshButton from "@/components/refresh-button";
import {
  fetchAdminActivityLogs,
  type UserActivityLogResponse,
} from "@/lib/admin-users";

export const metadata: Metadata = {
  title: "Activity Logs",
  description: "Quản lý nhật ký hoạt động người dùng.",
};

const activityTypeOptions = [
  { value: "", label: "Tất cả hoạt động" },
  { value: "REGISTER_ACCOUNT", label: "Đăng ký tài khoản" },
  { value: "COMPLETE_STUDY_SESSION", label: "Hoàn thành phiên học" },
  { value: "ADD_MYVOCAB", label: "Thêm My Vocab" },
  { value: "SUBMIT_VOCAB_CONTRIBUTION", label: "Gửi đóng góp từ vựng" },
  { value: "APPROVE_VOCAB_CONTRIBUTION", label: "Duyệt đóng góp" },
  { value: "REJECT_VOCAB_CONTRIBUTION", label: "Từ chối đóng góp" },
] as const;

const targetTypeOptions = [
  { value: "", label: "Tất cả đối tượng" },
  { value: "ACCOUNT", label: "Tài khoản" },
  { value: "TEST_SESSION", label: "Phiên học" },
  { value: "VOCABULARY", label: "Từ vựng" },
  { value: "VOCABULARY_CONTRIBUTION", label: "Đóng góp từ vựng" },
] as const;

const activityTypeLabels: Record<string, string> = Object.fromEntries(
  activityTypeOptions.filter((item) => item.value).map((item) => [item.value, item.label]),
);

const targetTypeLabels: Record<string, string> = Object.fromEntries(
  targetTypeOptions.filter((item) => item.value).map((item) => [item.value, item.label]),
);

const activityTypeStyles: Record<string, string> = {
  REGISTER_ACCOUNT: "border-[#3b82f6]/35 bg-[#3b82f6]/15 text-[#93c5fd]",
  COMPLETE_STUDY_SESSION: "border-[#34d399]/35 bg-[#34d399]/15 text-[#6ee7b7]",
  ADD_MYVOCAB: "border-[#22d3ee]/35 bg-[#22d3ee]/15 text-[#67e8f9]",
  SUBMIT_VOCAB_CONTRIBUTION:
    "border-[#f59e0b]/35 bg-[#f59e0b]/15 text-[#fcd34d]",
  APPROVE_VOCAB_CONTRIBUTION:
    "border-[#10b981]/35 bg-[#10b981]/15 text-[#6ee7b7]",
  REJECT_VOCAB_CONTRIBUTION:
    "border-[#fb7185]/35 bg-[#fb7185]/15 text-[#fecdd3]",
};

type AdminActivityLogsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const readParam = (
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
) => {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const stringifyMetadata = (value: unknown) => {
  if (value == null) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const truncateMiddle = (value?: string | null, head = 10, tail = 6) => {
  if (!value) return "—";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
};

const pillBase =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase";

const inputClass =
  "rounded-full border border-white/10 bg-[#0b0f14]/60 px-3 py-2 text-xs font-semibold text-[#e7edf3] outline-none transition focus:border-white/30";

const buildQueryString = (params: {
  page: number;
  size: number;
  sort?: string;
  userId?: string;
  activityType?: string;
  targetType?: string;
  from?: string;
  to?: string;
}) => {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("size", String(params.size));
  if (params.sort) query.set("sort", params.sort);
  if (params.userId) query.set("userId", params.userId);
  if (params.activityType) query.set("activityType", params.activityType);
  if (params.targetType) query.set("targetType", params.targetType);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  return query.toString();
};

export default async function AdminActivityLogsPage({
  searchParams,
}: AdminActivityLogsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const pageParam = readParam(resolvedSearchParams, "page");
  const sizeParam = readParam(resolvedSearchParams, "size");
  const sortParam = readParam(resolvedSearchParams, "sort");
  const userIdParam = readParam(resolvedSearchParams, "userId");
  const activityTypeParam = readParam(resolvedSearchParams, "activityType");
  const targetTypeParam = readParam(resolvedSearchParams, "targetType");
  const fromParam = readParam(resolvedSearchParams, "from");
  const toParam = readParam(resolvedSearchParams, "to");

  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const size = Math.min(100, Math.max(1, Number(sizeParam ?? 20) || 20));
  const sort = sortParam || "createdAt,desc";
  const userId = userIdParam?.trim() || "";
  const activityType = activityTypeParam?.trim() || "";
  const targetType = targetTypeParam?.trim() || "";
  const from = fromParam?.trim() || "";
  const to = toParam?.trim() || "";

  const data = await fetchAdminActivityLogs({
    page,
    size,
    sort,
    userId: userId || undefined,
    activityType: activityType || undefined,
    targetType: targetType || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const logs = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const currentPage = Math.min(Math.max(0, data?.number ?? page), totalPages - 1);
  const hasError = !data;

  const commonParams = {
    size,
    sort,
    userId: userId || undefined,
    activityType: activityType || undefined,
    targetType: targetType || undefined,
    from: from || undefined,
    to: to || undefined,
  };

  const buildHref = (pageIndex: number) =>
    `/admin/activity-logs?${buildQueryString({ page: pageIndex, ...commonParams })}`;

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
            Activity Logs
          </p>
          <h1 className="text-2xl font-semibold text-[#e7edf3]">
            Quản lý nhật ký hoạt động
          </h1>
          {hasError ? (
            <p className="mt-2 text-xs text-[#fb7185]">
              Không thể tải activity logs từ API.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#e7edf3]">
            {totalElements} logs
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <form
            action="/admin/activity-logs"
            className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-6"
          >
            <input type="hidden" name="page" value="0" />
            <input type="hidden" name="size" value={String(size)} />

            <input
              type="text"
              name="userId"
              defaultValue={userId}
              placeholder="User ID"
              className={inputClass}
            />

            <AutoSubmitSelect
              name="activityType"
              defaultValue={activityType}
              className={inputClass}
            >
              {activityTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AutoSubmitSelect>

            <AutoSubmitSelect
              name="targetType"
              defaultValue={targetType}
              className={inputClass}
            >
              {targetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AutoSubmitSelect>

            <input
              type="datetime-local"
              name="from"
              defaultValue={toDateTimeLocal(from)}
              className={inputClass}
            />

            <input
              type="datetime-local"
              name="to"
              defaultValue={toDateTimeLocal(to)}
              className={inputClass}
            />

            <div className="flex gap-2">
              <AutoSubmitSelect
                name="sort"
                defaultValue={sort}
                className={`${inputClass} flex-1`}
              >
                <option value="createdAt,desc">Mới nhất</option>
                <option value="createdAt,asc">Cũ nhất</option>
              </AutoSubmitSelect>
              <button
                type="submit"
                className="rounded-full bg-[#e7edf3] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5"
              >
                Lọc
              </button>
            </div>
          </form>

          <div className="flex gap-2">
            <Link
              href="/admin/activity-logs?sort=createdAt,desc"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/15"
            >
              Reset
            </Link>
            <RefreshButton className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/15 disabled:opacity-60" />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <div className="min-w-[1400px]">
            <div className="grid grid-cols-[minmax(0,_1.7fr)_200px_minmax(0,_1.6fr)_220px_minmax(0,_1.4fr)_100px] items-center gap-4 bg-[#0b0f14]/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              <span>Người dùng</span>
              <span className="text-center">Hoạt động</span>
              <span>Đối tượng</span>
              <span>Thời gian</span>
              <span>Metadata</span>
              <span className="text-center">Lọc</span>
            </div>
            <div className="divide-y divide-white/10">
              {logs.length === 0 ? (
                <div className="px-4 py-6 text-sm text-[#64748b]">
                  {hasError
                    ? "Không thể tải dữ liệu activity logs."
                    : "Chưa có activity log phù hợp bộ lọc."}
                </div>
              ) : (
                logs.map((log: UserActivityLogResponse) => {
                  const activityKey = log.activityType || "UNKNOWN";
                  const targetKey = log.targetType || "";
                  const userDisplayName = log.userDisplayName?.trim() || "Không rõ tên";
                  const metadataText = stringifyMetadata(log.metadata);
                  const filterUserHref = log.userId
                    ? `/admin/activity-logs?${buildQueryString({
                        page: 0,
                        ...commonParams,
                        userId: log.userId,
                      })}`
                    : null;

                  return (
                    <div
                      key={log.id}
                      className="grid grid-cols-[minmax(0,_1.7fr)_200px_minmax(0,_1.6fr)_220px_minmax(0,_1.4fr)_100px] items-start gap-4 px-4 py-4 text-sm text-[#e7edf3]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{userDisplayName}</p>
                        <p className="truncate text-xs text-[#64748b]">
                          {log.userId || "—"}
                        </p>
                        <p className="truncate text-xs text-[#475569]">{log.id}</p>
                      </div>

                      <div className="flex justify-center">
                        <span
                          className={`${pillBase} ${
                            activityTypeStyles[activityKey] ??
                            "border-white/10 bg-white/5 text-[#e7edf3]"
                          }`}
                        >
                          {activityTypeLabels[activityKey] ?? activityKey}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {(targetTypeLabels[targetKey] ?? targetKey) || "—"}
                        </p>
                        <p className="truncate text-xs text-[#64748b]">
                          {truncateMiddle(log.targetId)}
                        </p>
                        {log.targetId ? (
                          <p className="truncate text-xs text-[#475569]">{log.targetId}</p>
                        ) : null}
                      </div>

                      <p className="text-sm text-[#94a3b8]">{formatDate(log.createdAt)}</p>

                      <div className="min-w-0">
                        {metadataText ? (
                          <details className="rounded-xl border border-white/10 bg-[#0b0f14]/40 px-3 py-2">
                            <summary className="cursor-pointer list-none text-xs font-semibold text-[#e7edf3]">
                              Xem metadata
                            </summary>
                            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs text-[#cbd5e1]">
                              {metadataText}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-xs text-[#64748b]">—</span>
                        )}
                      </div>

                      <div className="flex justify-center">
                        {filterUserHref ? (
                          <Link
                            href={filterUserHref}
                            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                          >
                            User
                          </Link>
                        ) : (
                          <span className="text-xs text-[#64748b]">—</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-[#94a3b8]">
          <form action="/admin/activity-logs" className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="page" value="0" />
            <input type="hidden" name="sort" value={sort} />
            {userId ? <input type="hidden" name="userId" value={userId} /> : null}
            {activityType ? (
              <input type="hidden" name="activityType" value={activityType} />
            ) : null}
            {targetType ? (
              <input type="hidden" name="targetType" value={targetType} />
            ) : null}
            {from ? <input type="hidden" name="from" value={from} /> : null}
            {to ? <input type="hidden" name="to" value={to} /> : null}

            <span>
              Trang {currentPage + 1} / {totalPages}
            </span>
            <label className="flex items-center gap-2 text-xs">
              <span className="text-[#64748b]">Kích thước trang</span>
              <AutoSubmitSelect
                name="size"
                defaultValue={String(size)}
                className="rounded-full border border-white/10 bg-[#0b0f14]/60 px-3 py-1.5 text-xs font-semibold text-[#e7edf3] outline-none"
              >
                {[10, 20, 50, 100].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </AutoSubmitSelect>
            </label>
          </form>

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
