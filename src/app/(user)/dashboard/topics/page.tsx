import type { Metadata } from "next";
import RefreshButton from "@/components/refresh-button";
import { fetchTopics } from "@/lib/user-api";

export const metadata: Metadata = {
  title: "Chủ đề",
  description: "Danh sách chủ đề học tập dành cho người dùng.",
};

type TopicsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TopicsPage({ searchParams }: TopicsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const queryParam = Array.isArray(resolvedSearchParams?.query)
    ? resolvedSearchParams.query[0]
    : resolvedSearchParams?.query;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams?.page;
  const sizeParam = Array.isArray(resolvedSearchParams?.size)
    ? resolvedSearchParams.size[0]
    : resolvedSearchParams?.size;

  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const size = Math.min(50, Math.max(1, Number(sizeParam ?? 12) || 12));

  const data = await fetchTopics({
    query: queryParam,
    page,
    size,
    sort: "createdAt,desc",
  });
  const topics = data?.content ?? [];
  const hasError = !data;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Chủ đề học tập</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              Lấy từ endpoint `GET /topics`, chỉ hiển thị chủ đề đang hoạt động.
            </p>
            {hasError ? (
              <p className="mt-2 text-xs text-[#be123c]">
                Không thể tải danh sách chủ đề từ API.
              </p>
            ) : null}
          </div>
          <RefreshButton className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white/70 p-6 text-sm text-[#64748b]">
            Chưa có chủ đề nào.
          </div>
        ) : (
          topics.map((topic) => (
            <article
              key={topic.id}
              className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 text-base font-semibold text-[#0b0f14]">
                  {topic.name || "Chủ đề chưa đặt tên"}
                </h3>
                <span className="rounded-full border border-[#34d399]/30 bg-[#34d399]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#15803d]">
                  {topic.status || "ACTIVE"}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-[#64748b]">
                {topic.description || "Chưa có mô tả cho chủ đề này."}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-[#94a3b8]">
                <span>{topic.slug ? `slug: ${topic.slug}` : "slug: --"}</span>
                <span>
                  {topic.createdAt
                    ? new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "medium",
                      }).format(new Date(topic.createdAt))
                    : "Không rõ ngày tạo"}
                </span>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
