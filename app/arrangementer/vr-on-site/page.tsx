import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, MapPin, Truck, Zap, Monitor, Sparkles, HelpCircle } from "lucide-react";
import { Metadata } from "next";
import ArrangementSubNav from "@/components/ArrangementSubNav";
import { ArrangementFaq } from "@/components/ArrangementFaq";

export const metadata: Metadata = {
  title: "VR On-site i Kristiansand & Agder – Vi kommer til dine lokaler",
  description: "Ønsker dere VR-opplevelsen levert direkte til bedriften, konferansen, skolen eller festivalen? KRS VR Arena rigger opp mobil VR-arena on-site i hele Agder.",
  keywords: [
    "VR On-site Kristiansand",
    "Mobil VR arena",
    "VR til bedriften",
    "Konferanseaktivitet Kristiansand",
    "VR event Agder",
    "VR messe Kristiansand",
    "Mobil teambuilding",
    "VR utleie med instruktør",
  ],
  openGraph: {
    title: "VR On-site | Vi kommer til deg | KRS VR Arena",
    description: "Mobil VR-arena rigget opp direkte i deres kantine, konferansesal eller eventlokale i Agder. Komplett rigg med instruktører.",
    url: "https://www.krsvr.no/arrangementer/vr-on-site",
    type: "website",
    images: [
      {
        url: "https://www.krsvr.no/arrangement-hero.jpg",
        width: 1200,
        height: 800,
        alt: "VR On-site levert til bedriftsarrangement og konferanser i Agder",
      },
    ],
  },
};

