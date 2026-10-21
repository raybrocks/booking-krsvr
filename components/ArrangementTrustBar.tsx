import React from "react";
import { Star } from "lucide-react";

interface ArrangementTrustBarProps {
  items?: string[];
  className?: string;
}

export default function ArrangementTrustBar({
  items = ["90 min totalopplevelse", "2–64 personer", "Fra 375 kr/pers"],
  className = ""
}: ArrangementTrustBarProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="inline-flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-1 sm:gap-2 px-5 py-2 sm:px-4 sm:py-1.5 rounded-2xl sm:rounded-full bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-zinc-300 shadow-md">
        <span className="inline-flex items-center gap-1.5 text-[#19EB5B] font-medium whitespace-nowrap">
          <Star className="w-3.5 h-3.5 fill-[#19EB5B] text-[#19EB5B]" />
          5,0 på Google Maps & TripAdvisor
        </span>
        {items.length > 0 && (
          <>
            <span className="hidden sm:inline text-zinc-600">&middot;</span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-zinc-300">
              {items.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span className="whitespace-nowrap">{item}</span>
                  {idx < items.length - 1 && <span className="text-zinc-600">&middot;</span>}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
