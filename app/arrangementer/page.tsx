import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Users, PartyPopper } from "lucide-react";
import { motion } from "motion/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arrangementer, Teambuilding & Utdrikningslag Kristiansand",
  description: "Planlegg teambuilding, utdrikningslag, firmaevent eller bursdag hos KRS VR Arena i Kristiansand. Full frihet i VR er den perfekte sosiale aktiviteten.",
  keywords: ["Teambuilding Kristiansand", "Utdrikningslag Kristiansand", "Firmafest Kristiansand", "Julebord Kristiansand", "Bursdag Kristiansand", "Aktivitet Kristiansand", "Arrangement Kristiansand", "VR event"],
  openGraph: {
    title: "Arrangementer & Teambuilding Kristiansand",
    description: "Planlegg teambuilding, utdrikningslag, firmaevent eller bursdag med unike VR-opplevelser hos KRS VR Arena.",
    url: "https://www.krsvr.no/arrangementer",
    type: "website",
  }
};

export default function ArrangementerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    "name": "Arrangementer, Teambuilding og Utdrikningslag hos KRS VR Arena",
    "description": "Vi tilbyr skreddersydde pakker for teambuilding, utdrikningslag, firmaevent, julebord og bursdager i Kristiansand med eksklusiv VR-underholdning.",
    "url": "https://www.krsvr.no/arrangementer",
    "provider": {
      "@type": "EntertainmentBusiness",
      "name": "KRS VR Arena",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Industrigata 12",
        "postalCode": "4632",
        "addressLocality": "Kristiansand",
        "addressCountry": "NO"
      }
    }
  };

  return (
    <main className="min-h-screen pb-20 pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter">
          Arrangementer hos KRS VR Arena
        </h1>
        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Planlegg bursdag, utdrikningslag, firmaevent, teambuilding eller julebord med unike VR-opplevelser i Kristiansand. Hos oss spiller dere på lag, løser oppdrag og skaper minner gruppa faktisk snakker om etterpå.
        </p>

        
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/arrangementer/private-fester" className="px-6 py-2.5 rounded-full text-sm font-medium transition-all bg-white text-black hover:bg-zinc-200">
            Se private fester
          </Link>
          <Link href="/arrangementer/firmaevent" className="px-6 py-2.5 rounded-full text-sm font-medium transition-all bg-[#9C39FF]/10 text-white border border-[#9C39FF]/30 hover:bg-[#9C39FF]/20">
            Se firmaevent
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-16">
        {/* Pill Menu Navigation */}
        <div className="flex justify-center mb-10 w-full">
          <div className="inline-flex bg-zinc-900/80 p-1 rounded-full border border-white/5">
            <Link href="/arrangementer/private-fester" className="px-6 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Private fester
            </Link>
            <Link href="/arrangementer/firmaevent" className="px-6 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Bedrifter
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Kort 1 */}
          <Link href="/arrangementer/private-fester" className="group block">
            <div className="h-full bg-zinc-900/40 border border-white/10 rounded-2xl p-8 hover:bg-zinc-900/60 hover:border-white/20 transition-all flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#9C39FF]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PartyPopper className="w-8 h-8 text-[#9C39FF]" />
              </div>
              <h2 className="text-2xl font-medium tracking-tight mb-4">Private fester</h2>
              <p className="text-zinc-400 leading-relaxed mb-8 flex-grow">
                Perfekt for bursdag og utdrikningslag. Samle gjengen til en sosial VR-opplevelse med samarbeid, konkurranse og høy energi.
              </p>
              <div className="inline-flex items-center text-sm font-medium text-white group-hover:text-[#9C39FF] transition-colors">
                Se private fester <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Kort 2 */}
          <Link href="/arrangementer/firmaevent" className="group block">
            <div className="h-full bg-zinc-900/40 border border-white/10 rounded-2xl p-8 hover:bg-zinc-900/60 hover:border-white/20 transition-all flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#9C39FF]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-[#9C39FF]" />
              </div>
              <h2 className="text-2xl font-medium tracking-tight mb-4">Bedrifter</h2>
              <p className="text-zinc-400 leading-relaxed mb-8 flex-grow">
                Perfekt for teambuilding, kick off, firmafest og julebord. En aktiv og engasjerende opplevelse der kollegene må samarbeide for å lykkes.
              </p>
              <div className="inline-flex items-center text-sm font-medium text-white group-hover:text-[#9C39FF] transition-colors">
                Se firmaevent <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
