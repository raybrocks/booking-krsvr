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
  Mountain,
  PartyPopper,
  Baby,
  UserCheck,
  Layers,
  Smile
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function MediaGallery({ experience }: { experience: any }) {
  const [activeSlide, setActiveSlide] = useState<"image" | "video">("image");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const hasVideo = !!experience.videoUrl;
  
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let embedUrl = url;
    if (url.includes("youtube.com/watch?v=")) {
      embedUrl = url.replace("watch?v=", "embed/");
      const ampIndex = embedUrl.indexOf("&");
      if (ampIndex !== -1) {
        embedUrl = embedUrl.substring(0, ampIndex);
      }
    } else if (url.includes("youtu.be/")) {
      embedUrl = url.replace("youtu.be/", "www.youtube.com/embed/");
      const questionIndex = embedUrl.indexOf("?");
      if (questionIndex !== -1) {
        embedUrl = embedUrl.substring(0, questionIndex);
      }
    } else if (url.includes("vimeo.com/")) {
      embedUrl = url.replace("vimeo.com/", "player.vimeo.com/video/");
    }
    return embedUrl;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if ((isLeftSwipe || isRightSwipe) && hasVideo) {
      setActiveSlide(prev => prev === "image" ? "video" : "image");
    }
  };

  const toggleMedia = () => {
    setActiveSlide(prev => prev === "image" ? "video" : "image");
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        className="w-full aspect-video md:aspect-auto md:h-[450px] rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeSlide === "image" ? (
          experience.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={experience.picture} 
              alt={experience.name} 
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Gamepad2 className="w-20 h-20 text-zinc-800" />
            </div>
          )
        ) : (
          <div className="w-full h-full bg-black relative">
            <iframe 
              src={getEmbedUrl(experience.videoUrl)} 
              className="w-full h-full md:pointer-events-auto"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Desktop Side arrows */}
        {hasVideo && (
          <>
            <button 
              onClick={toggleMedia}
              className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-[#9C39FF] hover:bg-[#8A30E0] rounded-full text-white transition-all shadow-[0_0_15px_rgba(156,57,255,0.4)] z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={toggleMedia}
              className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-[#9C39FF] hover:bg-[#8A30E0] rounded-full text-white transition-all shadow-[0_0_15px_rgba(156,57,255,0.4)] z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Desktop Dots inside image */}
            <div className="hidden md:flex absolute bottom-4 left-0 right-0 justify-center gap-3 z-10">
              <button 
                onClick={() => setActiveSlide("image")}
                className={`w-3 h-3 rounded-full transition-colors ${activeSlide === "image" ? "bg-[#9C39FF] scale-125 shadow-[0_0_10px_rgba(156,57,255,0.8)]" : "bg-white/50 hover:bg-white/80"}`}
                aria-label="View Image"
              />
              <button 
                onClick={() => setActiveSlide("video")}
                className={`w-3 h-3 rounded-full transition-colors ${activeSlide === "video" ? "bg-[#9C39FF] scale-125 shadow-[0_0_10px_rgba(156,57,255,0.8)]" : "bg-white/50 hover:bg-white/80"}`}
                aria-label="Play Video"
              />
            </div>
          </>
        )}
      </div>

      {/* Mobile controls below gallery */}
      {hasVideo && (
        <div className="md:hidden flex items-center justify-center gap-6 mt-6 w-full px-4">
           <button 
              onClick={toggleMedia}
              className="p-3 bg-[#9C39FF] rounded-full text-white transition-all shadow-[0_0_15px_rgba(156,57,255,0.4)] active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
           </button>
           
           <div className="flex gap-3">
              <button 
                onClick={() => setActiveSlide("image")}
                className={`w-3 h-3 rounded-full transition-colors ${activeSlide === "image" ? "bg-[#9C39FF] scale-125 shadow-[0_0_10px_rgba(156,57,255,0.8)]" : "bg-zinc-700"}`}
                aria-label="View Image"
              />
              <button 
                onClick={() => setActiveSlide("video")}
                className={`w-3 h-3 rounded-full transition-colors ${activeSlide === "video" ? "bg-[#9C39FF] scale-125 shadow-[0_0_10px_rgba(156,57,255,0.8)]" : "bg-zinc-700"}`}
                aria-label="Play Video"
              />
           </div>

           <button 
              onClick={toggleMedia}
              className="p-3 bg-[#9C39FF] rounded-full text-white transition-all shadow-[0_0_15px_rgba(156,57,255,0.4)] active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
           </button>
        </div>
      )}
    </div>
  );
}

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
          let exps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          
          // Sort by order
          exps.sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : 999;
            const orderB = typeof b.order === 'number' ? b.order : 999;
            return orderA - orderB;
          });

          // Filter out inactive
          exps = exps.filter(e => e.isActive);

          setExperiences(exps);
          if (exps.length > 0) {
            setSelectedId(exps[0].id);
          } else {
            setSelectedId("");
          }
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
    if (ltype.includes("archer") || lname.includes("archer")) return <Mountain className="w-10 h-10" />;
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
                <span className={`text-[10px] md:text-xs mt-1 uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${isSelected ? "bg-[#9C39FF] text-white" : "text-zinc-600 bg-zinc-900"}`}>
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
        {/* IMAGE / MEDIA GALLERY */}
        <div className="w-full mb-12">
          <MediaGallery key={selected.id} experience={selected} />
        </div>

        {/* TITLE */}
        <div className="flex flex-col items-center mb-8 gap-4">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-wide uppercase text-center">
            {selected.name}
          </h2>
          <span className="text-[10px] md:text-xs uppercase tracking-wider px-3 py-1 rounded bg-[#9C39FF] text-white font-medium">
            {selected.type}
          </span>
        </div>

        {/* STATS ROW */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-zinc-300 font-medium mb-10 pb-10 border-b border-white/10 w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Timer className="w-5 h-5 text-white" />
            <span>{selected.duration || "45 min"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm md:text-base">
            <Users className="w-5 h-5 text-white" />
            <span>{selected.maxPlayers ? `Opptil ${selected.maxPlayers} pers` : "2-4 pers"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm md:text-base">
            <UserCheck className="w-5 h-5 text-white" />
            <span>{selected.age || "Fra 8 år"}</span>
          </div>

          {selected.difficulty && (
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Layers className="w-5 h-5 text-white" />
              <span>{selected.difficulty}</span>
            </div>
          )}
          
          {/* Custom tags if any exist in the old array format */}
          {selected.tags && Array.isArray(selected.tags) && selected.tags.map((tag: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm md:text-base">
               <Zap className="w-5 h-5 text-white" />
               <span>{tag}</span>
            </div>
          ))}

          {/* New specific tags */}
          {selected.familyFriendly && (
             <div className="flex items-center gap-2 text-sm md:text-base">
                <Smile className="w-5 h-5 text-white" />
                <span>Familievennlig</span>
             </div>
          )}
          {selected.teambuilding && (
             <div className="flex items-center gap-2 text-sm md:text-base">
                <Handshake className="w-5 h-5 text-white" />
                <span>Teambuilding</span>
             </div>
          )}
          {selected.party && (
             <div className="flex items-center gap-2 text-sm md:text-base">
                <PartyPopper className="w-5 h-5 text-white" />
                <span>Fest & Moro</span>
             </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <p className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed max-w-4xl text-center mb-12">
          {selected.shortDescription}
        </p>

        {/* BUTTONS */}
        <div className="flex gap-4">
          <Button 
            nativeButton={false} 
            render={<Link href="/booking" />} 
            size="lg" 
            className="h-14 px-10 text-lg bg-[#9C39FF] hover:bg-[#8A30E0] text-white rounded-full uppercase font-bold shadow-[0_0_20px_rgba(156,57,255,0.6)] transition-all hover:scale-105"
          >
            Booking
          </Button>
        </div>

      </motion.div>
    </div>
  );
}