export default function VrOnSitePage() {
  const faqs = [
    {
      question: "Hvor i Agder kan dere levere VR On-site?",
      answer: "Vi reiser over hele Agder-regionen, inkludert Kristiansand, Arendal, Grimstad, Mandal, Vennesla, Lillesand, Flekkefjord og Farsund. Har dere arrangementer utenfor Agder, tar vi gjerne en prat for å se på mulighetene.",
    },
    {
      question: "Hvilke krav stilles til lokalet vårt?",
      answer: "Vi trenger kun et ryddet, åpent gulvareal og tilgang til vanlige 230V stikkontakter. Arealet tilpasses ønsket antall samtidige spillere (fra ca. 30 til 100+ kvm). Opplegget fungerer like godt i møterom, kantiner, lagerhaller og gymsaler som i store partytelt.",
    },
    {
      question: "Hvor lang tid tar det å rigge opp og ned?",
      answer: "Våre verter ankommer cirka 45–60 minutter før arrangementet starter for oppsett, kalibrering og kvalitetssjekk. Nedrigging etterpå tar cirka 30 minutter og skjer raskt og diskret.",
    },
    {
      question: "Hva slags arrangementer passer mobil VR-arena for?",
      answer: "VR On-site er spesielt populært for fagdager, kickoffs, konferanser, sommerfester i egne lokaler, messer og festivaler der dere ønsker et interaktivt blikkfang med høy energi og stort publikumsengasjement.",
    },
    {
      question: "Følger det med instruktører og spillverter?",
      answer: "Ja, alltid. Vi stiller med erfarne spillverter som tar seg av alt fra opprigg og hygiene til innføring i spillene og veiledning av deltakerne gjennom hele arrangementet.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": "VR On-site hos kunden",
        "serviceType": "Mobile VR Entertainment and Corporate Events",
        "provider": {
          "@type": "EntertainmentBusiness",
          "name": "KRS VR Arena",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Industrigata 12",
            "postalCode": "4632",
            "addressLocality": "Kristiansand",
            "addressCountry": "NO",
          },
        },
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": "Agder",
        },
        "description": "KRS VR Arena leverer komplett mobil VR-arena on-site til konferanser, bedriftslokaler, messer og skoler i Agder.",
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
    <main className="min-h-screen pb-24 pt-12 md:pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Undermeny for arrangementer */}
        <ArrangementSubNav />

        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#9C39FF] bg-[#9C39FF]/10 px-4 py-1.5 rounded-full inline-block mb-4">
            Mobil VR-arena &middot; Vi kommer til deg
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white">
            VR On-site i Kristiansand og Agder
          </h1>
          <p className="mt-4 text-zinc-400 text-base md:text-lg leading-relaxed font-light">
            Skal dere arrangere konferanse, kickoff i egne lokaler, fagdager eller festival? Vi tar med toppmoderne trådløst VR-utstyr og erfarne verter og rigger opp en fullverdig spillarena hos dere.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/kontakt?type=onsite"
              className="px-8 py-3 rounded-full text-sm font-semibold tracking-wide bg-[#9C39FF] hover:bg-[#8A30E0] text-white shadow-[0_0_20px_rgba(156,57,255,0.4)] transition-all hover:scale-105"
            >
              Be om skreddersydd tilbud
            </Link>
            <a
              href="#hva-trengs"
              className="px-8 py-3 rounded-full text-sm font-medium tracking-wide bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
            >
              Hva trengs av lokaler?
            </a>
          </div>
        </div>

        {/* HERO BILDE */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-4">
          <Image
            src="/arrangement-hero.jpg"
            alt="Mobil VR opplevelse levert til bedrifter og arrangementer"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-zinc-400 mb-16 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#19EB5B]" />
            Rigger opp i kantiner, konferansesaler, messehaller og gymsaler
          </div>
          <div>Komplett med instruktører og rigg</div>
        </div>

        {/* DETTE LEVERER VI */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-white">Alt inkludert i leveransen</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mt-2">
              Dere stiller med rommet &mdash; vi ordner all teknologi, sikkerhet og gjennomføring.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Trådløse VR-headset</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Toppmoderne briller med full bevegelsesfrihet uten kabler eller eksterne basestasjoner som tar plass.
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Erfarne spillverter</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Våre instruktører rigger opp, veileder deltakerne, sørger for flyt og håndterer alt av teknisk oppfølging.
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-4">
                <Monitor className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Publikumsvisning</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Mulighet for å koble spillernes synsfelt direkte til storskjerm/TV, slik at tilskuerne kan heie og le sammen.
              </p>
            </div>
          </div>
        </div>

        {/* HVA KREVES AV LOKALE */}
        <div id="hva-trengs" className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 md:p-12 mb-20 scroll-mt-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-light text-white text-center mb-4">
              Hva kreves for en on-site leveranse?
            </h2>
            <p className="text-zinc-400 text-sm text-center mb-8 font-light">
              Teknologien vår er svært fleksibel og kan tilpasses de aller fleste romtyper.
            </p>
            <div className="space-y-4 text-sm text-zinc-300">
              <div className="flex items-start gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Fri gulvflate:</strong> En åpen, ryddig innendørs flate (f.eks. fra ca. 20 m² for mindre opplegg opp til store flater for full action).
                </div>
              </div>
              <div className="flex items-start gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Strøm:</strong> Standard 230V stikkontakt for lading og eventuelt storskjerm.
                </div>
              </div>
              <div className="flex items-start gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Belysning og takhøyde:</strong> Vanlig innendørs kontor-/romlys og normal takhøyde.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRIS & FORESPØRSEL */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-white mb-4">Pris på forespørsel</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Prisen tilpasses varighet, reisevei i Agder og ønsket antall briller og instruktører. Ta kontakt, så gir vi et raskt og uforpliktende pristilbud tilpasset deres arrangement.
          </p>
          <div className="inline-block">
            <Link
              href="/kontakt?type=onsite"
              className="px-10 py-4 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-sm font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(156,57,255,0.4)]"
            >
              Få tilbud på VR On-site <ArrowRight className="w-4 h-4 inline ml-2" />
            </Link>
          </div>
        </div>

        {/* FAQ SEKSJON FOR AI OG BESØKENDE */}
        <ArrangementFaq
          badge="Ofte stilte spørsmål"
          title="Alt du lurer på om VR On-site"
          subtitle="Svar på praktiske spørsmål om lokaler, strøm, reiseavstander i Agder og opprigg."
          faqs={faqs}
          contactHref="/kontakt?type=onsite"
          contactLabel="Spør oss om mobil VR-arena til ditt event"
        />
      </div>
    </main>
  );
}
