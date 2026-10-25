import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | KRS VR Arena Kristiansand",
  description:
    "Read the booking terms and conditions for KRS VR Arena in Kristiansand, including 48-hour free cancellation, arrival guidelines, and payment terms.",
  alternates: {
    canonical: "https://www.krsvr.no/en/terms",
    languages: {
      "nb-NO": "https://www.krsvr.no/vilkar",
      en: "https://www.krsvr.no/en/terms",
      "x-default": "https://www.krsvr.no/en/terms",
    },
  },
};

export default function EnglishTermsPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/en"
          className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-light text-white mb-10 tracking-tight">
          Terms & Conditions
        </h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-300">
          <section>
            <h2 className="text-2xl font-medium text-white mb-3">
              1. General Information
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              These terms and conditions apply to bookings of VR experiences and events at KRS VR Arena (Industrigata 12, 4632 Kristiansand, Norway, Org. no. 936 318 878).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">
              2. Booking, Pricing & Payment
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              All prices for private groups on our website are stated in Norwegian Kroner (NOK) including VAT. Approximate EUR amounts are displayed as a convenience guide for international visitors; the official transaction currency is NOK. You may pay upon arrival in the arena using our card terminal (Visa, Mastercard, Apple Pay, or cash) or online via Vipps (for Norwegian users).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">
              3. Cancellation & Changes (48-Hour Rule)
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Bookings for standard groups (2–10 players) can be rescheduled or cancelled free of charge up to 48 hours before the scheduled start time via the &quot;Manage Booking&quot; link in your confirmation email or by contacting us at post@krsvr.no. Cancellations made less than 48 hours before the scheduled session may be invoiced or non-refundable. You can adjust the number of participants within the game&apos;s capacity and update player names up until arrival.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">
              4. Arrival & Punctuality
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Please arrive on time so you do not lose any game time. Registration and safety briefing begin at your booked time. If a group arrives late, the active playing time may have to be shortened so subsequent bookings are not delayed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">
              5. Safety, Equipment & Alcohol Policy
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              All participants must follow the safety instructions given by the gamemaster. Visibly intoxicated individuals will not be permitted to use the VR equipment for safety reasons. Outside food and alcohol are not permitted at team building events, corporate gatherings, adult birthdays (18+), or bachelor/bachelorette parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-white mb-3">
              6. Contact Information
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              KRS VR Arena · Industrigata 12, 4632 Kristiansand, Norway · Email: post@krsvr.no · Phone: +47 40 82 83 02.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
