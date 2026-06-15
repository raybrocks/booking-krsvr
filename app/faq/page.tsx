import React from "react";
import { Metadata } from "next";
import { FaqClient } from "./FaqClient";

const faqs = [
  {
    question: "Er det plass til grupper større enn 8 personer?",
    answer: "Ja, vi tar imot opptil 64 personer! 8 personer kan spille samtidig, så vi deler større grupper opp i flere puljer. Mens én gruppe spiller, kan resten av gruppen slappe av, mingle og nyte medbrakt mat og drikke i vår partylounge. Ta kontakt med oss for et opplegg som passer for din gruppe.",
  },
  {
    question: "Kan vi ha med egen mat, kake eller drikke?",
    answer: "Absolutt! Alle bookinger inkluderer 30 minutter gratis tilgang til vår partylounge etter spillet, hvor dere kan nyte medbrakt mat, kake og drikke. For medium og store grupper som deles opp i puljer, har dere tilgang til loungen under hele opplegget. Er dere en bedrift kan vi også koordinere pizza via våre lokale leverandører.",
  },
  {
    question: "Hva er inkludert i prisen?",
    answer: "Prisen inkluderer ca. 45-55 minutter aktiv spilltid i VR, en dedikert gamemaster for deres gruppe, gruppebilder etter endt spill, gratis vann, og tilgang til partylounge i 30 minutter etter spillet med mulighet for å nyte medbrakt mat og drikke. Prisene varierer noe basert på gruppestørrelsen – se vår prisoversikt for detaljer.",
  },
  {
    question: "Må vi ha erfaring med VR fra før av?",
    answer: "Absolutt ikke! Våre opplevelser er utformet for å være intuitive for absolutt alle – uavhengig av tidligere erfaring. Dere får en egen, dedikert gamemaster som gir full opplæring i utstyret før dere begynner, og som er der gjennom hele spillet.",
  },
  {
    question: "Hvor tidlig må vi møte opp?",
    answer: "Vi ber om at dere møter 10-15 minutter før deres oppsatte starttid. Da rekker vi å registrere dere og kjøre opplæringen i fred og ro, slik at dere ikke mister noe av den verdifulle spilletiden deres.",
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
  }
];

export const metadata: Metadata = {
  title: "FAQ - Ofte stilte spørsmål",
  description: "Få svar på de vanligste spørsmålene om våre VR-opplevelser, inkludert grupper, utstyr, aldersgrense og booking.",
  keywords: ["FAQ VR Kristiansand", "Ofte stilte spørsmål KRS VR Arena", "VR aldersgrense", "VR utstyr", "Spørsmål og svar VR"],
  openGraph: {
    title: "FAQ - Ofte stilte spørsmål",
    description: "Få svar på de vanligste spørsmålene om våre VR-opplevelser, inkludert grupper, utstyr, aldersgrense og booking.",
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
