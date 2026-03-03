import type { Metadata } from "next";
import Link from "next/link";
import { fetchTopics } from "@/lib/admin-topics";
import { fetchVocabDetailById } from "@/lib/admin-vocab";
import VocabEditPage from "./_components/vocab-edit-page";

export const metadata: Metadata = {
  title: "Cập nhật từ vựng",
  description: "Chỉnh sửa thông tin vocabulary trong hệ thống.",
};

type AdminVocabEditPageProps = {
  params: Promise<{ vocabId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getSingleParam = (
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
) => {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
};

export default async function AdminVocabEditRoute({
  params,
  searchParams,
}: AdminVocabEditPageProps) {
  const [{ vocabId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const returnTo = getSingleParam(resolvedSearchParams, "returnTo");
  const returnHref =
    returnTo && returnTo.startsWith("/admin/vocab") ? returnTo : "/admin/vocab";

  const [vocab, topicsData] = await Promise.all([
    fetchVocabDetailById(vocabId),
    fetchTopics(0, 200, undefined, { status: "ACTIVE" }),
  ]);

  const topics =
    topicsData?.content?.map((topic) => ({
      id: topic.id,
      label: topic.name?.trim() || topic.title?.trim() || topic.id,
    })) ?? [];

  if (!vocab) {
    return (
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-[#0f172a]/85 p-8 shadow-[0_30px_80px_rgba(6,10,18,0.45)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
            Vocabulary edit
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#f8fafc]">
            Không tải được dữ liệu để cập nhật
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[#94a3b8]">
            API không trả về vocabulary hoặc bạn không còn quyền chỉnh sửa mục
            này.
          </p>
          <div className="mt-6">
            <Link
              href={returnHref}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition hover:bg-white/10"
            >
              Quay lại
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <VocabEditPage
      initialVocab={vocab}
      topics={topics}
      returnHref={returnHref}
    />
  );
}
