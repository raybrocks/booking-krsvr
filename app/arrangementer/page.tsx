import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Cake, Flame, Users, Truck, Check } from "lucide-react";
import { Metadata } from "next";
import ArrangementSubNav from "@/components/ArrangementSubNav";
import ArrangementTrustBar from "@/components/ArrangementTrustBar";

export const metadata: Metadata = {
  title: "Arrangementer i Kristiansand – Bursdag, Utdrikningslag & Teambuilding",
  description: "Skreddersydde arrangementer med VR i Kristiansand. Opplev VR-bursdag, VR-utdrikningslag, teambuilding for bedrifter og VR on-site hos KRS VR Arena.",
  keywords: [
    "Arrangementer Kristiansand",
    "VR Bursdag Kristiansand",
    "Utdrikningslag Kristiansand",
    "Bachelor party Kristiansand",
    "Teambuilding Kristiansand",
    "Firmaevent Kristiansand",
    "Firmafest Kristiansand",
    "VR On-site Kristiansand",
    "Gruppeaktivitet Kristiansand",
  ],
  alternates: {
    canonical: "https://www.krsvr.no/arrangementer",
    languages: {
      "nb-NO": "https://www.krsvr.no/arrangementer",
      en: "https://www.krsvr.no/en/events",
      "x-default": "https://www.krsvr.no/en/events",
    },
  },
  openGraph: {
    title: "Arrangementer i Kristiansand | KRS VR Arena",
    description: "Samle venner, kolleger eller familien til en engasjerende opplevelse i VR. Egen lounge og dedikert spillvert.",
    url: "https://www.krsvr.no/arrangementer",
    type: "website",
  },
};

export default function ArrangementerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    "name": "Arrangementer hos KRS VR Arena",
    "description": "Vi tilbyr skreddersydde pakker for VR-bursdag, VR-utdrikningslag, teambuilding og mobil VR on-site i Kristiansand og Agder.",
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

  const tracks = [
    {
      title: "VR Bursdag",
      subtitle: "Barn (8–12), ungdom & voksne",
      description: "En aktiv bursdag der alle samarbeider og mestrer sammen. Egen partylounge med kakespising eller pizzalevering etter spillet.",
      href: "/arrangementer/vr-bursdag",
      image: "/images/vr-familiepakke-8-12-aar.jpg",
      icon: Cake,
      tag: "Partylounge inkludert",
    },
    {
      title: "VR Utdrikningslag",
      subtitle: "Bachelor & Bachelorette party",
      description: "Det perfekte innslaget mellom lunsj og kvelden videre. Full action, lagkonkurranser, god stemning og partylounge for hele gjengen.",
      href: "/arrangementer/vr-utdrikningslag",
      image: "/images/vr-utdrikningslag-kristiansand.jpg",
      icon: Flame,
      tag: "Forloverens favoritt",
    },
    {
      title: "VR Teambuilding",
      subtitle: "Kickoff, firmafest & julebord",
      description: "Styrk samholdet i teamet. Oppdrag som krever tydelig kommunikasjon og tillit. EHF-faktura og fleksibelt deltakerantall.",
      href: "/arrangementer/vr-teambuilding",
      image: "/images/vr-teambuilding-firmaevent-kristiansand.jpg",
      icon: Users,
      tag: "375 kr + mva/pers &middot; 2–64 pers",
    },
    {
      title: "VR On-site",
      subtitle: "Vi kommer til dine lokaler",
      description: "Skal dere ha konferanse, kickoff eller festival i egne lokaler? Vi rigger opp mobil VR-arena med instruktører i hele Agder.",
      href: "/arrangementer/vr-on-site",
      image: "/arrangement-hero.jpg",
      icon: Truck,
      tag: "I hele Agder",
    },
  ];

  return (
    <main className="min-h-screen pb-24 pt-4 md:pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Undermeny for arrangementer */}
        <ArrangementSubNav />

        {/* COMPACT HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-5 md:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tighter text-white leading-tight">
            Arrangementer hos KRS VR Arena
          </h1>
          <p className="mt-2.5 text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed font-light">
            Planlegg en feiring eller et bedriftsevent som skiller seg ut. Velg anledning nedenfor for å se opplegg og pakker.
          </p>
        </div>

        {/* TRUST BAR */}
        <div className="mb-8 md:mb-10">
          <ArrangementTrustBar
            items={[
              "90 min totalopplevelse",
              "2–64 personer",
              "Fra 375 kr/pers"
            ]}
          />
        </div>

        {/* 4 BILDE-KORT GRID */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {tracks.map((track) => {
            const Icon = track.icon;
            return (
              <Link
                key={track.href}
                href={track.href}
                className="group block bg-zinc-900/30 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 hover:bg-zinc-900/50 transition-all duration-300 shadow-xl flex flex-col"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={track.image}
                    alt={track.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10 text-xs font-medium text-zinc-200">
                    <span dangerouslySetInnerHTML={{ __html: track.tag }} />
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-medium text-white tracking-tight group-hover:text-[#9C39FF] transition-colors">
                        {track.title}
                      </h2>
                      <div className="text-xs text-zinc-400 font-light">{track.subtitle}</div>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed mt-3 mb-6 flex-grow font-light">
                    {track.description}
                  </p>

                  <div className="inline-flex items-center text-sm font-semibold text-white group-hover:text-[#9C39FF] transition-colors">
                    Les mer og se opplegg <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* BUNN-BANNER / DIREKTE BOOKING */}
        <div className="bg-gradient-to-r from-zinc-900/80 via-zinc-900/40 to-zinc-900/80 border border-white/10 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-3">
            Klar for å planlegge arrangementet?
          </h2>
          <p className="text-zinc-400 text-sm md:text-base mb-8 max-w-xl mx-auto font-light">
            Enten dere vil sikre et tidspunkt direkte i bookingsystemet, eller be om et skreddersydd bedriftsopplegg med servering, er vi klare til å ta imot dere.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/booking"
              className="px-8 py-3 rounded-full text-sm font-semibold tracking-wide bg-[#9C39FF] hover:bg-[#8A30E0] text-white shadow-[0_0_20px_rgba(156,57,255,0.4)] transition-all hover:scale-105"
            >
              Book direkte online
            </Link>
            <Link
              href="/kontakt"
              className="px-8 py-3 rounded-full text-sm font-medium tracking-wide bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
            >
              Ta kontakt med oss
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
