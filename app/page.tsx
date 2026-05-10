"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { motion } from "motion/react";
import { ArrowRight, Users, Trophy, Gamepad2 } from "lucide-react";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#9C39FF]/5 rounded-full blur-3xl -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm md:text-base font-medium text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-[#9C39FF] animate-pulse"></span>
            Sørlandets Råeste VR Opplevelse
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter text-white leading-[1.1]">
            Tre inn i en <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">ny virkelighet</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Opplev fremtidens underholdning. Samle venner, familie eller kolleger til en uforglemmelig opplevelse i våre toppmoderne VR-arenaer.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button render={<Link href="/booking" />} size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)] transition-all hover:scale-105">
              Bestill nå <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button render={<Link href="/opplevelser" />} size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-zinc-700 hover:bg-zinc-800 rounded-full">
              Se opplevelser
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 bg-zinc-950/50 border-y border-white/5 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 text-center hover:bg-zinc-900 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-[#9C39FF]/10 text-[#9C39FF] flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Sosialt og Gøy</h3>
              <p className="text-zinc-400">Perfekt for teambuilding, utdrikningslag og vennegjenger. Utfordre hverandre i virtuelle verdener.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 text-center hover:bg-zinc-900 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-[#9C39FF]/10 text-[#9C39FF] flex items-center justify-center mx-auto mb-6">
                <Gamepad2 size={32} />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Stort Utvalg</h3>
              <p className="text-zinc-400">Fra spennende escape rooms til intense skytespill og familiestories. Vi har noe for enhver smak.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 text-center hover:bg-zinc-900 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-[#9C39FF]/10 text-[#9C39FF] flex items-center justify-center mx-auto mb-6">
                <Trophy size={32} />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Topp Utstyr</h3>
              <p className="text-zinc-400">Prøv den nyeste VR-teknologien på markedet med krystallklare bilder og nøyaktig tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Groups / Arrangement Cta */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">Perfekt for alle anledninger</h2>
            <p className="text-xl text-zinc-400 font-light">Gjør din neste samling til noe helt spesielt med en delt VR-opplevelse</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Link href="/arrangement" className="group relative h-96 rounded-3xl overflow-hidden border border-zinc-800">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
              {/* Optional: Add image here */}
              <div className="absolute inset-0 bg-zinc-900 group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-full p-8 z-20 flex flex-col items-start gap-4">
                <h3 className="text-3xl font-medium text-white">Bedrift & Teambuilding</h3>
                <p className="text-zinc-300">Styrk samholdet med felles utfordringer</p>
                <span className="inline-flex items-center text-[#9C39FF] font-medium group-hover:translate-x-2 transition-transform">
                  Les mer <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              </div>
            </Link>
            
            <Link href="/arrangement" className="group relative h-96 rounded-3xl overflow-hidden border border-zinc-800">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
              {/* Optional: Add image here */}
              <div className="absolute inset-0 bg-zinc-900 group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-full p-8 z-20 flex flex-col items-start gap-4">
                <h3 className="text-3xl font-medium text-white">Privat & Utdrikningslag</h3>
                <p className="text-zinc-300">En feiring dere sent vil glemme</p>
                <span className="inline-flex items-center text-[#9C39FF] font-medium group-hover:translate-x-2 transition-transform">
                  Les mer <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
