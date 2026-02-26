import type { Metadata } from "next";
import Link from "next/link";
import UserVocabContributionForm from "../../../_components/user-vocab-contribution-form";
import { fetchMyVocabContributions, fetchTopics } from "@/lib/user-api";
import { formatVocabularyContributionRejectReason } from "@/lib/vocab-contribution-reject-reason";

export const metadata: Metadata = {
  title: "Thêm mới từ vựng",
  description: "Thêm từ vựng mới và tự động kiểm tra trùng ngay trong ô nhập từ.",
};

export default async function NewUserVocabPage() {
  const [topicsData, contributionsData] = await Promise.all([
    fetchTopics({ page: 0, size: 200, sort: "name,asc" }),
    fetchMyVocabContributions({ page: 0, size: 8, sort: "createdAt,desc" }),
  ]);

  const topics = (topicsData?.content ?? [])
    .filter((topic) => (topic.status || "ACTIVE").toUpperCase() !== "INACTIVE")
    .map((topic) => ({
      id: topic.id,
      label: topic.name?.trim() || topic.slug || topic.id,
    }));
  const contributions = contributionsData?.content ?? [];

  const statusClasses = (status?: string | null) => {
    switch ((status || "").toUpperCase()) {
      case "APPROVED":
        return "border-[#34d399]/35 bg-[#ecfdf5] text-[#166534]";
      case "REJECTED":
        return "border-[#fb7185]/35 bg-[#fff1f2] text-[#be123c]";
      case "IN_REVIEW":
        return "border-[#60a5fa]/35 bg-[#eff6ff] text-[#1d4ed8]";
      case "CANCELED":
        return "border-[#e5e7eb] bg-[#f8fafc] text-[#64748b]";
      default:
        return "border-[#f59e0b]/35 bg-[#fffbeb] text-[#b45309]";
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#0b0f14]">Thêm mới từ vựng</h1>
          </div>
          <Link
            href="/dashboard/vocab"
            className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
          >
            Quay lại My Vocab
          </Link>
        </div>
      </section>

      <UserVocabContributionForm topics={topics} />

      <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0b0f14]">Đóng góp gần đây của tôi</h2>
          <span className="rounded-full border border-[#e5e7eb] px-3 py-1 text-xs font-semibold text-[#64748b]">
            {contributionsData?.totalElements ?? contributions.length} mục
          </span>
        </div>

        {!contributionsData ? (
          <p className="mt-4 text-sm text-[#be123c]">
            Không tải được danh sách đóng góp từ vựng.
          </p>
        ) : contributions.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm text-[#64748b]">
            Bạn chưa có đóng góp nào.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {contributions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#e5e7eb] bg-white p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-[#0b0f14]">
                        {item.term || "(không có term)"}
                      </p>
                      {item.language ? (
                        <span className="rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-semibold text-[#64748b]">
                          {item.language}
                        </span>
                      ) : null}
                      {item.partOfSpeech ? (
                        <span className="rounded-full border border-[#e5e7eb] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#64748b]">
                          {item.partOfSpeech}
                        </span>
                      ) : null}
                    </div>
                    {item.definition ? (
                      <p className="mt-2 text-sm text-[#334155]">{item.definition}</p>
                    ) : null}
                    {item.reviewNote ? (
                      <p className="mt-2 text-xs text-[#64748b]">
                        Ghi chú duyệt: {item.reviewNote}
                      </p>
                    ) : null}
                    {item.rejectReason ? (
                      <p className="mt-1 text-xs text-[#be123c]">
                        Lý do từ chối: {formatVocabularyContributionRejectReason(item.rejectReason)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(item.status)}`}
                    >
                      {item.status || "SUBMITTED"}
                    </span>
                    <p className="text-xs text-[#64748b]">
                      {item.createdAt
                        ? new Intl.DateTimeFormat("vi-VN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(item.createdAt))
                        : "--"}
                    </p>
                    {item.approvedVocabularyId ? (
                      <span className="text-xs text-[#166534]">
                        Đã tạo vocab: {item.approvedVocabularyId}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
