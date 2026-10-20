import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Users, Briefcase, Award, Building2, Coffee, Shield, Zap, Trophy, Beer, Wine } from "lucide-react";
import { Metadata } from "next";
import ArrangementSubNav from "@/components/ArrangementSubNav";
import { ArrangementFaq } from "@/components/ArrangementFaq";

export const metadata: Metadata = {
  title: "VR-teambuilding & Firmaevent i Kristiansand – Kickoff, Julebord & Fest",
  description: "Styrk samholdet med VR-teambuilding i Kristiansand. Perfekt for kickoff, firmafest, julebord og avdelingsdager for 2–64 personer hos KRS VR Arena.",
  keywords: [
    "Teambuilding Kristiansand",
    "Firmaevent Kristiansand",
    "Firmafest Kristiansand",
    "Kick off Kristiansand",
    "Julebord Kristiansand",
    "VR teambuilding",
    "VR firmaevent",
    "Bedriftsaktivitet Kristiansand",
    "Aktivitet for ansatte Kristiansand",
    "Avdelingsfest Kristiansand",
  ],
  openGraph: {
    title: "VR-teambuilding & Firmaevent i Kristiansand | KRS VR Arena",
    description: "Samarbeid og konkurranse i VR for små og store bedrifter (2–64 personer). EHF-faktura, instruktør og lounge.",
    url: "https://www.krsvr.no/arrangementer/vr-teambuilding",
    type: "website",
    images: [
      {
        url: "https://www.krsvr.no/images/vr-teambuilding-firmaevent-kristiansand.jpg",
        width: 1600,
        height: 1200,
        alt: "Stor bedriftsgruppe som feirer vellykket VR-teambuilding i Kristiansand",
      },
    ],
  },
};

