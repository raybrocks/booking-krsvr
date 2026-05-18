"use client";

import Link from "next/link";
import BookingFlow from "@/components/BookingFlow";

export default function BookingPage() {

  return (
    <main className="min-h-screen pb-20 pt-16">
      <div className="mb-10 px-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-center mb-6">
          Booking
        </h1>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-sm text-zinc-300 text-center space-y-4 mb-8">
          <p>
            <strong>For små grupper (2-8 personer):</strong> <br />Bruk bookingmodulen under.
          </p>
          <p>
            <strong>For større grupper (8-64 personer):</strong> <br />Utforsk våre arrangementssider og reserver via kontaktskjema.
          </p>
        </div>
      </div>

      <div className="px-4 md:px-6 max-w-lg mx-auto">
        <BookingFlow />
      </div>
    </main>
  );
}
