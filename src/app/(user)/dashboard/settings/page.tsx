import type { Metadata } from "next";
import UpdateProfileForm from "../../_components/update-profile-form";
import { fetchMe } from "@/lib/user-api";

export const metadata: Metadata = {
  title: "Cài đặt",
  description: "Cập nhật hồ sơ cá nhân và mục tiêu học tập.",
};

export default async function SettingsPage() {
  const profile = await fetchMe();

  if (!profile) {
    return (
      <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">
        Không thể tải thông tin tài khoản từ API.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h2 className="text-2xl font-semibold">Thông tin tài khoản</h2>
        <p className="mt-1 text-sm text-[#64748b]">
          Endpoint dùng: `GET /me` và `PATCH /me`.
        </p>
        <div className="mt-5">
          <UpdateProfileForm profile={profile} />
        </div>
      </section>
    </div>
  );
}
