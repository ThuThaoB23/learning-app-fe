import type { Metadata } from "next";
import Link from "next/link";
import StartSelectedVocabSessionForm from "../../../_components/start-selected-vocab-session-form";

export const metadata: Metadata = {
  title: "Phiên tự chọn",
  description: "Tạo phiên luyện tập từ danh sách từ vựng và dạng câu hỏi bạn tự chọn.",
};

export default function CustomPracticePage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/90 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            User set
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#0b0f14]">Phiên tự chọn</h2>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/practice"
            className="inline-flex rounded-full border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
          >
            Quay lại luyện tập
          </Link>
        </div>
      </section>

      <StartSelectedVocabSessionForm />
    </div>
  );
}
