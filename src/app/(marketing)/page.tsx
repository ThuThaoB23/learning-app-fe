import type { Metadata } from "next";
import Link from "next/link";
import AppLogo from "@/components/app-logo";
import MarketingSectionNav from "./_components/marketing-section-nav";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Khám phá trải nghiệm học từ vựng cá nhân hóa.",
};

const coreBenefits = [
  {
    title: "Khám phá từ có chọn lọc",
    desc: "Tìm từ theo chủ đề, giữ lại những từ bạn thật sự cần dùng.",
  },
  {
    title: "Hệ thống ôn tập đều nhịp",
    desc: "Tập trung vào nhóm từ cần ôn ngay, tránh học dồn và nhanh quên.",
  },
  {
    title: "Theo dõi tiến độ trực quan",
    desc: "Biết rõ bạn đã học bao nhiêu, còn bao nhiêu và đang ở mức nào.",
  },
  {
    title: "Bộ từ vựng cá nhân",
    desc: "Lưu từ, cập nhật trạng thái NEW, LEARNING, MASTERED theo thực tế.",
  },
  {
    title: "Phiên học linh hoạt",
    desc: "Bạn có thể học daily hoặc học theo topic tùy mục tiêu hôm đó.",
  },
  {
    title: "Dashboard tập trung",
    desc: "Tất cả từ, phiên học, thống kê nằm trong cùng một không gian rõ ràng.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Chọn từ cần học",
    desc: "Dùng bộ lọc để tìm đúng nhóm từ theo mục tiêu hiện tại.",
  },
  {
    step: "02",
    title: "Lưu vào danh sách cá nhân",
    desc: "Biến từ mới thành bộ học riêng để theo dõi dài hạn.",
  },
  {
    step: "03",
    title: "Luyện tập theo phiên",
    desc: "Ôn hằng ngày hoặc theo chủ đề để giữ nhịp ổn định.",
  },
  {
    step: "04",
    title: "Đánh giá và điều chỉnh",
    desc: "Xem tiến bộ, tăng/giảm mục tiêu và lặp lại chu trình.",
  },
];

const painPoints = [
  {
    title: "Học nhiều nhưng khó nhớ",
    desc: "Dữ liệu học không tập trung khiến bạn không biết nên ôn gì trước.",
  },
  {
    title: "Thiếu nhịp học ổn định",
    desc: "Không có mục tiêu ngày cụ thể nên dễ bỏ dở giữa chừng.",
  },
  {
    title: "Khó theo dõi tiến bộ thật",
    desc: "Không rõ từ nào đã thuộc, từ nào cần ưu tiên ôn lại.",
  },
];

const faqs = [
  {
    question: "Người mới bắt đầu có dùng được không?",
    answer:
      "Có. Bạn có thể bắt đầu bằng các chủ đề cơ bản, lưu từ dần dần và tăng độ khó theo tiến độ.",
  },
  {
    question: "Tôi có thể đặt mục tiêu học theo ngày không?",
    answer:
      "Có. Trong phần cài đặt bạn có thể đặt mục tiêu phút học/ngày và theo dõi việc hoàn thành.",
  },
  {
    question: "Danh sách từ cá nhân có chỉnh sửa được không?",
    answer:
      "Có. Bạn có thể cập nhật trạng thái học, theo dõi tiến độ hoặc xóa từ khỏi danh sách bất kỳ lúc nào.",
  },
];

