"use client";

import BookingFlow from "@/components/BookingFlow";
import { useI18n } from "@/lib/i18n";

export default function BookingPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen pb-20 pt-16">
      <div className="mb-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter">
          Booking
        </h1>
        <p className="mt-3 text-zinc-400 max-w-lg mx-auto">
          Velg dato, tidspunkt og den opplevelsen som passer dere best.
        </p>
      </div>

      <div className="px-4 md:px-6 max-w-lg mx-auto">
        <BookingFlow />
      </div>
    </main>
  );
}
