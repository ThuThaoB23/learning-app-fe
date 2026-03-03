import type { ReactNode } from "react";

export type VocabPageStatus = {
  type: "success" | "error";
  message: string;
} | null;

export const vocabPageSurfaceClassName =
  "rounded-3xl border border-white/10 bg-[#0f172a]/85 shadow-[0_30px_80px_rgba(6,10,18,0.42)] backdrop-blur";

export const vocabPageCardClassName =
  "rounded-2xl border border-white/10 bg-[#0b0f14]/60";

export const vocabPageMutedCardClassName =
  "rounded-2xl border border-white/10 bg-[#020617]/45";

const vocabPageStatusLabels: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const vocabPageStatusStyles: Record<string, string> = {
  PENDING: "border-[#fbbf24]/35 bg-[#fbbf24]/12 text-[#fde68a]",
  APPROVED: "border-[#34d399]/35 bg-[#34d399]/12 text-[#86efac]",
  REJECTED: "border-[#fb7185]/35 bg-[#fb7185]/12 text-[#fda4af]",
};

export const formatVocabDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const getVocabStatusMeta = (status?: string | null) => {
  const key = status ?? "PENDING";
  return {
    label: vocabPageStatusLabels[key] ?? key,
    className:
      vocabPageStatusStyles[key] ?? "border-white/10 bg-white/5 text-[#e7edf3]",
  };
};

export function VocabPageBadge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
        tone === "accent"
          ? "border-[#67e8f9]/20 bg-[#67e8f9]/10 text-[#a5f3fc]"
          : "border-white/10 bg-white/5 text-[#cbd5e1]"
      }`}
    >
      {children}
    </span>
  );
}

export function VocabPageStatusBanner({
  status,
}: {
  status: VocabPageStatus;
}) {
  if (!status) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl px-4 py-3 text-sm ${
        status.type === "success"
          ? "border border-[#34d399]/25 bg-[#34d399]/12 text-[#86efac]"
          : "border border-[#fb7185]/25 bg-[#fb7185]/12 text-[#fda4af]"
      }`}
    >
      {status.message}
    </div>
  );
}

export function VocabPageStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={`${vocabPageCardClassName} px-4 py-4 ${
        tone === "accent" ? "border-[#67e8f9]/20 bg-[#67e8f9]/10" : ""
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
        {label}
      </p>
      <p
        className={`mt-2 text-lg font-semibold ${
          tone === "accent" ? "text-[#cffafe]" : "text-[#e7edf3]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function VocabPageField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
        {label}
      </p>
      <div className={`${vocabPageCardClassName} px-4 py-3 text-sm text-[#d6deeb]`}>
        {value}
      </div>
    </div>
  );
}

export function VocabPageSection({
  eyebrow,
  title,
  description,
  actions,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${vocabPageCardClassName} p-5 ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[#f8fafc]">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm text-[#94a3b8]">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function VocabPageEmpty({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-[#020617]/40 px-4 py-5 text-sm text-[#64748b]">
      {message}
    </div>
  );
}
