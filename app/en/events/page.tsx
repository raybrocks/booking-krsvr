import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Handshake,
  Crown,
  CalendarHeart,
  Truck,
  CheckCircle2,
  Users,
  Trophy,
  Wine,
  Pizza,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { toApproxEur } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Corporate Team Building, Bachelor Parties, Birthdays & VR On-Site | Kristiansand",
  description:
    "Social VR events in Kristiansand for 2–64 participants: Corporate team building (375 NOK + VAT/pers), bachelor & bachelorette parties, kids & adult birthday parties, and mobile VR On-Site across Southern Norway.",
  keywords: [
    "Team building Kristiansand",
    "Corporate event Kristiansand",
    "Company party Kristiansand",
    "Bachelor party Kristiansand",
    "Bachelorette party Kristiansand",
    "Birthday party Kristiansand",
    "Kids birthday Kristiansand",
    "VR On-site Kristiansand",
  ],
  alternates: {
    canonical: "https://www.krsvr.no/en/events",
    languages: {
      "nb-NO": "https://www.krsvr.no/arrangementer",
      en: "https://www.krsvr.no/en/events",
      "x-default": "https://www.krsvr.no/en/events",
    },
  },
  openGraph: {
    title: "Events, Team Building & Group Celebrations | KRS VR Arena Kristiansand",
    description:
      "Bring your colleagues, friends, or birthday group together for wireless VR in our 300 sqm arena in Kristiansand. Rolling tournaments for up to 64 people, lounge, pizza, and pre-ordered bar.",
    url: "https://www.krsvr.no/en/events",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishEventsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Group Events & Packages at KRS VR Arena Kristiansand",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Service",
          name: "Corporate Team Building & Company Events (2–64 participants)",
          description:
            "Cooperative VR Escape Rooms or rolling tournament format for 10–64 colleagues with live spectator screen, team wristbands, pizza delivery, pre-ordered bar, and corporate invoice.",
          offers: {
            "@type": "Offer",
            price: "375",
            priceCurrency: "NOK",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "375",
              priceCurrency: "NOK",
              valueAddedTaxIncluded: false,
            },
          },
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Service",
          name: "Bachelor & Bachelorette Party in VR",
          description:
            "Social 1.5–3 hour celebration in Kristiansand with wireless VR games, party lounge access, optional pizza delivery, and pre-ordered drinks.",
          offers: {
            "@type": "Offer",
            price: "450",
            priceCurrency: "NOK",
          },
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "Service",
          name: "VR Birthday Party (Kids 8–12, Youth 12+, Adults 18+)",
          description:
            "90-minute birthday celebration including 60 minutes in VR with a dedicated gamemaster and 30 minutes in the party lounge.",
          offers: {
            "@type": "Offer",
            price: "375",
            priceCurrency: "NOK",
          },
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@type": "Service",
          name: "Mobile VR On-Site – We Come to You",
          description:
            "Mobile wireless VR setup with dedicated instructors at your conference, office, or event venue in Kristiansand and Southern Norway.",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-black pt-16 pb-24 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/15 via-black to-black -z-10" />

      {/* Hero */}
      <section className="container mx-auto px-4 max-w-5xl text-center mb-16">
        <span className="inline-block text-xs uppercase tracking-widest text-[#9C39FF] font-semibold mb-3">
          2 – 64 Participants · Kristiansand
        </span>
        <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-6">
          Events, Team Building & Celebrations
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 font-light max-w-3xl mx-auto leading-relaxed">
          Whether you are planning corporate team building, a bachelor or bachelorette party, a birthday celebration, or want us to bring wireless VR to your conference venue, we tailor a safe and social event for your group.
        </p>

        {/* Quick Anchor Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
          <a
            href="#teambuilding"
            className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#9C39FF] text-xs sm:text-sm text-zinc-200 transition-colors"
          >
            Corporate Team Building
          </a>
          <a
            href="#bachelor-party"
            className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#9C39FF] text-xs sm:text-sm text-zinc-200 transition-colors"
          >
            Bachelor & Bachelorette
          </a>
          <a
            href="#birthday"
            className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#9C39FF] text-xs sm:text-sm text-zinc-200 transition-colors"
          >
            VR Birthday Parties
          </a>
          <a
            href="#bar-catering"
            className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#9C39FF] text-xs sm:text-sm text-zinc-200 transition-colors"
          >
            Bar & Catering
          </a>
          <a
            href="#on-site"
            className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#9C39FF] text-xs sm:text-sm text-zinc-200 transition-colors"
          >
            VR On-Site
          </a>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl space-y-24">
        {/* 1. Corporate Team Building */}
        <section id="teambuilding" className="scroll-mt-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 md:p-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9C39FF]/15 text-[#9C39FF] text-xs font-semibold">
                <Handshake className="w-4 h-4" />
                Corporate & Company Events
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                Team Building in Kristiansand (2–64 Colleagues)
              </h2>
              <p className="text-zinc-300 font-light leading-relaxed">
                Strengthen communication and team spirit in a relaxed setting where everyone participates on equal footing — regardless of age, physical fitness, or technical background.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">
                    Small Teams (2–10 people)
                  </span>
                  <strong className="text-lg text-white font-semibold">
                    375 NOK + VAT / pers
                  </strong>
                  <p className="text-xs text-zinc-400 mt-1">
                    90-minute experience · Everyone plays simultaneously in VR Escape Rooms or Tactical Arena.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-[#9C39FF]/40">
                  <span className="text-xs text-[#9C39FF] font-medium block mb-1">
                    Tournament Format (10–50+ people)
                  </span>
                  <strong className="text-lg text-white font-semibold">
                    375 NOK + VAT / pers
                  </strong>
                  <p className="text-xs text-zinc-400 mt-1">
                    Up to 3 hours total · Entire venue exclusively for your company · 120 min active tournament.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#9C39FF]" />
                  How Our Tournament Format Works for 10–64 Players:
                </h3>
                <ul className="space-y-2.5 text-sm text-zinc-300 font-light">
                  {[
                    "Up to 10 players are active in the arena simultaneously in fast-paced ~10-minute rounds.",
                    "Every team receives colorful wristbands with custom team names (e.g. company departments or Team Alpha, Beta, Charlie, Delta).",
                    "Colleagues on break follow the live action on the big screen in the lounge, check scorecards, enjoy refreshments, and plan tactics.",
                    "Joint award ceremony crowning the winning team at the end — everyone shares the same event from start to finish.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#9C39FF] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  nativeButton={false}
                  render={<Link href="/en/contact" />}
                  className="bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full px-6"
                >
                  Request Corporate Offer (10+ players) <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/en/booking" />}
                  variant="outline"
                  className="border-zinc-700 hover:bg-zinc-800 text-white rounded-full px-6"
                >
                  Book Direct (2–10 players)
                </Button>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/images/vr-teambuilding-firmaevent-kristiansand.jpg"
                alt="Corporate team building group at KRS VR Arena in Kristiansand"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-12">
            <TestimonialsCarousel />
          </div>
        </section>

        {/* 2. Bar & Catering Section */}
        <section id="bar-catering" className="scroll-mt-28">
          <div className="bg-zinc-900/60 border border-[#9C39FF]/30 rounded-3xl p-6 sm:p-10 md:p-12">
            <div className="max-w-3xl mb-8">
              <span className="text-xs uppercase tracking-widest text-[#9C39FF] font-semibold">
                Pre-Ordered Bar & Lounge Catering
              </span>
              <h2 className="text-3xl font-light text-white mt-2 mb-3">
                Drinks & Hot Pizza in the Party Lounge
              </h2>
              <p className="text-zinc-300 font-light leading-relaxed text-sm sm:text-base">
                Our bar is prepared specifically for pre-booked group events. We send a non-binding price list upon inquiry, and settlement can be handled either via a single corporate invoice (EHF) or by opening the bar for individual participant payment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                <Wine className="w-7 h-7 text-[#9C39FF] mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Bar Package 1: Beer, Cider & Soft Drinks
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">
                  Cold Tuborg, Corona Extra, Bacardi Breezer, and soft drinks/mineral water. Practical, informal, and safe around the arena equipment.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                <Wine className="w-7 h-7 text-[#9C39FF] mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Bar Package 2: Quality Wine & Sparkling
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">
                  Selected quality wines and sparkling bubbles from the same respected supplier used by Boen Gård — ideal for celebrations in the lounge or after gameplay.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                <Pizza className="w-7 h-7 text-[#9C39FF] mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Fresh Local Pizza Delivery
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">
                  We coordinate delivery of hot, freshly baked local pizza directly to our party lounge so it is ready when your group takes a break or finishes playing.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-3 text-xs sm:text-sm text-zinc-400">
              <Info className="w-5 h-5 text-[#9C39FF] shrink-0 mt-0.5" />
              <p>
                <strong className="text-zinc-200">Note on outside food and drinks:</strong>{" "}
                Outside food and beverages are not permitted at team building events, corporate gatherings, adult birthdays (18+), or bachelor/bachelorette parties. Exception: For children&apos;s birthday parties, you are welcome to bring your own birthday cake, snacks, candy, and soda.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Bachelor & Bachelorette Parties */}
        <section id="bachelor-party" className="scroll-mt-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 md:p-12">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 lg:order-first">
              <Image
                src="/images/vr-utdrikningslag-kristiansand.jpg"
                alt="Bachelor and bachelorette party in the VR arena in Kristiansand"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9C39FF]/15 text-[#9C39FF] text-xs font-semibold">
                <Crown className="w-4 h-4" />
                From 450 NOK (approx. €{toApproxEur(450)}) / person · 1.5–3 Hours
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                Bachelor & Bachelorette Parties
              </h2>
              <p className="text-zinc-300 font-light leading-relaxed">
                Start the celebration with an activity that brings everyone together — even when guests do not all know each other beforehand. Compete in Tactical Arena, survive Zombie Shooter together, or solve a VR Escape Room, followed by time in our private party lounge.
              </p>
              <ul className="space-y-2.5 text-sm text-zinc-300 font-light">
                {[
                  "Suitable for groups of 2–64 participants (tournament format for 10+).",
                  "Dedicated gamemaster and group photos included.",
                  "Private party lounge access with optional hot pizza delivery and pre-ordered bar.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#9C39FF] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  nativeButton={false}
                  render={<Link href="/en/contact" />}
                  className="bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full px-6"
                >
                  Plan Bachelor / Bachelorette Party <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. VR Birthday Parties */}
        <section id="birthday" className="scroll-mt-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 md:p-12">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9C39FF]/15 text-[#9C39FF] text-xs font-semibold">
                <CalendarHeart className="w-4 h-4" />
                From 375 NOK (approx. €{toApproxEur(375)}) / person · 90 Minutes
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                VR Birthday Parties (Kids, Teens & Adults)
              </h2>
              <p className="text-zinc-300 font-light leading-relaxed">
                Celebrate your birthday inside interactive virtual worlds with a dedicated gamemaster who guides the group from start to finish, followed by 30 minutes in our party lounge.
              </p>
              <ul className="space-y-2.5 text-sm text-zinc-300 font-light">
                {[
                  "Kids Birthday (ages 8–12): Safe, cooperative family-friendly games where everyone plays together. Bring your own birthday cake, snacks, candy, and soda at no extra cost.",
                  "Youth Birthday (ages 12+): Adventure quests, VR Escape Rooms, and team action.",
                  "Adult Birthday (18+): Combine VR Escape Rooms, Tactical Arena, or Zombie Shooter with hot pizza delivery and pre-ordered bar packages in the lounge.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#9C39FF] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  nativeButton={false}
                  render={<Link href="/en/booking" />}
                  className="bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full px-6"
                >
                  Book Birthday (2–10 players) <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/en/contact" />}
                  variant="outline"
                  className="border-zinc-700 hover:bg-zinc-800 text-white rounded-full px-6"
                >
                  Group Inquiry (10+ players)
                </Button>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/images/vr-familiepakke-ungdom-12pluss.jpg"
                alt="Birthday party celebration with VR headsets at KRS VR Arena"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[center_18%]"
              />
            </div>
          </div>
        </section>

        {/* 5. Mobile VR On-Site */}
        <section id="on-site" className="scroll-mt-28">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9C39FF]/15 text-[#9C39FF] text-xs font-semibold">
                <Truck className="w-4 h-4" />
                Across Kristiansand & Agder
              </div>
              <h2 className="text-3xl font-light text-white tracking-tight">
                VR On-Site – We Bring the Arena to You
              </h2>
              <p className="text-zinc-300 font-light leading-relaxed">
                Hosting a conference, kickoff, or company event at your own office or hotel? Because our VR equipment is completely wireless, our instructors can set up a mobile free-roam VR zone directly at your venue.
              </p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/en/contact" />}
              size="lg"
              className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 shrink-0"
            >
              Request VR On-Site Quote <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
