"use client";

import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  Target,
  Gamepad2, 
  Skull, 
  Ghost, 
  Crosshair, 
  Key,
  PlaySquare,
  Swords,
  Timer,
  Zap,
  Ticket,
  Handshake,
  Mountain
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ExperiencesView() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "experiences"));
        if (!querySnapshot.empty) {
          const exps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          setExperiences(exps);
          setSelectedId(exps[0].id);
        } else {
          setExperiences([]);
          setSelectedId("");
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
        setExperiences([]);
        setSelectedId("");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  const selected = experiences.find(e => e.id === selectedId) || experiences[0];

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

  // Maps experience type to an icon
  const getIconForType = (type: string, name: string) => {
    const lname = name.toLowerCase();
    const ltype = type ? type.toLowerCase() : "";
    
    if (ltype.includes("escape") || lname.includes("escape")) return <Handshake className="w-10 h-10" />;
    if (ltype.includes("zomb") || lname.includes("zomb") || lname.includes("fear") || lname.includes("blood")) return <Skull className="w-10 h-10" />;
    if (ltype.includes("arrow") || lname.includes("arrow")) return <Mountain className="w-10 h-10" />;
    if (lname.includes("sanctum")) return <Ghost className="w-10 h-10" />;
    return <Gamepad2 className="w-10 h-10" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#9C39FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (experiences.length === 0 || !selected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Ingen opplevelser lagt til enda</h2>
        <p className="text-zinc-400">Kom tilbake senere for å se våre opplevelser.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-12 text-center uppercase">
        Våre Opplevelser
      </h1>

      {/* HORIZONTAL CAROUSEL NAV */}
      <div className="relative w-full max-w-6xl mx-auto flex items-center mb-16">
        <button 
          onClick={scrollLeft} 
          className="absolute -left-4 md:-left-12 z-10 p-2 text-zinc-500 hover:text-[#9C39FF] transition-colors"
        >
          <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
        </button>

        <div 
          ref={scrollRef}
          className="w-full flex items-start overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:gap-8 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {experiences.map((exp) => {
            const isSelected = exp.id === selectedId;
            return (
              <button
                key={exp.id}
                onClick={() => setSelectedId(exp.id)}
                className="flex flex-col items-center flex-shrink-0 snap-center focus:outline-none group min-w-[120px]"
              >
                <div 
                  className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-2 flex items-center justify-center mb-4 transition-all duration-300 ${
                    isSelected 
                      ? "border-[#9C39FF] text-white shadow-[0_0_25px_rgba(156,57,255,0.4)]" 
                      : "border-zinc-800 text-zinc-500 group-hover:border-zinc-600 group-hover:text-zinc-300 bg-zinc-900/50"
                  }`}
                >
                  {getIconForType(exp.type, exp.name)}
                </div>
                <span className={`text-base md:text-lg font-medium transition-colors ${isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                  {exp.name}
                </span>
                <span className={`text-xs md:text-sm mt-1 transition-colors ${isSelected ? "text-[#9C39FF]" : "text-zinc-600"}`}>
                  {exp.type}
                </span>
              </button>
            );
          })}
        </div>

        <button 
          onClick={scrollRight} 
          className="absolute -right-4 md:-right-12 z-10 p-2 text-zinc-500 hover:text-[#9C39FF] transition-colors"
        >
          <ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
        </button>
      </div>

      {/* SELECTED EXPERIENCE DETAILS */}
      <motion.div 
        key={selected.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mx-auto flex flex-col items-center"
      >
        {/* IMAGE */}
        <div className="w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl mb-12">
          {selected.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={selected.picture} 
              alt={selected.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Gamepad2 className="w-20 h-20 text-zinc-800" />
            </div>
          )}
        </div>

        {/* TITLE */}
        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-wide uppercase">
          {selected.name}
        </h2>

        {/* STATS ROW */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-zinc-300 font-medium mb-10 pb-10 border-b border-white/10 w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Timer className="w-5 h-5 text-[#9C39FF]" />
              <span>{selected.duration || "45 min"}</span>
            </div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Varighet</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Users className="w-5 h-5 text-[#9C39FF]" />
              <span>{selected.maxPlayers ? `Opptil ${selected.maxPlayers} pers` : "2-4 pers"}</span>
            </div>
             <span className="text-xs text-zinc-500 uppercase tracking-widest">Spillere</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Ticket className="w-5 h-5 text-[#9C39FF]" />
              <span>{selected.age || "Fra 8 år"}</span>
            </div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Aldersgrense</span>
          </div>

          {selected.difficulty && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Target className="w-5 h-5 text-[#9C39FF]" />
                <span>{selected.difficulty}</span>
              </div>
              <span className="text-xs text-zinc-500 uppercase tracking-widest">Vanskelighetsgrad</span>
            </div>
          )}
          
          {/* Custom tags if any exist in the old array format */}
          {selected.tags && Array.isArray(selected.tags) && selected.tags.map((tag: string, i: number) => (
            <div key={i} className="flex flex-col items-center gap-2 text-sm md:text-base">
               <div className="flex items-center gap-2 text-sm md:text-base">
                 <Zap className="w-5 h-5 text-[#9C39FF]" />
                 <span>{tag}</span>
               </div>
               <span className="text-xs text-zinc-500 uppercase tracking-widest">Tag</span>
            </div>
          ))}

          {/* New specific tags */}
          {selected.familyFriendly && (
             <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <span className="text-xl">👪</span>
                  <span>Familievennlig</span>
                </div>
                 <span className="text-xs text-zinc-500 uppercase tracking-widest">Passer For</span>
             </div>
          )}
          {selected.teambuilding && (
             <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <span className="text-xl">🤝</span>
                  <span>Teambuilding</span>
                </div>
                 <span className="text-xs text-zinc-500 uppercase tracking-widest">Passer For</span>
             </div>
          )}
          {selected.party && (
             <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <span className="text-xl">🎉</span>
                  <span>Fest & Moro</span>
                </div>
                 <span className="text-xs text-zinc-500 uppercase tracking-widest">Passer For</span>
             </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <p className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed max-w-4xl text-center mb-12">
          {selected.shortDescription}
        </p>

        {/* BUTTONS */}
        <div className="flex gap-4">
          <Button nativeButton={false} render={<Link href="/booking" />} size="lg" className="h-14 px-10 text-lg bg-[#0099FF] hover:bg-[#007acc] text-white rounded-md uppercase font-bold shadow-none transition-transform hover:scale-105">
            Booke
          </Button>
          <Button variant="outline" size="lg" className="h-14 px-10 text-lg bg-[#D42BCA] hover:bg-[#b01e9e] border-none text-white rounded-md uppercase font-bold shadow-none transition-transform hover:scale-105" onClick={() => alert("Video kommer snart!")}>
            Se Video
          </Button>
        </div>

      </motion.div>
    </div>
  );
}
