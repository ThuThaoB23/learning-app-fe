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
  identifier: "",
  email: "",
  password: "",
  confirmPassword: "",
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isRegister = mode === "register";
  const heading = isRegister ? "Tạo tài khoản mới" : "Đăng nhập tài khoản";
  const subheading = isRegister
    ? "Thiết lập nhanh tài khoản để bắt đầu học theo lộ trình cá nhân."
    : "Tiếp tục hành trình học từ vựng của bạn.";
  const helperTitle = isRegister ? "Đăng ký" : "Đăng nhập";
  const helperAction = isRegister ? "Tạo tài khoản" : "Đăng nhập";
  const helperLoading = isRegister ? "Đang tạo tài khoản..." : "Đang đăng nhập...";
  const helperSwitchTo = isRegister ? "Đăng nhập" : "Đăng ký";
  const helperSwitchHint = isRegister
    ? "Đã có tài khoản?"
    : "Chưa có tài khoản?";
  const identifierLabel = isRegister ? "Email" : "Email hoặc username";
  const identifierName = isRegister ? "email" : "identifier";
  const identifierType = isRegister ? "email" : "text";
  const identifierValue = isRegister ? form.email : form.identifier;
  const identifierAutocomplete = isRegister ? "email" : "username";
  const identifierPlaceholder = isRegister
    ? "user@example.com"
    : "Nhập email hoặc username";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const email = form.email.trim().toLowerCase();
    const displayName = form.displayName.trim();
    const identifier = form.identifier.trim();
    const password = form.password;

    if (isRegister) {
      if (displayName.length < 2) {
        setStatus({
          type: "error",
          message: "Tên hiển thị cần tối thiểu 2 ký tự.",
        });
        setIsLoading(false);
        return;
      }

      if (password !== form.confirmPassword) {
        setStatus({
          type: "error",
          message: "Mật khẩu xác nhận không khớp.",
        });
        setIsLoading(false);
        return;
      }
    }

    const endpoint = isRegister ? "/auth/register" : "/auth/login";
    const payload = isRegister
      ? {
          email,
          password,
          displayName,
        }
      : {
          identifier,
          password,
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
          message: "Tạo tài khoản thành công. Bạn có thể đăng nhập ngay bây giờ.",
        });
        setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
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
    } catch {
      setStatus({
        type: "error",
        message: "Không thể kết nối máy chủ. Vui lòng kiểm tra lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] rounded-3xl border border-white/80 bg-white/95 p-5 text-[#0b0f14] shadow-[0_28px_70px_rgba(17,24,39,0.16)] backdrop-blur sm:p-8">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#3b82f6]">{helperTitle}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
      </div>

      <p className="mt-2 text-sm text-[#64748b]">{subheading}</p>

      <div className="mt-5 inline-flex w-full rounded-xl bg-[#0b0f14]/5 p-1 text-sm">
        <Link
          href="/login"
          className={`flex-1 rounded-lg px-3 py-2 text-center font-medium transition-all duration-200 ease-out ${
            mode === "login"
              ? "bg-[#0b0f14] text-white"
              : "text-[#64748b] hover:text-[#0b0f14]"
          }`}
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className={`flex-1 rounded-lg px-3 py-2 text-center font-medium transition-all duration-200 ease-out ${
            mode === "register"
              ? "bg-[#0b0f14] text-white"
              : "text-[#64748b] hover:text-[#0b0f14]"
          }`}
        >
          Đăng ký
        </Link>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        {isRegister ? (
          <label className="block space-y-2 text-sm font-medium">
            Tên hiển thị
            <input
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              required
              autoComplete="name"
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:border-[#0b0f14] focus:outline-none focus:ring-2 focus:ring-[#0b0f14]/15"
              placeholder="Ví dụ: Minh Anh"
            />
          </label>
        ) : null}

        <label className="block space-y-2 text-sm font-medium">
          {identifierLabel}
          <input
            name={identifierName}
            type={identifierType}
            value={identifierValue}
            onChange={handleChange}
            required
            autoComplete={identifierAutocomplete}
            className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:border-[#0b0f14] focus:outline-none focus:ring-2 focus:ring-[#0b0f14]/15"
            placeholder={identifierPlaceholder}
          />
          {!isRegister ? (
            <p className="text-xs font-normal text-[#64748b]">
              Dùng email hoặc username bạn đã đăng ký.
            </p>
          ) : null}
        </label>

        <label className="block space-y-2 text-sm font-medium">
          Mật khẩu
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={6}
              className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 pr-20 text-sm focus:border-[#0b0f14] focus:outline-none focus:ring-2 focus:ring-[#0b0f14]/15"
              placeholder="Nhập tối thiểu 6 ký tự"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#475569] transition hover:bg-[#f1f5f9] hover:text-[#0b0f14]"
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </label>

        {isRegister ? (
          <label className="block space-y-2 text-sm font-medium">
            Xác nhận mật khẩu
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                minLength={6}
                className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 pr-20 text-sm focus:border-[#0b0f14] focus:outline-none focus:ring-2 focus:ring-[#0b0f14]/15"
                placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#475569] transition hover:bg-[#f1f5f9] hover:text-[#0b0f14]"
              >
                {showConfirmPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </label>
        ) : null}

        {status ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-[#34d399]/25 bg-[#34d399]/10 text-[#065f46]"
                : status.type === "error"
                  ? "border-[#fb7185]/25 bg-[#fb7185]/10 text-[#be123c]"
                  : "border-[#fbbf24]/25 bg-[#fbbf24]/10 text-[#92400e]"
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
          {isLoading ? helperLoading : helperAction}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-[#64748b]">
        {helperSwitchHint}{" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-semibold text-[#0b0f14]"
        >
          {helperSwitchTo}
        </Link>
      </div>

      {!isRegister ? (
        <p className="mt-3 text-center text-xs text-[#94a3b8]">
          Quên mật khẩu? Liên hệ quản trị viên để được hỗ trợ.
        </p>
      ) : null}
    </div>
  );
}

