import type { Metadata } from "next";
import Link from "next/link";
import RefreshButton from "@/components/refresh-button";
import AddToMyVocabButton from "../../_components/add-to-my-vocab-button";
import { fetchTopics, fetchVocab } from "@/lib/user-api";

export const metadata: Metadata = {
  title: "Khám phá từ",
  description: "Tìm và thêm từ vựng vào danh sách học cá nhân.",
};

type LibraryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const queryParam = Array.isArray(resolvedSearchParams?.query)
    ? resolvedSearchParams.query[0]
    : resolvedSearchParams?.query;
  const topicIdParam = Array.isArray(resolvedSearchParams?.topicId)
    ? resolvedSearchParams.topicId[0]
    : resolvedSearchParams?.topicId;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams?.page;
  const sizeParam = Array.isArray(resolvedSearchParams?.size)
    ? resolvedSearchParams.size[0]
    : resolvedSearchParams?.size;

  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const size = Math.min(50, Math.max(1, Number(sizeParam ?? 12) || 12));

  const [vocabData, topicsData] = await Promise.all([
    fetchVocab({
      query: queryParam,
      topicId: topicIdParam,
      page,
      size,
      sort: "createdAt,desc",
      status: "APPROVED",
    }),
    fetchTopics({ page: 0, size: 100, sort: "name,asc" }),
  ]);
  const vocabularies = vocabData?.content ?? [];
  const topics = topicsData?.content ?? [];
  const hasError = !vocabData || !topicsData;
  const totalPages = Math.max(1, vocabData?.totalPages ?? 1);
  const currentPage = Math.min(Math.max(0, vocabData?.number ?? page), totalPages - 1);

  const buildHref = (pageIndex: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageIndex));
    params.set("size", String(size));
    if (queryParam) {
      params.set("query", queryParam);
    }
    if (topicIdParam) {
      params.set("topicId", topicIdParam);
    }
    return `/dashboard/library?${params.toString()}`;
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
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <form className="grid flex-1 gap-3 md:grid-cols-[minmax(0,_1fr)_220px_auto]">
            <input
              type="text"
              name="query"
              defaultValue={queryParam ?? ""}
              placeholder="Tìm từ vựng, định nghĩa..."
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm focus:border-[#0b0f14] focus:outline-none"
            />
            <select
              name="topicId"
              defaultValue={topicIdParam ?? ""}
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm focus:border-[#0b0f14] focus:outline-none"
            >
              <option value="">Tất cả chủ đề</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name || topic.slug || topic.id}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-[#0b0f14] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#111827]"
            >
              Lọc
            </button>
          </form>
          <RefreshButton className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]" />
        </div>
        {hasError ? (
          <p className="mt-3 text-xs text-[#be123c]">
            Không thể tải đầy đủ dữ liệu từ API.
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        {vocabularies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white/70 p-6 text-sm text-[#64748b]">
            Không có từ vựng phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          vocabularies.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-[#0b0f14]">
                      {item.term || "--"}
                    </h3>
                    <span className="rounded-full border border-[#dbeafe] bg-[#eff6ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1d4ed8]">
                      {item.language || "en"}
                    </span>
                    {item.partOfSpeech ? (
                      <span className="rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                        {item.partOfSpeech}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-[#334155]">
                    {item.definition || "Chưa có định nghĩa."}
                  </p>
                  <p className="text-sm text-[#64748b]">
                    {item.definitionVi || "Chưa có định nghĩa tiếng Việt."}
                  </p>
                  {item.examples?.length ? (
                    <ul className="space-y-1 text-xs text-[#475569]">
                      {item.examples.slice(0, 2).map((example, index) => (
                        <li key={`${item.id}-example-${index}`}>• {example}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <AddToMyVocabButton vocabularyId={item.id} />
              </div>
            </article>
          ))
        )}
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
