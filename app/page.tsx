"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  Puzzle, 
  Footprints, 
  Users, 
  Glasses, 
  CalendarHeart, 
  Briefcase, 
  Smile, 
  Info, 
  Clock, 
  Shirt,
  UsersRound
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/15 via-black to-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#9C39FF]/5 rounded-full blur-3xl -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto space-y-6 md:space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300">
            <MapPin className="w-4 h-4 text-[#9C39FF]" />
            Lokalt i Kristiansand
          </div>
          
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white leading-[1.15]">
            VR Escape Rooms og <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">team-opplevelser</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed">
            En sosial VR-opplevelse for grupper. Samarbeid, løs oppdrag eller konkurrer mot hverandre med fri bevegelse i våre store VR-rom.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button render={<Link href="/booking" />} size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)] transition-all hover:scale-105">
              Book opplevelse <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button render={<Link href="/opplevelser" />} size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-zinc-700 hover:bg-zinc-800 rounded-full text-white">
              Se opplevelser
            </Button>
          </div>
        </motion.div>

        {/* 2. Tillitslinje (Trust Line) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 sm:mt-24 w-full max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 px-4"
        >
          <div className="flex flex-col items-center gap-2 text-zinc-400 p-2">
            <Smile className="w-6 h-6 text-[#9C39FF]/70" />
            <span className="text-sm font-medium text-center">Ingen erfaring nødvendig</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-zinc-400 p-2">
            <Info className="w-6 h-6 text-[#9C39FF]/70" />
            <span className="text-sm font-medium text-center">Vi hjelper dere i gang</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-zinc-400 p-2">
            <UsersRound className="w-6 h-6 text-[#9C39FF]/70" />
            <span className="text-sm font-medium text-center">Perfekt for grupper</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-zinc-400 p-2">
            <Footprints className="w-6 h-6 text-[#9C39FF]/70" />
            <span className="text-sm font-medium text-center">Store frie VR-rom</span>
          </div>
        </motion.div>
      </section>

      {/* 3. Seksjon: Velg opplevelse */}
      <section className="py-24 bg-zinc-950/50 border-y border-white/5 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight">Velg deres opplevelse</h2>
            <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto">
              Vi tilbyr to hovedtyper opplevelser som begge er designet for at dere skal ha det supert sammen i VR.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Kort A: VR Escape Rooms */}
            <div className="group rounded-3xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden hover:bg-zinc-900 transition-colors flex flex-col">
              <div className="h-56 bg-zinc-800 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9C39FF]/20 to-black/20 mix-blend-overlay"></div>
                <Puzzle size={56} className="text-zinc-500 group-hover:scale-110 group-hover:text-zinc-400 transition-all duration-500 mb-2" />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-3xl font-medium text-white mb-4">VR Escape Rooms</h3>
                <p className="text-zinc-400 text-lg flex-1 mb-8 leading-relaxed font-light">
                  En sosial samarbeidsopplevelse. Løs oppdrag, utforsk fantastiske verdener og jobb sammen for å nå målet. Perfekt for de som elsker eventyr, nysgjerrighet og hjernetrim.
                </p>
                <Button render={<Link href="/opplevelser" />} variant="outline" className="w-full h-12 rounded-full border-zinc-700 hover:bg-zinc-800 text-white shadow-none">
                  Se Escape Rooms
                </Button>
              </div>
            </div>

            {/* Kort B: VR Team Challenge */}
            <div className="group rounded-3xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden hover:bg-zinc-900 transition-colors flex flex-col">
              <div className="h-56 bg-zinc-800 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9C39FF]/20 to-black/20 mix-blend-overlay"></div>
                <Footprints size={56} className="text-zinc-500 group-hover:scale-110 group-hover:text-zinc-400 transition-all duration-500 mb-2" />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-3xl font-medium text-white mb-4">VR Team Challenge</h3>
                <p className="text-zinc-400 text-lg flex-1 mb-8 leading-relaxed font-light">
                  En actionfylt og lagbasert VR-opplevelse med taktikk, bevegelse og konkurranse. Del opp i lag og se hvem som stikker av med seieren i et energisk samarbeidsoppdrag.
                </p>
                <Button render={<Link href="/opplevelser" />} variant="outline" className="w-full h-12 rounded-full border-zinc-700 hover:bg-zinc-800 text-white shadow-none">
                  Se Team Challenge
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Seksjon: Slik fungerer det */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">Slik fungerer det</h2>
            <p className="text-xl text-zinc-400 font-light">Enkelt, trygt og veldig morsomt.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 max-w-5xl mx-auto text-center relative px-2">
            {/* Connecting Line (desktop only) */}
            <div className="hidden md:block absolute top-[44px] left-[15%] w-[70%] h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center group">
              <div className="w-20 h-20 rounded-full bg-zinc-950 border-2 border-zinc-800 text-2xl font-light text-white flex items-center justify-center mb-8 shadow-xl transition-colors group-hover:border-zinc-600">
                1
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">Velg opplevelse og tid</h3>
              <p className="text-zinc-400 font-light leading-relaxed">Finn den opplevelsen som appellerer mest til din gruppe, og reserver et tidspunkt.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center group">
              <div className="w-20 h-20 rounded-full bg-zinc-950 border-2 border-zinc-800 text-2xl font-light text-white flex items-center justify-center mb-8 shadow-xl transition-colors group-hover:border-zinc-600">
                2
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">Møt opp hos oss</h3>
              <p className="text-zinc-400 font-light leading-relaxed">Våre guider tar dere imot, viser dere tilstanden og hjelper alle i gang med utstyret.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center group">
              <div className="w-20 h-20 rounded-full bg-[#9C39FF] border-2 border-[#9C39FF] text-2xl font-medium text-white flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(156,57,255,0.4)]">
                3
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">Spill sammen i VR</h3>
              <p className="text-zinc-400 font-light leading-relaxed">Sett på Meta Quest 3-brillene og del en helt utrolig verden i fellesskap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Seksjon: Perfekt for grupper */}
      <section className="py-24 bg-zinc-950/50 border-y border-white/5 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight">Perfekt for grupper</h2>
            <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto">
              Aktiviteten kan tilpasses, og alle får en fantastisk tur – helt uavhengig av tidligere gaming-erfaring.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col gap-4">
              <Users className="w-10 h-10 text-[#9C39FF]" />
              <h4 className="text-2xl font-medium text-white">Vennegjenger</h4>
              <p className="text-zinc-400 font-light leading-relaxed">Samle gjengen til en annerledes, aktiv og sosial kveld i byen. Et garantert latterfylt minne.</p>
            </div>
            <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col gap-4">
              <CalendarHeart className="w-10 h-10 text-[#9C39FF]" />
              <h4 className="text-2xl font-medium text-white">Bursdag</h4>
              <p className="text-zinc-400 font-light leading-relaxed">Gi bursdagsbarnet en feiring som skiller seg skikkelig ut fra det vanlige programmet.</p>
            </div>
            <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col gap-4">
              <Briefcase className="w-10 h-10 text-[#9C39FF]" />
              <h4 className="text-2xl font-medium text-white">Firmaevent</h4>
              <p className="text-zinc-400 font-light leading-relaxed">Bryt opp arbeidsdagen med ren moro for de ansatte, garantert et høydepunkt i kalenderen.</p>
            </div>
            <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col gap-4">
              <Puzzle className="w-10 h-10 text-[#9C39FF]" />
              <h4 className="text-2xl font-medium text-white">Teambuilding</h4>
              <p className="text-zinc-400 font-light leading-relaxed">Styrk samholdet gjennom utfordrende samarbeid, oppdrag og morsomme vurderinger.</p>
            </div>
            <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col gap-4">
              <Smile className="w-10 h-10 text-[#9C39FF]" />
              <h4 className="text-2xl font-medium text-white">Utdrikningslag</h4>
              <p className="text-zinc-400 font-light leading-relaxed">En energisk og lattermild start på feiringen der alle i alle aldre kan delta på lik linje.</p>
            </div>
            <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 flex flex-col gap-4">
              <Glasses className="w-10 h-10 text-[#9C39FF]" />
              <h4 className="text-2xl font-medium text-white">Familier med ungdom</h4>
              <p className="text-zinc-400 font-light leading-relaxed">Utforsk nye verdener og løs spennende gåter sammen som en aktiv familie.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Seksjon: Teambuilding */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-transparent to-[#9C39FF]/5 hidden sm:block">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#9C39FF]/10 rounded-full blur-3xl -z-10 absolute-center translate-x-1/3 -translate-y-1/2"></div>
            
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">Teambuilding som faktisk engasjerer</h2>
            <p className="text-xl text-zinc-300 font-light max-w-3xl mx-auto mb-10 leading-relaxed">
              Ser dere etter en aktivitet som virkelig bygger relasjoner? I våre opplevelser må deltakerne samarbeide, kommunisere, ta raske valg og løse oppgaver felles.
            </p>
            <Button render={<Link href="/kontakt" />} size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-zinc-200 rounded-full font-medium transition-transform hover:scale-105">
              Send forespørsel (mer enn 8 pers) <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Seksjon: Hvorfor velge KRS VR Arena? */}
      <section className="py-24 bg-zinc-950 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-light text-white mb-16 text-center">
            Hvorfor velge KRS VR Arena?
          </h2>
          <div className="max-w-4xl mx-auto">
            <ul className="space-y-4">
              {[
                "Sosial aktivitet som alle kan være med på.",
                "Opplevelser med enormt fokus på både samarbeid og konkurranse.",
                "To store spillsoner (150 kvm og 75 kvm) med full fri bevegelse.",
                "Passer perfekt for både nybegynnere og erfarne VR-spillere.",
                "Førsteklasses, moderne utstyr i form av Meta Quest 3.",
                "Lokalt og sentralt plassert midt i Kristiansand."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-[#9C39FF] flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300 md:text-lg font-light leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Seksjon: Praktisk informasjon */}
      <section className="py-24 bg-zinc-900/30 border-y border-white/5 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">Praktisk informasjon</h2>
            <p className="text-xl text-zinc-400 font-light">Greit å vite før dere besøker oss i arenaen.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex gap-5 p-8 bg-zinc-950/50 rounded-3xl border border-zinc-800/50">
              <Clock className="w-10 h-10 text-[#9C39FF] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-medium text-white mb-2">Møt opp litt før</h4>
                <p className="text-zinc-400 font-light leading-relaxed">Møt opp 10 minutter før starttiden deres. Slik sikrer vi at vi kommer i gang i tide, uten unødig stress.</p>
              </div>
            </div>
            <div className="flex gap-5 p-8 bg-zinc-950/50 rounded-3xl border border-zinc-800/50">
              <Shirt className="w-10 h-10 text-[#9C39FF] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-medium text-white mb-2">Komfortable klær og sko</h4>
                <p className="text-zinc-400 font-light leading-relaxed">Bruk komfortable klær og flate sko. Dere vil bevege dere fritt rundt på arenaen during hele opplevelsen.</p>
              </div>
            </div>
            <div className="flex gap-5 p-8 bg-zinc-950/50 rounded-3xl border border-zinc-800/50">
              <Info className="w-10 h-10 text-[#9C39FF] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-medium text-white mb-2">Ingen erfaring nødvendig</h4>
                <p className="text-zinc-400 font-light leading-relaxed">Det er helt normalt at VR er nytt for mange! Opplevelsene våre er intuitive, og veiledning gis.</p>
              </div>
            </div>
            <div className="flex gap-5 p-8 bg-zinc-950/50 rounded-3xl border border-zinc-800/50">
              <Smile className="w-10 h-10 text-[#9C39FF] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-medium text-white mb-2">Vi hjelper dere i gang</h4>
                <p className="text-zinc-400 font-light leading-relaxed">Våre ansatte hjelper dere med utstyret. Vi gir full opplæring, så alt føles trygt hele veien inni VR.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
             <p className="text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
               ✨ Våre VR aktiviteter passer best for grupper som vil gjøre noe aktivt og sosialt sammen i trygge, morsomme omgivelser.
             </p>
          </div>
        </div>
      </section>

      {/* 9. Avsluttende CTA */}
      <section className="py-32 relative text-center px-4 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-[#9C39FF]/10 to-transparent -z-10"></div>
        <h2 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight">Klar for å prøve VR sammen?</h2>
        <p className="text-xl text-zinc-400 font-light mb-12 max-w-2xl mx-auto">
          Reserver din tid i dag, og gled deg til en opplevelse teamet sent vil glemme.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button render={<Link href="/booking" />} size="lg" className="w-full sm:w-auto h-16 px-10 text-xl bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)] transition-all hover:scale-105">
            Book opplevelse
          </Button>
          <Button render={<Link href="/kontakt" />} size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl border-zinc-700 hover:bg-zinc-800 rounded-full text-white">
            Send gruppeforespørsel
          </Button>
        </div>
      </section>

    </main>
  );
}

