import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import PremiumPackageCard from "@/components/PremiumPackageCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Firmaevent, Julebord & Teambuilding Kristiansand | KRS VR Arena",
  description: "Bygg team, skap energi og gi kollegene en opplevelse utenfor møterommet. Unike VR-opplevelser, perfekt for teambuilding, firmafest og julebord i Kristiansand.",
  keywords: ["Teambuilding Kristiansand", "Firmaevent Kristiansand", "Julebord Kristiansand", "Firmafest Kristiansand", "Kick off Kristiansand", "Aktivitet for bedrifter", "VR bedrift"],
  openGraph: {
    title: "Firmaevent & Teambuilding Kristiansand | KRS VR Arena",
    description: "Unike VR-opplevelser, perfekt for teambuilding, firmafest og julebord i Kristiansand. Fra 2-24 personer.",
    url: "https://www.krsvr.no/arrangementer/firmaevent",
    type: "website",
  }
};

export default function FirmaeventPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Teambuilding og Firmaevent",
    "description": "Engasjerende teambuilding, julebord og firmaevent med opptil 24 personer. Bygg relasjoner med samarbeids-VR.",
    "brand": {
      "@type": "Brand",
      "name": "KRS VR Arena"
    },
    "category": "Corporate Events",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "375",
      "highPrice": "460",
      "priceCurrency": "NOK",
      "offerCount": "3"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "124"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Fornøyd Kunde"
        }
      }
    ]
  };

  return (
    <main className="min-h-screen pb-20 pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <div className="mb-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter">
          Firmaevent og teambuilding i Kristiansand
        </h1>
        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Bygg team, skap energi og gi kollegene en opplevelse utenfor møterommet. Hos KRS VR Arena må deltakerne samarbeide, kommunisere og løse oppdrag sammen &mdash; under tidspress, med høy energi og mye latter.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/kontakt" className="px-6 py-2.5 rounded-full text-sm font-medium transition-all bg-white text-black hover:bg-zinc-200">
            Send firmaforespørsel
          </Link>
          <a href="#pakker" className="px-6 py-2.5 rounded-full text-sm font-medium transition-all bg-[#9C39FF]/10 text-white border border-[#9C39FF]/30 hover:bg-[#9C39FF]/20">
            Se pakker
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {/* Trust Line */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center text-sm text-zinc-400 bg-zinc-900/50 px-6 py-3 rounded-full border border-white/5 whitespace-normal text-center">
            2–64 personer &middot; Fra 375 kr per person &middot; Partylounge &middot; Kaffe og vann ved forespørsel
          </div>
        </div>

        {/* Pill Menu Navigation */}
        <div className="flex justify-center mb-10 w-full">
          <div className="inline-flex bg-zinc-900/80 p-1 rounded-full border border-white/5">
            <Link href="/arrangementer/private-fester" className="px-6 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Private fester
            </Link>
            <Link href="/arrangementer/firmaevent" className="px-6 py-2 rounded-full text-sm font-medium bg-[#9C39FF] text-white shadow-lg">
              Bedrifter
            </Link>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 flex flex-col hover:bg-zinc-900/50 transition-colors">
            <h2 className="text-xl font-medium tracking-tight mb-3">Teambuilding</h2>
            <p className="text-zinc-400 text-sm leading-relaxed flex-grow mb-0">
              En aktivitet der samarbeid faktisk betyr noe. Deltakerne må kommunisere, fordele roller, ta raske valg og jobbe sammen for å lykkes i spillet.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 flex flex-col hover:bg-zinc-900/50 transition-colors">
            <h2 className="text-xl font-medium tracking-tight mb-3">Kick Off / Firmafest</h2>
            <p className="text-zinc-400 text-sm leading-relaxed flex-grow mb-0">
              Start perioden, prosjektet eller feiringen med en opplevelse som samler folk. VR gir energi, latter og en felles opplevelse som fungerer på tvers av avdelinger og erfaringsnivå.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 flex flex-col hover:bg-zinc-900/50 transition-colors">
            <h2 className="text-xl font-medium tracking-tight mb-3">Julebord</h2>
            <p className="text-zinc-400 text-sm leading-relaxed flex-grow mb-0">
              Gjør julebordet mer minneverdig med en aktivitet før maten, festen eller resten av kvelden. VR-opplevelsene gir gruppa noe å samles rundt &mdash; uten at det blir stivt eller formelt.
            </p>
          </div>
        </div>

        {/* Packages Section */}
        <div id="pakker" className="mb-24 pt-8 scroll-mt-20">
          <h2 className="text-3xl font-light tracking-tighter text-center mb-12">Velg pakke</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pakke 1 */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 flex flex-col relative">
              <h3 className="text-xl font-medium tracking-tight mb-2">Liten gruppe</h3>
              <p className="text-sm text-[#9C39FF] font-medium mb-4">2–8 personer &middot; 90 minutter &middot; 375 kr per person</p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                For mindre team som vil ha en effektiv, sosial og engasjerende VR-opplevelse.
              </p>
              <div className="space-y-3 mb-8 flex-grow">
                {[
                  "Oppmøte 15 minutter før spillestart",
                  "Ca. 10 minutter forberedelse og introduksjon",
                  "Rundt 45 minutter spilletid",
                  "Unik VR-opplevelse",
                  "Dedikert gamemaster for gruppen",
                  "Gruppebilde",
                  "Gratis vann og kaffe ved forespørsel",
                  "Tilgang til partylounge i 30 minutter etter spillet",
                  "Mulighet til å nyte medbrakt mat og drikke",
                  "Pizza kan koordineres på forespørsel gjennom lokal leverandør"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#9C39FF] shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/booking" className="w-full py-3 rounded-lg text-sm font-medium transition-all bg-white text-black hover:bg-zinc-200 text-center">
                Book liten gruppe
              </Link>
            </div>

            {/* Pakke 2 */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 flex flex-col relative border-[#9C39FF]/30 shadow-[0_0_30px_rgba(156,57,255,0.05)]">
              <h3 className="text-xl font-medium tracking-tight mb-2">Medium gruppe</h3>
              <p className="text-sm text-[#9C39FF] font-medium mb-4">9–16 personer &middot; 2,5 timer &middot; 375 kr per person</p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                For team og avdelinger som ønsker en sosial aktivitet med god tid til både spill, mingling og oppsummering.
              </p>
              <div className="space-y-3 mb-8 flex-grow">
                {[
                  "Oppmøte 15 minutter før spillestart",
                  "Ca. 10 minutter forberedelse og introduksjon",
                  "To puljer med rundt 45 minutter spilletid per pulje",
                  "Tilgang til partylounge under hele opplegget",
                  "De som venter kan mingle, spise og følge med på de aktive spillerne",
                  "Resultater annonseres underveis",
                  "Gruppebilder",
                  "Dedikert gamemaster",
                  "Mulighet til å nyte medbrakt mat og drikke",
                  "Gratis vann og kaffe ved forespørsel",
                  "Pizza kan koordineres på forespørsel gjennom lokal leverandør"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#9C39FF] shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/kontakt" className="w-full py-3 rounded-lg text-sm font-medium transition-all bg-[#9C39FF] text-white hover:bg-[#8b32e6] text-center shadow-lg shadow-[#9C39FF]/20">
                Send firmaforespørsel
              </Link>
            </div>

            {/* Pakke 3 */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 flex flex-col relative">
              <h3 className="text-xl font-medium tracking-tight mb-2">Stor gruppe</h3>
              <p className="text-sm text-[#9C39FF] font-medium mb-4">17–24 personer &middot; 3,5 timer &middot; 375 kr per person</p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                For større firmaeventer, julebord eller avdelingssamlinger. Gruppen deles i tre puljer, og partyloungen brukes som sosial base gjennom opplegget.
              </p>
              <div className="space-y-3 mb-8 flex-grow">
                {[
                  "Oppmøte 15 minutter før spillestart",
                  "Ca. 10 minutter forberedelse og introduksjon",
                  "Tre puljer med rundt 45 minutter spilletid per pulje",
                  "Tilgang til partylounge under hele opplegget",
                  "De som venter kan mingle, spise og følge med på de aktive spillerne",
                  "Resultater annonseres underveis",
                  "Gruppebilder",
                  "Dedikert gamemaster",
                  "Mulighet til å nyte medbrakt mat og drikke",
                  "Gratis vann og kaffe ved forespørsel",
                  "Pizza kan koordineres på forespørsel gjennom lokal leverandør"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#9C39FF] shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/kontakt" className="w-full py-3 rounded-lg text-sm font-medium transition-all bg-zinc-800 text-white hover:bg-zinc-700 text-center">
                Send forespørsel for stor gruppe
              </Link>
            </div>
          </div>

          {/* Premium Pakke - Full width */}
          <PremiumPackageCard />
        </div>

        {/* Avsluttende CTA */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-light tracking-tighter mb-4">Klar for et firmaevent folk faktisk husker?</h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-lg">
            Send oss en forespørsel, så hjelper vi dere med et opplegg som passer teamet, tidspunktet og anledningen.
          </p>
          <Link href="/kontakt" className="inline-block px-8 py-4 rounded-full text-base font-medium transition-all bg-[#9C39FF] text-white hover:bg-[#8b32e6] shadow-lg shadow-[#9C39FF]/20">
            Send firmaforespørsel
          </Link>
        </div>
      </div>
    </main>
  );
}