export default function VrTeambuildingPage() {
  const faqs = [
    {
      question: "Passer VR-teambuilding for kolleger uten spill- eller teknologierfaring?",
      answer: "Ja, absolutt. Konseptet er utformet spesielt for at alle skal oppleve mestring uansett bakgrunn. Våre erfarne spillverter veileder gruppen gjennom hele opplevelsen og velger oppdrag med fokus på samarbeid, kommunikasjon og bevegelse fremfor komplekse spillkontroller. De som aldri har prøvd VR før, blir ofte de mest engasjerte.",
    },
    {
      question: "Hvor mange deltakere kan være med på et bedriftsarrangement?",
      answer: "Vi tar imot grupper fra 2 til 50 personer (ved forespørsel opptil 64). For grupper opptil 10 personer holder det med 90 minutter, mens grupper fra 10–50 personer har hele lokalet for seg selv i inntil 3 timer med vårt dynamiske turneringsformat, armbånd, storskjerm-spectator og kåring av vinnerlag.",
    },
    {
      question: "Har dere bar og servering til bedrifter?",
      answer: "Ja, ved forhåndsbestilling klargjør vi baren i partyloungen. Dere kan velge mellom to forhåndsbestilte drikkepakker: 1) Øl, cider og mineralvann (Tuborg, Corona, Breezer) eller 2) Kvalitetsvin og bobler fra samme leverandør som Boen Gård. Vi kan også ordne fersk lokal pizza levert til loungen. Komplett prisliste sendes uforpliktende ved bookingforespørsel, og dere velger om alt samles på EHF-faktura eller om baren åpnes for deltakerbetaling.",
    },
    {
      question: "Kan vi ta med medbrakt mat eller drikke?",
      answer: "Nei, det er ikke anledning til medbrakt mat eller drikke til teambuilding og bedriftsarrangementer. Drikkeservering håndteres via våre forhåndsbestilte barkonsepter (kald øl/cider/mineralvann eller kvalitetsvin og bobler), og vi koordinerer gjerne levering av fersk lokal pizza direkte til loungen.",
    },
    {
      question: "Kan bedriften få samlet EHF-faktura?",
      answer: "Ja, vi tilbyr full EHF-fakturering for bedrifter og offentlige virksomheter. Vi kan inkludere både aktivitet, drikke og eventuell mat på samme faktura, merket med deres PO-nummer eller ressursnummer.",
    },
    {
      question: "Blir man uvel eller «bilsyk» av VR hos dere?",
      answer: "Nei, i våre arenaer beveger du deg fritt og fysisk i 1:1 skala i rommet. Dette eliminerer bevegelsessyke (motion sickness) som noen forbinder med eldre, stillesittende VR-teknologi. De aller fleste opplever full komfort fra første minutt.",
    },
    {
      question: "Må vi velge opplevelser eller spill på forhånd?",
      answer: "Nei, det trenger dere ikke. Våre spillverter kjenner opplevelsene best og tilpasser innholdet fortløpende etter gruppens dynamikk, energinivå og ønsker slik at flyten blir optimal og ingen opplever dødtid.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": "VR Teambuilding og Firmaevent hos KRS VR Arena",
        "description": "Engasjerende teambuilding, kickoff og firmaevent for bedrifter i Kristiansand og Agder. 2–64 personer, EHF-faktura og egen partylounge.",
        "brand": {
          "@type": "Brand",
          "name": "KRS VR Arena"
        },
        "category": "Corporate Events",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": 375,
          "highPrice": 375,
          "priceCurrency": "NOK",
          "offerCount": 2
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 4.9,
          "reviewCount": 142
        },
        "subjectOf": {
          "@type": "NewsArticle",
          "headline": "Åpnet VR-arena i Kristiansand: – Nytt konsept på Sørlandet (Deler lokale med dansestudio: Nå fyller de storsalen med virtuell moro)",
          "abstract": "Reportasje i KRS – Avisen Kristiansand fra teambuilding hos KRS VR Arena på Lund, der 17 kolleger fra Verkstedet Spiseri konkurrerte i tre rullerende lag med storskjerm i arenaen (kapasitet 2–64 spillere).",
          "url": "https://www.krs.no/apnet-vr-arena-i-kristiansand-nytt-konsept-pa-sorlandet/s/80-157-40800",
          "datePublished": "2026-10-19T21:49:30+02:00",
          "publisher": {
            "@type": "Organization",
            "name": "KRS - Avisen Kristiansand"
          }
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
            Bedrift &middot; Teambuilding &middot; Julebord &middot; Kickoff
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tighter text-white leading-tight">
            VR Teambuilding og firmaevent i Kristiansand
          </h1>
        </div>

        {/* HERO BILDE – SYNLIG VED FØRSTE ØYEKAST */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-3">
          <Image
            src="/images/vr-teambuilding-firmaevent-kristiansand.jpg"
            alt="Stor bedriftsgruppe som feirer teambuilding hos KRS VR Arena"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-zinc-400 mb-6 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#19EB5B]" />
            Kapasitet fra 2 til 64 personer &middot; EHF-faktura støttes
          </div>
          <div>Møt presist for å ikke miste spilletid.</div>
        </div>

        {/* INTRO TEKST OG CTA UNDER BILDET */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed font-light mb-6">
            Gi kollegene en opplevelse som bygger ekte relasjoner utenfor møterommet. Hos oss må deltakerne kommunisere, fordele roller og samarbeide under tidspress &mdash; med høy energi og mye latter.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/kontakt?type=bedrift"
              className="px-7 sm:px-8 py-3 rounded-full text-sm font-semibold tracking-wide bg-[#9C39FF] hover:bg-[#8A30E0] text-white shadow-[0_0_20px_rgba(156,57,255,0.4)] transition-all hover:scale-105"
            >
              Send firmaforespørsel
            </Link>
            <Link
              href="/booking"
              className="px-7 sm:px-8 py-3 rounded-full text-sm font-medium tracking-wide bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
            >
              Book direkte online
            </Link>
          </div>
        </div>

        {/* 4 ANLEDNINGER I ÉN */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Teambuilding</h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Konkrete oppgaver som krever tillit, tydelig kommunikasjon og rollefordeling for å lykkes.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Kickoff</h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Start et nytt prosjekt eller kvartal med energi, felles latter og en opplevelse alle snakker om.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Firmafest</h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              En uhøytidelig og aktiv programpost som bryter isen på tvers av avdelinger og stillinger.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-4">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Julebord</h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Start julebordet med en spennende opplevelse sammen før middag og fest utover kvelden.
            </p>
          </div>
        </div>

        {/* PASSER FOR ALLE / TRYGGHET FOR ARRANGØREN */}
        <div className="bg-gradient-to-r from-zinc-900/60 via-zinc-900/40 to-zinc-900/60 border border-white/10 rounded-3xl p-8 md:p-12 mb-20">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9C39FF] bg-[#9C39FF]/10 px-3.5 py-1 rounded-full inline-block mb-3">
              Trygghet for arrangøren
            </span>
            <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
              Passer dette for alle hos oss?
            </h2>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6 font-light">
              Mange som planlegger teambuilding er spente på om aktiviteten vil treffe hele avdelingen &mdash; spesielt de som aldri har prøvd VR før, eller kolleger som i utgangspunktet ikke er interessert i gaming.
            </p>
            <div className="space-y-4 text-sm text-zinc-300 font-light">
              <div className="flex items-start gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                <Shield className="w-5 h-5 text-[#9C39FF] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium">Vi velger opplevelsene for dere:</strong> Våre erfarne spillverter skreddersyr og plukker spill som balanserer samarbeid og bevegelse, slik at arrangementet får en naturlig dynamikk og alle opplever mestring, spenning og engasjement &mdash; uansett erfaringsnivå.
                </div>
              </div>
              <div className="flex items-start gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                <Coffee className="w-5 h-5 text-[#9C39FF] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium">Sosialt samspill &ndash; også mellom rundene:</strong> For større grupper roterer lagene, og pausene er like sosiale som spilletiden. Kollegene følger med på hverandres kamper på storskjerm, sjekker egen statistikk på poengtavlen, tar en forfriskning og legger taktikk sammen før neste runde. Det er her latteren og praten virkelig sitter løst.
                </div>
              </div>
              <div className="flex items-start gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                <Users className="w-5 h-5 text-[#9C39FF] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium">En felles opplevelse sammen:</strong> Dette handler ikke om tradisjonell dataspilling alene foran en skjerm. Dere er i samme rom, snakker sammen, heier og løser utfordringene som et lag.
                </div>
              </div>
              <div className="flex items-start gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium">Gode erfaringer og omtale i lokalpressen:</strong> Vår erfaring fra bedriftene som besøker oss (fra kommunale etater som Ingeniørvesenet til serveringssteder og private bedrifter) er at nettopp de som aldri har spilt før, ofte blir mest positivt overrasket.{" "}
                  <a
                    href="https://www.krs.no/apnet-vr-arena-i-kristiansand-nytt-konsept-pa-sorlandet/s/80-157-40800"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9C39FF] hover:text-[#b466ff] underline underline-offset-4 transition-colors"
                  >
                    Les reportasjen i KRS – Avisen Kristiansand
                  </a>{" "}
                  fra da 17 kolleger var inne til rullerende teambuilding hos oss.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TURNERINGSFORMAT FOR STORE GRUPPER */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 md:p-12 mb-20 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9C39FF] bg-[#9C39FF]/10 px-3.5 py-1 rounded-full inline-block mb-3">
                Løsningen for 10–50 personer
              </span>
              <h2 className="text-2xl md:text-4xl font-light text-white mb-4">
                Slik fungerer det: Turneringsformat
              </h2>
              <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
                Mange bedrifter frykter at store grupper må deles opp i lange, adskilte økter. Hos oss deltar hele avdelingen på <strong>samme arrangement hele tiden</strong> gjennom et sosialt og dynamisk turneringsformat.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">10 aktive samtidig i 10-min runder</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Korte, intense økter på ca. 10 minutter med rask rullering mellom 3–4 lag. Ingen blir stående og kjede seg.
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Egne teamnavn på armbånd</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Lagene får fargerike armbånd med egne teamnavn &mdash; enten avdelingsnavnene fra bedriften (IT, Salg, HR, Marked) eller Team Alfa, Beta, Charlie og Delta.
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/10 flex items-center justify-center text-[#9C39FF] mb-4">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Storskjerm & kåring av vinnerlag</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  De som har pustepause følger lagkameratene live på storskjerm og sjekker poengtavlen. På slutten kårer vi vinnerlaget!
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center text-xs sm:text-sm text-zinc-300">
              Alternativt kan vi sette opp Escape Room eller andre opplevelser som gjennomføres i puljer mens det sosiale foregår side om side i loungen.
            </div>
          </div>
        </div>

        {/* FORHÅNDSBESTILT BAR & SERVERING */}
        <div className="bg-gradient-to-r from-zinc-900/60 via-zinc-900/40 to-zinc-900/60 border border-white/10 rounded-3xl p-8 md:p-12 mb-20">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9C39FF] bg-[#9C39FF]/10 px-3.5 py-1 rounded-full inline-block mb-3">
              Servering i partyloungen
            </span>
            <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
              Forhåndsbestilt bar, drikke og pizza
            </h2>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6 font-light">
              Gjør teambuildingen til en komplett sosial kveld. Baren settes opp og fylles ved forhåndsbestilling til arrangementet, slik at alt er ferdig nedkjølt når dere ankommer.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 text-sm text-zinc-300 font-light mb-6">
              <div className="bg-black/30 p-5 rounded-xl border border-white/5 flex items-start gap-3.5">
                <Beer className="w-5 h-5 text-[#9C39FF] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#9C39FF] font-semibold mb-1">Pakke 1 &middot; Uformelt & sosialt</div>
                  <strong className="text-white font-medium text-base block mb-1">Øl, cider og mineralvann</strong>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Kald Tuborg, Corona Extra og Bacardi Breezer samt assortert mineralvann. Vår mest populære og uformelle pakke til teambuilding.
                  </p>
                </div>
              </div>

              <div className="bg-black/30 p-5 rounded-xl border border-white/5 flex items-start gap-3.5">
                <Wine className="w-5 h-5 text-[#9C39FF] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#9C39FF] font-semibold mb-1">Pakke 2 &middot; Vin og bobler</div>
                  <strong className="text-white font-medium text-base block mb-1">Kvalitetsvin og bobler</strong>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Håndplukkede viner og musserende bobler fra samme anerkjente leverandør som Boen Gård. Ypperlig for jubileer og feiringer etter spillet.
                  </p>
                </div>
              </div>

              <div className="bg-black/30 p-5 rounded-xl border border-white/5 flex items-start gap-3.5">
                <Coffee className="w-5 h-5 text-[#9C39FF] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium text-base block mb-1">Varm pizza til loungen</strong>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Vi koordinerer fersk, lokal pizzalevering direkte til partyloungen etter at spillet er over, slik at dere kan samles til et hyggelig måltid.
                  </p>
                </div>
              </div>

              <div className="bg-black/30 p-5 rounded-xl border border-white/5 flex items-start gap-3.5">
                <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium text-base block mb-1">Prisliste & oppgjør</strong>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Full prisliste mottas ved bookingforespørsel. Dere velger om bedriften dekker drikken samlet på EHF-faktura, eller om vi åpner baren for deltakerbetaling.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 italic text-center">
              * Bar og servering klargjøres ved forhåndsbooking slik at vi har alt ferdig innkjøpt og nedkjølt til dere kommer. Det er ikke anledning til medbrakt mat eller drikke.
            </p>
          </div>
        </div>

        {/* FORDELER FOR BEDRIFTEN */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 md:p-12 mb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-light text-white text-center mb-8">
              Smidig for bedriften fra start til slutt
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 text-sm text-zinc-300">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                <span><strong>EHF-faktura og firmakort:</strong> Vi sender EHF-faktura direkte til bedriften med deres referanser, eller dere betaler med firmakort ved oppmøte.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                <span><strong>Dedikerte spillverter:</strong> Erfarne instruktører leder arrangementet fra A til Å, sikrer trygghet og god flyt.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                <span><strong>Partylounge og servering:</strong> Gratis kaffe og vann. Mulighet for forhåndsbestilt bar og lokal pizzalevering (ikke anledning til medbrakt mat/drikke).</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#19EB5B] flex-shrink-0 mt-0.5" />
                <span><strong>Fleksibelt deltakerantall:</strong> Dere kan justere navneliste og endelig antall frem mot arrangementet.</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRIS OG PAKKER */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-white mb-4">Pakker for bedrifter</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-10 max-w-2xl mx-auto font-light">
            Vi tilpasser opplegget etter gruppestørrelse med en fast pris på 375 kr + mva per person. For grupper opptil 10 personer holder det med 90 minutter, mens grupper over 10 personer kjøres i turneringsformat og har hele lokalet for seg selv i inntil 3 timer.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left mb-10">
            {/* Pakke 1 */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#9C39FF] font-semibold mb-2">Mindre grupper</div>
                <h3 className="text-2xl font-medium text-white mb-2">Teambuilding 2–10 personer</h3>
                <div className="text-3xl font-bold text-white mb-1">375 kr <span className="text-xs font-normal text-zinc-400">+ mva / pers</span></div>
                <div className="text-xs text-zinc-400 mb-6">90 minutter totalopplevelse (ca. 60 min spill + briefing)</div>
                <ul className="text-xs sm:text-sm text-zinc-300 space-y-2.5 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> Dedikert game master (spillvert) for gruppen</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> Escape Room eller samarbeidsaction tilpasset teamet</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> Storskjerm-spectator, scorecards & premiekåring</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> Mulighet for forhåndsbestilt bar (øl/vin) & pizza</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> Gruppebilde inkludert & gratis kaffe/vann</li>
                </ul>
              </div>
              <Link
                href="/booking"
                className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 text-center text-sm font-medium transition-colors"
              >
                Book teambuilding (2–10 pers)
              </Link>
            </div>

            {/* Pakke 2 */}
            <div className="bg-zinc-900/60 border border-[#9C39FF]/40 rounded-2xl p-8 flex flex-col justify-between relative shadow-[0_0_30px_rgba(156,57,255,0.15)]">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#9C39FF] font-semibold mb-2">Større grupper</div>
                <h3 className="text-2xl font-medium text-white mb-2">Teambuilding 10–50 personer</h3>
                <div className="text-3xl font-bold text-white mb-1">375 kr <span className="text-xs font-normal text-zinc-400">+ mva / pers</span></div>
                <div className="text-xs text-zinc-400 mb-6">Inntil 3 timer totaltid &middot; 120 min aktivt turneringsformat</div>
                <ul className="text-xs sm:text-sm text-zinc-300 space-y-2.5 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> <strong>Hele lokalet for dere selv</strong> (inntil 3 timer)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> Dedikert game master (spillvert) som leder turneringen</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> Turneringsformat med opptil 10 aktive samtidig & armbånd</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> Storskjerm-spectator, scorecards & premiekåring</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> Mulighet for forhåndsbestilt bar (øl/vin) & pizza</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#19EB5B]" /> God tid til mingling, lagtaktikk og felles feiring</li>
                </ul>
              </div>
              <Link
                href="/kontakt?type=bedrift"
                className="w-full py-3 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-center text-sm font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(156,57,255,0.4)]"
              >
                Be om tilbud (10–50 pers) <ArrowRight className="w-4 h-4 inline ml-1.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ SEKSJON FOR AI OG BESØKENDE */}
        <ArrangementFaq
          badge="Ofte stilte spørsmål"
          title="Alt du lurer på om VR Teambuilding"
          subtitle="Svar på praktiske spørsmål om gjennomføring, servering, tilpasning og oppgjør for bedrifter."
          faqs={faqs}
          contactHref="/kontakt?type=bedrift"
          contactLabel="Send en uforpliktende firmaforespørsel"
        />
      </div>
    </main>
  );
}
