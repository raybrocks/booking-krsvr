import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kjøpsvilkår og bookingbetingelser | KRS VR Arena",
  description:
    "Les kjøpsvilkår og bookingbetingelser for KRS VR Arena i Kristiansand, inkludert 48-timers gratis avbestilling, oppmøtetid og betalingsbetingelser.",
  alternates: {
    canonical: "https://www.krsvr.no/vilkar",
    languages: {
      "nb-NO": "https://www.krsvr.no/vilkar",
      en: "https://www.krsvr.no/en/terms",
      "x-default": "https://www.krsvr.no/en/terms",
    },
  },
  openGraph: {
    title: "Kjøpsvilkår og bookingbetingelser | KRS VR Arena",
    description:
      "Kjøpsvilkår og bookingbetingelser for KRS VR Arena på Lund i Kristiansand.",
    url: "https://www.krsvr.no/vilkar",
    type: "website",
  },
};

const DEFAULT_NORWEGIAN_TERMS = `1. Generell informasjon
Disse vilkårene gjelder for bestilling av VR-opplevelser og arrangementer hos KRS VR Arena AS (Industrigata 12, 4632 Kristiansand, Org.nr. 936 318 878 MVA).

2. Bestilling, priser og betaling
Alle priser for privatkunder og ordinære grupper (2–10 spillere) oppgis i norske kroner (NOK) inkludert merverdiavgift. For bedriftsarrangementer og teambuilding oppgis priser ekskl. mva. Du kan velge å betale ved oppmøte i arenaen med kortterminal (Visa, Mastercard, Apple Pay) eller på nett via Vipps.

3. Avbestilling og endringer (48-timers regel)
Bookinger for ordinære grupper (2–10 spillere) kan endres eller avbestilles kostnadsfritt inntil 48 timer før avtalt starttid via administrasjonslenken i bestillingsbekreftelsen eller ved å kontakte oss på post@krsvr.no. Avbestilling senere enn 48 timer før oppsatt tid kan faktureres eller belastes. Du kan justere antall deltakere (innenfor opplevelsens kapasitet) og oppdatere navneliste helt frem til ankomst.

4. Oppmøte og presisjon
Møt presist for å ikke miste spilletid. Registrering, gjennomgang og sikkerhetsbriefing starter til avtalt klokkeslett. Ved forsinket oppmøte kan aktiv spilletid måtte avkortes av hensyn til etterfølgende bookinger.

5. Sikkerhet, utstyr og alkoholregler
Alle deltakere må følge instruksjoner fra spillvert (gamemaster). Synlig berusede personer vil av sikkerhetshensyn ikke få benytte VR-utstyret. Det er ikke anledning til medbrakt mat og drikke på teambuilding, firmaarrangementer, voksenbursdager (18+) og utdrikningslag. Ved barnebursdager er det tillatt å ta med egen bursdagskake, snacks og brus.

6. Kontaktinformasjon
KRS VR Arena AS · Industrigata 12, 4632 Kristiansand · E-post: post@krsvr.no · Telefon: +47 40 82 83 02.`;

export default async function KjøpsvilkårPage() {
  let terms = DEFAULT_NORWEGIAN_TERMS;

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "general" },
    });
    const generalData = setting?.value as any;
    if (generalData?.termsContent && String(generalData.termsContent).trim().length > 20) {
      terms = String(generalData.termsContent);
    }
  } catch (error) {
    console.error("Error fetching terms on server:", error);
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-24 md:py-32">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-2">
            Kjøpsvilkår
          </h1>
          <p className="text-zinc-400 text-lg">
            Vilkår og betingelser for bestilling hos KRS VR Arena
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-xl backdrop-blur-sm min-h-[400px]">
          <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-headings:font-light prose-headings:text-white whitespace-pre-wrap text-sm md:text-base text-zinc-300">
            {terms}
          </div>
        </div>
      </div>
    </main>
  );
}
