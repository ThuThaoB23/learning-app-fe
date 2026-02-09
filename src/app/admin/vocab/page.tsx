import type { Metadata } from "next";
import Link from "next/link";
import RefreshButton from "@/components/refresh-button";
import type { VocabularyResponse } from "@/lib/admin-vocab";
import { fetchVocab } from "@/lib/admin-vocab";
import { fetchTopics } from "@/lib/admin-topics";
import PageSizeSelect from "./_components/page-size-select";
import VocabSearchBar from "./_components/vocab-search-bar";
import VocabFilterPanel from "./_components/vocab-filter-panel";
import VocabActions from "./_components/vocab-actions";
import CreateVocabModal from "./_components/create-vocab-modal";

export const metadata: Metadata = {
  title: "Từ vựng",
  description: "Quản lý danh sách từ vựng trong hệ thống.",
};

const pillBase =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase";

const statusLabels: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const statusStyles: Record<string, string> = {
  PENDING: "border-[#fbbf24]/35 bg-[#fbbf24]/15 text-[#fde68a]",
  APPROVED: "border-[#34d399]/35 bg-[#34d399]/15 text-[#86efac]",
  REJECTED: "border-[#fb7185]/35 bg-[#fb7185]/15 text-[#fda4af]",
};

const getStatusMeta = (status?: string | null) => {
  const key = status ?? "PENDING";
  return {
    label: statusLabels[key] ?? key,
    className: statusStyles[key] ?? statusStyles.PENDING,
  };
};

const getTitle = (vocab: VocabularyResponse) =>
  vocab.term?.trim() ||
  vocab.termNormalized?.trim() ||
  vocab.definition?.trim() ||
  "Chưa đặt từ";

const formatDefinition = (vocab: VocabularyResponse) => {
  const en = vocab.definition?.trim();
  const vi = vocab.definitionVi?.trim();

  if (en && vi) {
    return `${en} • VI: ${vi}`;
  }
  return en || vi || "—";
};

type AdminVocabPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminVocabPage({
  searchParams,
}: AdminVocabPageProps) {
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
  const queryParam = Array.isArray(resolvedSearchParams?.query)
    ? resolvedSearchParams?.query[0]
    : resolvedSearchParams?.query;
  const topicParam = Array.isArray(resolvedSearchParams?.topicId)
    ? resolvedSearchParams?.topicId[0]
    : resolvedSearchParams?.topicId;
  const languageParam = Array.isArray(resolvedSearchParams?.language)
    ? resolvedSearchParams?.language[0]
    : resolvedSearchParams?.language;
  const statusParam = Array.isArray(resolvedSearchParams?.status)
    ? resolvedSearchParams?.status[0]
    : resolvedSearchParams?.status;

  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const size = Math.min(50, Math.max(1, Number(sizeParam ?? 20) || 20));

  const vocabPromise = fetchVocab(page, size, sortParam, {
    query: queryParam,
    topicId: topicParam,
    language: languageParam,
    status: statusParam,
  });
  const topicsPromise = fetchTopics(0, 200, undefined, { status: "ACTIVE" });

  const [data, topicsData] = await Promise.all([vocabPromise, topicsPromise]);

  const items = data?.content ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const currentPage = Math.min(Math.max(0, data?.number ?? page), totalPages - 1);
  const hasError = !data;
  const topics =
    topicsData?.content?.map((topic) => ({
      id: topic.id,
      label: topic.name?.trim() || topic.title?.trim() || topic.id,
    })) ?? [];

  const buildHref = (pageIndex: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageIndex));
    params.set("size", String(size));
    if (sortParam) {
      params.set("sort", String(sortParam));
    }
    if (queryParam) {
      params.set("query", String(queryParam));
    }
    if (topicParam) {
      params.set("topicId", String(topicParam));
    }
    if (languageParam) {
      params.set("language", String(languageParam));
    }
    if (statusParam) {
      params.set("status", String(statusParam));
    }
    return `/admin/vocab?${params.toString()}`;
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
            Vocabulary
          </p>
          <h1 className="text-2xl font-semibold text-[#e7edf3]">
            Quản lý từ vựng
          </h1>
          <p className="mt-2 text-sm text-[#64748b]">
            Duyệt và kiểm soát danh sách từ vựng trong hệ thống.
          </p>
          {hasError ? (
            <p className="mt-2 text-xs text-[#fb7185]">
              Không thể tải danh sách từ vựng từ API.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <CreateVocabModal topics={topics} />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-[0_20px_60px_rgba(6,10,18,0.4)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <VocabSearchBar query={queryParam ?? ""} />
            <VocabFilterPanel
              status={statusParam ?? ""}
              language={languageParam ?? ""}
              topicId={topicParam ?? ""}
              topics={topics}
            />
          </div>
          <RefreshButton className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/15 disabled:opacity-60" />
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <div className="min-w-[1300px]">
            <div className="grid grid-cols-[minmax(0,_1.3fr)_minmax(0,_2fr)_minmax(0,_1.7fr)_120px_160px_220px_96px] items-center gap-4 bg-[#0b0f14]/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              <span>Từ vựng</span>
              <span>Định nghĩa</span>
              <span>Định nghĩa VN</span>
              <span>Ngôn ngữ</span>
              <span className="text-center">Trạng thái</span>
              <span>Ngày tạo</span>
              <span className="text-center">Thao tác</span>
            </div>
            <div className="divide-y divide-white/10">
              {items.length === 0 ? (
                <div className="px-4 py-6 text-sm text-[#64748b]">
                  Chưa có dữ liệu từ vựng.
                </div>
              ) : (
                items.map((item) => {
                  const statusMeta = getStatusMeta(item.status);
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(0,_1.3fr)_minmax(0,_2fr)_minmax(0,_1.7fr)_120px_160px_220px_96px] items-center gap-4 px-4 py-4 text-sm text-[#e7edf3]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {getTitle(item)}
                        </p>
                        <p className="truncate text-xs text-[#64748b]">
                          {item.phonetic || "—"}{" "}
                          {item.partOfSpeech ? `• ${item.partOfSpeech}` : ""}
                        </p>
                      </div>
                      <p className="truncate text-sm text-[#94a3b8]">
                        {formatDefinition(item)}
                      </p>
                      <p className="truncate text-sm text-[#94a3b8]">
                        {item.definitionVi?.trim() || "—"}
                      </p>
                      <p className="text-sm uppercase text-[#94a3b8]">
                        {item.language ?? "—"}
                      </p>
                      <div className="flex justify-center">
                        <span
                          className={`${pillBase} ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-[#94a3b8]">
                        <p>
                          {item.createdAt
                            ? new Intl.DateTimeFormat("vi-VN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(item.createdAt))
                            : "—"}
                        </p>
                        <p className="text-xs text-[#64748b]">
                          {item.updatedAt
                            ? `Cập nhật: ${new Intl.DateTimeFormat("vi-VN", {
                                dateStyle: "medium",
                              }).format(new Date(item.updatedAt))}`
                            : "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <VocabActions vocab={item} topics={topics} />
                      </div>
                    </div>
                  );
                })
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
