import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import PremiumPackageCard from "@/components/PremiumPackageCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utdrikningslag, Julebord & Bursdag Kristiansand | KRS VR Arena",
  description: "Planlegger du utdrikningslag, bursdag eller julebord med vennegjengen? KRS VR Arena i Kristiansand tilbyr unike opplevelser for private grupper.",
  keywords: ["Utdrikningslag Kristiansand", "Bursdag Kristiansand", "Private fester Kristiansand", "Julebord vennegjeng Kristiansand", "Vennegjeng aktivitet", "Innendørs aktivitet Kristiansand", "VR utdrikningslag"],
  openGraph: {
    title: "Utdrikningslag, Julebord & Bursdag i Kristiansand | KRS VR Arena",
    description: "Samle vennegjengen for utdrikningslag, julebord eller bursdag med aktive og morsomme VR-opplevelser i Kristiansand.",
    url: "https://vrsenteret.no/arrangementer/private-fester",
    type: "website",
  }
};

export default function PrivateFesterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Utdrikningslag, Julebord og Bursdag (Private fester)",
    "description": "Planlegg festen, utdrikningslaget eller julebordet med spennende VR-konkurranser og Escape Rooms. Inkluderer partylounge for gruppen din i Kristiansand.",
    "brand": {
      "@type": "Brand",
      "name": "KRS VR Arena"
    },
    "category": "Private Events",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "375",
      "priceCurrency": "NOK",
      "offerCount": "3"
    }
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
          Private fester med VR i Kristiansand
        </h1>
        <p className="mt-4 text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Samle gjengen til en sosial VR-opplevelse med samarbeid, konkurranse og full bevegelse. Perfekt for bursdag og utdrikningslag der dere vil gjøre noe annerledes, aktivt og minneverdig sammen.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/kontakt" className="px-6 py-2.5 rounded-full text-sm font-medium transition-all bg-white text-black hover:bg-zinc-200">
            Send forespørsel
          </Link>
          <Link href="/booking" className="px-6 py-2.5 rounded-full text-sm font-medium transition-all bg-[#9C39FF]/10 text-white border border-[#9C39FF]/30 hover:bg-[#9C39FF]/20">
            Book direkte
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {/* Trust Line */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center text-sm text-zinc-400 bg-zinc-900/50 px-6 py-3 rounded-full border border-white/5">
            2–64 personer &middot; Fra 375 kr per person &middot; Partylounge inkludert &middot; Ingen erfaring nødvendig
          </div>
        </div>

        {/* Pill Menu Navigation */}
        <div className="flex justify-center mb-10 w-full">
          <div className="inline-flex bg-zinc-900/80 p-1 rounded-full border border-white/5">
            <Link href="/arrangementer/private-fester" className="px-6 py-2 rounded-full text-sm font-medium bg-[#9C39FF] text-white shadow-lg">
              Private fester
            </Link>
            <Link href="/arrangementer/firmaevent" className="px-6 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Bedrifter
            </Link>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 flex flex-col">
            <h2 className="text-2xl font-medium tracking-tight mb-4">Utdrikningslag</h2>
            <p className="text-zinc-400 leading-relaxed mb-8 flex-grow">
              Start dagen eller kvelden med en opplevelse som får hele gjengen i gang. Dere spiller på lag, fullfører oppdrag, konkurrerer og skaper øyeblikk det er lett å snakke om resten av feiringen.
            </p>
            <Link href="/kontakt" className="inline-flex items-center text-sm font-medium text-white hover:text-[#9C39FF] transition-colors w-fit">
              Planlegg utdrikningslag <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 flex flex-col">
            <h2 className="text-2xl font-medium tracking-tight mb-4">Bursdag</h2>
            <p className="text-zinc-400 leading-relaxed mb-8 flex-grow">
              En opplevelse som skiller seg ut. Hos KRS VR Arena får gruppa prøve unike VR-opplevelser der alle kan delta, enten de har prøvd VR før eller ikke.
            </p>
            <Link href="/kontakt" className="inline-flex items-center text-sm font-medium text-white hover:text-[#9C39FF] transition-colors w-fit">
              Planlegg bursdag <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Packages Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-light tracking-tighter text-center mb-12">Velg pakke</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pakke 1 */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 flex flex-col relative">
              <h3 className="text-xl font-medium tracking-tight mb-2">Liten gruppe</h3>
              <p className="text-sm text-[#9C39FF] font-medium mb-4">2–8 personer &middot; 90 minutter &middot; 375 kr per person</p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                For små grupper som vil ha en komplett VR-opplevelse med god flyt fra start til slutt. Opptil 8 deltakere kan spille samtidig hos oss.
              </p>
              <div className="space-y-3 mb-8 flex-grow">
                {[
                  "Oppmøte 15 minutter før spillestart",
                  "Ca. 10 minutter forberedelse og introduksjon",
                  "Rundt 45 minutter spilletid",
                  "Unik VR-opplevelse",
                  "Dedikert gamemaster for gruppen",
                  "Gruppebilde",
                  "Gratis vann",
                  "Tilgang til partylounge i 30 minutter etter spillet",
                  "Mulighet til å nyte medbrakt mat og drikke"
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
                For grupper som er flere enn 8 personer. Dere deles i to puljer, slik at alle får spille, samtidig som resten av gruppen kan mingle i partyloungen.
              </p>
              <div className="space-y-3 mb-8 flex-grow">
                {[
                  "Oppmøte 15 minutter før spillestart",
                  "Ca. 10 minutter forberedelse og introduksjon",
                  "To puljer med rundt 45 minutter spilletid per pulje",
                  "Tilgang til partylounge under hele opplegget",
                  "Mulighet til å nyte medbrakt mat og drikke",
                  "De som venter kan høre og følge med på de aktive spillerne fra partyloungen",
                  "Resultater annonseres underveis",
                  "Gruppebilder",
                  "Dedikert gamemaster"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#9C39FF] shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/kontakt" className="w-full py-3 rounded-lg text-sm font-medium transition-all bg-[#9C39FF] text-white hover:bg-[#8b32e6] text-center shadow-lg shadow-[#9C39FF]/20">
                Send forespørsel for medium gruppe
              </Link>
            </div>

            {/* Pakke 3 */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 flex flex-col relative">
              <h3 className="text-xl font-medium tracking-tight mb-2">Stor gruppe</h3>
              <p className="text-sm text-[#9C39FF] font-medium mb-4">17–24 personer &middot; 3,5 timer &middot; 375 kr per person</p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                For større feiringer der dere ønsker en sosial ramme rundt hele opplevelsen. Gruppen deles i tre puljer, og partyloungen brukes som samlingspunkt mellom spillrundene.
              </p>
              <div className="space-y-3 mb-8 flex-grow">
                {[
                  "Oppmøte 15 minutter før spillestart",
                  "Ca. 10 minutter forberedelse og introduksjon",
                  "Tre puljer med rundt 45 minutter spilletid per pulje",
                  "Tilgang til partylounge under hele opplegget",
                  "Mulighet til å nyte medbrakt mat og drikke",
                  "De som venter kan mingle og følge med på spillet fra partyloungen",
                  "Resultater annonseres underveis",
                  "Gruppebilder",
                  "Dedikert gamemaster"
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
          <h2 className="text-3xl md:text-4xl font-light tracking-tighter mb-4">Klar for å samle gjengen?</h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-lg">
            Send oss en forespørsel, så hjelper vi dere med et opplegg som passer antall personer, anledning og ønsket stemning.
          </p>
          <Link href="/kontakt" className="inline-block px-8 py-4 rounded-full text-base font-medium transition-all bg-[#9C39FF] text-white hover:bg-[#8b32e6] shadow-lg shadow-[#9C39FF]/20">
            Send forespørsel
          </Link>
        </div>
      </div>
    </main>
  );
}
