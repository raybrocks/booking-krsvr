import React from "react";
import { Metadata } from "next";
import { FaqClient } from "./FaqClient";

const faqs = [
  {
    question: "Er det plass til grupper større enn 8 personer?",
    answer: "Ja, vi tar imot opptil 64 personer! Opptil 10 personer kan spille samtidig i vårt sosiale turneringsformat. Mens én gruppe spiller, følger resten med på storskjerm (spectator), sjekker scorecards og slapper av i partyloungen. Ved forhåndsbestilling tilbyr vi egne barkonsepter (øl/cider eller vin/bobler) og lokal pizzalevering.",
  },
  {
    question: "Kan vi ha med egen mat, kake eller drikke?",
    answer: "Ved barnebursdager er dere hjertelig velkomne til å ta med egen bursdagskake, godteri og brus til partyloungen. For teambuilding, firmaarrangementer og utdrikningslag er det ikke anledning til medbrakt mat og drikke – her tilbyr vi i stedet forhåndsbestilte drikkepakker (kald øl/cider/mineralvann eller kvalitetsvin og bobler) og koordinerer levering av fersk, varm lokal pizza direkte til loungen.",
  },
  {
    question: "Hva er inkludert i prisen?",
    answer: "Prisen inkluderer en totalopplevelse på 90 minutter. Dette består av forberedelse og introduksjon, rundt 60 minutter aktiv in-game session i VR, gruppebilder etter endt spill, og gratis vann. I tillegg har dere tilgang til partyloungen etter spillet. Ved barnebursdager kan dere ta med egen kake, mens for bedrifter og utdrikningslag tilbyr vi forhåndsbestilt bar og pizzalevering (ikke anledning til medbrakt mat/drikke).",
  },
  {
    question: "Må vi ha erfaring med VR fra før av?",
    answer: "Absolutt ikke! Våre opplevelser er utformet for å være intuitive for absolutt alle – uavhengig av tidligere erfaring. Dere får en egen, dedikert gamemaster som gir full opplæring i utstyret før dere begynner, og som er der gjennom hele spillet.",
  },
  {
    question: "Hvor tidlig må vi møte opp?",
    answer: "Møt presist for å ikke miste spilletid. Vi starter med registrering og introduksjon til oppsatt tid, slik at dere får maksimal tid inne i den virtuelle arenaen.",
  },
  {
    question: "Hva bør jeg ha på meg?",
    answer: "Siden dere vil bevege dere fritt over store VR-arenaer i full bevegelse, anbefaler vi komfortable klær (som for eksempel en t-skjorte) og flate sko. Dersom dere vanligvis bruker briller, anbefaler vi på det sterkeste å bruke kontaktlinser i stedet da dette gir den desidert beste opplevelsen i VR-brillene.",
  },
  {
    question: "Finnes det egne tilbud eller rabatter?",
    answer: "Ja, ved forespørsel gir vi 10% rabatt for barn til og med 14 år, og 20% studentrabatt på alle dager unntatt fredag og lørdag (for grupper på minimum 3 personer). Booking via nettsidene kan gjøres i sin helhet, og vi refunderer rabattsummen dersom dere informerer oss om rabatten på forhånd eller før dere spiller.",
  },
  {
    question: "Hvordan fungerer avbooking?",
    answer: "Dere har mulighet til å avbooke kostnadsfritt inntil 48 timer før den oppsatte spilltiden deres. Avbestiller dere innenfor 48-timers fristen gjelder andre retningslinjer, de fullstendige vilkårene er tilgjengelige under booking.",
  },
  {
    question: "Tilbyr dere parkering?",
    answer: "Ja, vi ligger sentralt plassert på Lund i Kristiansand og tilbyr gratis gateparkering til våre gjester.",
  },
  {
    question: "Holder dere åpent i skoleferier og på helligdager?",
    answer: "Ja, vi har åpent gjennom ferier og helger hele året (inkludert jule- og nyttårsferien, vinterferien, påskeferien, sommerferien og inneklemte dager). Vi tilbyr et bredt utvalg av opplevelser – fra utfordrende VR Escape Rooms og intense skytespill for vennegjenger, studenter og bedrifter, til egne familiepakker. Sjekk bookingsiden for tilgjengelige tider.",
  },
  {
    question: "Passer KRS VR Arena som innendørs aktivitet når det regner i Kristiansand?",
    answer: "Absolutt! Vår 140 kvm store trådløse arena er en av Kristiansands mest populære innendørs aktiviteter. Her er dere i full aktivitet med dedikert gamemaster, uavhengig av vær og vind – perfekt for vennegjenger, studenter, kollegaer og familier.",
  },
  {
    question: "Hva er Familiepakke Barn og Familiepakke Ungdom?",
    answer: "For familier som ønsker en samlet opplevelse tilbyr vi to egne pakker: Familiepakke Barn (8–12 år) med trygge, engasjerende spill barna mestrer, og Familiepakke Ungdom (12+) med mer action, samarbeidsoppdrag og konkurranser for tenåringer og voksne. Begge inkluderer 90 minutters opplegg med gamemaster og partylounge.",
  }
];

export const metadata: Metadata = {
  title: "FAQ - Ofte stilte spørsmål",
  description: "Få svar på de vanligste spørsmålene om våre VR-opplevelser, inkludert grupper, utstyr, ferier, aldersgrense og booking.",
  keywords: [
    "FAQ VR Kristiansand", 
    "Ofte stilte spørsmål KRS VR Arena", 
    "VR aldersgrense", 
    "VR utstyr", 
    "Spørsmål og svar VR",
    "Innendørs aktivitet Kristiansand",
    "Ting å gjøre i Kristiansand",
    "VR ferieaktivitet",
    "Familiepakke VR"
  ],
  openGraph: {
    title: "FAQ - Ofte stilte spørsmål | KRS VR Arena",
    description: "Få svar på de vanligste spørsmålene om våre VR-opplevelser, grupper, ferieåpning, aldersgrenser og booking.",
    url: "https://www.krsvr.no/faq",
    type: "website",
  }
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <main className="min-h-screen bg-black pt-16 pb-20 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background flourishes */}
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <FaqClient faqs={faqs} />
      </div>
    </main>
  );
}
