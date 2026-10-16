"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <nav 
      aria-label="Arrangementer undermeny"
      className={`flex items-center justify-center gap-3 sm:gap-6 w-full max-w-4xl mx-auto px-4 mb-8 sm:mb-12 overflow-x-auto hide-scrollbar ${className}`}
    >
      {NAV_ITEMS.map((item, idx) => {
        const isActive = pathname === item.href;
        return (
          <React.Fragment key={item.href}>
            <Link
              href={item.href}
              className={`relative py-1.5 text-xs sm:text-sm md:text-base tracking-wide whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? "text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-200 font-normal"
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#9C39FF] rounded-full shadow-[0_0_8px_rgba(156,57,255,0.7)]" />
              )}
            </Link>
            {idx < NAV_ITEMS.length - 1 && (
              <span className="text-zinc-800 text-xs sm:text-sm select-none" aria-hidden="true">
                |
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
