import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Globe,
  MapPin,
  Ship,
  Star,
  Clock,
  CloudRain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toApproxEur } from "@/lib/currency";

export const metadata: Metadata = {
  title: {
    absolute:
      "KRS VR Arena Kristiansand | VR Escape Rooms & Gezinsactiviteiten in Zuid-Noorwegen",
  },
  description:
    "Draadloze Free-Roam VR Escape Rooms, actiegames en familiepakketten (vanaf 8 jaar) in Kristiansand, Noorwegen. Slechts 5 min. van de veerboot (Color Line / Fjord Line). Reserveer online met 0 NOK vooraf.",
  keywords: [
    "Kristiansand activiteiten",
    "Wat te doen in Kristiansand",
    "Kristiansand met kinderen",
    "Indoor activiteiten Kristiansand regen",
    "VR Escape Room Kristiansand",
    "Zuid-Noorwegen vakantie gezin",
    "KRS VR Arena Nederlands",
  ],
  alternates: {
    canonical: "https://www.krsvr.no/nl",
    languages: {
      "nb-NO": "https://www.krsvr.no",
      en: "https://www.krsvr.no/en",
      de: "https://www.krsvr.no/de",
      nl: "https://www.krsvr.no/nl",
      "x-default": "https://www.krsvr.no/en",
    },
  },
  openGraph: {
    title:
      "KRS VR Arena Kristiansand | VR Escape Rooms & Gezinsactiviteiten",
    description:
      "300 m² indoor VR-arena in Kristiansand — 5 min. van de veerboot uit Hirtshals. Gratis online reserveren (0 NOK vooraf) en ter plaatse per kaart betalen.",
    url: "https://www.krsvr.no/nl",
    siteName: "KRS VR Arena",
    locale: "nl_NL",
    type: "website",
  },
};

const dutchFaqs = [
  {
    question: "In welke taal zijn de spellen en de begeleiding?",
    answer:
      "Onze gamemasters verwelkomen en begeleiden jullie groep in vloeiend Engels. In de VR-bril zelf zijn alle spellen in het Engels beschikbaar (en veel VR Escape Rooms ook in het Duits en Frans).",
  },
  {
    question: "Hoe werkt het boeken en betalen voor Nederlandse en Belgische gasten?",
    answer:
      "U reserveert uw tijdslot via onze Engelse boekingspagina (/en/booking). Daar staat 'Pay on arrival in the arena (0 NOK upfront)' standaard geselecteerd. U betaalt online niets vooraf en rekent pas bij aankomst in de arena af met uw betaalkaart, creditcard (Visa, Mastercard) of Apple Pay.",
  },
  {
    question: "Vanaf welke leeftijd kunnen kinderen meespelen?",
    answer:
      "Onze familiepakketten zijn speciaal samengesteld voor gezinnen met kinderen vanaf 8 jaar (Familiepakket Kinderen 8–12 jaar en Familiepakket Jeugd 12+). Ouders en kinderen lopen samen vrij rond in dezelfde virtuele wereld.",
  },
  {
    question: "Hoe ver is de arena vanaf de veerboot (Color Line / Fjord Line)?",
    answer:
      "KRS VR Arena ligt aan de Industrigata 12 in de centrale wijk Lund — op slechts 5 minuten rijden van de veerhaven in Kristiansand en de E18, en circa 12 minuten van dierenpark Dyreparken. In de directe omgeving kunt u gratis op straat parkeren.",
  },
  {
    question: "Word je duizelig of misselijk van de VR-bril?",
    answer:
      "Nee. Omdat u in onze tot 143 m² grote arena echt fysiek rondloopt (Free-Roam VR) en uw bewegingen exact overeenkomen met wat u ziet, heeft u geen last van bewegingsziekte. Ook een gewone bril past prima onder de VR-headset.",
  },
  {
    question: "Kunnen we gratis annuleren of het aantal spelers aanpassen?",
    answer:
      "Ja, u kunt tot 48 uur voor aanvang kosteloos annuleren via de link in uw bevestigingsmail. Het aantal deelnemers en de spelersnamen kunt u tot aan uw aankomst aanpassen. Zorg dat u op tijd aanwezig bent zodat u geen speeltijd verliest.",
  },
];

