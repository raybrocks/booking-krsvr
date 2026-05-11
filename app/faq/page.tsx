"use client";

import React from "react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "motion/react";

const faqs = [
  {
    question: "Er det plass til grupper større enn 8 personer?",
    answer: "Ja, vi tar imot større grupper uten problem. 8 personer kan spille samtidig, så vi deler store grupper opp i flere runder. Mellom hver bruk desinfiseres utstyret vårt grundig. Ta gjerne kontakt med oss via kontaktskjemaet dersom dere er en større gruppe.",
  },
  {
    question: "Må vi ha erfaring med VR fra før av?",
    answer: "Absolutt ikke! Våre opplevelser er utformet for å være intuitive for absolutt alle – uavhengig av tidligere erfaring. Dere får en egen, dedikert gamemaster som gir full opplæring i utstyret før dere begynner, og som er der gjennom hele spillet.",
  },
  {
    question: "Hvor tidlig må vi møte opp?",
    answer: "Vi ber om at dere møter 10 minutter før deres oppsatte starttid. Da rekker vi å registrere dere og kjøre opplæringen i fred og ro, slik at dere ikke mister noe av den verdifulle spilletiden deres.",
  },
  {
    question: "Hva bør jeg ha på meg?",
    answer: "Siden dere vil bevege dere fritt over store VR-arenaer, anbefaler vi komfortable klær, som for eksempel en t-skjorte, og flate sko. Dersom dere vanligvis bruker briller, anbefaler vi på det sterkeste å bruke kontaktlinser i stedet, slik at dere får den beste opplevelsen i VR-brillene.",
  },
  {
    question: "Finnes det egne tilbud eller rabatter?",
    answer: "Ja, ved forespørsel gir vi 10% rabatt for barn til og med 14 år, og 20% studentrabatt på alle dager unntatt fredag og lørdag (for grupper på minimum 3 personer). Booking via nettsidene kan gjøres i sin helhet, og vi refunderer rabattsummen dersom dere informerer oss om rabatten på forhånd eller før dere spiller.",
  },
  {
    question: "Hvordan fungerer avbooking?",
    answer: "Dere har mulighet til å avbooke kostnadsfritt inntil 48 timer før den oppsatte spilltiden deres. Avbestiller dere innenfor 48-timers fristen gjelder andre retningslinjer, de fullstendige vilkårene er tilgjengelige under booking.",
  }
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20 relative overflow-hidden">
      {/* Background flourishes */}
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-6">
            Ofte Stilte Spørsmål
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            Her finner du svar på de vanligste spørsmålene. Finner du ikke svar på det du leter etter, ta gjerne <Link href="/kontakt" className="text-[#9C39FF] hover:text-white transition-colors underline underline-offset-4">kontakt med oss</Link>.
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-zinc-950/80 border border-zinc-800/50 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-white/5 last:border-0 px-2 py-2">
                <AccordionTrigger className="text-left text-lg md:text-xl font-medium text-zinc-100 hover:text-white hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 text-base md:text-lg leading-relaxed pt-2 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </main>
  );
}
