"use client";

import Link from "next/link";
import BookingFlow from "@/components/BookingFlow";
import { useI18n } from "@/lib/i18n";

export default function BookingPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen pb-20 pt-16">
      <div className="mb-10 px-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-center mb-6">
          Booking
        </h1>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-sm text-zinc-300 space-y-4 mb-8">
          <p>
            <strong>For små grupper (2-8 personer):</strong> Bruk bookingmodulen her til å velge dato, tidspunkt og opplevelse.
          </p>
          <p>
            <strong>For større grupper (over 8 personer):</strong> Utforsk våre pakker og reserver via kontaktskjemaet.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/arrangementer" className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-white px-5 text-xs font-medium transition-colors">
              Se arrangementer
            </Link>
            <Link href="/kontakt" className="inline-flex h-9 items-center justify-center rounded-full bg-[#9C39FF] hover:bg-[#8b32e6] text-white px-5 text-xs font-medium transition-colors">
              Gå til kontaktskjema
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 max-w-lg mx-auto">
        <BookingFlow />
      </div>
    </main>
  );
}
