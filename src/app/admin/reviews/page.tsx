import type { Metadata } from "next";
import Link from "next/link";
import RefreshButton from "@/components/refresh-button";
import ContributionReviewActions from "./_components/contribution-review-actions";
import {
  fetchAdminVocabContributionDetail,
  fetchAdminVocabContributions,
  type AdminVocabularyContributionQueueItemResponse,
} from "@/lib/admin-vocab-contributions";
import { formatVocabularyContributionRejectReason } from "@/lib/vocab-contribution-reject-reason";

export const metadata: Metadata = {
  title: "Duyệt Đóng Góp",
  description: "Xem hàng chờ và duyệt đóng góp từ vựng của người dùng.",
};

type AdminReviewsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statusLabelMap: Record<string, string> = {
  SUBMITTED: "Mới gửi",
  IN_REVIEW: "Đang duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELED: "Đã hủy",
};

const statusStyleMap: Record<string, string> = {
  SUBMITTED: "border-[#fbbf24]/35 bg-[#fbbf24]/15 text-[#fde68a]",
  IN_REVIEW: "border-[#60a5fa]/35 bg-[#60a5fa]/15 text-[#bfdbfe]",
  APPROVED: "border-[#34d399]/35 bg-[#34d399]/15 text-[#86efac]",
  REJECTED: "border-[#fb7185]/35 bg-[#fb7185]/15 text-[#fda4af]",
  CANCELED: "border-white/10 bg-white/5 text-[#94a3b8]",
};

const pillBase =
  "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]";

