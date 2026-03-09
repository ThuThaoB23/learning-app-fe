"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionHistoryIds } from "@/lib/session-history";
import { fetchSessionDetailClient } from "@/lib/user-actions-client";

type SessionView = {
  id: string;
  status?: string | null;
  type?: string | null;
  startedAt?: string | null;
  itemsCount: number;
};

const toSessionView = (data: Record<string, unknown>): SessionView => ({
  id: String(data.id ?? ""),
  status: typeof data.status === "string" ? data.status : null,
  type: typeof data.type === "string" ? data.type : null,
  startedAt: typeof data.startedAt === "string" ? data.startedAt : null,
  itemsCount: Array.isArray(data.items) ? data.items.length : 0,
});

const toStatusLabel = (value?: string | null) => {
  const normalized = (value || "ACTIVE").toUpperCase();
  if (normalized === "COMPLETED") {
    return "Đã nộp";
  }
  if (normalized === "ABANDONED") {
    return "Đã hủy";
  }
  return "Đang làm";
};

const toSessionTypeLabel = (value?: string | null) => {
  const normalized = (value || "DAILY").toUpperCase();
  if (normalized === "SET_PRACTICE") {
    return "Tự chọn";
  }
  if (normalized === "CUSTOM") {
    return "Theo chủ đề";
  }
  if (normalized === "REVIEW") {
    return "Ôn tập";
  }
  if (normalized === "NEW_WORDS") {
    return "Từ mới";
  }
  return "Daily";
};

export default function RecentSessionsList() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionView[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const ids = getSessionHistoryIds().slice(0, 10);
      if (ids.length === 0) {
        if (mounted) {
          setSessions([]);
          setLoading(false);
        }
        return;
      }

      const results = await Promise.all(
        ids.map((id) => fetchSessionDetailClient<Record<string, unknown>>(id)),
      );
      const mapped = results
        .filter((item): item is { ok: true; data: Record<string, unknown> } => item.ok)
        .map((item) => toSessionView(item.data))
        .filter((item) => item.id);

      if (mounted) {
        setSessions(mapped);
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <h3 className="text-lg font-semibold">Phiên gần đây</h3>

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="text-sm text-[#64748b]">Đang tải phiên...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-[#64748b]">Chưa có phiên nào.</p>
        ) : (
          sessions.map((session) => (
            <Link
              key={session.id}
              href={`/dashboard/practice/${session.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 transition hover:border-[#0b0f14]"
            >
              <div>
                <p className="text-sm font-semibold text-[#0b0f14]">
                  {toSessionTypeLabel(session.type)} • {toStatusLabel(session.status)}
                </p>
                <p className="text-xs text-[#64748b]">
                  {session.startedAt
                    ? new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(session.startedAt))
                    : "Chưa bắt đầu"}
                </p>
              </div>
              <div className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-xs text-[#475569]">
                {session.itemsCount} câu
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
