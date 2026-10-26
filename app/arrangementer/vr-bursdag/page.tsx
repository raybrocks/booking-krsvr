import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Sparkles, Cake, Users, Clock } from "lucide-react";
import { Metadata } from "next";
import ArrangementSubNav from "@/components/ArrangementSubNav";
import ArrangementTrustBar from "@/components/ArrangementTrustBar";
import { ArrangementFaq } from "@/components/ArrangementFaq";

export const metadata: Metadata = {
  title: "VR-bursdag i Kristiansand – Barnebursdag, Ungdom & Voksne",
  description: "Feir bursdag med en aktiv og sosial VR-opplevelse hos KRS VR Arena i Kristiansand. Tilpassede opplegg for barnebursdag (8–12 år), ungdom og voksne.",
  keywords: [
    "Bursdag Kristiansand",
    "Barnebursdag Kristiansand",
    "Ungdomsbursdag Kristiansand",
    "Bursdagsfeiring Kristiansand",
    "VR Bursdag",
    "VR bursdag Kristiansand",
    "Aktivitet bursdag Kristiansand",
    "Bursdag for voksne Kristiansand",
  ],
  alternates: {
    canonical: "https://www.krsvr.no/arrangementer/vr-bursdag",
    languages: {
      "nb-NO": "https://www.krsvr.no/arrangementer/vr-bursdag",
      en: "https://www.krsvr.no/en/events",
      "x-default": "https://www.krsvr.no/en/events",
    },
  },
  openGraph: {
    title: "VR-bursdag i Kristiansand | KRS VR Arena",
    description: "Samle venner og familie til en feiring dere faktisk husker. Full bevegelse, samarbeid og egen partylounge.",
    url: "https://www.krsvr.no/arrangementer/vr-bursdag",
    type: "website",
    images: [
      {
        url: "https://www.krsvr.no/images/vr-familiepakke-8-12-aar.jpg",
        width: 1600,
        height: 1200,
        alt: "Barn og familie som feirer bursdag i VR-arenaen i Kristiansand",
      },
    ],
  },
};

