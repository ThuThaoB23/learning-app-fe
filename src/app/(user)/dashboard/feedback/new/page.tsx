import type { Metadata } from "next";
import Link from "next/link";
import UserFeedbackForm from "../../../_components/user-feedback-form";

export const metadata: Metadata = {
  title: "Gửi Feedback",
  description: "Tạo feedback mới gửi tới đội ngũ quản trị.",
};

export default function NewFeedbackPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
              Feedback hub
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#0b0f14]">Gửi feedback mới</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#64748b]">
              Gửi bug report, lỗi nội dung hoặc yêu cầu tính năng bằng form riêng để dễ
              tập trung và theo dõi.
            </p>
          </div>

          <Link
            href="/dashboard/feedback"
            className="inline-flex items-center justify-center rounded-full border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-[#0b0f14] transition hover:border-[#0b0f14]"
          >
            Quay lại danh sách
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-[#e2e8f0] pb-4">
          <h3 className="text-xl font-semibold text-[#0b0f14]">Form gửi feedback</h3>
          <p className="mt-1 text-sm text-[#64748b]">
            Form này dùng `POST /feedback`, hỗ trợ tối đa 3 ảnh đính kèm.
          </p>
        </div>

        <div className="mt-4">
          <UserFeedbackForm redirectTo="/dashboard/feedback" />
        </div>
      </section>
    </div>
  );
}
