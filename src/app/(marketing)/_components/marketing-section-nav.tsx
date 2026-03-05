"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SectionLink = {
  href: string;
  label: string;
};

type MarketingSectionNavProps = {
  links: SectionLink[];
};

export default function MarketingSectionNav({ links }: MarketingSectionNavProps) {
  const sectionIds = useMemo(
    () =>
      links
        .map((item) => item.href.replace(/^#/, "").trim())
        .filter((id) => id.length > 0),
    [links],
  );
  const [activeId, setActiveId] = useState(() => {
    if (typeof window === "undefined") {
      return sectionIds[0] ?? "";
    }
    const hash = window.location.hash.replace(/^#/, "").trim();
    return sectionIds.includes(hash) ? hash : (sectionIds[0] ?? "");
  });
  const ratiosRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    const resolveFallbackId = () => {
      let fallback = sectionIds[0];
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) {
          continue;
        }
        if (element.getBoundingClientRect().top <= 140) {
          fallback = id;
        }
      }
      return fallback;
    };

    const ratios = ratiosRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        const visibleIds = sectionIds.filter((id) => (ratios.get(id) ?? 0) > 0);

        if (visibleIds.length > 0) {
          const nextId = visibleIds.reduce((bestId, currentId) => {
            const bestRatio = ratios.get(bestId) ?? 0;
            const currentRatio = ratios.get(currentId) ?? 0;
            return currentRatio > bestRatio ? currentId : bestId;
          }, visibleIds[0]);
          setActiveId(nextId);
          return;
        }

        setActiveId(resolveFallbackId());
      },
      {
        root: null,
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      ratios.clear();
    };
  }, [sectionIds]);

  return (
    <>
      <nav className="mt-2 hidden items-center gap-1 xl:flex">
        {links.map((item) => {
          const itemId = item.href.replace(/^#/, "").trim();
          const isActive = itemId === activeId;
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive ? "true" : undefined}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-[#0b0f14] text-white"
                  : "text-[#475569] hover:bg-[#eef2f7] hover:text-[#0b0f14]"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <details className="mt-2 rounded-xl border border-[#d5dde8] bg-[#f8fafc] xl:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-semibold text-[#334155] [&::-webkit-details-marker]:hidden">
          Mục lục trang
          <span aria-hidden>+</span>
        </summary>
        <div className="grid grid-cols-2 gap-2 px-2 pb-2">
          {links.map((item) => {
            const itemId = item.href.replace(/^#/, "").trim();
            const isActive = itemId === activeId;
            return (
              <a
                key={`mobile-${item.href}`}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={`rounded-lg border px-2.5 py-1.5 text-center text-[11px] font-semibold transition ${
                  isActive
                    ? "border-[#0b0f14] bg-[#0b0f14] text-white"
                    : "border-[#d5dde8] bg-white text-[#334155] hover:border-[#0b0f14] hover:text-[#0b0f14]"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </details>
    </>
  );
}
