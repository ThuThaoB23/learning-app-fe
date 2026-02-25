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
};

export default function UserNav({ items, mobile = false }: UserNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={
        mobile
          ? "flex gap-2 overflow-x-auto pb-1"
          : "space-y-1 text-sm font-medium text-[#64748b]"
      }
    >
      {items.map((item) => {
        const active = pathname === item.href;
        const base = mobile
          ? "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition"
          : "flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-200 ease-out";
        const activeClass = mobile
          ? "border-[#0b0f14] bg-[#0b0f14] text-white"
          : "bg-black/5 text-[#0b0f14]";
        const idleClass = mobile
          ? "border-[#e5e7eb] bg-white text-[#64748b] hover:border-[#0b0f14] hover:text-[#0b0f14]"
          : "text-[#64748b] hover:bg-black/5 hover:text-[#0b0f14]";

        return (
          <Link key={item.href} href={item.href} className={`${base} ${active ? activeClass : idleClass}`}>
            <span>{item.label}</span>
            {mobile ? null : <span className="text-xs text-[#64748b]">→</span>}
          </Link>
        );
      })}
    </nav>
  );
}
