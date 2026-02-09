"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/admin-users";
import { getAuthHeader } from "@/lib/client-auth";
import LoadingOverlay from "@/components/loading-overlay";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type UserActionsProps = {
  user: AdminUser;
};

type MenuPos = {
  top: number;
  right: number;
};

type Status = {
  type: "success" | "error";
  message: string;
} | null;

const statusOptions = [
  "ACTIVE",
  "INACTIVE",
  "BANNED",
  "PENDING_VERIFICATION",
] as const;

const roleOptions = ["ADMIN", "USER"] as const;

const statusLabels: Record<(typeof statusOptions)[number], string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
  BANNED: "Bị khóa",
  PENDING_VERIFICATION: "Chờ xác minh",
};

const roleLabels: Record<(typeof roleOptions)[number], string> = {
  ADMIN: "Quản trị",
  USER: "Người dùng",
};

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    email: user.email ?? "",
    username: user.username ?? "",
    displayName: user.displayName ?? "",
    role: user.role ?? "USER",
    status: user.status ?? "ACTIVE",
    locale: user.locale ?? "",
    timeZone: user.timeZone ?? "",
    dailyGoal: user.dailyGoal?.toString() ?? "",
  });
  const [newPassword, setNewPassword] = useState("");

  const isInactive = user.status === "INACTIVE";
  const confirmLabel = isInactive ? "Khôi phục user" : "Xóa user";
  const normalizedRole = roleOptions.includes(editForm.role as "ADMIN" | "USER")
    ? editForm.role
    : "USER";
  const normalizedStatus = statusOptions.includes(
    editForm.status as (typeof statusOptions)[number],
  )
    ? editForm.status
    : "ACTIVE";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEditForm({
      email: user.email ?? "",
      username: user.username ?? "",
      displayName: user.displayName ?? "",
      role: user.role ?? "USER",
      status: user.status ?? "ACTIVE",
      locale: user.locale ?? "",
      timeZone: user.timeZone ?? "",
      dailyGoal: user.dailyGoal?.toString() ?? "",
    });
  }, [user]);

  useEffect(() => {
    if (!menuPos) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedButton =
        buttonRef.current && buttonRef.current.contains(target);
      const clickedMenu = menuRef.current && menuRef.current.contains(target);
      if (!clickedButton && !clickedMenu) {
        setMenuPos(null);
      }
    };

    const handleScroll = () => setMenuPos(null);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [menuPos]);

  const openMenu = () => {
    if (!buttonRef.current) {
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  };

  const closeAllModals = () => {
    setShowEdit(false);
    setShowReset(false);
    setShowConfirm(false);
    setStatus(null);
  };

  const requireAuth = () => {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      setStatus({
        type: "error",
        message: "Bạn chưa đăng nhập hoặc phiên đã hết hạn.",
      });
      return null;
    }
    return authHeader;
  };

  const handleUpdateUser = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);
    const authHeader = requireAuth();
    if (!authHeader) {
      setIsLoading(false);
      return;
    }

    const body = {
      email: editForm.email.trim() || null,
      username: editForm.username.trim() || null,
      displayName: editForm.displayName.trim() || null,
      role: normalizedRole,
      status: normalizedStatus,
      locale: editForm.locale.trim() || null,
      timeZone: editForm.timeZone.trim() || null,
      dailyGoal: editForm.dailyGoal
        ? Number(editForm.dailyGoal)
        : null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus({
          type: "error",
          message:
            data?.message ?? data?.error ?? "Không thể cập nhật tài khoản.",
        });
        return;
      }

      setStatus({ type: "success", message: "Cập nhật thành công." });
      router.refresh();
      setTimeout(closeAllModals, 500);
    } catch {
      setStatus({
        type: "error",
        message: "Không thể kết nối máy chủ. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);
    const authHeader = requireAuth();
    if (!authHeader) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${user.id}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({ newPassword }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setStatus({
          type: "error",
          message:
            data?.message ?? data?.error ?? "Không thể reset mật khẩu.",
        });
        return;
      }

      setStatus({ type: "success", message: "Reset mật khẩu thành công." });
      setNewPassword("");
      router.refresh();
      setTimeout(closeAllModals, 500);
    } catch {
      setStatus({
        type: "error",
        message: "Không thể kết nối máy chủ. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrRestore = async () => {
    setIsLoading(true);
    setStatus(null);
    const authHeader = requireAuth();
    if (!authHeader) {
      setIsLoading(false);
      return;
    }

    const endpoint = isInactive
      ? `${API_BASE_URL}/admin/users/${user.id}/restore`
      : `${API_BASE_URL}/admin/users/${user.id}`;
    const method = isInactive ? "POST" : "DELETE";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setStatus({
          type: "error",
          message:
            data?.message ?? data?.error ?? "Không thể thực hiện thao tác.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: isInactive ? "Đã khôi phục user." : "Đã xóa user.",
      });
      router.refresh();
      setTimeout(closeAllModals, 500);
    } catch {
      setStatus({
        type: "error",
        message: "Không thể kết nối máy chủ. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatus = status ? (
    <div
      className={`rounded-2xl px-4 py-3 text-sm ${
        status.type === "success"
          ? "bg-[#34d399]/15 text-[#34d399]"
          : "bg-[#fb7185]/15 text-[#fb7185]"
      }`}
    >
      {status.message}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (menuPos ? setMenuPos(null) : openMenu())}
        className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
      >
        ...
      </button>

      {mounted && menuPos
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[120] w-48 rounded-2xl border border-white/10 bg-[#0f172a] p-2 shadow-[0_20px_60px_rgba(6,10,18,0.6)]"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuPos(null);
                  setStatus(null);
                  setShowEdit(true);
                }}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#e7edf3] transition hover:bg-white/10"
              >
                Sửa thông tin
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuPos(null);
                  setStatus(null);
                  setNewPassword("");
                  setShowReset(true);
                }}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#e7edf3] transition hover:bg-white/10"
              >
                Reset mật khẩu
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuPos(null);
                  setStatus(null);
                  setShowConfirm(true);
                }}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#fb7185] transition hover:bg-white/10"
              >
                {confirmLabel}
              </button>
            </div>,
            document.body,
          )
        : null}

      {mounted && showEdit
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={closeAllModals}
              />
              <div className="relative z-[131] w-full max-w-xl rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                      Admin
                    </p>
                    <h2 className="text-xl font-semibold text-[#e7edf3]">
                      Cập nhật user
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleUpdateUser}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Tên hiển thị
                      <input
                        name="displayName"
                        value={editForm.displayName}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            displayName: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Email
                      <input
                        name="email"
                        type="email"
                        value={editForm.email}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Username
                      <input
                        name="username"
                        value={editForm.username}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            username: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Ảnh đại diện
                      <input
                        name="avatar"
                        type="file"
                        accept="image/*"
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#0b0f14]/40 px-4 py-3 text-sm text-[#64748b] focus:outline-none"
                      />
                      <span className="text-xs text-[#64748b]">
                        Chức năng tải ảnh sẽ được bổ sung sau.
                      </span>
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Vai trò
                      <select
                        name="role"
                        value={normalizedRole}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            role: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {roleLabels[role]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Trạng thái
                      <select
                        name="status"
                        value={normalizedStatus}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            status: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      >
                        {statusOptions.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusLabels[statusOption]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Locale
                      <input
                        name="locale"
                        value={editForm.locale}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            locale: event.target.value,
                          }))
                        }
                        placeholder="vi"
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Timezone
                      <input
                        name="timeZone"
                        value={editForm.timeZone}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            timeZone: event.target.value,
                          }))
                        }
                        placeholder="Asia/Ho_Chi_Minh"
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                      Daily goal
                      <input
                        name="dailyGoal"
                        type="number"
                        min={0}
                        value={editForm.dailyGoal}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            dailyGoal: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                      />
                    </label>
                  </div>

                  {renderStatus}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeAllModals}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="rounded-full bg-[#e7edf3] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {mounted && showReset
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={closeAllModals}
              />
              <div className="relative z-[131] w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                      Admin
                    </p>
                    <h2 className="text-xl font-semibold text-[#e7edf3]">
                      Reset mật khẩu
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
                  <label className="block space-y-2 text-sm font-medium text-[#e7edf3]">
                    Mật khẩu mới
                    <input
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-white/10 bg-[#0b0f14]/60 px-4 py-3 text-sm text-[#e7edf3] focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                    />
                  </label>

                  {renderStatus}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeAllModals}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="rounded-full bg-[#e7edf3] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading ? "Đang lưu..." : "Reset mật khẩu"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {mounted && showConfirm
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={closeAllModals}
              />
              <div className="relative z-[131] w-full max-w-md rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                      Admin
                    </p>
                    <h2 className="text-xl font-semibold text-[#e7edf3]">
                      {confirmLabel}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <p className="mt-4 text-sm text-[#94a3b8]">
                  Bạn chắc chắn muốn{" "}
                  {isInactive ? "khôi phục" : "xóa"} user{" "}
                  <span className="font-semibold text-[#e7edf3]">
                    {user.displayName || user.email}
                  </span>
                  ?
                </p>

                {renderStatus}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleDeleteOrRestore}
                    className="rounded-full bg-[#fb7185]/20 px-4 py-2 text-sm font-semibold text-[#fb7185] transition-all duration-200 ease-out hover:bg-[#fb7185]/30 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading
                      ? "Đang xử lý..."
                      : isInactive
                        ? "Khôi phục"
                        : "Xóa user"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
