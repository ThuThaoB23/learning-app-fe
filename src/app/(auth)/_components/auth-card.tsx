"use client";

import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "register";

type Status = {
  type: "success" | "error" | "info";
  message: string;
} | null;

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const initialForm = {
  email: "",
  password: "",
  displayName: "",
};

type AuthCardProps = {
  mode: Mode;
};

export default function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<Status>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === "register";
  const heading = isRegister ? "Tạo tài khoản mới" : "Chào mừng quay lại";
  const subheading = isRegister
    ? "Bắt đầu hành trình học từ vựng với mục tiêu rõ ràng."
    : "Đăng nhập để tiếp tục lộ trình học và theo dõi tiến độ.";
  const helperTitle = isRegister ? "Đăng ký" : "Đăng nhập";
  const helperAction = isRegister ? "Tạo tài khoản" : "Đăng nhập";
  const helperSwitchTo = isRegister ? "Đăng nhập" : "Đăng ký";
  const helperSwitchHint = isRegister
    ? "Đã có tài khoản?"
    : "Chưa có tài khoản?";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const endpoint = isRegister ? "/auth/register" : "/auth/login";
    const payload = isRegister
      ? {
          email: form.email.trim(),
          password: form.password,
          displayName: form.displayName.trim(),
        }
      : {
          email: form.email.trim(),
          password: form.password,
        };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.message ??
          data?.error ??
          "Có lỗi xảy ra. Vui lòng thử lại.";
        setStatus({ type: "error", message });
        return;
      }

      if (isRegister) {
        setStatus({
          type: "success",
          message: "Tạo tài khoản thành công. Hãy đăng nhập để bắt đầu.",
        });
        setForm((prev) => ({ ...prev, password: "" }));
      } else {
        const token = data?.accessToken;
        const tokenType = data?.tokenType ?? "Bearer";
        const role = data?.user?.role ?? "USER";
        if (token) {
          localStorage.setItem("accessToken", token);
          localStorage.setItem("tokenType", tokenType);
          document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; samesite=lax`;
          document.cookie = `tokenType=${encodeURIComponent(tokenType)}; path=/; samesite=lax`;
        }
        setStatus({
          type: "success",
          message: "Đăng nhập thành công. Bạn có thể bắt đầu học ngay.",
        });
        setForm((prev) => ({ ...prev, password: "" }));
        if (role === "ADMIN") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Không thể kết nối máy chủ. Vui lòng kiểm tra lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-8 text-[#0b0f14] shadow-[0_24px_60px_rgba(17,24,39,0.16)] backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#3b82f6]">
            {helperTitle}
          </p>
          <h1 className="text-2xl font-semibold">{heading}</h1>
        </div>
        <div className="flex rounded-full bg-[#0b0f14]/5 p-1 text-sm">
          <Link
            href="/login"
            className={`rounded-full px-4 py-2 font-medium transition-all duration-200 ease-out ${
              mode === "login"
                ? "bg-[#0b0f14] text-white"
                : "text-[#64748b] hover:text-[#0b0f14]"
            }`}
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className={`rounded-full px-4 py-2 font-medium transition-all duration-200 ease-out ${
              mode === "register"
                ? "bg-[#0b0f14] text-white"
                : "text-[#64748b] hover:text-[#0b0f14]"
            }`}
          >
            Đăng ký
          </Link>
        </div>
      </div>

      <p className="mt-4 text-sm text-[#64748b]">{subheading}</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {isRegister ? (
          <label className="block space-y-2 text-sm font-medium">
            Tên hiển thị
            <input
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:border-[#0b0f14] focus:outline-none focus:ring-2 focus:ring-[#0b0f14]/20"
              placeholder="Ví dụ: Minh Anh"
            />
          </label>
        ) : null}

        <label className="block space-y-2 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:border-[#0b0f14] focus:outline-none focus:ring-2 focus:ring-[#0b0f14]/20"
            placeholder="user@example.com"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium">
          Mật khẩu
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={6}
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:border-[#0b0f14] focus:outline-none focus:ring-2 focus:ring-[#0b0f14]/20"
            placeholder="Nhập tối thiểu 6 ký tự"
          />
        </label>

        <div className="flex items-center justify-between text-sm text-[#64748b]">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#e5e7eb] text-[#0b0f14] focus:ring-[#0b0f14]"
            />
            Ghi nhớ đăng nhập
          </label>
          <button type="button" className="font-medium text-[#0b0f14]">
            Quên mật khẩu?
          </button>
        </div>

        {status ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              status.type === "success"
                ? "bg-[#34d399]/15 text-[#065f46]"
                : status.type === "error"
                  ? "bg-[#fb7185]/15 text-[#be123c]"
                  : "bg-[#fbbf24]/15 text-[#92400e]"
            }`}
            aria-live="polite"
          >
            {status.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-[#0b0f14] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Đang xử lý..." : helperAction}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#64748b]">
        {helperSwitchHint}{" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-semibold text-[#0b0f14]"
        >
          {helperSwitchTo}
        </Link>
      </div>
    </div>
  );
}

