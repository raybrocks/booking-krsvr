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
  Smile,
  Activity,
  X,
  Play
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function MediaGallery({ experience }: { experience: any }) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full aspect-video md:aspect-auto md:h-[450px] rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl group">
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
      </div>
    </div>
  );
}

export function ExperiencesView() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("Alle");
  const [isVideoOpen, setIsVideoOpen] = useState(false);
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
    } else if (url.includes("vimeo.com/")) {
      embedUrl = url.replace("vimeo.com/", "player.vimeo.com/video/");
    }
    return embedUrl;
  };

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

  const filteredExperiences = experiences.filter(exp => {
    if (activeFilter === "Alle") return true;
    if (activeFilter === "Familievennlig") return exp.familyFriendly;
    if (activeFilter === "Teambuilding") return exp.teambuilding;
    if (activeFilter === "Fest og Moro") return exp.party;
    if (activeFilter === "Jump Scare") return exp.jumpScare;
    return true;
  });

  const selected = filteredExperiences.find(e => e.id === selectedId) || filteredExperiences[0] || experiences[0];

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    
    // Find first experience matching new filter
    const newFiltered = experiences.filter(exp => {
      if (filter === "Alle") return true;
      if (filter === "Familievennlig") return exp.familyFriendly;
      if (filter === "Teambuilding") return exp.teambuilding;
      if (filter === "Fest og Moro") return exp.party;
      if (filter === "Jump Scare") return exp.jumpScare;
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
    <div className="flex flex-col items-center w-full">
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center mb-8 w-full"
      >
        <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-6">
          Våre VR Opplevelser
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto px-4">
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
      </motion.div>

      {/* HORIZONTAL CAROUSEL NAV */}
      <div className="sticky top-[70px] md:top-[85px] z-40 w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 py-4 mb-12 shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
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
          <span className="text-xs md:text-sm uppercase tracking-wider px-4 py-1.5 rounded bg-[#9C39FF] text-white font-medium">
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
          {selected.jumpScare && (
             <div className="flex items-center gap-2 text-sm md:text-base">
                <Activity className="w-5 h-5 text-white" />
                <span>Jump Scare</span>
             </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <p className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed max-w-4xl text-center mb-12">
          {selected.shortDescription}
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col items-center gap-4">
          {selected.videoUrl && (
            <Button 
              variant="secondary"
              size="lg" 
              onClick={() => setIsVideoOpen(true)}
              className="h-12 px-8 text-base bg-zinc-800 hover:bg-zinc-700 text-white rounded-full uppercase font-medium border border-zinc-700 transition-all hover:scale-105 group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:text-[#9C39FF] transition-colors" />
              Se video
            </Button>
          )}
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

      {/* Video Modal */}
      {isVideoOpen && selected.videoUrl && (
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
            className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 relative z-[105]"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe 
              src={getEmbedUrl(selected.videoUrl)} 
              className="w-full h-full"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
