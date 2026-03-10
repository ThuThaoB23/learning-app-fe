import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import RefreshButton from "@/components/refresh-button";
import AdminFeedbackActions from "./_components/admin-feedback-actions";
import {
  fetchAdminFeedback,
  fetchAdminFeedbackDetail,
  type AdminFeedbackCategory,
  type AdminFeedbackStatus,
  type AdminUserFeedbackQueueItemResponse,
} from "@/lib/admin-feedback";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Quản lý hộp thư feedback từ người dùng.",
};

type AdminFeedbackPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const pillBase =
  "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]";

const statusLabelMap: Record<string, string> = {
  NEW: "Mới",
  READ: "Đã đọc",
  ARCHIVED: "Lưu trữ",
};

const statusStyleMap: Record<string, string> = {
  NEW: "border-[#fbbf24]/35 bg-[#fbbf24]/15 text-[#fde68a]",
  READ: "border-[#38bdf8]/35 bg-[#38bdf8]/15 text-[#bae6fd]",
  ARCHIVED: "border-white/10 bg-white/5 text-[#94a3b8]",
};

const categoryLabelMap: Record<string, string> = {
  BUG_REPORT: "Lỗi hệ thống",
  CONTENT_ISSUE: "Nội dung",
  FEATURE_REQUEST: "Tính năng",
  UX_FEEDBACK: "Trải nghiệm",
  GENERAL: "Khác",
};

const getStatusMeta = (status?: AdminFeedbackStatus | null) => {
  const key = (status || "NEW").toUpperCase();
  return {
    key,
    label: statusLabelMap[key] ?? key,
    className: statusStyleMap[key] ?? statusStyleMap.NEW,
  };
};

const getCategoryLabel = (category?: AdminFeedbackCategory | null) => {
  const key = (category || "GENERAL").toUpperCase();
  return categoryLabelMap[key] ?? key;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const getFeedbackTitle = (item?: { title?: string | null } | null) =>
  item?.title?.trim() || "Feedback chưa có tiêu đề";

const getFeedbackSender = (
  item?: { userDisplayName?: string | null; userId?: string | null } | null,
) => item?.userDisplayName?.trim() || item?.userId || "Người dùng ẩn danh";

const getAttachmentLabel = (count?: number | null) => {
  const normalizedCount = Math.max(0, Number(count) || 0);
  if (normalizedCount <= 0) {
    return "Không có file";
  }
  return `${normalizedCount} file`;
};

const isImageAttachment = (contentType?: string | null, fileUrl?: string | null) => {
  if (contentType?.toLowerCase().startsWith("image/")) {
    return true;
  }

  if (!fileUrl) {
    return false;
  }

  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileUrl);
};

