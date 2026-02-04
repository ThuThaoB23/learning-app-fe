import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Learning App",
    default: "Learning App",
  },
  description: "Nền tảng học từ vựng với lộ trình cá nhân hóa.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#0b0f14]">{children}</div>
  );
}
