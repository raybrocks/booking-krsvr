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
  Play,
  Maximize,
  Trophy,
  Sparkles,
  Moon,
  Info
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

const getTypeSlug = (exp: any) => exp.experienceType?.slug || slugify(exp.type || "");

function MediaGallery({ experience, onPlayVideo }: { experience: any; onPlayVideo?: () => void }) {
  return (
    <div className="w-full flex flex-col items-center relative group">
      <div className="w-full aspect-video md:aspect-auto md:h-[450px] rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl">
        {experience.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={experience.picture} 
            alt={`Spill ${experience.name} - ${experience.type} hos KRS VR Arena i Kristiansand`} 
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
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activePrimaryFilter, setActivePrimaryFilter] = useState<string>(() => {
    if (initialTypeSlug === "escape-room" || initialTypeSlug === "escape-rooms") return "Escape Room";
    if (initialTypeSlug === "mixed-reality") return "Mixed Reality";
    if (initialTypeSlug === "zombie" || initialTypeSlug === "zombie-shooter") return "Zombie";
    return "Alle";
  });
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
    if (experiences.length > 0) {
      let initialId = "";
      const typeSlug = initialTypeSlug || "alle";
      // Initialize selectedId based on typeSlug and initialExpSlug
      if (typeSlug !== "alle" && initialExpSlug) {
        const matchedExp = experiences.find(e => getTypeSlug(e) === typeSlug && slugify(e.name) === initialExpSlug);
        if (matchedExp) initialId = matchedExp.id;
      } else if (typeSlug !== "alle") {
        const matchedExp = experiences.find(e => getTypeSlug(e) === typeSlug);
        if (matchedExp) initialId = matchedExp.id;
      }
      
      if (!initialId) {
        // If no match based on slug, use the first experience based on typeSlug
        const matchingTypeExps = typeSlug === "alle" 
          ? experiences 
          : experiences.filter(e => getTypeSlug(e) === typeSlug);
        
        if (matchingTypeExps.length > 0) {
            initialId = matchingTypeExps[0].id;
        } else {
            initialId = experiences[0].id;
        }
      }
      
      setSelectedId(initialId);
    }
  }, [experiences, initialTypeSlug, initialExpSlug]);

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
      const newUrl = `/vr-opplevelser/${getTypeSlug(exp)}/${slugify(exp.name)}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
    
  }, [selectedId, experiences]);

  const filteredExperiences = experiences.filter(exp => {
    if (activePrimaryFilter === "Alle") return true;
    if (activePrimaryFilter === "Familie") return exp.familyFriendly;
    if (activePrimaryFilter === "Teambuilding") return exp.teambuilding;
    
    const tSlug = getTypeSlug(exp);
    const nSlug = slugify(exp.name || "");
    
    if (activePrimaryFilter === "Escape Room") return tSlug.includes("escape");
    if (activePrimaryFilter === "Mixed Reality") return tSlug.includes("mixed-reality");
    if (activePrimaryFilter === "Zombie") return tSlug.includes("zombie") || nSlug.includes("zombie");
    
    return true;
  });

  const selected = filteredExperiences.find(e => e.id === selectedId) || filteredExperiences[0] || experiences[0];

  useEffect(() => {
    setIsExpanded(false);
  }, [selectedId]);

  const handlePrimaryFilterClick = (filter: string) => {
    setActivePrimaryFilter(filter);
    
    const newFiltered = experiences.filter(exp => {
      if (filter === "Alle") return true;
      if (filter === "Familie") return exp.familyFriendly;
      if (filter === "Teambuilding") return exp.teambuilding;
      
      const tSlug = getTypeSlug(exp);
      const nSlug = slugify(exp.name || "");
      
      if (filter === "Escape Room") return tSlug.includes("escape");
      if (filter === "Mixed Reality") return tSlug.includes("mixed-reality");
      if (filter === "Zombie") return tSlug.includes("zombie") || nSlug.includes("zombie");
      
      return true;
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

  if (experiences.length === 0) {
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
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter mb-4">
          Våre VR Opplevelser
        </h1>

        {/* Simple Primary Filter Row */}
        <p className="text-zinc-400 text-base md:text-lg text-center font-light mb-10 max-w-2xl mx-auto px-4">
          Alle opplevelser hos oss er laget for samarbeid, kommunikasjon og felles mestring.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-4xl mx-auto px-4 mb-4">
          {["Alle", "Escape Room", "Mixed Reality", "Zombie", "Familie", "Teambuilding"].map(filter => (
            <button
              key={filter}
              onClick={() => handlePrimaryFilterClick(filter)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                activePrimaryFilter === filter
                  ? "border-[#9C39FF] bg-[#9C39FF]/20 text-white shadow-[0_0_15px_rgba(156,57,255,0.2)]"
                  : "border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {filteredExperiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 w-full">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
            <X className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 text-center">Ingen opplevelser funnet</h2>
          <p className="text-zinc-400 text-center max-w-md">Ingen opplevelser matcher filtrene. Prøv å fjerne ett filter.</p>
        </div>
      ) : (
        <>
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
                const isSelected = selected ? exp.id === selected.id : false;
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
                          ? "text-[#9C39FF]" 
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

          {/* MAIN EXPERIENCE DISPLAY */}
          {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl mx-auto flex flex-col items-center cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* HERO IMAGE */}
            <div className="relative mb-12 w-full">
              <MediaGallery experience={selected} onPlayVideo={() => setIsVideoOpen(true)} />
            </div>
            <div className="flex flex-col items-center mb-8 gap-4 px-4">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-wide uppercase text-center">
                {selected.name}
              </h2>
              {selected.subName && (
                <h3 className="text-lg md:text-2xl text-zinc-400 font-medium tracking-wide uppercase text-center -mt-2">
                  {selected.subName}
                </h3>
              )}
              <div className="flex items-center gap-2 flex-wrap justify-center mt-2">
                <span className="text-xs md:text-sm uppercase tracking-wider px-4 py-1.5 rounded bg-[#9C39FF] text-white font-medium">
                  {selected.type}
                </span>
                {selected.action && <span title="Høyt tempo og spenning!" className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Action</span>}
                {selected.jumpScare && <span title="Advarsel: Kan inneholde skremmende elementer" className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Jump Scare</span>}
                {selected.highscore && <span title="Jakt på poeng og sett nye rekorder!" className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Highscore</span>}
                {selected.fantasy && <span title="Opplev magiske og eventyrlige verdener" className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Fantasy</span>}
                {selected.mystic && <span title="Gåtefulle og spennende mysterier venter" className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Mystikk</span>}
                {selected.codeSolving && <span title="Krever kløkt og logisk tenkning for å løse kodene" className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Kodeløsning</span>}
              </div>
            </div>

            {/* AWARDS / RECOGNITIONS */}
            {selected.awards && Array.isArray(selected.awards) && selected.awards.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-8 max-w-4xl mx-auto px-4">
                {selected.awards.map((awardUrl: string, index: number) => (
                  <div key={index} className="relative h-12 md:h-16 flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                    <img 
                      src={awardUrl} 
                      alt={`Utmerkelse for ${selected.name}`} 
                      className="max-h-full max-w-[150px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" 
                    />
                  </div>
                ))}
              </div>
            )}

            {/* STATS ROW */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-zinc-300 font-medium mb-10 pb-10 border-b border-white/10 w-full max-w-4xl mx-auto px-4">
              <div className="flex items-center gap-2 text-sm md:text-base relative group cursor-help">
                <Timer className="w-5 h-5 text-white" />
                <span>{selected.duration || "90 min"}</span>
                <Info className="w-4 h-4 text-zinc-400" />
                
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-left">
                  <h4 className="font-bold text-white mb-2 text-sm">90 minutter totalopplevelse</h4>
                  <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4">
                    <li>10-15 min forberedelse og intro</li>
                    <li>Rundt 60 min in-game session</li>
                    <li>Gruppebilde og gratis vann</li>
                    <li>Mission debrief og scoreboard i lounge</li>
                    <li>Lån av party lounge i 30 min etter spill</li>
                    <li>Mulighet for medbrakt mat/drikke</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm md:text-base">
                <Users className="w-5 h-5 text-white" />
                <span>{selected.maxPlayers ? `Fra 2-${selected.maxPlayers} personer` : "Fra 2-8 personer"}</span>
              </div>

              {selected.arenaSize && (
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Maximize className="w-5 h-5 text-white" />
                  <span>{selected.arenaSize}</span>
                </div>
              )}

              {selected.age && (
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <UserCheck className="w-5 h-5 text-white" />
                  <span>Fra {selected.age} år</span>
                </div>
              )}

              {selected.difficulty && (
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Activity className="w-5 h-5 text-white" />
                  <span>{selected.difficulty}</span>
                </div>
              )}
            </div>

            {/* CONTENT MERGED */}
            <div className="flex flex-col gap-12 w-full max-w-3xl mx-auto px-4 items-center">
              {/* DESCRIPTION & PASSER FOR */}
              <div className="flex flex-col items-center w-full">
                {(selected.familyFriendly || selected.teambuilding || selected.party) && (
                  <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 mb-12 bg-zinc-900/40 p-4 md:px-8 rounded-2xl border border-white/5 w-full">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Passer for:</span>
                    <div className="flex flex-wrap items-center gap-4">
                      {selected.familyFriendly && (
                        <div className="flex items-center gap-2 cursor-help" title="Passer perfekt for hele familien">
                          <Baby className="w-4 h-4 text-[#9C39FF]" />
                          <span className="text-sm text-zinc-300 font-medium">Familie</span>
                        </div>
                      )}
                      {selected.teambuilding && (
                        <div className="flex items-center gap-2 cursor-help" title="Krever samarbeid og kommunikasjon">
                          <Layers className="w-4 h-4 text-[#9C39FF]" />
                          <span className="text-sm text-zinc-300 font-medium">Teambuilding</span>
                        </div>
                      )}
                      {selected.party && (
                        <div className="flex items-center gap-2 cursor-help" title="Ypperlig for fest og moro!">
                          <PartyPopper className="w-4 h-4 text-[#9C39FF]" />
                          <span className="text-sm text-zinc-300 font-medium">Vennegjeng</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-6 text-center">Om opplevelsen</h3>
                <div className="prose prose-invert prose-lg max-w-none text-zinc-400 text-center">
                  {selected.shortDescription && selected.shortDescription.split('\n').map((paragraph: string, i: number) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* PRICING IF AVAILABLE */}
              <div className="w-full">
                {/* PRICING IF AVAILABLE */}
                {selected.pricing && Array.isArray(selected.pricing) && selected.pricing.length > 0 && (
                  <div className="bg-gradient-to-br from-zinc-900 to-black p-6 md:p-8 rounded-3xl border border-zinc-800 w-full">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Priser</h3>
                    <div className="flex flex-col gap-3">
                      {selected.pricing.map((p: any, i: number) => (
                        <div key={i} className="flex justify-between items-center border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                          <span className="text-zinc-400">{p.label}</span>
                          <span className="text-white font-bold">{p.price} kr</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* BOOK BUTTON */}
            <div className="mt-16 mb-8 w-full px-4 flex justify-center">
              <Link href={`/booking?opplevelse=${selected.id}`}>
                <Button size="lg" className="bg-[#9C39FF] hover:bg-[#8A2BE2] text-white px-12 py-8 text-xl rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)] hover:shadow-[0_0_40px_rgba(156,57,255,0.6)] hover:-translate-y-1 transition-all duration-300">
                  Book {selected.name}
                </Button>
              </Link>
            </div>
          </motion.div>
          )}
        </>
      )}

      {/* VIDEO MODAL */}
      {isVideoOpen && selected && selected.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className={`relative w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl ${
            selected.videoUrl.includes("shorts") || selected.videoUrl.includes("tiktok") 
              ? "max-w-md aspect-[9/16]" 
              : "max-w-5xl aspect-video"
          }`}>
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe 
              src={getEmbedUrl(selected.videoUrl) + "?autoplay=1"} 
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
