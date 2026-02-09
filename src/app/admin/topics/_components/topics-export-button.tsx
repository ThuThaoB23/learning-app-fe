"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { getAuthHeader } from "@/lib/client-auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function TopicsExportButton() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      params.delete("size");
      params.delete("sort");

      const response = await fetch(
        `${API_BASE_URL}/admin/topics/export?${params.toString()}`,
        {
          headers: {
            Authorization: authHeader,
          },
        },
      );

      if (!response.ok) {
        return;
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      const fileNameMatch = contentDisposition?.match(/filename="([^"]+)"/i);
      const fileName = fileNameMatch?.[1] ?? "topics.csv";

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isLoading}
      className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Đang xuất..." : "Xuất CSV"}
    </button>
  );
}
