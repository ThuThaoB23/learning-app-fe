"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LogoutButton from "@/components/logout-button";

type UserMenuProps = {
  variant?: "admin" | "user";
  displayName?: string | null;
};

export default function UserMenu({
  variant = "user",
  displayName,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isAdmin = variant === "admin";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const triggerClasses = isAdmin
    ? "h-10 w-10 rounded-full bg-white/10 text-[#e7edf3] transition hover:bg-white/20"
    : "h-10 w-10 rounded-full bg-black/10 text-[#0b0f14] transition hover:bg-black/20";

  const menuClasses = isAdmin
    ? "mt-3 w-56 rounded-2xl border border-white/10 bg-[#0f172a] shadow-[0_20px_60px_rgba(6,10,18,0.5)]"
    : "mt-3 w-56 rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]";

  const itemClasses = isAdmin
    ? "flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#e7edf3] transition hover:bg-white/10"
    : "flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#0b0f14] transition hover:bg-black/5";

  const mutedText = isAdmin ? "text-[#64748b]" : "text-[#64748b]";
  const name = displayName?.trim() || "Người dùng";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={triggerClasses}
      >
        <span className="sr-only">Mở menu người dùng</span>
        <div className="grid h-full w-full place-items-center text-xs font-semibold">
          LA
        </div>
      </button>

      {open ? (
        <div className={`absolute right-0 ${menuClasses}`}>
          <div className="px-3 pb-2 pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              Tài khoản
            </p>
            <p className={`mt-1 text-sm font-medium ${mutedText}`}>{name}</p>
          </div>
          <div className="px-2 pb-2">
            <Link href="/dashboard/settings" className={itemClasses}>
              Cài đặt tài khoản
            </Link>
            <LogoutButton className={itemClasses} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
