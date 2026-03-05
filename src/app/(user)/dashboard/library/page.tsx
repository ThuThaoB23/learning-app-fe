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

const pickSingle = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const queryParam = pickSingle(resolvedSearchParams?.query)?.trim() || "";
  const topicIdParam = pickSingle(resolvedSearchParams?.topicId) || "";
  const pageParam = pickSingle(resolvedSearchParams?.page);
  const sizeParam = pickSingle(resolvedSearchParams?.size);

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
  const totalElements = vocabData?.totalElements ?? vocabularies.length;
  const resultStart =
    vocabularies.length > 0 ? currentPage * size + 1 : 0;
  const resultEnd =
    vocabularies.length > 0 ? resultStart + vocabularies.length - 1 : 0;
  const normalizedSize = String(size);

  const buildHref = (
    pageIndex: number,
    overrides?: {
      query?: string;
      topicId?: string;
      size?: string;
    },
  ) => {
    const params = new URLSearchParams();
    const nextQuery = overrides?.query ?? queryParam;
    const nextTopicId = overrides?.topicId ?? topicIdParam;
    const nextSize = overrides?.size ?? normalizedSize;

    if (pageIndex > 0) {
      params.set("page", String(pageIndex));
    }
    if (nextSize && nextSize !== "12") {
      params.set("size", nextSize);
    }
    if (nextQuery) {
      params.set("query", nextQuery);
    }
    if (nextTopicId) {
      params.set("topicId", nextTopicId);
    }

    const query = params.toString();
    return query ? `/dashboard/library?${query}` : "/dashboard/library";
  };

  const rangeStart = Math.max(0, currentPage - 2);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 2);
  const pageRange = Array.from(
    { length: rangeEnd - rangeStart + 1 },
    (_, index) => rangeStart + index,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0b0f14]">
              Khám phá từ
            </h2>
            <p className="mt-1 text-sm text-[#64748b]">
              Kho từ vựng đã duyệt, sẵn sàng thêm vào danh sách học cá nhân.
            </p>
          </div>
          <RefreshButton className="w-fit rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[#64748b]">
          <span className="rounded-full border border-[#dbeafe] bg-[#eff6ff] px-3 py-1 text-[#1d4ed8]">
            {totalElements} kết quả
          </span>
          {queryParam ? (
            <span className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1">
              Từ khóa: {queryParam}
            </span>
          ) : null}
          {topicIdParam ? (
            <span className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1">
              Đang lọc theo chủ đề
            </span>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:p-5">
        <form className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_250px_170px_auto_auto] lg:items-end">
          <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">
            Từ khóa
            <input
              type="text"
              name="query"
              defaultValue={queryParam}
              placeholder="Tìm theo từ hoặc nghĩa"
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-[#0f172a] focus:border-[#0b0f14] focus:outline-none"
            />
          </label>

          <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">
            Chủ đề
            <select
              name="topicId"
              defaultValue={topicIdParam}
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-[#0f172a] focus:border-[#0b0f14] focus:outline-none"
            >
              <option value="">Tất cả chủ đề</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name || topic.slug || topic.id}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">
            Mỗi trang
            <select
              name="size"
              defaultValue={normalizedSize}
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-[#0f172a] focus:border-[#0b0f14] focus:outline-none"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="50">50</option>
            </select>
          </label>

          <button
            type="submit"
            className="rounded-xl bg-[#0b0f14] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#111827]"
          >
            Áp dụng
          </button>
          <Link
            href="/dashboard/library"
            className="inline-flex items-center justify-center rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-[#0b0f14] hover:text-[#0b0f14]"
          >
            Xóa lọc
          </Link>
        </form>
        {hasError ? (
          <p className="mt-3 text-xs text-[#be123c]">
            Không thể tải đầy đủ dữ liệu từ API.
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        {vocabularies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white/70 p-6 text-sm text-[#64748b]">
            Không có từ vựng phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {vocabularies.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col rounded-2xl border border-white/80 bg-white/90 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <h3 className="truncate text-lg font-semibold text-[#0b0f14]">
                      {item.term || "--"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full border border-[#dbeafe] bg-[#eff6ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1d4ed8]">
                        {item.language || "en"}
                      </span>
                      {item.partOfSpeech ? (
                        <span className="rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                          {item.partOfSpeech}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <AddToMyVocabButton
                      vocabularyId={item.id}
                      inMyVocab={item.inMyVocab}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3 text-sm">
                  <p className="text-[#334155]">
                    {item.definition || "Chưa có định nghĩa."}
                  </p>
                  <p className="text-[#64748b]">
                    {item.definitionVi || "Chưa có định nghĩa tiếng Việt."}
                  </p>
                </div>

                <div className="mt-4 flex min-h-10 items-center border-t border-[#edf2f7] pt-3">
                  {item.examples?.length ? (
                    <p className="line-clamp-2 text-xs italic text-[#475569]">
                      &quot;{item.examples[0]}&quot;
                    </p>
                  ) : (
                    <p className="text-xs text-[#94a3b8]">Chưa có ví dụ.</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <p className="text-[#64748b]">
          {resultStart > 0 ? (
            <>
              Hiển thị{" "}
              <span className="font-semibold text-[#0b0f14]">{resultStart}</span>
              -
              <span className="font-semibold text-[#0b0f14]">{resultEnd}</span> /{" "}
              <span className="font-semibold text-[#0b0f14]">{totalElements}</span>
            </>
          ) : (
            <>Không có kết quả</>
          )}
        </p>

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
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
        ) : null}
      </section>
    </div>
  );
}
