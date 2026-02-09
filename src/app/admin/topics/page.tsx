import type { Metadata } from "next";
import Link from "next/link";
import type { TopicResponse } from "@/lib/admin-topics";
import { fetchTopics } from "@/lib/admin-topics";
import PageSizeSelect from "./_components/page-size-select";
import RefreshButton from "@/components/refresh-button";
import CreateTopicModal from "./_components/create-topic-modal";
import TopicsSearchBar from "./_components/topics-search-bar";
import TopicsFilterPanel from "./_components/topics-filter-panel";
import TopicActions from "./_components/topic-actions";
import TopicsExportButton from "./_components/topics-export-button";

export const metadata: Metadata = {
  title: "Chủ đề",
  description: "Quản lý danh sách chủ đề học tập.",
};

const getTopicTitle = (topic: TopicResponse) =>
  topic.name?.trim() ||
  topic.title?.trim() ||
  topic.description?.trim() ||
  "Chưa đặt tên";

type AdminTopicsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTopicsPage({
  searchParams,
}: AdminTopicsPageProps) {
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
  const nameParam = Array.isArray(resolvedSearchParams?.name)
    ? resolvedSearchParams?.name[0]
    : resolvedSearchParams?.name;
  const slugParam = Array.isArray(resolvedSearchParams?.slug)
    ? resolvedSearchParams?.slug[0]
    : resolvedSearchParams?.slug;
  const statusParam = Array.isArray(resolvedSearchParams?.status)
    ? resolvedSearchParams?.status[0]
    : resolvedSearchParams?.status;

  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const size = Math.min(50, Math.max(1, Number(sizeParam ?? 20) || 20));

  const data = await fetchTopics(page, size, sortParam, {
    name: nameParam,
    slug: slugParam,
    status: statusParam,
  });
  const topics = data?.content ?? [];
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
    if (nameParam) {
      params.set("name", String(nameParam));
    }
    if (slugParam) {
      params.set("slug", String(slugParam));
    }
    if (statusParam) {
      params.set("status", String(statusParam));
    }
    return `/admin/topics?${params.toString()}`;
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
            Topics
          </p>
          <h1 className="text-2xl font-semibold text-[#e7edf3]">
            Quản lý chủ đề
          </h1>
          <p className="mt-2 text-sm text-[#64748b]">
            Theo dõi danh sách chủ đề đang hoạt động.
          </p>
          {hasError ? (
            <p className="mt-2 text-xs text-[#fb7185]">
              Không thể tải danh sách chủ đề từ API.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <TopicsExportButton />
          <CreateTopicModal />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <TopicsSearchBar name={nameParam ?? ""} slug={slugParam ?? ""} />
            <TopicsFilterPanel status={statusParam ?? ""} />
          </div>
          <RefreshButton className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/15 disabled:opacity-60" />
        </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[minmax(0,_1.6fr)_minmax(0,_2fr)_160px_200px_96px] items-center gap-4 bg-[#0b0f14]/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                <span>Chủ đề</span>
                <span>Mô tả</span>
                <span className="text-center">Trạng thái</span>
                <span>Ngày tạo</span>
                <span className="text-center">Thao tác</span>
              </div>
              <div className="divide-y divide-white/10">
                {topics.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-[#64748b]">
                    Chưa có dữ liệu chủ đề.
                  </div>
                ) : (
                  topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="grid grid-cols-[minmax(0,_1.6fr)_minmax(0,_2fr)_160px_200px_96px] items-center gap-4 px-4 py-4 text-sm text-[#e7edf3]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {getTopicTitle(topic)}
                        </p>
                        <p className="truncate text-xs text-[#64748b]">
                          {topic.name || topic.title || "—"}
                        </p>
                      </div>
                      <p className="truncate text-sm text-[#94a3b8]">
                        {topic.description ?? "—"}
                      </p>
                      <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#3b82f6]/35 bg-[#3b82f6]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#93c5fd]">
                          {topic.status ?? "ACTIVE"}
                        </span>
                      </div>
                      <p className="text-sm text-[#94a3b8]">
                        {topic.createdAt
                          ? new Intl.DateTimeFormat("vi-VN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(topic.createdAt))
                          : "—"}
                      </p>
                      <div className="flex justify-center">
                        <TopicActions topic={topic} />
                      </div>
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