export default function VrBursdagPage() {
  const faqs = [
    {
      question: "Hva er anbefalt aldersgrense for VR-bursdag?",
      answer: "Anbefalt nedre aldersgrense er 8 år. Vi har spesialtilpassede opplevelser fordelt på aldersgrupper: Barn (8–12 år), ungdom (13–17 år) og voksne. Spillene for de yngste har intuitiv styring og trygge, fartsfylte verdener.",
    },
    {
      question: "Kan vi ta med egen bursdagskake eller bestille mat?",
      answer: "Ja, alle våre bursdagspakker inkluderer 30 minutter i partyloungen etter spillingen. Ved barnebursdager kan dere fritt ta med egen kake, muffins og snacks. For voksenbursdager (18+) er det ikke anledning til medbrakt mat og drikke – her tilbyr vi forhåndsbestilt bar (øl/cider eller vin/bobler) og koordinerer levering av varm pizza fra våre lokale partnere.",
    },
    {
      question: "Er det spillverter til stede som passer på barna?",
      answer: "Ja, alltid. Våre dedikerte spillverter er til stede under hele bursdagen, hjelper alle med briller og utstyr, forklarer reglene og veileder dem underveis slik at foreldrene kan slappe av i loungen.",
    },
    {
      question: "Hvor mange barn kan feire bursdag sammen?",
      answer: "Vi kan ta imot både små og store grupper opptil 64 personer. Mindre grupper (opptil 10 personer) spiller sammen kontinuerlig, mens større grupper rullerer i korte, spennende runder med heiing og pause i partyloungen.",
    },
    {
      question: "Hva bør barna ha på seg?",
      answer: "Vanlige, behagelige klær og flate innesko eller sokker er perfekt. Det blir ofte litt varmt når man lever seg inn i spillet, så t-skjorte anbefales.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": "VR Bursdag hos KRS VR Arena",
        "description": "Feir bursdag med skreddersydde VR-opplevelser for barnebursdag, ungdomsbursdag og voksne bursdager i Kristiansand. Inkluderer spillvert og partylounge.",
        "brand": {
          "@type": "Brand",
          "name": "KRS VR Arena"
        },
        "category": "Birthday Parties",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": 375,
          "highPrice": 460,
          "priceCurrency": "NOK",
          "offerCount": 3
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 4.9,
          "reviewCount": 128
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
          },
        })),
      },
    ],
  };

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
        <div className="text-center max-w-3xl mx-auto mb-4 md:mb-6">
          <span className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-[#9C39FF] bg-[#9C39FF]/10 px-3.5 py-1 rounded-full inline-block mb-2">
            Feiringer for alle aldre
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tighter text-white leading-tight mb-4">
            VR Bursdag i Kristiansand
          </h1>
          <ArrangementTrustBar
            items={[
              "90 min totalopplevelse",
              "Partylounge inkludert",
              "Fra 375 kr/pers"
            ]}
          />
        </div>

        {/* HERO BILDE – SYNLIG VED FØRSTE ØYEKAST */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-3">
          <Image
            src="/images/vr-familiepakke-8-12-aar.jpg"
            alt="Barn og voksne med VR-headset klare for spill i arenaen"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-zinc-400 mb-6 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#19EB5B]" />
            Møt presist for å ikke miste spilletid.
          </div>
          <div>Partylounge inkludert etter spillet</div>
        </div>

        {/* INTRO TEKST OG CTA UNDER BILDET */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed font-light mb-6">
            En aktiv og sosial bursdagsfeiring der alle er med på oppdraget. Hos KRS VR Arena spiller dere sammen på lag, løser gåter og kjemper side om side &mdash; med instruktør og egen partylounge.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/booking"
              className="px-7 sm:px-8 py-3 rounded-full text-sm font-semibold tracking-wide bg-[#9C39FF] hover:bg-[#8A30E0] text-white shadow-[0_0_20px_rgba(156,57,255,0.4)] transition-all hover:scale-105"
            >
              Book bursdag direkte
            </Link>
            <Link
              href="/kontakt?type=bursdag"
              className="px-7 sm:px-8 py-3 rounded-full text-sm font-medium tracking-wide bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
            >
              Send forespørsel
            </Link>
          </div>
        </div>

        {/* 3 ALDERS-SPOR */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white">
              Tilpasset alder og mestringsnivå
            </h2>
            <p className="mt-3 text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Vi veileder gruppen gjennom opplevelsen og sørger for trygge, alderstilpassede spill.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Barn 8-12 */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col group hover:border-white/20 transition-all">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src="/images/vr-familiepakke-8-12-aar.jpg"
                  alt="Barnebursdag 8-12 år i VR"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs uppercase tracking-wider text-[#9C39FF] font-semibold mb-1">
                  8–12 år
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Barnebursdag</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4 flex-grow">
                  Fargerike og morsomme oppdrag med bueskyting, samarbeid og eventyrlige verdener. Tilpasset barn uten tidligere erfaring.
                </p>
                <ul className="text-xs text-zinc-300 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#19EB5B]" /> Trygge, barnevennlige spill
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#19EB5B]" /> Egen spillvert som hjelper alle
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#19EB5B]" /> Foreldre kan heie og ta bilder
                  </li>
                </ul>
              </div>
            </div>

            {/* Ungdom 12+ */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col group hover:border-white/20 transition-all">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src="/images/vr-familiepakke-ungdom-12pluss.jpg"
                  alt="Ungdomsbursdag i VR Kristiansand"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs uppercase tracking-wider text-[#9C39FF] font-semibold mb-1">
                  12–17 år
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Ungdomsbursdag</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4 flex-grow">
                  Actionfylte skytespill, lagkonkurranser og nervepirrende Escape Rooms. En aktivitet tenåringene genuint digger.
                </p>
                <ul className="text-xs text-zinc-300 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#19EB5B]" /> Actionfylte flerspilleropplevelser
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#19EB5B]" /> Konkurranse og felles mestring
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#19EB5B]" /> Fri bevegelse uten kabler
                  </li>
                </ul>
              </div>
            </div>

            {/* Voksne */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col group hover:border-white/20 transition-all">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src="/images/vr-vennegjeng.jpg"
                  alt="Voksenbursdag og vennegjeng i VR"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs uppercase tracking-wider text-[#9C39FF] font-semibold mb-1">
                  18+ år & Rundt tall
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Voksenbursdag</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4 flex-grow">
                  Samle vennegjengen eller familien til en annerledes kveld. Kombiner VR med sosialt samvær i loungen før eller etter middag.
                </p>
                <ul className="text-xs text-zinc-300 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#19EB5B]" /> Escape Room og taktisk action
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#19EB5B]" /> Egen partylounge til disposisjon
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#19EB5B]" /> Forhåndsbestilt bar og pizzalevering
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* LOUNGE & MAT/DRIKKE SEKSJON */}
        <div className="bg-zinc-900/30 border border-white/10 rounded-3xl p-8 md:p-12 mb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9C39FF] bg-[#9C39FF]/10 px-3.5 py-1 rounded-full inline-block mb-3">
                Partylounge inkludert
              </span>
              <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
                Feiring, kake og mat etter spillet
              </h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6 font-light">
                Etter den aktive runden i spillarenaen har bursdagsfølget tilgang til vår egen partylounge i 30 minutter. Her kan dere samles rundt bordet, åpne gaver, spise og prate om opplevelsene.
              </p>
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                  <span><strong>Medbrakt kake ved barnebursdag:</strong> Ved barnebursdager kan dere fritt ta med egen bursdagskake, godteri og brus (ved voksenbursdag 18+ tilbyr vi forhåndsbestilt bar og pizzalevering).</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                  <span><strong>Pizzabestilling:</strong> Vi kan koordinere varm levering av pizza fra lokal leverandør direkte til loungen.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                  <span><strong>Gratis kaffe og vann:</strong> Tilgjengelig for foreldre og gjester under oppholdet.</span>
                </div>
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-center">
              <Cake className="w-12 h-12 text-[#9C39FF] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Praktisk info</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Total tid i lokalet er ca. 90 minutter (klargjøring, ca. 60 min spill og 30 min i partyloungen).
              </p>
              <div className="inline-block bg-white/5 px-4 py-2 rounded-xl text-xs text-zinc-300 border border-white/5">
                Møt presist for å ikke miste spilletid.
              </div>
            </div>
          </div>
        </div>

        {/* PRISER & PAKKER */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-white mb-4">Priser for bursdag</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            En fast pris per person som inkluderer spilltid, utstyr, instruktør, gruppebilde og tilgang til partylounge.
          </p>
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 text-center max-w-md mx-auto">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">Fra 375 kr</div>
            <div className="text-xs uppercase tracking-wider text-[#9C39FF] font-medium mb-6">per deltaker &middot; 90 min totalopplevelse</div>
            <Link
              href="/booking"
              className="w-full flex items-center justify-center h-12 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-sm font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(156,57,255,0.4)]"
            >
              Velg dato og book nå <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* FAQ SEKSJON FOR AI OG BESØKENDE */}
        <ArrangementFaq
          badge="Ofte stilte spørsmål"
          title="Alt du lurer på om VR Bursdag"
          subtitle="Svar på praktiske spørsmål om aldersgrenser, mat og kake, oppmøte og partylounge."
          faqs={faqs}
          contactHref="/kontakt?type=bursdag"
          contactLabel="Send en bursdagsforespørsel"
        />
      </div>
    </main>
  );
}
