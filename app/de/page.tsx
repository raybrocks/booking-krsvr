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
  Users,
  Clock,
  CloudRain,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toApproxEur } from "@/lib/currency";

export const metadata: Metadata = {
  title: {
    absolute:
      "KRS VR Arena Kristiansand | VR Escape Rooms & Familien-Aktivitäten in Südnorwegen",
  },
  description:
    "Kabellose Free-Roam VR Escape Rooms, Action-Spiele und Familienpakete (ab 8 Jahren) in Kristiansand, Norwegen. Nur 5 Min. vom Fährhafen (Color Line / Fjord Line). Viele Spiele auf Deutsch & Englisch. 0 NOK Vorauszahlung online.",
  keywords: [
    "Kristiansand Aktivitäten",
    "Kristiansand bei Regen",
    "Ausflugsziele Kristiansand Familie",
    "Indoor Aktivitäten Kristiansand",
    "VR Escape Room Kristiansand",
    "Südnorwegen Urlaub mit Kindern",
    "Was tun in Kristiansand",
    "KRS VR Arena Deutsch",
  ],
  alternates: {
    canonical: "https://www.krsvr.no/de",
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
      "KRS VR Arena Kristiansand | VR Escape Rooms & Familien-Erlebnisse",
    description:
      "300 m² Indoor-VR-Arena in Kristiansand — 5 Min. vom Fährhafen. Viele Spiele auf Deutsch & Englisch. Online reservieren ohne Vorauszahlung (0 NOK).",
    url: "https://www.krsvr.no/de",
    siteName: "KRS VR Arena",
    locale: "de_DE",
    type: "website",
  },
};

const germanFaqs = [
  {
    question: "Auf welcher Sprache sind die Spiele und die Einweisung?",
    answer:
      "Unsere Gamemaster begrüßen und begleiten Sie herzlich auf Englisch. Im VR-Headset selbst können viele unserer beliebtesten VR Escape Rooms und Familienspiele direkt auf Deutsch (oder Englisch) eingestellt werden.",
  },
  {
    question: "Wie funktioniert die Buchung und Bezahlung für Urlauber aus Deutschland, Österreich oder der Schweiz?",
    answer:
      "Sie buchen Ihren Wunschtermin über unser englisches Buchungssystem (/en/booking). Dort ist „Pay on arrival in the arena (0 NOK upfront)“ bereits voreingestellt. Sie zahlen online nichts im Voraus und begleichen den Betrag bequem bei Ankunft vor Ort per Karte (Visa, Mastercard, Apple Pay oder EC/Debitkarte).",
  },
  {
    question: "Ab welchem Alter können Kinder mitspielen?",
    answer:
      "Unsere Familienpakete sind ab 8 Jahren konzipiert (Familienpaket Kinder 8–12 Jahre sowie Familienpaket Jugend ab 12 Jahren). Eltern, Großeltern und Kinder spielen gemeinsam im selben virtuellen Raum.",
  },
  {
    question: "Wie weit ist die Arena vom Fährhafen (Color Line / Fjord Line) entfernt?",
    answer:
      "Die KRS VR Arena liegt in der Industrigata 12 im zentralen Stadtteil Lund — nur ca. 5 Autominuten vom Fährhafen Kristiansand und der Europastraße E18 sowie ca. 12 Minuten vom Tierpark Kristiansand (Dyreparken) entfernt. Kostenlose Straßenparkplätze befinden sich in direkter Umgebung.",
  },
  {
    question: "Wird einem in der VR-Brille schwindelig (Motion Sickness)?",
    answer:
      "Nein. Da Sie sich in unserer bis zu 143 m² großen Arena physisch zu Fuß bewegen (Free-Roam VR) und Ihre echte Bewegung exakt mit der virtuellen Welt übereinstimmt, tritt keine Reisekrankheit auf. Auch normale Brillen passen problemlos unter das VR-Headset.",
  },
  {
    question: "Kann ich kostenlos stornieren oder die Personenanzahl ändern?",
    answer:
      "Ja, eine kostenlose Stornierung ist bis zu 48 Stunden vor Spielbeginn über den Link in Ihrer Bestätigungs-E-Mail möglich. Die Teilnehmerzahl und Spielernamen können Sie bis zur Ankunft anpassen. Bitte erscheinen Sie pünktlich zur gebuchten Zeit, damit Sie keine Spielzeit verlieren.",
  },
];

