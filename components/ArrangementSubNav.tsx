"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArrangementSubNavProps {
  className?: string;
}

const NAV_ITEMS = [
  { href: "/arrangementer", label: "Oversikt" },
  { href: "/arrangementer/vr-bursdag", label: "VR Bursdag" },
  { href: "/arrangementer/vr-utdrikningslag", label: "VR Utdrikningslag" },
  { href: "/arrangementer/vr-teambuilding", label: "VR Teambuilding" },
  { href: "/arrangementer/vr-on-site", label: "VR On-site" },
];

export default function ArrangementSubNav({ className = "" }: ArrangementSubNavProps) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    const activeEl = itemRefs.current[pathname];
    if (el && activeEl) {
      const targetLeft =
        activeEl.offsetLeft - el.clientWidth / 2 + activeEl.offsetWidth / 2;
      el.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    }
    const timer = setTimeout(updateScrollButtons, 150);
    return () => clearTimeout(timer);
  }, [pathname, updateScrollButtons]);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [updateScrollButtons]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const offset = direction === "left" ? -180 : 180;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto mb-5 md:mb-8 ${className}`}>
      {/* Venstre fade + pil ved horisontal scroll */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pointer-events-none pr-6 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            aria-label="Rull meny til venstre"
            className="pointer-events-auto w-7 h-7 rounded-full bg-zinc-900/95 border border-white/15 text-zinc-200 hover:text-white hover:border-[#9C39FF] flex items-center justify-center shadow-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Horisontal scrollbar med tydelige kapsler (pills) */}
      <nav
        ref={scrollRef}
        onScroll={updateScrollButtons}
        aria-label="Arrangementer undermeny"
        className="flex items-center md:justify-center gap-2 sm:gap-2.5 overflow-x-auto hide-scrollbar py-1 px-1 scroll-smooth"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(node) => {
                itemRefs.current[item.href] = node;
              }}
              className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm tracking-wide whitespace-nowrap border transition-all cursor-pointer ${
                isActive
                  ? "bg-[#9C39FF] text-white font-semibold border-[#9C39FF] shadow-[0_0_15px_rgba(156,57,255,0.4)]"
                  : "bg-zinc-900/70 text-zinc-300 hover:text-white border-white/10 hover:border-white/25 hover:bg-zinc-800/80 font-normal"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Høyre fade + pil ved horisontal scroll */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end pointer-events-none pl-6 bg-gradient-to-l from-[#050505] via-[#050505]/90 to-transparent">
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            aria-label="Rull meny til høyre"
            className="pointer-events-auto w-7 h-7 rounded-full bg-zinc-900/95 border border-white/15 text-zinc-200 hover:text-white hover:border-[#9C39FF] flex items-center justify-center shadow-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
