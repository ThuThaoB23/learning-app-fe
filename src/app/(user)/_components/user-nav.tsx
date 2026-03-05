"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type UserNavItem = {
  label: string;
  href: string;
};

type UserNavProps = {
  items: UserNavItem[];
  mobile?: boolean;
  collapsed?: boolean;
};

const iconClassName = "h-4 w-4 shrink-0";

const getNavIcon = (href: string) => {
  switch (href) {
    case "/dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M4 4h7v7H4V4Zm9 0h7v5h-7V4Zm0 7h7v9h-7v-9Zm-9 2h7v7H4v-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/dashboard/library":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M5 5a2 2 0 0 1 2-2h10v18H7a2 2 0 0 0-2 2V5Zm0 0h12a2 2 0 0 1 2 2v12M9 7h6m-6 4h6m-6 4h4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/dashboard/vocab":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M5 3h11a2 2 0 0 1 2 2v16l-3.5-2-3.5 2-3.5-2L4 21V5a2 2 0 0 1 1-2Zm3 5h6m-6 4h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/dashboard/topics":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4l-4 4-4-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/dashboard/practice":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M12 6v6l4 2m5-2a9 9 0 1 1-2.64-6.36"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "/dashboard/settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <path
            d="M10.7 3h2.6l.5 2.1c.45.16.87.39 1.25.66l2.06-.62 1.3 2.25-1.54 1.5c.05.3.08.6.08.9s-.03.6-.08.9l1.54 1.5-1.3 2.25-2.06-.62c-.38.27-.8.5-1.25.66L13.3 21h-2.6l-.5-2.1a6.8 6.8 0 0 1-1.25-.66l-2.06.62-1.3-2.25 1.54-1.5a6 6 0 0 1-.08-.9c0-.3.03-.6.08-.9L5.59 11.8l1.3-2.25 2.06.62c.38-.27.8-.5 1.25-.66L10.7 3Zm1.3 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
};

export default function UserNav({
  items,
  mobile = false,
  collapsed = false,
}: UserNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={
        mobile
          ? "grid grid-cols-3 gap-2"
          : "space-y-1 text-sm font-medium"
      }
    >
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const base = mobile
          ? "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 text-[11px] font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f7fc]"
          : `flex h-11 items-center rounded-xl border border-transparent transition-colors duration-150 ${
              collapsed ? "justify-center px-2" : "gap-3 px-3"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7fbff]`;
        const activeClass = mobile
          ? "border-[#0f172a] bg-[#0f172a] text-white shadow-[0_8px_20px_rgba(15,23,42,0.2)]"
          : "border-[#0f2746]/20 bg-[#0f2746] text-[#f8fafc]";
        const idleClass = mobile
          ? "border-[#d6dfeb] bg-white text-[#334155] hover:border-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#0f172a]"
          : "text-[#334155] hover:border-[#d1dbea] hover:bg-[#e8eef7] hover:text-[#0f172a]";

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${base} ${active ? activeClass : idleClass}`}
          >
            {getNavIcon(item.href)}
            {mobile || !collapsed ? (
              <span className={mobile ? "text-center" : undefined}>{item.label}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
