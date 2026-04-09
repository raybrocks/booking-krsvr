"use client";

import BookingFlow from "@/components/BookingFlow";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative pt-16 pb-20 px-6 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/20 via-black to-black"></div>
        <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-6">
          {t("hero.title1")}<span className="font-medium">{t("hero.title2")}</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light">
          {t("hero.subtitle")}
        </p>
      </div>

      {/* Booking Flow */}
      <div className="px-4 md:px-6 max-w-lg mx-auto">
        <BookingFlow />
      </div>
    </main>
  );
}
