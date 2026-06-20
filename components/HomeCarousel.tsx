"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Handshake, Crosshair, Skull, Mountain, Ghost, Gamepad2 } from "lucide-react";
import Tilt from "react-parallax-tilt";

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
            scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
          }
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, experiences, isPaused]);

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

  const getIconForType = (type: string, name: string) => {
    const lname = name.toLowerCase();
    const ltype = type ? type.toLowerCase() : "";
    
    if (ltype.includes("escape") || lname.includes("escape")) return <Handshake className="w-10 h-10 md:w-12 md:h-12" />;
    if (ltype.includes("shooter") || lname.includes("shooter")) return <Crosshair className="w-10 h-10 md:w-12 md:h-12" />;
    if (ltype.includes("zomb") || lname.includes("zomb") || lname.includes("fear") || lname.includes("blood")) return <Skull className="w-10 h-10 md:w-12 md:h-12" />;
    if (ltype.includes("archer") || lname.includes("archer")) return <Mountain className="w-10 h-10 md:w-12 md:h-12" />;
    if (lname.includes("sanctum")) return <Ghost className="w-10 h-10 md:w-12 md:h-12" />;
    return <Gamepad2 className="w-10 h-10 md:w-12 md:h-12" />;
  };

  const slugify = (text: string) => {
    if (!text) return "";
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
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
      className="relative w-full max-w-6xl mx-auto flex items-center mt-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <button 
        onClick={scrollLeft} 
        className="absolute -left-4 md:-left-12 z-10 p-2 text-zinc-500 hover:text-[#9C39FF] transition-colors bg-black/80 rounded-full md:bg-transparent"
      >
        <ChevronLeft className="w-8 h-8 md:w-16 md:h-16" strokeWidth={1} />
      </button>

      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-start justify-start md:justify-center gap-4 md:gap-8 px-8 md:px-4 w-max min-w-full snap-x snap-mandatory pb-4">
        {experiences.map((exp) => {
          return (
            <Tilt
              key={exp.id}
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              glareEnable={true}
              glareMaxOpacity={0.3}
              glareColor="#ffffff"
              glarePosition="all"
              glareBorderRadius="24px"
              scale={1.05}
              transitionSpeed={1500}
              className="flex-shrink-0 snap-center min-w-[140px]"
            >
              <Link
                href={`/opplevelser/${slugify(exp.type)}/${slugify(exp.name)}`}
                className="flex flex-col items-center justify-center group w-full h-full px-4 py-8 rounded-3xl border border-[#9C39FF] bg-[#9C39FF]/10 shadow-[0_0_15px_rgba(156,57,255,0.2)] hover:bg-[#9C39FF]/20 hover:shadow-[0_0_25px_rgba(156,57,255,0.4)] transition-all duration-300"
              >
                <div className="mb-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-300">
                  {getIconForType(exp.type, exp.name)}
                </div>
                <span className="text-sm md:text-base font-bold mb-2 text-white text-center max-w-[120px] leading-tight">
                  {exp.name}
                </span>
                <span className="text-[10px] md:text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#9C39FF] text-white font-medium shadow-[0_0_10px_rgba(156,57,255,0.5)]">
                  {exp.type}
                </span>
              </Link>
            </Tilt>
          );
        })}
        </div>
      </div>

      <button 
        onClick={scrollRight} 
        className="absolute -right-4 md:-right-12 z-10 p-2 text-zinc-500 hover:text-[#9C39FF] transition-colors bg-black/80 rounded-full md:bg-transparent"
      >
        <ChevronRight className="w-8 h-8 md:w-16 md:h-16" strokeWidth={1} />
      </button>
    </div>
  );
}
