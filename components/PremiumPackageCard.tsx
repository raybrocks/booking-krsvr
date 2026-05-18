"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PremiumPackageCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-8 bg-zinc-900/60 border border-[#9C39FF]/40 rounded-2xl p-8 lg:p-12 shadow-[0_0_40px_rgba(156,57,255,0.1)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9C39FF]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10 grid lg:grid-cols-2 gap-12">
        <div>
          <h3 className="text-3xl font-medium tracking-tight mb-2">Privat dagsevent</h3>
          <p className="text-[#9C39FF] font-medium mb-6">10–64 personer &middot; Inntil 8 timer &middot; Privat leie av hele lokalet</p>
          
          <div className="text-zinc-300 space-y-4 mb-6 leading-relaxed">
            <p>
              For grupper og bedrifter som vil ha hele KRS VR Arena for seg selv. Dette er pakken for dere som vil lage en større samling, fest, firmaevent, bursdag, utdrikningslag eller sosial dag med VR-opplevelser, mat, mingling og god tid sammen.
            </p>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden"
                >
                  <p>
                    Med Privat dagsevent får dere eksklusiv tilgang til hele lokalet i inntil 8 timer. Gruppen kan kose seg gjennom dagen med ubegrensede VR-opplevelser, hvor hvert spill varer i inntil 45 minutter. Opptil 8 personer spiller VR samtidig, mens resten av gruppen kan mingle, spise, drikke og følge stemningen i lokalet.
                  </p>
                  <p>
                    Dere får tilgang til partylounge, spiserom med tekjøkken hvor vi kan rigge langbord, garderobe og toaletter. Lokalet har musikk og skjermer, og passer godt for grupper som ønsker en sosial og fleksibel ramme rundt arrangementet.
                  </p>
                  <p>
                    Vi stiller med eventansvarlig som kan bistå med koordinering av mat, drikke og eventuelt ekstra utstyr. Under selve arrangementet får dere egen gamemaster som følger dere gjennom dagen og hjelper gruppen med VR-opplevelsene.
                  </p>
                  <p>
                    Dette er et godt valg for dere som vil arrangere en større fest, firmaevent, privat samling eller heldagsopplevelse hvor hele lokalet er reservert for deres gruppe.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-[#9C39FF] hover:text-[#8b32e6] transition-colors mb-8"
          >
            {isExpanded ? (
              <>Vis mindre <ChevronUp className="ml-1 w-4 h-4" /></>
            ) : (
              <>Les mer <ChevronDown className="ml-1 w-4 h-4" /></>
            )}
          </button>

          <div className="mb-8 p-6 bg-black/40 rounded-xl border border-white/5">
            <h4 className="text-lg font-medium mb-4">Totalpris for leie av lokaler og spill, inkludert MVA</h4>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-zinc-400">Mandag–tirsdag:</div>
              <div className="font-medium text-white text-right">17 400 kr</div>
              <div className="text-zinc-400">Onsdag–torsdag:</div>
              <div className="font-medium text-white text-right">20 300 kr</div>
              <div className="text-zinc-400">Fredag:</div>
              <div className="font-medium text-white text-right">22 000 kr</div>
              <div className="text-zinc-400">Lørdag:</div>
              <div className="font-medium text-white text-right">30 200 kr</div>
              <div className="text-zinc-400">Søndag:</div>
              <div className="font-medium text-white text-right">24 500 kr</div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Link href="/kontakt" className="inline-block px-12 py-4 rounded-full text-base font-medium transition-all bg-[#9C39FF] text-white hover:bg-[#8b32e6] text-center shadow-[0_0_15px_rgba(156,57,255,0.3)] hover:scale-105">
              Send forespørsel
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400 text-center">
            Fortell oss ønsket dato, antall personer og type arrangement, så hjelper vi dere med å sette opp et passende opplegg.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-medium tracking-tight mb-6">Inkludert i pakken</h4>
          <div className="space-y-4">
            {[
              "Privat leie av hele lokalet i inntil 8 timer",
              "Passer for 10–64 personer",
              "Opptil 8 personer kan spille VR samtidig",
              "Ubegrensede VR-opplevelser i 8 timer for deres selskap",
              "Hver runde varer i inntil 45 minutter",
              "Tilgang til partylounge",
              "Tilgang til spiserom med tekjøkken",
              "Mulighet for langbord",
              "Garderobe og toaletter",
              "Musikk og skjermer i lokalet",
              "Mulighet for medbrakt mat og drikke etter avtale",
              "Eventansvarlig som bistår med koordinering",
              "Egen gamemaster gjennom arrangementet"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <Check className="w-6 h-6 text-[#9C39FF] shrink-0" />
                <span className="text-base text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
