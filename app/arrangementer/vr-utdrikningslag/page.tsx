import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Flame, Trophy, GlassWater, Camera, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import ArrangementSubNav from "@/components/ArrangementSubNav";
import { ArrangementFaq } from "@/components/ArrangementFaq";

export const metadata: Metadata = {
  title: "VR-utdrikningslag i Kristiansand – Bachelor & Bachelorette Party",
  description: "Planlegger du utdrikningslag i Kristiansand? Samle gjengen til en engasjerende VR-opplevelse med action, latter og samarbeid. Bachelor & Bachelorette party in Kristiansand.",
  keywords: [
    "Utdrikningslag Kristiansand",
    "Bachelor party Kristiansand",
    "Bachelorette party Kristiansand",
    "Stag party Kristiansand",
    "Hen party Kristiansand",
    "Hen party Norway",
    "Utdrikningslag for jenter",
    "Utdrikningslag for menn",
    "Utdrikkingslag Kristiansand",
    "Aktivitet utdrikningslag Kristiansand",
    "VR utdrikningslag",
  ],
  openGraph: {
    title: "VR-utdrikningslag i Kristiansand | Bachelor & Bachelorette Party",
    description: "Det perfekte innslaget i utdrikningslaget. Action, samarbeid og feiring i Kristiansand.",
    url: "https://www.krsvr.no/arrangementer/vr-utdrikningslag",
    type: "website",
    images: [
      {
        url: "https://www.krsvr.no/images/vr-utdrikningslag-kristiansand.jpg",
        width: 1600,
        height: 1200,
        alt: "Festkledd gjeng som feirer utdrikningslag i VR-arenaen i Kristiansand",
      },
    ],
  },
};

