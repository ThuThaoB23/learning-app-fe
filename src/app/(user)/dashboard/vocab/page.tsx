import type { Metadata } from "next";
import Link from "next/link";
import RefreshButton from "@/components/refresh-button";
import MyVocabActions from "../../_components/my-vocab-actions";
import { fetchMyVocab } from "@/lib/user-api";

export const metadata: Metadata = {
  title: "Từ vựng của tôi",
  description: "Theo dõi và quản lý danh sách từ vựng cá nhân.",
};

type MyVocabPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statuses = ["NEW", "LEARNING", "MASTERED"] as const;

export default async function MyVocabPage({ searchParams }: MyVocabPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const statusParam = Array.isArray(resolvedSearchParams?.status)
    ? resolvedSearchParams.status[0]
    : resolvedSearchParams?.status;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams?.page;
  const sizeParam = Array.isArray(resolvedSearchParams?.size)
    ? resolvedSearchParams.size[0]
    : resolvedSearchParams?.size;

  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const size = Math.min(50, Math.max(1, Number(sizeParam ?? 20) || 20));

  const data = await fetchMyVocab({
    status: statusParam,
    page,
    size,
    sort: "updatedAt,desc",
  });
  const items = data?.content ?? [];
  const hasError = !data;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const currentPage = Math.min(Math.max(0, data?.number ?? page), totalPages - 1);

  const buildHref = (pageIndex: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageIndex));
    params.set("size", String(size));
    if (statusParam) {
      params.set("status", statusParam);
    }
    return `/dashboard/vocab?${params.toString()}`;
  };

  const rangeStart = Math.max(0, currentPage - 2);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 2);
  const pageRange = Array.from(
    { length: rangeEnd - rangeStart + 1 },
    (_, index) => rangeStart + index,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[#64748b]">Trạng thái:</span>
            <button
              type="submit"
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                !statusParam
                  ? "border-[#0b0f14] bg-[#0b0f14] text-white"
                  : "border-[#e5e7eb] bg-white text-[#64748b]"
              }`}
            >
              Tất cả
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                type="submit"
                name="status"
                value={status}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  statusParam === status
                    ? "border-[#0b0f14] bg-[#0b0f14] text-white"
                    : "border-[#e5e7eb] bg-white text-[#64748b]"
                }`}
              >
                {status}
              </button>
            ))}
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/vocab/new"
              className="rounded-full bg-[#0b0f14] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#111827]"
            >
              Thêm mới từ vựng
            </Link>
            <RefreshButton className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]" />
          </div>
        </div>
        <div className="mt-4 text-sm text-[#64748b]">
          Tổng: <span className="font-semibold text-[#0b0f14]">{data?.totalElements ?? 0}</span> từ
        </div>
        {hasError ? (
          <p className="mt-2 text-xs text-[#be123c]">
            Không thể tải danh sách từ cá nhân.
          </p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white/90">
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[minmax(0,_1.2fr)_180px_150px_140px_260px] gap-4 bg-[#f8fafc] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
              <span>Từ</span>
              <span>Thời gian thêm</span>
              <span>Trạng thái</span>
              <span>Tiến độ</span>
              <span>Hành động</span>
            </div>
            <div className="divide-y divide-[#e5e7eb]">
              {items.length === 0 ? (
                <div className="px-4 py-6 text-sm text-[#64748b]">Chưa có từ vựng nào.</div>
              ) : (
                items.map((item) => {
                  const term =
                    item.term?.trim() ||
                    item.vocabulary?.term ||
                    item.vocabularyId ||
                    "--";
                  const progress = Math.min(
                    100,
                    Math.max(0, item.progress ?? item.process ?? 0),
                  );
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(0,_1.2fr)_180px_150px_140px_260px] gap-4 px-4 py-4 text-sm"
                    >
                      <p className="truncate font-semibold text-[#0b0f14]">{term}</p>
                      <p className="text-xs text-[#64748b]">
                        {item.createdAt
                          ? new Intl.DateTimeFormat("vi-VN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(item.createdAt))
                          : "--"}
                      </p>
                      <span className="w-fit rounded-full border border-[#dbeafe] bg-[#eff6ff] px-2 py-0.5 text-xs font-semibold text-[#1d4ed8]">
                        {item.status || "NEW"}
                      </span>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-[#0b0f14]">{progress}%</p>
                        <div className="h-2 rounded-full bg-[#e5e7eb]">
                          <div
                            className="h-2 rounded-full bg-[#34d399]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <MyVocabActions
                        vocabularyId={item.vocabularyId}
                        currentStatus={item.status}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <p className="text-[#64748b]">
          Trang <span className="font-semibold text-[#0b0f14]">{currentPage + 1}</span> /{" "}
          <span className="font-semibold text-[#0b0f14]">{totalPages}</span>
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={buildHref(Math.max(0, currentPage - 1))}
            aria-disabled={currentPage === 0}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              currentPage === 0
                ? "pointer-events-none border-[#e5e7eb] text-[#94a3b8]"
                : "border-[#e5e7eb] text-[#0b0f14] hover:border-[#0b0f14]"
            }`}
          >
            Trước
          </Link>

          {rangeStart > 0 ? (
            <>
              <Link
                href={buildHref(0)}
                className="rounded-full border border-[#e5e7eb] px-3 py-1 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
              >
                1
              </Link>
              <span className="px-1 text-xs text-[#94a3b8]">…</span>
            </>
          ) : null}

          {pageRange.map((pageIndex) => (
            <Link
              key={pageIndex}
              href={buildHref(pageIndex)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                pageIndex === currentPage
                  ? "border-[#0b0f14] bg-[#0b0f14] text-white"
                  : "border-[#e5e7eb] text-[#0b0f14] hover:border-[#0b0f14]"
              }`}
            >
              {pageIndex + 1}
            </Link>
          ))}

          {rangeEnd < totalPages - 1 ? (
            <>
              <span className="px-1 text-xs text-[#94a3b8]">…</span>
              <Link
                href={buildHref(totalPages - 1)}
                className="rounded-full border border-[#e5e7eb] px-3 py-1 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
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
                ? "pointer-events-none border-[#e5e7eb] text-[#94a3b8]"
                : "border-[#e5e7eb] text-[#0b0f14] hover:border-[#0b0f14]"
            }`}
          >
            Sau
          </Link>
        </div>
      </section>
    </div>
  );
}
