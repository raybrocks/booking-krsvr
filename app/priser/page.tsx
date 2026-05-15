import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { CheckCircle2, Clock, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Priser og prisoversikt for VR opplevelser | KRS VR Arena",
  description: "Se våre priser for VR Escape Room og VR Arcade. Prisen inkluderer ca 45-55 minutter aktiv spilltid, dedikert gamemaster, bilder og lån av partylounge.",
  keywords: ["Priser VR", "Hva koster VR Kristiansand", "VR priser pr person", "KRS VR Arena pris"],
  openGraph: {
    title: "Priser på VR i Kristiansand | KRS VR Arena",
    description: "Priser for grupper. Ca 45-55 min aktiv spilletid, inkludert partylounge.",
    url: "https://vrsenteret.no/priser",
    type: "website",
  }
};

export default function PriserPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    "name": "Priser for VR opplevelser",
    "priceCurrency": "NOK",
    "description": "Priser inkluderer ca 45-55 minutter aktiv spilltid, gamemaster og lån av partylounge",
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
          Priser <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest ml-2 align-middle">Inkl. MVA</span>
        </h1>
        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Prisen justeres automatisk etter hvor mange dere er. Få en uforglemmelig opplevelse i våre store VR arenaer!
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Pricing Table */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#9C39FF]/5 rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12" />
            
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-[#9C39FF]" />
              <div>
                <h3 className="text-xl font-medium text-white">Normal Booking</h3>
                <p className="text-sm text-zinc-400">Aktiv spilltid i virtuell verden: ca 45-55 min</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { pers: "8 pers+", price: "375 kr", popular: false },
                { pers: "5 - 7 pers", price: "385 kr", popular: false },
                { pers: "3 - 4 pers", price: "395 kr", popular: false },
                { pers: "2 pers", price: "460 kr", popular: false },
              ].map((tier, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${tier.popular ? 'border-[#9C39FF]/30 bg-[#9C39FF]/5' : 'border-zinc-800 bg-zinc-950/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-medium ${tier.popular ? 'text-white' : 'text-zinc-300'}`}>{tier.pers}</span>
                    {tier.popular && (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-[#9C39FF] text-white px-2 py-0.5 rounded-full">
                        Mest populær
                      </span>
                    )}
                  </div>
                  <span className="text-xl font-bold text-white">{tier.price} <span className="text-sm font-normal text-zinc-500">per pers</span></span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
              <Link href="/booking" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white font-bold transition-colors shadow-[0_0_15px_rgba(156,57,255,0.4)] hover:shadow-[0_0_25px_rgba(156,57,255,0.6)]">
                Book din opplevelse nå
              </Link>
            </div>
          </div>

          {/* Included Features */}
          <div className="flex flex-col h-full justify-center">
            <h2 className="text-2xl font-light tracking-tight text-white mb-6">Dette er inkludert i prisen:</h2>
            <ul className="space-y-5">
              {[
                "Cirka 45-55 min aktiv spilletid i VR.",
                "Dedikert gamemaster som har ansvar for deres gruppe.",
                "Gruppebilder etter endt spill.",
                "Gratis vann å drikke.",
                "Tilgang til vår partylounge i 30 minutter etter spillet.",
                "Mulighet til å nyte medbrakt mat, kake og drikke.",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/20 border border-white/5 hover:border-white/10 hover:bg-zinc-900/40 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-[#9C39FF] flex-shrink-0" />
                  <span className="text-zinc-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-400 flex items-start gap-3">
              <Info className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
              <p>For grupper med flere enn 8 personer, deles gruppen opp slik at alle får spille med maksimal komfort og utstyr.</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