const getStatusMeta = (status?: string | null) => {
  const key = (status || "SUBMITTED").toUpperCase();
  return {
    key,
    label: statusLabelMap[key] ?? key,
    className: statusStyleMap[key] ?? statusStyleMap.SUBMITTED,
  };
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

const getQueueTitle = (item: AdminVocabularyContributionQueueItemResponse) =>
  item.term?.trim() || item.id;

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
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
  const languageParam = Array.isArray(resolvedSearchParams?.language)
    ? resolvedSearchParams.language[0]
    : resolvedSearchParams?.language;
  const selectedParam = Array.isArray(resolvedSearchParams?.selected)
    ? resolvedSearchParams.selected[0]
    : resolvedSearchParams?.selected;

  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const size = Math.min(50, Math.max(1, Number(sizeParam ?? 15) || 15));
  const sort = sortParam || "createdAt,desc";

  const queueData = await fetchAdminVocabContributions(page, size, sort, {
    query: queryParam,
    status: statusParam,
    language: languageParam,
  });

  const items = queueData?.content ?? [];
  const totalPages = Math.max(1, queueData?.totalPages ?? 1);
  const currentPage = Math.min(Math.max(0, queueData?.number ?? page), totalPages - 1);
  const selectedId = selectedParam || null;
  const detailData = selectedId ? await fetchAdminVocabContributionDetail(selectedId) : null;
  const contribution = detailData?.contribution ?? null;
  const reviewLogs = detailData?.reviewLogs ?? [];
  const hasQueueError = !queueData;
  const showDetailModal = Boolean(selectedId);

  const buildHref = (overrides?: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams();
    params.set("page", String(overrides?.page ?? currentPage));
    params.set("size", String(overrides?.size ?? size));
    params.set("sort", String(overrides?.sort ?? sort));
    const query = overrides?.query ?? queryParam;
    const status = overrides?.status ?? statusParam;
    const language = overrides?.language ?? languageParam;
    const selected = overrides?.selected ?? selectedId;
    if (query) params.set("query", String(query));
    if (status) params.set("status", String(status));
    if (language) params.set("language", String(language));
    if (selected) params.set("selected", String(selected));
    return `/admin/reviews?${params.toString()}`;
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
              Reviews
            </p>
            <h1 className="text-2xl font-semibold text-[#e7edf3]">
              Duyệt đóng góp từ vựng
            </h1>
            <p className="mt-2 text-sm text-[#64748b]">
              Xem hàng chờ, mở chi tiết đóng góp, duyệt hoặc từ chối theo lý do.
            </p>
            {hasQueueError ? (
              <p className="mt-2 text-xs text-[#fb7185]">
                Không thể tải hàng chờ đóng góp từ API.
              </p>
            ) : null}
          </div>
          <RefreshButton className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition hover:bg-white/15" />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
        <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px_auto]">
          <input
            name="query"
            defaultValue={queryParam ?? ""}
            placeholder="Tìm theo term / definition..."
            className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/70 px-4 py-3 text-sm text-[#e7edf3] placeholder:text-[#64748b] focus:border-white/20 focus:outline-none"
          />
          <select
            name="language"
            defaultValue={languageParam ?? ""}
            className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/70 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/20 focus:outline-none"
          >
            <option value="">Tất cả ngôn ngữ</option>
            <option value="en">English (en)</option>
            <option value="vi">Tiếng Việt (vi)</option>
            <option value="ja">Nhật (ja)</option>
            <option value="ko">Hàn (ko)</option>
          </select>
          <select
            name="status"
            defaultValue={statusParam ?? ""}
            className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/70 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/20 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="IN_REVIEW">IN_REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELED">CANCELED</option>
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
              href="/admin/reviews"
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
            <h2 className="text-lg font-semibold text-[#e7edf3]">Hàng chờ đóng góp</h2>
            <span className="text-xs text-[#64748b]">
              {queueData?.totalElements ?? 0} mục
            </span>
          </div>

          <div className="mt-2 overflow-x-auto rounded-2xl border border-white/10">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[minmax(0,_1.6fr)_minmax(0,_1.25fr)_110px_170px_210px_96px] items-center gap-4 bg-[#0b0f14]/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                <span>Từ đóng góp</span>
                <span>Người gửi</span>
                <span>Ngôn ngữ</span>
                <span className="text-center">Trạng thái</span>
                <span>Ngày gửi</span>
                <span className="text-center">Chi tiết</span>
              </div>
              <div className="divide-y divide-white/10">
                {items.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-[#64748b]">
                    Chưa có đóng góp nào phù hợp bộ lọc hiện tại.
                  </div>
                ) : (
                  items.map((item) => {
                    const statusMeta = getStatusMeta(item.status);
                    const isActive = item.id === selectedId;
                    return (
                      <div
                        key={item.id}
                        className={`grid grid-cols-[minmax(0,_1.6fr)_minmax(0,_1.25fr)_110px_170px_210px_96px] items-center gap-4 px-4 py-4 text-sm text-[#e7edf3] transition ${
                          isActive ? "bg-white/5" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{getQueueTitle(item)}</p>
                          <p className="truncate text-xs text-[#64748b]">
                            {item.partOfSpeech || "—"}
                          </p>
                        </div>
                        <p className="truncate text-sm text-[#94a3b8]">
                          {item.contributorDisplayName || item.contributorUserId || "Ẩn danh"}
                        </p>
                        <p className="text-sm uppercase text-[#94a3b8]">
                          {item.language || "—"}
                        </p>
                        <div className="flex justify-center">
                          <span className={`${pillBase} ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="text-sm text-[#94a3b8]">
                          {formatDateTime(item.createdAt)}
                        </p>
                        <div className="flex justify-center">
                          <Link
                            href={buildHref({ selected: item.id, page: currentPage })}
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
            aria-label="Đóng cửa sổ chi tiết"
          />

          <div className="relative z-10 max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0f14] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#e7edf3]">Chi tiết đóng góp</h2>
                {contribution ? (
                  <span className={`${pillBase} ${getStatusMeta(contribution.status).className}`}>
                    {getStatusMeta(contribution.status).label}
                  </span>
                ) : null}
              </div>
              <Link
                href={closeDetailHref}
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
              >
                Đóng
              </Link>
            </div>

            {!detailData || !contribution ? (
              <p className="text-sm text-[#fb7185]">Không tải được chi tiết đóng góp.</p>
            ) : (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <div className="space-y-4">
                  <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-[#e7edf3]">
                        {contribution.term || "(không có term)"}
                      </h3>
                      {contribution.language ? (
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#94a3b8]">
                          {contribution.language}
                        </span>
                      ) : null}
                      {contribution.partOfSpeech ? (
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#94a3b8]">
                          {contribution.partOfSpeech}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm text-[#dbeafe]">
                      {contribution.definition || "—"}
                    </p>
                    {contribution.definitionVi ? (
                      <p className="mt-2 text-sm text-[#94a3b8]">
                        VI: {contribution.definitionVi}
                      </p>
                    ) : null}
                    {contribution.phonetic ? (
                      <p className="mt-2 text-xs text-[#64748b]">
                        Phiên âm: {contribution.phonetic}
                      </p>
                    ) : null}
                  </section>

                  <section className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                        Contributor
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#e7edf3]">
                        {contribution.contributorDisplayName ||
                          contribution.contributorUserId ||
                          "—"}
                      </p>
                      <p className="mt-1 text-xs text-[#64748b]">
                        Tạo lúc: {formatDateTime(contribution.createdAt)}
                      </p>
                      <p className="mt-1 text-xs text-[#64748b]">
                        Cập nhật: {formatDateTime(contribution.updatedAt)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                        Review Result
                      </p>
                      <p className="mt-2 text-sm text-[#e7edf3]">
                        Lý do từ chối:{" "}
                        {formatVocabularyContributionRejectReason(contribution.rejectReason)}
                      </p>
                      <p className="mt-1 text-sm text-[#e7edf3]">
                        Approved Vocabulary: {contribution.approvedVocabularyId || "—"}
                      </p>
                      <p className="mt-1 text-xs text-[#64748b]">
                        Reviewed At: {formatDateTime(contribution.reviewedAt)}
                      </p>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                      Examples
                    </p>
                    {contribution.examples && contribution.examples.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm text-[#e7edf3]">
                        {contribution.examples.map((example, index) => (
                          <li
                            key={`${contribution.id}-example-${index}`}
                            className="rounded-xl border border-white/10 bg-[#0b0f14]/40 px-3 py-2"
                          >
                            {example}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-[#64748b]">Không có ví dụ.</p>
                    )}
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                      Topic IDs
                    </p>
                    {contribution.topicIds && contribution.topicIds.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {contribution.topicIds.map((topicId) => (
                          <span
                            key={`${contribution.id}-${topicId}`}
                            className="rounded-full border border-white/10 bg-[#0b0f14]/50 px-3 py-1 text-xs font-semibold text-[#cbd5e1]"
                          >
                            {topicId}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-[#64748b]">Không có topic.</p>
                    )}
                  </section>
                </div>

                <div className="space-y-4">
                  <ContributionReviewActions
                    contributionId={contribution.id}
                    status={contribution.status}
                  />

                  <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-sm font-semibold text-[#e7edf3]">Lịch sử duyệt</h3>
                    {reviewLogs.length === 0 ? (
                      <p className="mt-3 text-sm text-[#64748b]">Chưa có review log.</p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {reviewLogs.map((log) => (
                          <div
                            key={log.id}
                            className="rounded-2xl border border-white/10 bg-[#0b0f14]/30 p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#cbd5e1]">
                                {log.action || "ACTION"}
                              </span>
                              <span className="text-xs text-[#64748b]">
                                {formatDateTime(log.createdAt)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-[#e7edf3]">
                              {log.actorDisplayName || log.actorUserId || "—"}
                            </p>
                            {log.note ? (
                              <p className="mt-1 text-sm text-[#94a3b8]">{log.note}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