const formatFileSize = (fileSize?: number | null) => {
  if (!fileSize || fileSize <= 0) {
    return "Kích thước không rõ";
  }

  if (fileSize >= 1024 * 1024) {
    return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
};

export default async function AdminFeedbackPage({
  searchParams,
}: AdminFeedbackPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams?.page;
  const sizeParam = Array.isArray(resolvedSearchParams?.size)
    ? resolvedSearchParams.size[0]
    : resolvedSearchParams?.size;
  const sortParam = Array.isArray(resolvedSearchParams?.sort)
    ? resolvedSearchParams.sort[0]
    : resolvedSearchParams?.sort;
  const queryParam = Array.isArray(resolvedSearchParams?.query)
    ? resolvedSearchParams.query[0]
    : resolvedSearchParams?.query;
  const statusParam = Array.isArray(resolvedSearchParams?.status)
    ? resolvedSearchParams.status[0]
    : resolvedSearchParams?.status;
  const categoryParam = Array.isArray(resolvedSearchParams?.category)
    ? resolvedSearchParams.category[0]
    : resolvedSearchParams?.category;
  const selectedParam = Array.isArray(resolvedSearchParams?.selected)
    ? resolvedSearchParams.selected[0]
    : resolvedSearchParams?.selected;

  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const size = Math.min(50, Math.max(1, Number(sizeParam ?? 15) || 15));
  const sort = sortParam || "createdAt,desc";
  const selectedId = selectedParam || null;

  const queuePromise = fetchAdminFeedback(page, size, sort, {
    query: queryParam,
    status: statusParam,
    category: categoryParam,
  });
  const detailPromise = selectedId
    ? fetchAdminFeedbackDetail(selectedId)
    : Promise.resolve(null);
  const [queueData, detailData] = await Promise.all([queuePromise, detailPromise]);

  const items = queueData?.content ?? [];
  const totalPages = Math.max(1, queueData?.totalPages ?? 1);
  const currentPage = Math.min(Math.max(0, queueData?.number ?? page), totalPages - 1);
  const hasQueueError = !queueData;
  const showDetailModal = Boolean(selectedId);

  const buildHref = (overrides?: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams();
    params.set("page", String(overrides?.page ?? currentPage));
    params.set("size", String(overrides?.size ?? size));
    params.set("sort", String(overrides?.sort ?? sort));

    const query = overrides?.query ?? queryParam;
    const status = overrides?.status ?? statusParam;
    const category = overrides?.category ?? categoryParam;
    const selected = overrides?.selected ?? selectedId;

    if (query) params.set("query", String(query));
    if (status) params.set("status", String(status));
    if (category) params.set("category", String(category));
    if (selected) params.set("selected", String(selected));

    return `/admin/feedback?${params.toString()}`;
  };

  const rangeStart = Math.max(0, currentPage - 2);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 2);
  const pageRange = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart + i);
  const closeDetailHref = buildHref({ selected: "" });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              Feedback
            </p>
            <h1 className="text-2xl font-semibold text-[#e7edf3]">Hộp thư feedback</h1>
            <p className="mt-2 text-sm text-[#64748b]">
              Theo dõi góp ý, đọc chi tiết báo lỗi và lưu trữ các mục đã xử lý.
            </p>
            {hasQueueError ? (
              <p className="mt-2 text-xs text-[#fb7185]">Không thể tải danh sách feedback từ API.</p>
            ) : null}
          </div>
          <RefreshButton className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition hover:bg-white/15" />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
        <form className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <input
            name="query"
            defaultValue={queryParam ?? ""}
            placeholder="Tìm theo tiêu đề hoặc nội dung..."
            className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/70 px-4 py-3 text-sm text-[#e7edf3] placeholder:text-[#64748b] focus:border-white/20 focus:outline-none"
          />
          <select
            name="category"
            defaultValue={categoryParam ?? ""}
            className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/70 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/20 focus:outline-none"
          >
            <option value="">Tất cả loại feedback</option>
            <option value="BUG_REPORT">Lỗi hệ thống</option>
            <option value="CONTENT_ISSUE">Nội dung</option>
            <option value="FEATURE_REQUEST">Tính năng</option>
            <option value="UX_FEEDBACK">Trải nghiệm</option>
            <option value="GENERAL">Khác</option>
          </select>
          <select
            name="status"
            defaultValue={statusParam ?? ""}
            className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/70 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/20 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NEW">NEW</option>
            <option value="READ">READ</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
          <div className="flex gap-2">
            <input type="hidden" name="page" value="0" />
            <input type="hidden" name="size" value={size} />
            <input type="hidden" name="sort" value={sort} />
            <button
              type="submit"
              className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0b0f14] transition hover:bg-[#e7edf3]"
            >
              Lọc
            </button>
            <Link
              href="/admin/feedback"
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-[#e7edf3] transition hover:bg-white/10"
            >
              Xóa lọc
            </Link>
          </div>
        </form>
      </section>

      <section>
        <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-4 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#e7edf3]">Danh sách feedback</h2>
            <span className="text-xs text-[#64748b]">{queueData?.totalElements ?? 0} mục</span>
          </div>

          <div className="space-y-3 md:hidden">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0b0f14]/40 px-4 py-6 text-sm text-[#64748b]">
                Chưa có feedback nào phù hợp bộ lọc hiện tại.
              </div>
            ) : (
              items.map((item) => {
                const statusMeta = getStatusMeta(item.status);
                const isActive = item.id === selectedId;

                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border p-4 text-sm text-[#e7edf3] ${
                      isActive
                        ? "border-white/20 bg-white/10"
                        : "border-white/10 bg-[#0b0f14]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{getFeedbackTitle(item)}</p>
                        <p className="mt-1 text-xs text-[#94a3b8]">{getFeedbackSender(item)}</p>
                      </div>
                      <span className={`${pillBase} ${statusMeta.className}`}>{statusMeta.label}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#94a3b8]">
                      <span className="rounded-full border border-white/10 px-2.5 py-1">
                        {getCategoryLabel(item.category)}
                      </span>
                      <span>{getAttachmentLabel(item.attachmentCount)}</span>
                    </div>

                    <p className="mt-3 text-xs text-[#64748b]">{formatDateTime(item.createdAt)}</p>
                    <div className="mt-3">
                      <Link
                        href={buildHref({ selected: item.id })}
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          isActive
                            ? "border-white/25 bg-white/10 text-[#e7edf3]"
                            : "border-white/10 text-[#e7edf3] hover:bg-white/10"
                        }`}
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-white/10 md:block">
            <div className="min-w-[960px]">
              <div className="grid grid-cols-[minmax(0,_1.7fr)_minmax(0,_1.15fr)_170px_150px_170px_96px] items-center gap-4 bg-[#0b0f14]/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                <span>Tiêu đề</span>
                <span>Người gửi</span>
                <span>Loại</span>
                <span className="text-center">Trạng thái</span>
                <span>Ngày gửi</span>
                <span className="text-center">Chi tiết</span>
              </div>
              <div className="divide-y divide-white/10">
                {items.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-[#64748b]">
                    Chưa có feedback nào phù hợp bộ lọc hiện tại.
                  </div>
                ) : (
                  items.map((item: AdminUserFeedbackQueueItemResponse) => {
                    const statusMeta = getStatusMeta(item.status);
                    const isActive = item.id === selectedId;

                    return (
                      <div
                        key={item.id}
                        className={`grid grid-cols-[minmax(0,_1.7fr)_minmax(0,_1.15fr)_170px_150px_170px_96px] items-center gap-4 px-4 py-4 text-sm text-[#e7edf3] transition ${
                          isActive ? "bg-white/5" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{getFeedbackTitle(item)}</p>
                          <p className="mt-1 text-xs text-[#64748b]">
                            {getAttachmentLabel(item.attachmentCount)}
                          </p>
                        </div>
                        <p className="truncate text-sm text-[#94a3b8]">{getFeedbackSender(item)}</p>
                        <p className="text-sm text-[#94a3b8]">{getCategoryLabel(item.category)}</p>
                        <div className="flex justify-center">
                          <span className={`${pillBase} ${statusMeta.className}`}>{statusMeta.label}</span>
                        </div>
                        <p className="text-sm text-[#94a3b8]">{formatDateTime(item.createdAt)}</p>
                        <div className="flex justify-center">
                          <Link
                            href={buildHref({ selected: item.id })}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                              isActive
                                ? "border-white/25 bg-white/10 text-[#e7edf3]"
                                : "border-white/10 text-[#e7edf3] hover:bg-white/10"
                            }`}
                          >
                            Xem
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <span>
                Trang {currentPage + 1}/{totalPages}
              </span>
              <div className="flex items-center gap-1">
                {[10, 15, 20, 30].map((pageSize) => (
                  <Link
                    key={pageSize}
                    href={buildHref({ page: 0, size: pageSize })}
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold transition ${
                      pageSize === size
                        ? "border-white/20 bg-white/10 text-[#e7edf3]"
                        : "border-white/10 text-[#94a3b8] hover:bg-white/10 hover:text-[#e7edf3]"
                    }`}
                  >
                    {pageSize}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={buildHref({ page: Math.max(0, currentPage - 1) })}
                aria-disabled={currentPage === 0}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  currentPage === 0
                    ? "pointer-events-none border-white/10 text-[#475569]"
                    : "border-white/10 text-[#e7edf3] hover:bg-white/10"
                }`}
              >
                Trước
              </Link>
              {pageRange.map((pageIndex) => (
                <Link
                  key={pageIndex}
                  href={buildHref({ page: pageIndex })}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    pageIndex === currentPage
                      ? "border-white/25 bg-white/10 text-[#e7edf3]"
                      : "border-white/10 text-[#e7edf3] hover:bg-white/10"
                  }`}
                >
                  {pageIndex + 1}
                </Link>
              ))}
              <Link
                href={buildHref({ page: Math.min(totalPages - 1, currentPage + 1) })}
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
        </div>
      </section>

      {showDetailModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <Link
            href={closeDetailHref}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            aria-label="Đóng cửa sổ chi tiết feedback"
          />

          <div className="relative z-10 max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0f14] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold text-[#e7edf3]">
                    {getFeedbackTitle(detailData)}
                  </h2>
                  {detailData ? (
                    <span className={`${pillBase} ${getStatusMeta(detailData.status).className}`}>
                      {getStatusMeta(detailData.status).label}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[#64748b]">{selectedId}</p>
              </div>
              <Link
                href={closeDetailHref}
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
              >
                Đóng
              </Link>
            </div>

            {!detailData ? (
              <p className="text-sm text-[#fb7185]">Không tải được chi tiết feedback.</p>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_320px]">
                  <div className="space-y-5">
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-[#cbd5e1]">
                          {getCategoryLabel(detailData.category)}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-[#94a3b8]">
                          {formatDateTime(detailData.createdAt)}
                        </span>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#0b0f14]/40 p-4">
                        <p className="whitespace-pre-wrap text-[15px] leading-8 text-[#dbeafe]">
                          {detailData.message || "Không có nội dung."}
                        </p>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                          Tệp đính kèm
                        </h3>
                        <span className="text-xs text-[#64748b]">
                          {getAttachmentLabel(detailData.attachments?.length)}
                        </span>
                      </div>
                      {detailData.attachments && detailData.attachments.length > 0 ? (
                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          {detailData.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14]/40"
                            >
                              {isImageAttachment(attachment.contentType, attachment.fileUrl) &&
                              attachment.fileUrl ? (
                                <a
                                  href={attachment.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block"
                                >
                                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#020617]">
                                    <Image
                                      src={attachment.fileUrl}
                                      alt={attachment.fileName || "Ảnh đính kèm"}
                                      fill
                                      unoptimized
                                      className="object-cover transition duration-300 hover:scale-[1.03]"
                                    />
                                  </div>
                                </a>
                              ) : (
                                <div className="flex aspect-[4/3] items-center justify-center bg-[#020617] px-6">
                                  <div className="text-center">
                                    <p className="text-sm font-semibold text-[#e7edf3]">
                                      Tệp đính kèm
                                    </p>
                                    <p className="mt-1 text-xs text-[#64748b]">
                                      {attachment.contentType || "Không rõ định dạng"}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div className="p-4">
                                <p className="truncate text-sm font-semibold text-[#e7edf3]">
                                  {attachment.fileName || "Tệp đính kèm"}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#94a3b8]">
                                  <span className="rounded-full border border-white/10 px-2.5 py-1">
                                    {attachment.contentType || "Không rõ định dạng"}
                                  </span>
                                  <span>{formatFileSize(attachment.fileSize)}</span>
                                </div>
                                {attachment.fileUrl ? (
                                  <div className="mt-3">
                                    <a
                                      href={attachment.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                                    >
                                      Mở file gốc
                                    </a>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-[#64748b]">Không có tệp đính kèm.</p>
                      )}
                    </section>
                  </div>

                  <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
                    <AdminFeedbackActions feedbackId={detailData.id} status={detailData.status} />

                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                        Thông tin chính
                      </h3>
                      <dl className="mt-4 space-y-4 text-sm">
                        <div>
                          <dt className="text-xs uppercase tracking-[0.14em] text-[#64748b]">
                            Người gửi
                          </dt>
                          <dd className="mt-1 text-[#e7edf3]">{getFeedbackSender(detailData)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-[0.14em] text-[#64748b]">
                            Thời gian gửi
                          </dt>
                          <dd className="mt-1 text-[#e7edf3]">{formatDateTime(detailData.createdAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-[0.14em] text-[#64748b]">
                            Màn hình
                          </dt>
                          <dd className="mt-1 text-[#e7edf3]">{detailData.sourceScreen || "—"}</dd>
                        </div>
                      </dl>
                    </section>
                  </aside>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