const sectionLinks = [
  { href: "#hero", label: "Hero" },
  { href: "#so-lieu", label: "Số liệu" },
  { href: "#van-de-giai-phap", label: "Vấn đề/Giải pháp" },
  { href: "#tinh-nang", label: "Tính năng" },
  { href: "#quy-trinh", label: "Quy trình" },
  { href: "#faq", label: "FAQ" },
  { href: "#cta", label: "CTA" },
];

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-36 right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_#f9d27c,_transparent_72%)] opacity-70" />
      <div className="pointer-events-none absolute -bottom-48 left-[-14%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,_#8bd6c8,_transparent_72%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(11,15,20,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,15,20,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-3 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-6xl rounded-xl border border-white/70 bg-white/92 px-2.5 py-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.1)] backdrop-blur sm:rounded-2xl sm:px-3 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2.5 text-sm font-semibold">
              <AppLogo size={20} className="rounded-md border-0 bg-transparent" />
              Learning App
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="hidden rounded-full border border-[#d5dde8] bg-white px-3 py-1.5 text-xs font-semibold text-[#0b0f14] transition hover:border-[#0b0f14] sm:inline-flex"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#0b0f14] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#111827]"
              >
                <span className="sm:hidden">Bắt đầu</span>
                <span className="hidden sm:inline">Tạo tài khoản</span>
              </Link>
            </div>
          </div>
          <MarketingSectionNav links={sectionLinks} />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-32 sm:px-6 sm:pb-10 sm:pt-36 lg:px-10 lg:pb-12 xl:pt-24">

        <section
          id="hero"
          className="scroll-mt-28 mt-7 grid gap-5 lg:grid-cols-[minmax(0,_1.08fr)_minmax(0,_0.92fr)] lg:items-stretch"
        >
          <div className="rounded-3xl border border-white/75 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)] lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
              Nền tảng học từ vựng thực dụng
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Học từ vựng có lộ trình, dễ duy trì mỗi ngày.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[#526176]">
              Không chỉ lưu từ. Learning App giúp bạn quyết định nên học gì,
              ôn gì và đo được tiến bộ sau từng phiên.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-[#0b0f14] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#111827]"
              >
                Bắt đầu miễn phí
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-[#d7dde6] bg-white px-6 py-3 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#0b0f14]"
              >
                Tôi đã có tài khoản
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#dce5f2] bg-[#f8fbff] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
              Snapshot hôm nay
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Mục tiêu/ngày", value: "30 phút" },
                { label: "Phiên học", value: "Daily + Topic" },
                { label: "Trạng thái theo dõi", value: "3 mức" },
                { label: "Nhịp học khuyến nghị", value: "5-15 phút" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#dbe4f0] bg-white px-3 py-3"
                >
                  <p className="text-xs text-[#64748b]">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#0b0f14]">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-[#dbe4f0] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                Chu trình học đề xuất
              </p>
              <p className="mt-2 text-sm text-[#334155]">
                Khám phá từ mới -&gt; Lưu vào bộ cá nhân -&gt; Luyện theo phiên
                -&gt; Đánh giá tiến độ.
              </p>
            </div>
          </div>
        </section>

        <section id="so-lieu" className="scroll-mt-28 mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { value: "01 Dashboard", label: "quản lý tập trung toàn bộ quá trình học" },
            { value: "03 Trạng thái", label: "NEW, LEARNING, MASTERED rõ ràng" },
            { value: "02 Loại phiên", label: "daily hoặc theo chủ đề tùy thời điểm" },
          ].map((metric) => (
            <div
              key={metric.value}
              className="rounded-xl border border-white/75 bg-white/90 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
            >
              <p className="text-base font-semibold text-[#0b0f14]">{metric.value}</p>
              <p className="mt-1 text-xs text-[#64748b]">{metric.label}</p>
            </div>
          ))}
        </section>

        <section
          id="van-de-giai-phap"
          className="scroll-mt-28 mt-11 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold tracking-tight">Vấn đề thường gặp khi tự học</h2>
            <div className="mt-4 space-y-3">
              {painPoints.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#f1d6dc] bg-[#fff5f7] p-4"
                >
                  <h3 className="text-sm font-semibold text-[#0b0f14]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#64748b]">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold tracking-tight">Hướng giải quyết</h2>
            <div className="mt-4 space-y-3">
              <p className="rounded-2xl border border-[#dde5f1] bg-[#f8fbff] p-4 text-sm text-[#526176]">
                Tập trung dữ liệu học vào một dashboard thay vì rải rác nhiều nơi.
              </p>
              <p className="rounded-2xl border border-[#dde5f1] bg-[#f8fbff] p-4 text-sm text-[#526176]">
                Chia tiến độ thành trạng thái rõ ràng để biết bước tiếp theo.
              </p>
              <p className="rounded-2xl border border-[#dde5f1] bg-[#f8fbff] p-4 text-sm text-[#526176]">
                Gắn việc học với phiên daily/topic để giữ nhịp đều mỗi ngày.
              </p>
            </div>
          </div>
        </section>

        <section
          id="tinh-nang"
          className="scroll-mt-28 mt-11 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Tính năng nổi bật</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coreBenefits.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#dde5f1] bg-[#f8fbff] p-4">
                <h3 className="text-sm font-semibold text-[#0b0f14]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#64748b]">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="quy-trinh"
          className="scroll-mt-28 mt-11 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Quy trình học 4 bước</h2>
          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            {workflowSteps.map((item) => (
              <div key={item.step} className="rounded-2xl border border-[#dde5f1] bg-[#f8fbff] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3b82f6]">
                  Bước {item.step}
                </p>
                <h3 className="mt-2 text-base font-semibold text-[#0b0f14]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#64748b]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="scroll-mt-28 mt-11 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-semibold tracking-tight">Câu hỏi thường gặp</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-[#0b0f14]">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-[#64748b]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          id="cta"
          className="scroll-mt-28 mt-11 rounded-3xl border border-[#0b0f14] bg-[#0b0f14] px-6 py-8 text-white shadow-[0_24px_70px_rgba(11,15,20,0.35)] lg:px-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Sẵn sàng bắt đầu hành trình học từ vựng?
              </h2>
              <p className="mt-2 text-sm text-[#cbd5e1]">
                Tạo tài khoản trong vài giây và bắt đầu phiên học đầu tiên ngay hôm nay.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0b0f14] transition hover:bg-[#e2e8f0]"
              >
                Tạo tài khoản
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
