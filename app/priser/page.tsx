import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { CheckCircle2, Clock, Info, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: "Priser og prisoversikt for VR opplevelser",
  description: "Se våre priser for VR Escape Room og VR Arcade. Prisen inkluderer en 90 minutters totalopplevelse, dedikert gamemaster, bilder og lån av partylounge.",
  keywords: ["Priser VR", "Hva koster VR Kristiansand", "VR priser pr person", "KRS VR Arena pris"],
  alternates: {
    canonical: "https://www.krsvr.no/priser",
    languages: {
      "nb-NO": "https://www.krsvr.no/priser",
      en: "https://www.krsvr.no/en/prices",
      "x-default": "https://www.krsvr.no/en/prices",
    },
  },
  openGraph: {
    title: "Priser på VR i Kristiansand",
    description: "Priser for grupper. 90 minutters totalopplevelse, inkludert partylounge.",
    url: "https://www.krsvr.no/priser",
    type: "website",
  }
};

export default function PriserPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    "name": "Priser for VR opplevelser",
    "priceCurrency": "NOK",
    "description": "Priser inkluderer 90 minutters totalopplevelse, gamemaster og lån av partylounge",
    "price": "375 - 460",
    "eligibleQuantity": {
      "@type": "QuantitativeValue",
      "minValue": 2,
      "maxValue": 24
    }
  };

  return (
    <main className="min-h-screen bg-black pt-16 pb-20 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background flourishes */}
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-white">
          Priser <span className="text-sm font-medium text-zinc-300 uppercase tracking-widest ml-2 align-middle">Inkl. MVA</span>
        </h1>
        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Prisen justeres automatisk etter hvor mange dere er. Samle venner, familie eller kollegaer i våre trådløse VR-arenaer på Lund.
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Gift Card Callout Banner */}
        <div className="mb-10 bg-gradient-to-r from-purple-950/35 via-zinc-900/70 to-purple-950/35 border border-[#9C39FF]/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#9C39FF]/20 border border-[#9C39FF]/40 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <Gift className="w-6 h-6 text-[#c084fc]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gi bort en opplevelse i gave</h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
                Kjøp digitalt gavekort for 2–10 personer. 12 måneders gyldighet, umiddelbar levering til din e-post og enkel betaling med Vipps.
              </p>
            </div>
          </div>
          <Link
            href="/gavekort"
            className="shrink-0 px-6 py-3 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
          >
            Kjøp gavekort nå
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Pricing Table */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-[#9C39FF]" />
              <div>
                <h3 className="text-xl font-medium text-white">Normal Booking (90 min)</h3>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { pers: "8 - 10 pers", price: "375 kr" },
                { pers: "5 - 7 pers", price: "385 kr" },
                { pers: "3 - 4 pers", price: "395 kr" },
                { pers: "2 pers", price: "460 kr" },
              ].map((tier, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60">
                  <span className="text-lg font-medium text-zinc-200">{tier.pers}</span>
                  <span className="text-xl font-bold text-white">{tier.price} <span className="text-sm font-normal text-zinc-400">per pers</span></span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col gap-3">
              <Link href="/vr-opplevelser" className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-700 hover:bg-zinc-800 text-white font-bold transition-colors">
                Se VR opplevelser
              </Link>
              <Link href="/booking" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white font-bold transition-colors">
                Book din opplevelse nå
              </Link>
            </div>
          </div>

          {/* Included Features */}
          <div className="flex flex-col h-full justify-center">
            <h2 className="text-2xl font-light tracking-tight text-white mb-4">Dette er inkludert i prisen:</h2>
            <ul className="divide-y divide-zinc-800/70">
              {[
                "10-15 minutter forberedelse og introduksjon.",
                "Rundt 60 minutter in-game session i VR.",
                "Dedikert gamemaster som har ansvar for deres gruppe.",
                "Gruppebilder etter endt spill.",
                "Gratis vann å drikke.",
                "Mission debrief og scoreboard i lounge med gamemaster.",
                "Tilgang til vår partylounge i 30 minutter etter spillet.",
                "Mulighet for medbrakt kake ved barnebursdag (forhåndsbestilt servering ved teambuilding, voksenbursdag og utdrikningslag).",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3.5 py-3.5">
                  <CheckCircle2 className="w-5 h-5 text-[#9C39FF] flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 pt-5 border-t border-zinc-800 text-sm text-zinc-400 flex items-start gap-3">
              <Info className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
              <p>For grupper med flere enn 10 personer kjøres opplegget i et sosialt turneringsformat, slik at alle får spille sammen med maksimal komfort og utstyr.</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
