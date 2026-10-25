import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { CheckCircle2, Clock, Info, CreditCard } from "lucide-react";
import { toApproxEur } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Prices & Packages for VR Experiences in Kristiansand",
  description:
    "View our prices in NOK and approximate EUR for VR Escape Rooms, Action Strategy, and Family VR packages at KRS VR Arena in Kristiansand. Includes a 90-minute visit, dedicated gamemaster, group photos, and 30 minutes in our party lounge.",
  keywords: [
    "VR prices Kristiansand",
    "VR Escape Room price Norway",
    "KRS VR Arena prices",
    "Family VR package Kristiansand",
    "Team building price Kristiansand",
  ],
  alternates: {
    canonical: "https://www.krsvr.no/en/prices",
    languages: {
      "nb-NO": "https://www.krsvr.no/priser",
      en: "https://www.krsvr.no/en/prices",
      "x-default": "https://www.krsvr.no/en/prices",
    },
  },
  openGraph: {
    title: "Prices for VR Experiences in Kristiansand | KRS VR Arena",
    description:
      "Transparent group pricing from 375 NOK (approx. €32) per person. Includes a 90-minute total visit, English-speaking gamemaster, and party lounge.",
    url: "https://www.krsvr.no/en/prices",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishPricesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    name: "Prices for VR Experiences at KRS VR Arena",
    priceCurrency: "NOK",
    description:
      "Prices include a 90-minute total experience, dedicated English-speaking gamemaster, group photo, and 30 minutes in our party lounge.",
    price: "375 - 460",
    eligibleQuantity: {
      "@type": "QuantitativeValue",
      minValue: 2,
      maxValue: 64,
    },
  };

  const privateTiers = [
    { players: "8 – 10 players", nok: 375 },
    { players: "5 – 7 players", nok: 385 },
    { players: "3 – 4 players", nok: 395 },
    { players: "2 players", nok: 460 },
  ];

  return (
    <main className="min-h-screen bg-black pt-16 pb-20 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-white">
          Prices{" "}
          <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest ml-2 align-middle">
            Incl. VAT
          </span>
        </h1>
        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The price per person adjusts automatically based on your group size. Gather family, friends, or colleagues in our wireless free-roam VR arenas at Lund in Kristiansand.
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Pricing Table */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#9C39FF]/5 rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12" />

            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-[#9C39FF]" />
              <div>
                <h2 className="text-xl font-medium text-white">
                  Standard Booking & Family Packages (90 min)
                </h2>
                <p className="text-xs text-zinc-400">
                  Private groups of 2–10 players · Prices incl. VAT
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {privateTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl border border-zinc-800 bg-zinc-950/50"
                >
                  <span className="text-lg font-medium text-zinc-300">
                    {tier.players}
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white">
                      {tier.nok} NOK{" "}
                      <span className="text-sm font-normal text-zinc-500">
                        / person
                      </span>
                    </span>
                    <span className="block text-xs text-zinc-400">
                      approx. €{toApproxEur(tier.nok)} per person
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-[#9C39FF]/10 border border-[#9C39FF]/25 flex items-start gap-3 text-left">
              <CreditCard className="w-5 h-5 text-[#9C39FF] shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong className="text-white">International visitors:</strong> Reserve online with{" "}
                <strong className="text-white">0 NOK upfront</strong> and pay by card terminal (Visa, Mastercard, Apple Pay, or cash) when you arrive at the arena.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col gap-3">
              <Link
                href="/en/experiences"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-700 hover:bg-zinc-800 text-white font-bold transition-colors"
              >
                Explore VR Experiences
              </Link>
              <Link
                href="/en/booking"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white font-bold transition-colors shadow-[0_0_15px_rgba(156,57,255,0.4)] hover:shadow-[0_0_25px_rgba(156,57,255,0.6)]"
              >
                Book Your Experience Now
              </Link>
            </div>
          </div>

          {/* Included Features */}
          <div className="flex flex-col h-full justify-center">
            <h2 className="text-2xl font-light tracking-tight text-white mb-6">
              Included in Every Booking:
            </h2>
            <ul className="space-y-4">
              {[
                "10–15 minutes of welcome, registration, and safety briefing.",
                "Approximately 60 minutes of active in-game time in wireless VR.",
                "Dedicated English-speaking gamemaster assisting your group throughout.",
                "Group photos taken after your game session.",
                "Complimentary drinking water.",
                "Mission debrief and scorecards in the lounge with your gamemaster.",
                "30 minutes of access to our party lounge after the game.",
                "Option to bring birthday cake for children's birthdays (pre-ordered bar & pizza available for team building, adult birthdays, and bachelor/bachelorette parties).",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/20 border border-white/5 hover:border-white/10 hover:bg-zinc-900/40 transition-colors"
                >
                  <CheckCircle2 className="w-6 h-6 text-[#9C39FF] flex-shrink-0" />
                  <span className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-400 flex items-start gap-3">
              <Info className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
              <p>
                For groups larger than 10 players (up to 64 people), we run a social tournament format with rolling rounds and a live spectator screen in the lounge so everyone participates together.
              </p>
            </div>
          </div>
        </div>

        {/* Corporate & Event Packages Summary */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800">
            <h3 className="text-lg font-medium text-white mb-1">
              Corporate Team Building
            </h3>
            <p className="text-[#9C39FF] text-sm font-semibold mb-3">
              375 NOK + VAT / person (2–64 players)
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              90 min for 2–10 players, or up to 3 hours private venue rental with a 120-min active tournament for 10–50+ colleagues. EHF/corporate invoice, pizza & bar available.
            </p>
            <Link
              href="/en/events#teambuilding"
              className="text-xs font-medium text-white hover:text-[#9C39FF] transition-colors"
            >
              Read about corporate events →
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800">
            <h3 className="text-lg font-medium text-white mb-1">
              Bachelor & Bachelorette
            </h3>
            <p className="text-[#9C39FF] text-sm font-semibold mb-3">
              From 450 NOK (approx. €{toApproxEur(450)}) / person
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Duration 1.5–3 hours. Competitive team games or cooperative escape rooms, private lounge time, optional hot pizza delivery and pre-ordered bar packages.
            </p>
            <Link
              href="/en/events#bachelor-party"
              className="text-xs font-medium text-white hover:text-[#9C39FF] transition-colors"
            >
              Read about bachelor parties →
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800">
            <h3 className="text-lg font-medium text-white mb-1">
              VR Birthday Parties
            </h3>
            <p className="text-[#9C39FF] text-sm font-semibold mb-3">
              From 375 NOK (approx. €{toApproxEur(375)}) / person
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              90-minute celebration for kids (8–12 yrs), youth (12+), or adults (18+). Includes 60 min VR gameplay and 30 min in the party lounge.
            </p>
            <Link
              href="/en/events#birthday"
              className="text-xs font-medium text-white hover:text-[#9C39FF] transition-colors"
            >
              Read about birthday packages →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