export default function DutchLandingPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "EntertainmentBusiness",
      name: "KRS VR Arena",
      description:
        "Draadloze Free-Roam VR Escape Rooms, actie-strategie (Tactical Arena) en familiepakketten in onze 300 m² grote indoor arena in Kristiansand, Zuid-Noorwegen. Slechts 5 minuten van de veerhaven.",
      url: "https://www.krsvr.no/nl",
      telephone: "+4740828302",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Industrigata 12",
        postalCode: "4632",
        addressLocality: "Kristiansand",
        addressCountry: "NO",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "58.152302",
        longitude: "8.025888",
      },
      availableLanguage: ["en", "de", "nb"],
      offers: {
        "@type": "AggregateOffer",
        offerCount: 10,
        lowPrice: 375,
        highPrice: 460,
        priceCurrency: "NOK",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: 5.0,
        reviewCount: 25,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: dutchFaqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    },
  ];

  const experiences = [
    {
      title: "Familiepakket Kinderen (8–12 jaar)",
      badge: "Ideaal voor gezinnen · 2–10 spelers",
      description:
        "Veilige, fantasierijke en coöperatieve spellen waarin kinderen en ouders samen opdrachten oplossen. Inclusief rustige begeleiding door onze Engelstalige gamemaster en 30 minuten in de lounge.",
      image: "/images/vr-familiepakke-8-12-aar.jpg",
      bookHref: "/en/booking?opplevelse=cmsq659u60001jymmi71llhxc",
      detailsHref: "/en/experiences/family",
    },
    {
      title: "Familiepakket Jeugd (12+ jaar)",
      badge: "Tieners & Ouders · Actie & Samenwerking",
      description:
        "Meer tempo, boogschieten tegen trollen en draken (Elven Arrows) en spannende teammissies voor gezinnen met tieners.",
      image: "/images/vr-familiepakke-ungdom-12pluss.jpg",
      bookHref: "/en/booking?opplevelse=cmsq68v3r0001k2ov6elf8cte",
      detailsHref: "/en/experiences/family",
    },
    {
      title: "VR Escape Rooms (2–10 spelers)",
      badge: "Puzzels & Avontuur · Volledig draadloos",
      description:
        "Verken een gezonken onderwaterstation (Abyss Vault), ontsnap samen uit de gevangenis (Prison Break) of los mystieke raadsels op in grote virtuele werelden.",
      image: "/images/vr-vennegjeng.jpg",
      bookHref: "/en/booking",
      detailsHref: "/en/experiences/escape-room",
    },
    {
      title: "Tactical Arena & Zombie Shooter",
      badge: "Actie & Strategie · Tot 10 spelers tegelijk",
      description:
        "Dynamische team-shooter op 143 m² (Tactical Arena, vanaf 10–12 jaar) of samen overleven in Zombie Shooter (18+).",
      image: "/images/vr-teambuilding-firmaevent-kristiansand.jpg",
      bookHref: "/en/booking?opplevelse=ztiASgjjGIQsoUXCdNIk",
      detailsHref: "/en/experiences/action-strategy",
    },
  ];

  const priceTiers = [
    { group: "8 – 10 personen", nok: 375 },
    { group: "5 – 7 personen", nok: 385 },
    { group: "3 – 4 personen", nok: 395 },
    { group: "2 personen", nok: 460 },
  ];

  return (
    <main className="min-h-screen bg-black text-white pt-10 pb-24 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute top-0 w-full h-[650px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/15 via-black to-black -z-10" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 max-w-5xl text-center pt-4 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs sm:text-sm text-zinc-300 mb-6">
          <span>🇳🇱 Bezoekersinformatie in het Nederlands</span>
          <span className="text-zinc-600">·</span>
          <span className="text-[#19EB5B] font-medium inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#19EB5B] text-[#19EB5B]" /> 5,0 op Google & TripAdvisor
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] max-w-4xl mx-auto mb-6">
          VR Escape Rooms & Gezinsactiviteiten in Kristiansand
        </h1>

        <p className="text-base sm:text-xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed mb-8">
          Loop volledig draadloos en vrij rond in virtuele werelden in onze{" "}
          <strong className="font-semibold text-white">300 m² grote indoor arena</strong> in Kristiansand. Slechts 5 minuten rijden vanaf de veerboot (Color Line & Fjord Line) — het ideale uitje voor gezinnen, vriendengroepen en regenachtige vakantiedagen in Zuid-Noorwegen.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            nativeButton={false}
            render={<Link href="/en/booking" />}
            size="lg"
            className="h-14 px-8 text-base sm:text-lg bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)] transition-all hover:scale-105"
          >
            Boek in het Engels (0 NOK vooraf) <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/en/experiences" />}
            size="lg"
            variant="outline"
            className="h-14 px-8 text-base sm:text-lg border-zinc-700 hover:bg-zinc-800 rounded-full text-white"
          >
            Bekijk alle spellen (EN)
          </Button>
        </div>

        {/* 4 Key Tourist Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 text-left">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
            <Globe className="w-6 h-6 text-[#9C39FF] mb-2.5" />
            <h2 className="text-sm font-semibold text-white mb-1">
              Engelstalige begeleiding
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Persoonlijke ontvangst en uitleg in het Engels door jullie eigen gamemaster. Geen VR-ervaring nodig.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
            <CreditCard className="w-6 h-6 text-[#9C39FF] mb-2.5" />
            <h2 className="text-sm font-semibold text-white mb-1">
              0 NOK vooruitbetaling
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Reserveer uw tijdslot gratis online en betaal pas bij aankomst in de arena met Visa, Mastercard, Apple Pay of pinpas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
            <Ship className="w-6 h-6 text-[#9C39FF] mb-2.5" />
            <h2 className="text-sm font-semibold text-white mb-1">
              5 min. van de veerboot & E18
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Perfecte tussenstop voor of na de overtocht Hirtshals–Kristiansand. Gratis parkeren in de omliggende straten.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
            <CloudRain className="w-6 h-6 text-[#9C39FF] mb-2.5" />
            <h2 className="text-sm font-semibold text-white mb-1">
              Ideale binnenactiviteit
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              90 minuten totaalbeleving inclusief instructie, 60 min. actief spelen in VR en 30 min. nagenieten in onze lounge.
            </p>
          </div>
        </div>
      </section>

      {/* Experience Cards */}
      <section className="py-16 bg-zinc-950/60 border-y border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Populaire ervaringen voor gezinnen & vakantiegangers
            </h2>
            <p className="text-zinc-400 font-light">
              Tot 10 personen spelen tegelijkertijd in onze arena. Geschikt voor zowel beginners als ervaren spelers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {experiences.map((exp) => (
              <div
                key={exp.title}
                className="rounded-3xl bg-zinc-900/50 border border-zinc-800 overflow-hidden flex flex-col justify-between hover:border-[#9C39FF]/50 transition-all"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full bg-zinc-950">
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
                    <span className="absolute top-3.5 left-3.5 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-zinc-200">
                      {exp.badge}
                    </span>
                  </div>
                  <div className="p-6 sm:p-7">
                    <h3 className="text-xl font-medium text-white mb-2">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 sm:px-7 sm:pb-7 flex flex-wrap items-center gap-3">
                  <Link
                    href={exp.bookHref}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#9C39FF] hover:bg-[#8b32e6] text-white text-xs sm:text-sm font-semibold transition-colors"
                  >
                    Kies tijdslot (EN) <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Link>
                  <Link
                    href={exp.detailsHref}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs sm:text-sm transition-colors"
                  >
                    Meer informatie (EN)
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Included */}
      <section className="py-20 container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-7 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-[#9C39FF]" />
              <div>
                <h2 className="text-xl font-medium text-white">
                  Prijzen (90 min. totaalbeleving)
                </h2>
                <p className="text-xs text-zinc-400">
                  Incl. btw · De prijs per persoon past zich automatisch aan uw groepsgrootte aan
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {priceTiers.map((tier) => (
                <div
                  key={tier.group}
                  className="flex items-center justify-between p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60"
                >
                  <span className="font-medium text-zinc-200">{tier.group}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">
                      {tier.nok} NOK{" "}
                      <span className="text-xs font-normal text-zinc-400">/ p.p.</span>
                    </span>
                    <span className="block text-xs text-zinc-400">
                      ca. €{toApproxEur(tier.nok)} per persoon
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed">
              Let op: Betaling in de arena vindt plaats in Noorse kronen (NOK). De eurobedragen zijn een indicatie.
            </p>

            <div className="mt-6">
              <Link
                href="/en/booking"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white font-semibold transition-colors shadow-[0_0_20px_rgba(156,57,255,0.4)]"
              >
                Reserveer nu uw tijdslot (EN)
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-2xl font-light text-white">
              Dit is altijd inbegrepen:
            </h3>
            <ul className="space-y-3.5">
              {[
                "10–15 minuten ontvangst, registratie en rustige veiligheidsinstructie.",
                "Circa 60 minuten actieve speeltijd in draadloze Virtual Reality.",
                "Persoonlijke, Engelstalige gamemaster voor jullie groep.",
                "Groepsfoto's na afloop van het spel.",
                "Gratis drinkwater.",
                "30 minuten toegang tot onze gezellige lounge na het spel.",
                "Zorg dat u op tijd aanwezig bent zodat u geen speeltijd verliest.",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-zinc-900/30 border border-white/5 text-sm text-zinc-300"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#9C39FF] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Location & Directions */}
      <section className="py-16 bg-zinc-950/60 border-y border-white/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#9C39FF] font-semibold">
                <MapPin className="w-4 h-4" />
                Locatie & Parkeren in Kristiansand
              </div>
              <h2 className="text-3xl font-light text-white">
                Centraal op Lund — 5 minuten van de veerhaven
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
                U vindt ons op{" "}
                <strong className="text-white">Industrigata 12, 4632 Kristiansand</strong>. Of u nu net met de Color Line of Fjord Line uit Hirtshals bent aangekomen, nog tijd heeft voor de avondboot of vakantie viert in Zuid-Noorwegen:
              </p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>• <strong className="text-zinc-200">Vanaf de veerboot / centrum:</strong> ca. 5 minuten rijden</li>
                <li>• <strong className="text-zinc-200">Vanaf Dyreparken (dierenpark):</strong> ca. 12 minuten via de E18</li>
                <li>• <strong className="text-zinc-200">Parkeren:</strong> Gratis parkeren in de omliggende straten</li>
                <li>• <strong className="text-zinc-200">Contact:</strong> post@krsvr.no · Tel. +47 40 82 83 02</li>
              </ul>
            </div>

            <div className="bg-zinc-900/40 border border-white/10 p-2 rounded-2xl">
              <iframe
                title="KRS VR Arena Kaart Kristiansand"
                width="100%"
                height="320"
                src="https://maps.google.com/maps?width=100%25&height=320&hl=nl&q=Industrigata%2012,%204632%20Kristiansand+(KRS%20VR%20Arena)&t=&z=14&ie=UTF8&iwloc=B&output=embed"
                style={{ border: 0, borderRadius: "0.75rem" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Dutch FAQ */}
      <section className="py-20 container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-light text-white text-center mb-10">
          Veelgestelde vragen (FAQ)
        </h2>
        <div className="space-y-4">
          {dutchFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80"
            >
              <h3 className="text-lg font-medium text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-zinc-400 mb-6">
            Wij kijken ernaar uit om jullie te verwelkomen bij KRS VR Arena in Kristiansand!
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/en/booking" />}
            size="lg"
            className="h-14 px-10 text-lg bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)]"
          >
            Ga naar de Engelse boekingspagina <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </main>
  );
}
