"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Handshake, Crosshair, Skull, Mountain, Ghost, Gamepad2, Users } from "lucide-react";
import Tilt from "react-parallax-tilt";
import { slugify } from "@/lib/utils";

export default function HomeCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await fetch('/api/experiences?active_only=true&timestamp=' + new Date().getTime());
        if (response.ok) {
          let expList = await response.json();
          
          // Filter out "Vipps test" category/experiences
          expList = expList.filter((exp: any) => 
            exp.type !== "Vipps test" && 
            exp.name !== "Vipps test"
          );
          
          expList.sort((a: any, b: any) => {
            const orderA = typeof a.order === 'number' ? a.order : 999;
            const orderB = typeof b.order === 'number' ? b.order : 999;
            return orderA - orderB;
          });
          setExperiences(expList);
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExperiences();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isLoading && experiences.length > 0 && !isPaused) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
          }
        }
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, experiences, isPaused]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  const getIconForType = (type: string, name: string) => {
    const lname = name.toLowerCase();
    const ltype = type ? type.toLowerCase() : "";
    
    if (ltype.includes("escape") || lname.includes("escape")) return <Handshake className="w-10 h-10 md:w-12 md:h-12" />;
    if (ltype.includes("shooter") || lname.includes("shooter") || lname.includes("tactical")) return <Crosshair className="w-10 h-10 md:w-12 md:h-12" />;
    if (ltype.includes("zomb") || lname.includes("zomb") || lname.includes("fear") || lname.includes("blood")) return <Skull className="w-10 h-10 md:w-12 md:h-12" />;
    if (ltype.includes("archer") || lname.includes("archer")) return <Mountain className="w-10 h-10 md:w-12 md:h-12" />;
    if (lname.includes("sanctum")) return <Ghost className="w-10 h-10 md:w-12 md:h-12" />;
    return <Gamepad2 className="w-10 h-10 md:w-12 md:h-12" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-8 h-8 border-4 border-[#9C39FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!experiences || experiences.length === 0) return null;

  return (
    <div 
      className="relative w-full max-w-6xl mx-auto flex flex-col items-center mt-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative w-full flex items-center">
        <button 
          onClick={scrollLeft} 
          aria-label="Bla til venstre"
          className="hidden md:flex absolute -left-12 z-20 p-2 text-zinc-400 hover:text-[#9C39FF] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-14 h-14" strokeWidth={1.5} />
        </button>

        <div 
          ref={scrollRef}
          className="w-full overflow-x-auto overflow-y-hidden hide-scrollbar py-14 -my-6 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex items-stretch justify-start gap-5 md:gap-6 px-8 md:px-6 w-max min-w-full">
          {experiences.map((exp) => {
            const typeSlug = exp.experienceType?.slug || slugify(exp.type || "");
            const coverImage =
              (Array.isArray(exp.images) && exp.images.length > 0 ? exp.images[0] : null) ||
              exp.picture ||
              null;
            const maxPlayers = exp.maxPlayers || 6;

            return (
              <Tilt
                key={exp.id}
                tiltMaxAngleX={8}
                tiltMaxAngleY={8}
                glareEnable={true}
                glareMaxOpacity={0.2}
                glareColor="#ffffff"
                glarePosition="all"
                glareBorderRadius="24px"
                scale={1.03}
                transitionSpeed={1500}
                className="flex-shrink-0 snap-center w-[250px] sm:w-[260px]"
              >
                <Link
                  href={`/vr-opplevelser/${typeSlug}/${slugify(exp.name)}`}
                  className="flex flex-col justify-between group w-full h-full rounded-3xl overflow-hidden border border-[#9C39FF]/40 bg-zinc-900/70 shadow-[0_0_20px_rgba(156,57,255,0.15)] hover:border-[#9C39FF] hover:shadow-[0_0_30px_rgba(156,57,255,0.35)] transition-all duration-300"
                >
                  {/* Cover Image or Icon Fallback */}
                  <div className="relative w-full aspect-[16/10] bg-zinc-950 overflow-hidden">
                    {coverImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverImage}
                          alt={`${exp.name} – ${exp.type || "VR-opplevelse"} hos KRS VR Arena`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#9C39FF]/10 text-white group-hover:scale-110 transition-transform duration-300">
                        {getIconForType(exp.type, exp.name)}
                      </div>
                    )}

                    {/* Genre Pill Top-Left */}
                    {exp.type && (
                      <span className="absolute top-3 left-3 text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#9C39FF] text-white font-semibold shadow-md">
                        {exp.type}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-grow justify-between text-left">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-[#9C39FF] transition-colors leading-snug line-clamp-2">
                        {exp.name}
                      </h3>
                      {exp.subName && (
                        <p className="text-xs text-zinc-400 font-light mt-1 line-clamp-1">
                          {exp.subName}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#9C39FF]" />
                        2–{maxPlayers >= 10 ? "10" : maxPlayers} spillere
                      </span>
                      {exp.age && (
                        <span className="text-zinc-500 font-medium">
                          {String(exp.age).includes("år") ? exp.age : `${exp.age} år`}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </Tilt>
            );
          })}
          </div>
        </div>

        <button 
          onClick={scrollRight} 
          aria-label="Bla til høyre"
          className="hidden md:flex absolute -right-12 z-20 p-2 text-zinc-400 hover:text-[#9C39FF] transition-colors cursor-pointer"
        >
          <ChevronRight className="w-14 h-14" strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile navigation controls below cards so they never overlap text */}
      <div className="flex md:hidden items-center justify-center gap-4 mt-1">
        <button
          onClick={scrollLeft}
          aria-label="Bla til venstre"
          className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs text-zinc-500">Sveip for å utforske</span>
        <button
          onClick={scrollRight}
          aria-label="Bla til høyre"
          className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 active:scale-95 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

