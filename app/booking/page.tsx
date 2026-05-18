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
      </div>

      <div className="px-4 md:px-6 max-w-lg mx-auto">
        <BookingFlow />
      </div>
    </main>
  );
}
