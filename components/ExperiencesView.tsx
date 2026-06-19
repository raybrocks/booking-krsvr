"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
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
  Smile,
  Activity,
  X,
  Play
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

function MediaGallery({ experience, onPlayVideo }: { experience: any; onPlayVideo?: () => void }) {
  return (
    <div className="w-full flex flex-col items-center relative group">
      <div className="w-full aspect-video md:aspect-auto md:h-[450px] rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl">
        {experience.picture ? (
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
        )}

        {/* Overlay for Play Button */}
        {experience.videoUrl && onPlayVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button 
              onClick={onPlayVideo}
              className="pointer-events-auto bg-black/20 backdrop-blur-md border border-white/20 hover:bg-black/40 hover:border-white/40 text-white w-12 h-12 md:w-16 md:h-16 rounded-full shadow-lg transform hover:scale-110 transition-all flex items-center justify-center group/play"
              aria-label="Se Trailer"
            >
              <Play className="w-5 h-5 md:w-7 md:h-7 ml-1 text-white transition-colors" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ExperiencesView({ 
  initialExperiences = [],
  initialTypeSlug, 
  initialExpSlug 
}: { 
  initialExperiences?: any[];
  initialTypeSlug?: string | null;
  initialExpSlug?: string | null;
}) {
  const [experiences, setExperiences] = useState<any[]>(
    initialExperiences.filter((e: any) => e.isActive && e.type !== "Vipps test")
  );
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(experiences.length === 0);
  const [activeFilter, setActiveFilter] = useState<string>("Alle");
  const [activeTypeSlug, setActiveTypeSlug] = useState<string>(initialTypeSlug || "alle");
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    } else if (url.includes("youtube.com/shorts/")) {
      embedUrl = url.replace("youtube.com/shorts/", "www.youtube.com/embed/");
      const questionIndex = embedUrl.indexOf("?");
      if (questionIndex !== -1) {
        embedUrl = embedUrl.substring(0, questionIndex);
      }
    } else if (url.includes("vimeo.com/")) {
      embedUrl = url.replace("vimeo.com/", "player.vimeo.com/video/");
    }
    return embedUrl;
  };

  useEffect(() => {
    if (initialExperiences.length > 0) return;
    
    const fetchExperiences = async () => {
      try {
        const response = await fetch('/api/experiences?timestamp=' + new Date().getTime());
        if (response.ok) {
          let exps = await response.json();
          
          exps.sort((a: any, b: any) => {
            const orderA = typeof a.order === 'number' ? a.order : 999;
            const orderB = typeof b.order === 'number' ? b.order : 999;
            return orderA - orderB;
          });

          exps = exps.filter((e: any) => e.isActive && e.type !== "Vipps test");
          setExperiences(exps);
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, [initialExperiences.length]);

  useEffect(() => {
    setActiveTypeSlug(initialTypeSlug || "alle");
  }, [initialTypeSlug]);

  useEffect(() => {
    if (experiences.length > 0) {
      let initialId = "";
      // Initialize selectedId based on activeTypeSlug and initialExpSlug
      if (activeTypeSlug !== "alle" && initialExpSlug) {
        const matchedExp = experiences.find(e => slugify(e.type) === activeTypeSlug && slugify(e.name) === initialExpSlug);
        if (matchedExp) initialId = matchedExp.id;
      } else if (activeTypeSlug !== "alle") {
        const matchedExp = experiences.find(e => slugify(e.type) === activeTypeSlug);
        if (matchedExp) initialId = matchedExp.id;
      }
      
      if (!initialId) {
        // If no match based on slug, use the first experience based on activeTypeSlug
        const matchingTypeExps = activeTypeSlug === "alle" 
          ? experiences 
          : experiences.filter(e => slugify(e.type) === activeTypeSlug);
        
        if (matchingTypeExps.length > 0) {
            initialId = matchingTypeExps[0].id;
        } else {
            initialId = experiences[0].id;
        }
      }
      
      setSelectedId(initialId);
    }
  }, [experiences, activeTypeSlug, initialExpSlug]);

  useEffect(() => {
    if (selectedId && scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector(`[data-id="${selectedId}"]`) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
    
    // Update URL when selectedId changes
    const exp = experiences.find(e => e.id === selectedId);
    if (exp) {
      const newUrl = `/opplevelser/${slugify(exp.type)}/${slugify(exp.name)}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
    
  }, [selectedId, experiences]);

  const filteredExperiences = experiences.filter(exp => {
    // 1. Filter by attribute
    let attrMatch = true;
    if (activeFilter === "Familievennlig") attrMatch = exp.familyFriendly;
    else if (activeFilter === "Teambuilding") attrMatch = exp.teambuilding;
    else if (activeFilter === "Fest og Moro") attrMatch = exp.party;
    else if (activeFilter === "Jump Scare") attrMatch = exp.jumpScare;
    
    // 2. Filter by type
    let typeMatch = true;
    if (activeTypeSlug && activeTypeSlug !== "alle") {
      typeMatch = slugify(exp.type) === activeTypeSlug;
    }

    return attrMatch && typeMatch;
  });

  const selected = filteredExperiences.find(e => e.id === selectedId) || filteredExperiences[0] || experiences[0];

  useEffect(() => {
    setIsExpanded(false);
  }, [selectedId]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    
    // Find first experience matching new filter
    const newFiltered = experiences.filter(exp => {
      let attrMatch = true;
      if (filter === "Familievennlig") attrMatch = exp.familyFriendly;
      else if (filter === "Teambuilding") attrMatch = exp.teambuilding;
      else if (filter === "Fest og Moro") attrMatch = exp.party;
      else if (filter === "Jump Scare") attrMatch = exp.jumpScare;
      
      let typeMatch = true;
      if (activeTypeSlug && activeTypeSlug !== "alle") {
        typeMatch = slugify(exp.type) === activeTypeSlug;
      }
      return attrMatch && typeMatch;
    });

    if (newFiltered.length > 0) {
      setSelectedId(newFiltered[0].id);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    }
  };

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

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    
    if (Math.abs(info.offset.x) > swipeThreshold) { 
      const currentIndex = filteredExperiences.findIndex(exp => exp.id === selectedId);
      if (info.offset.x < 0) {
        if (currentIndex < filteredExperiences.length - 1) {
          setSelectedId(filteredExperiences[currentIndex + 1].id);
        }
      } else {
        if (currentIndex > 0) {
          setSelectedId(filteredExperiences[currentIndex - 1].id);
        }
      }
    }
  };

  // Maps experience type to an icon
  const getIconForType = (type: string, name: string) => {
    const lname = name.toLowerCase();
    const ltype = type ? type.toLowerCase() : "";
    
    if (ltype.includes("escape") || lname.includes("escape")) return <Handshake className="w-10 h-10" />;
    if (ltype.includes("shooter") || lname.includes("shooter")) return <Crosshair className="w-10 h-10" />;
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
    <div className="flex flex-col items-center w-full">
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-10 text-center px-4 w-full"
      >
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter">
          Våre VR Opplevelser
        </h1>

        {/* Existing Attribute Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto px-4 mt-6">
          {["Alle", "Teambuilding", "Fest og Moro", "Familievennlig", "Jump Scare"].map(filter => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter
                  ? "bg-[#9C39FF] text-white shadow-[0_0_15px_rgba(156,57,255,0.4)]"
                  : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* New Experience Type Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto px-4 mt-4">
          <Link
            href="/opplevelser"
            scroll={false}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              activeTypeSlug === "alle"
                ? "border-[#9C39FF] bg-[#9C39FF]/20 text-white shadow-[0_0_15px_rgba(156,57,255,0.2)]"
                : "border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-white"
            }`}
          >
            Alle Typer
          </Link>
          {Array.from(new Set(experiences.map(e => e.type))).filter(Boolean).map(type => {
            const tSlug = slugify(type);
            const isActive = activeTypeSlug === tSlug;
            return (
              <Link
                key={type}
                href={`/opplevelser/${tSlug}`}
                scroll={false}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  isActive
                    ? "border-[#9C39FF] bg-[#9C39FF]/20 text-white shadow-[0_0_15px_rgba(156,57,255,0.2)]"
                    : "border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-white"
                }`}
              >
                {type}
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* HORIZONTAL CAROUSEL NAV */}
      <div className="sticky top-[81px] md:top-[189px] lg:top-[199px] z-40 w-full bg-black py-4 mb-12 shadow-[0_20px_40px_rgba(0,0,0,0.8)] border-b border-white/5">
        <div className="relative w-full max-w-6xl mx-auto flex items-center">
          <button 
            onClick={scrollLeft} 
            className="absolute -left-4 md:-left-12 z-10 p-2 text-zinc-500 hover:text-[#9C39FF] transition-colors"
          >
            <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
          </button>

          <div 
            ref={scrollRef}
            className="w-full overflow-x-auto hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex items-start justify-center gap-4 md:gap-8 px-4 w-max min-w-full snap-x snap-mandatory">
            {filteredExperiences.map((exp) => {
            const isSelected = exp.id === selectedId;
            return (
              <button
                key={exp.id}
                data-id={exp.id}
                onClick={() => setSelectedId(exp.id)}
                className={`flex flex-col items-center justify-center flex-shrink-0 snap-center focus:outline-none group min-w-[120px] px-2 py-3 rounded-2xl border transition-all duration-300 ${
                  isSelected 
                    ? "border-[#9C39FF] bg-[#9C39FF]/10 shadow-[0_0_15px_rgba(156,57,255,0.2)]" 
                    : "border-transparent hover:border-zinc-800 hover:bg-zinc-800/30"
                }`}
              >
                <div 
                  className={`mb-2 transition-colors duration-300 ${
                    isSelected 
                      ? "text-white" 
                      : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                >
                  {getIconForType(exp.type, exp.name)}
                </div>
                <span className={`text-sm md:text-base font-medium mb-1 transition-colors ${isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                  {exp.name}
                </span>
                <span className={`text-[10px] md:text-[11px] uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${isSelected ? "bg-[#9C39FF] text-white" : "text-zinc-500 bg-zinc-900"}`}>
                  {exp.type}
                </span>
              </button>
            );
          })}
          </div>
        </div>

        <button 
          onClick={scrollRight} 
          className="absolute -right-4 md:-right-12 z-10 p-2 text-zinc-500 hover:text-[#9C39FF] transition-colors"
        >
          <ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
        </button>
        </div>
      </div>

      {/* SELECTED EXPERIENCE DETAILS */}
      <AnimatePresence mode="wait">
      <motion.div 
        key={selected.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        className="w-full max-w-6xl mx-auto flex flex-col items-center cursor-grab active:cursor-grabbing"
      >
        {/* HERO IMAGE */}
        <div className="relative mb-12">
          <MediaGallery experience={selected} onPlayVideo={() => setIsVideoOpen(true)} />
          {/* Fading text container overlapping bottom of image on desktop */}
        </div>
        <div className="flex flex-col items-center mb-8 gap-4">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-wide uppercase text-center">
            {selected.name}
          </h2>
          <span className="text-xs md:text-sm uppercase tracking-wider px-4 py-1.5 rounded bg-[#9C39FF] text-white font-medium">
            {selected.type}
          </span>
        </div>

        {/* AWARDS / RECOGNITIONS */}
        {selected.awards && Array.isArray(selected.awards) && selected.awards.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-8 max-w-4xl mx-auto px-4">
            {selected.awards.map((awardUrl: string, index: number) => (
              <div key={index} className="relative h-12 md:h-16 flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={awardUrl} 
                  alt={`Award ${index + 1}`} 
                  className="max-h-full max-w-[150px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" 
                />
              </div>
            ))}
          </div>
        )}

        {/* STATS ROW */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-zinc-300 font-medium mb-10 pb-10 border-b border-white/10 w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Timer className="w-5 h-5 text-white" />
            <span>{selected.duration || "45 min"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm md:text-base">
            <Users className="w-5 h-5 text-white" />
            <span>{selected.maxPlayers ? `Fra 2-${selected.maxPlayers} personer` : "Fra 2-8 personer"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm md:text-base">
            <UserCheck className="w-5 h-5 text-white" />
            <span>Fra {selected.age} år</span>
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
          {selected.jumpScare && (
             <div className="flex items-center gap-2 text-sm md:text-base">
                <Activity className="w-5 h-5 text-white" />
                <span>Jump Scare</span>
             </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="max-w-4xl w-full text-center mb-12">
          <p className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed">
            {selected.shortDescription}
          </p>
          
          {selected.detailedDescription && (
            <div className="mt-4">
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-base md:text-lg text-zinc-400 font-light leading-relaxed mt-4 text-left whitespace-pre-wrap">
                      {selected.detailedDescription}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-6 text-sm uppercase tracking-wider font-medium text-[#9C39FF] hover:text-[#b466ff] transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <span>{isExpanded ? "Vis mindre" : "Les mer"}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col items-center gap-4">
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
      </AnimatePresence>

      {/* Video Modal */}
      {isVideoOpen && selected.videoUrl && (() => {
        const isVertical = selected.videoUrl.includes("shorts") || selected.videoUrl.includes("tiktok");
        const containerClasses = isVertical 
          ? "w-full max-w-[400px] md:max-w-[450px] aspect-[9/16] rounded-3xl"
          : "w-full max-w-5xl aspect-video rounded-2xl";

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsVideoOpen(false)}
          >
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-[110] p-3 bg-zinc-800/80 hover:bg-zinc-700 rounded-full text-white transition-colors"
              aria-label="Lukk video"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div 
              className={`${containerClasses} overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-zinc-800 relative z-[105] bg-black`}
              onClick={(e) => e.stopPropagation()}
            >
              {selected.videoUrl.includes("youtube") || selected.videoUrl.includes("vimeo") ? (
                <iframe 
                  src={getEmbedUrl(selected.videoUrl)} 
                  className="w-full h-full"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  src={selected.videoUrl} 
                  className="w-full h-full object-cover"
                  controls 
                  autoPlay 
                  loop 
                  playsInline
                />
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
