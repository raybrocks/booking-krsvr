"use client";

import BookingFlow from "@/components/BookingFlow";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative pt-16 pb-10 px-6 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/20 via-black to-black"></div>
        <h1 className="text-5xl md:text-6xl font-light tracking-tighter">
          {t("hero.title1")}
        </h1>
      </div>

      {/* Booking Flow */}
      <div className="px-4 md:px-6 max-w-lg mx-auto">
        <BookingFlow />
      </div>

      <div className="mt-12 text-center pb-8">
        <a href="https://www.krsvr.no" className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm underline underline-offset-4">
          {t("footer.cancel")}
        </a>
      </div>
    </main>
  );
}