export default function GermanLandingPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "EntertainmentBusiness",
      name: "KRS VR Arena",
      description:
        "Kabellose Free-Roam VR Escape Rooms, Action-Strategie (Tactical Arena) und Familienpakete in unserer 300 m² großen Indoor-Arena in Kristiansand, Südnorwegen. Nur 5 Minuten vom Fährhafen entfernt.",
      url: "https://www.krsvr.no/de",
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
      availableLanguage: ["de", "en", "nb"],
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
      mainEntity: germanFaqs.map((f) => ({
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
      title: "Familienpaket Kinder (8–12 Jahre)",
      badge: "Ideal für Familien · Deutsch & Englisch im Spiel",
      description:
        "Sichere, fantasievolle und kooperative Spiele, bei denen Kinder und Erwachsene gemeinsam Aufgaben lösen. Inklusive ruhiger Einweisung durch unseren Gamemaster und 30 Minuten in der Lounge.",
      image: "/images/vr-familiepakke-8-12-aar.jpg",
      bookHref: "/en/booking?opplevelse=cmsq659u60001jymmi71llhxc",
      detailsHref: "/en/experiences/family",
    },
    {
      title: "Familienpaket Jugend (ab 12 Jahren)",
      badge: "Teenager & Eltern · 2–10 Spieler",
      description:
        "Mehr Action, Bogenschießen gegen Trolle & Drachen (Elven Arrows) sowie spannende Team-Herausforderungen für Familien mit Teenagern.",
      image: "/images/vr-familiepakke-ungdom-12pluss.jpg",
      bookHref: "/en/booking?opplevelse=cmsq68v3r0001k2ov6elf8cte",
      detailsHref: "/en/experiences/family",
    },
    {
      title: "VR Escape Rooms (2–10 Spieler)",
      badge: "Viele Räume auf Deutsch spielbar",
      description:
        "Erkunden Sie versunkene Unterwasserstationen (Abyss Vault), brechen Sie gemeinsam aus dem Gefängnis aus (Prison Break) oder lösen Sie mystische Rätsel — komplett kabellos im selben Raum.",
      image: "/images/vr-vennegjeng.jpg",
      bookHref: "/en/booking",
      detailsHref: "/en/experiences/escape-room",
    },
    {
      title: "Tactical Arena & Zombie Shooter",
      badge: "Action & Strategie · Bis zu 10 Spieler gleichzeitig",
      description:
        "Dynamisches Team-Actionspiel auf 143 m² (Tactical Arena, ab 10–12 J.) oder kooperatives Überlebenstraining in Zombie Shooter (ab 18 J.).",
      image: "/images/vr-teambuilding-firmaevent-kristiansand.jpg",
      bookHref: "/en/booking?opplevelse=ztiASgjjGIQsoUXCdNIk",
      detailsHref: "/en/experiences/action-strategy",
    },
  ];

  const priceTiers = [
    { group: "8 – 10 Personen", nok: 375 },
    { group: "5 – 7 Personen", nok: 385 },
    { group: "3 – 4 Personen", nok: 395 },
    { group: "2 Personen", nok: 460 },
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
          <span>🇩🇪 Besucher-Information auf Deutsch</span>
          <span className="text-zinc-600">·</span>
          <span className="text-[#19EB5B] font-medium inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#19EB5B] text-[#19EB5B]" /> 5,0 auf Google & TripAdvisor
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] max-w-4xl mx-auto mb-6">
          VR Escape Rooms & Familien-Erlebnisse in Kristiansand
        </h1>

        <p className="text-base sm:text-xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed mb-8">
          Bewegen Sie sich kabellos und frei zu Fuß durch virtuelle Welten in unserer{" "}
          <strong className="font-semibold text-white">300 m² großen Indoor-Arena</strong> in Kristiansand. Nur 5 Autominuten vom Fährhafen (Color Line & Fjord Line) entfernt — die ideale Aktivität für Familien, Freunde und Regentage in Südnorwegen.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            nativeButton={false}
            render={<Link href="/en/booking" />}
            size="lg"
            className="h-14 px-8 text-base sm:text-lg bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)] transition-all hover:scale-105"
          >
            Auf Englisch buchen (0 NOK Vorauszahlung) <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/en/experiences" />}
            size="lg"
            variant="outline"
            className="h-14 px-8 text-base sm:text-lg border-zinc-700 hover:bg-zinc-800 rounded-full text-white"
          >
            Alle Spiele ansehen (EN)
          </Button>
        </div>

        {/* 4 Key Tourist Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 text-left">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
            <Globe className="w-6 h-6 text-[#9C39FF] mb-2.5" />
            <h2 className="text-sm font-semibold text-white mb-1">
              Spiele auf Deutsch & Englisch
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Herzliche Betreuung auf Englisch durch unsere Gamemaster. Viele VR Escape Rooms bieten deutsche Sprachausgabe im Headset.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
            <CreditCard className="w-6 h-6 text-[#9C39FF] mb-2.5" />
            <h2 className="text-sm font-semibold text-white mb-1">
              0 NOK Vorauszahlung online
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Reservieren Sie online kostenlos und bezahlen Sie erst bei Ankunft in der Arena mit Visa, Mastercard, Apple Pay oder Bar.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
            <Ship className="w-6 h-6 text-[#9C39FF] mb-2.5" />
            <h2 className="text-sm font-semibold text-white mb-1">
              5 Min. vom Fährhafen & E18
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Perfekter Zwischenstopp vor der Fähre nach Hirtshals oder auf dem Weg durch Südnorwegen. Kostenlose Straßenparkplätze.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
            <CloudRain className="w-6 h-6 text-[#9C39FF] mb-2.5" />
            <h2 className="text-sm font-semibold text-white mb-1">
              Perfekt bei jedem Wetter
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              90 Minuten wetterunabhängiges Indoor-Erlebnis inkl. Einweisung, 60 Min. VR-Spielzeit und 30 Min. in unserer gemütlichen Lounge.
            </p>
          </div>
        </div>
      </section>

      {/* Experience Cards */}
      <section className="py-16 bg-zinc-950/60 border-y border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Unsere beliebtesten Erlebnisse für Urlauber & Familien
            </h2>
            <p className="text-zinc-400 font-light">
              Bis zu 10 Personen spielen gleichzeitig in unserer Arena. Vorkenntnisse sind nicht erforderlich.
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
                    Termin wählen (EN) <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Link>
                  <Link
                    href={exp.detailsHref}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs sm:text-sm transition-colors"
                  >
                    Alle Details (EN)
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
                  Preise (90 Min. Gesamterlebnis)
                </h2>
                <p className="text-xs text-zinc-400">
                  Inkl. MwSt. · Der Preis richtet sich automatisch nach der Gruppengröße
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
                      <span className="text-xs font-normal text-zinc-400">/ Pers.</span>
                    </span>
                    <span className="block text-xs text-zinc-400">
                      ca. €{toApproxEur(tier.nok)} pro Person
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed">
              Hinweis: Die Abrechnung vor Ort erfolgt in Norwegischen Kronen (NOK). Die Euro-Angaben dienen als unverbindlicher Richtwert.
            </p>

            <div className="mt-6">
              <Link
                href="/en/booking"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white font-semibold transition-colors shadow-[0_0_20px_rgba(156,57,255,0.4)]"
              >
                Jetzt Wunschtermin reservieren (EN)
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-2xl font-light text-white">
              Das ist in jedem Besuch enthalten:
            </h3>
            <ul className="space-y-3.5">
              {[
                "10–15 Minuten Begrüßung, Registrierung und verständliche Sicherheitseinweisung.",
                "Rund 60 Minuten aktive Spielzeit in kabelloser Virtual Reality.",
                "Persönlicher, englischsprachiger Gamemaster für Ihre Gruppe.",
                "Erinnerungsfotos Ihrer Gruppe nach dem Spiel.",
                "Kostenloses Trinkwasser.",
                "30 Minuten Zugang zu unserer gemütlichen Lounge nach dem Spiel.",
                "Bitte erscheinen Sie pünktlich zur gebuchten Zeit, damit Sie keine Spielzeit verlieren.",
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
                Anfahrt & Parken in Kristiansand
              </div>
              <h2 className="text-3xl font-light text-white">
                Zentral auf Lund — 5 Minuten vom Fährhafen
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
                Sie finden uns in der{" "}
                <strong className="text-white">Industrigata 12, 4632 Kristiansand</strong>. Egal ob Sie gerade mit der Color Line oder Fjord Line aus Hirtshals angekommen sind, auf die Abendfähre warten oder in Südnorwegen Urlaub machen:
              </p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>• <strong className="text-zinc-200">Vom Fährterminal / Zentrum:</strong> ca. 5 Minuten mit dem Auto</li>
                <li>• <strong className="text-zinc-200">Vom Tierpark (Dyreparken):</strong> ca. 12 Minuten über die E18</li>
                <li>• <strong className="text-zinc-200">Parken:</strong> Kostenlose Straßenparkplätze in den umliegenden Straßen</li>
                <li>• <strong className="text-zinc-200">Kontakt:</strong> post@krsvr.no · Tel. +47 40 82 83 02</li>
              </ul>
            </div>

            <div className="bg-zinc-900/40 border border-white/10 p-2 rounded-2xl">
              <iframe
                title="KRS VR Arena Karte Kristiansand"
                width="100%"
                height="320"
                src="https://maps.google.com/maps?width=100%25&height=320&hl=de&q=Industrigata%2012,%204632%20Kristiansand+(KRS%20VR%20Arena)&t=&z=14&ie=UTF8&iwloc=B&output=embed"
                style={{ border: 0, borderRadius: "0.75rem" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* German FAQ */}
      <section className="py-20 container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-light text-white text-center mb-10">
          Häufig gestellte Fragen (FAQ)
        </h2>
        <div className="space-y-4">
          {germanFaqs.map((faq, idx) => (
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
            Wir freuen uns darauf, Sie bei uns in Kristiansand begrüßen zu dürfen!
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/en/booking" />}
            size="lg"
            className="h-14 px-10 text-lg bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)]"
          >
            Weiter zur englischen Buchung <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </main>
  );
}