export default function VrUtdrikningslagPage() {
  const faqs = [
    {
      question: "Passer dette for både herre- og damegjenger (bachelor & bachelorette)?",
      answer: "Ja, absolutt! De fleste utdrikningslagene hos oss er guttegjenger som vil ha action, skytespill og lagkamper, men vi har også mange jentegjenger og miksede grupper som elsker samarbeidsoppdrag og Escape Rooms. Opplegget tilpasses alltid stemningen og energinivået dere ønsker.",
    },
    {
      question: "Hva slags klær og sko bør vi ha på?",
      answer: "Vanlige klær og behagelige innesko eller sneakers er helt perfekt. Dere trenger ikke skifte til treningstøy. Har brudgommen eller bruden et morsomt kostyme, går det helt fint så lenge det er trygt å bevege seg i.",
    },
    {
      question: "Kan vi nyte forfriskninger eller sprette bobler hos dere?",
      answer: "Ja! Ved forhåndsbestilling kan dere velge mellom to drikkepakker til partyloungen: enten kald øl/cider/mineralvann eller håndplukkede viner og bobler. Komplett prisliste sendes uforpliktende ved forespørsel.",
    },
    {
      question: "Kan vi ta med medbrakt mat eller drikke?",
      answer: "Nei, det er ikke anledning til medbrakt mat eller drikke til utdrikningslag. Vi klargjør gjerne partyloungen med våre forhåndsbestilte drikkepakker (kald øl/cider/mineralvann eller kvalitetsvin og bobler) samt varm, lokal pizzalevering.",
    },
    {
      question: "Hvor tidlig må vi møte opp?",
      answer: "Møt presist for å ikke miste spilletid. Vi starter med en kort briefing og utstyrsgjennomgang til oppsatt tid, slik at dere får maksimal tid inne i den virtuelle arenaen.",
    },
    {
      question: "Kan gravide eller brillebrukere delta?",
      answer: "Brillebrukere kan fint ha på sine vanlige briller inne i VR-headsettene (vi har god plass), men kontaktlinser gir den aller beste komforten. Gravide kan fint delta på våre roligere samarbeids- og escape room-opplevelser – snakk gjerne med oss i forkant så tilpasser vi.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": "VR Utdrikningslag hos KRS VR Arena",
        "description": "Skreddersydd utdrikningslag, bachelor party og bachelorette party i Kristiansand. Samarbeids-VR, action, lagkonkurranser og partylounge.",
        "brand": {
          "@type": "Brand",
          "name": "KRS VR Arena"
        },
        "category": "Bachelor and Bachelorette Parties",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": 450,
          "highPrice": 450,
          "priceCurrency": "NOK",
          "offerCount": 1
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 5.0,
          "reviewCount": 96
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
            Bachelor & Bachelorette Party &middot; Kristiansand
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tighter text-white leading-tight">
            VR Utdrikningslag i Kristiansand
          </h1>
        </div>

        {/* HERO BILDE – SYNLIG VED FØRSTE ØYEKAST */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-3">
          <Image
            src="/images/vr-utdrikningslag-kristiansand.jpg"
            alt="Stor og glad gjeng som feirer i VR-arenaen i Kristiansand"
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
          <div>Partylounge til disposisjon før og etter spillet</div>
        </div>

        {/* INTRO TEKST OG CTA UNDER BILDET */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed font-light mb-6">
            Det ideelle stoppestedet mellom lunsj og kvelden videre. Hos KRS VR Arena får hovedpersonen og hele vennegjengen en felles opplevelse som <strong className="font-semibold text-white">begeistrer</strong> &mdash; fylt med action, lagkonkurranser og god stemning.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/booking"
              className="px-7 sm:px-8 py-3 rounded-full text-sm font-semibold tracking-wide bg-[#9C39FF] hover:bg-[#8A30E0] text-white shadow-[0_0_20px_rgba(156,57,255,0.4)] transition-all hover:scale-105"
            >
              Book for gjengen
            </Link>
            <Link
              href="/kontakt?type=utdrikningslag"
              className="px-7 sm:px-8 py-3 rounded-full text-sm font-medium tracking-wide bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
            >
              Spør oss om opplegg
            </Link>
          </div>
        </div>

        {/* HVORFOR VELGE VR TIL UTDRIKNINGSLAG */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-8 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-5">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Alle spiller sammen</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Ingen blir stående utenfor. Enten dere velger lagkamper, actionfylte skytespill eller felles Escape Room, deltar alle på like vilkår uavhengig av tidligere erfaring.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-8 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-5">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Ingen klesskift nødvendig</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Dere trenger verken treningstøy eller ekstra klesskift. Møt opp i vanlige klær eller kostyme, ta på behagelige innesko eller sneakers til spillingen, og dra rett videre til kveldens program etterpå.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-8 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-5">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Minner og gruppebilde</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Vår spillvert tar gjerne morsomme gruppebilder og videoer med utstyret på, slik at dere har gode minner (og videomateriale) til talene og storskjermen i bryllupet.
            </p>
          </div>
        </div>

        {/* GALLERI OG STEMNING */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 md:p-12 mb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/images/vr-vennegjeng.jpg"
                alt="Vennegjeng som koser seg i utdrikningslag"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9C39FF] bg-[#9C39FF]/10 px-3.5 py-1 rounded-full inline-block mb-3">
                Forloverens favoritt
              </span>
              <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
                Enkelt å planlegge, garantert god stemning
              </h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6 font-light">
                Som forlover har du nok å holde styr på. Hos oss får du en ferdig rigget opplevelse der verten tar hånd om alt fra introduksjon til spillflyt. Dere møter opp, har det kjempegøy, og kan slappe av i loungen etterpå.
              </p>
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#19EB5B]" /> Egen dedikert gamemaster for gruppen
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#19EB5B]" /> <strong>Forhåndsbestilt bar:</strong> Velg mellom pakke med kald øl/cider eller vin & bobler for å skåle for bruden eller brudgommen! Prisliste på forespørsel.
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#19EB5B]" /> <strong>Lokal pizzalevering:</strong> Varm pizza levert til loungen (ikke anledning til medbrakt mat/drikke)
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#19EB5B]" /> Sentral beliggenhet i Kristiansand (Lund)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INTERNASJONALE GJESTER / BACHELOR & BACHELORETTE INFO */}
        <div className="border border-white/5 bg-black/40 rounded-2xl p-6 text-center max-w-2xl mx-auto mb-16 text-zinc-400 text-xs sm:text-sm">
          <p>
            Planning a <strong>Bachelor party</strong> or <strong>Bachelorette party</strong> in Kristiansand? All our games and gamemasters fully support English. Feel free to contact us or book directly online.
          </p>
        </div>

        {/* PRIS OG BOOKING */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-white mb-4">Priser for utdrikningslag</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Enkel kuvertpris som inkluderer full spilletid, instruktør, partylounge og gruppebilde.
          </p>
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 text-center max-w-md mx-auto">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">Fra 450 kr</div>
            <div className="text-xs uppercase tracking-wider text-[#9C39FF] font-medium mb-6">per person &middot; Varighet: 1,5–3 timer</div>
            <Link
              href="/booking"
              className="w-full flex items-center justify-center h-12 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-sm font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(156,57,255,0.4)]"
            >
              Sikre tidspunktet nå <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* FAQ SEKSJON FOR AI OG BESØKENDE */}
        <ArrangementFaq
          badge="Ofte stilte spørsmål"
          title="Alt du lurer på om VR Utdrikningslag"
          subtitle="Svar på praktiske spørsmål om kleskode, oppmøte, forfriskninger og tilpasning for brud og brudgom."
          faqs={faqs}
          contactHref="/kontakt?type=utdrikningslag"
          contactLabel="Spør oss om opplegg for utdrikningslag"
        />
      </div>
    </main>
  );
}
