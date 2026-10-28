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
  Info,
  Globe
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { getLanguageInfo } from "@/lib/languages";
import { localizeExperience } from "@/lib/i18n";

const getTypeSlug = (exp: any) => exp.experienceType?.slug || slugify(exp.type || "");

function MediaGallery({ experience, onPlayVideo }: { experience: any; onPlayVideo?: () => void }) {
  const images: string[] = Array.isArray(experience.images) && experience.images.length > 0
    ? experience.images
    : experience.picture
    ? [experience.picture]
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);

  const hasMultiple = images.length > 1;
  const safeIndex = currentIndex >= images.length ? 0 : currentIndex;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiple) return;
    pointerStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultiple || pointerStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - pointerStartX.current;
    const threshold = 40;
    if (deltaX < -threshold && safeIndex < images.length - 1) {
      goNext();
    } else if (deltaX > threshold && safeIndex > 0) {
      goPrev();
    }
    pointerStartX.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!hasMultiple) return;
    pointerStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!hasMultiple || pointerStartX.current === null) return;
    const deltaX = e.clientX - pointerStartX.current;
    const threshold = 50;
    if (deltaX < -threshold && safeIndex < images.length - 1) {
      goNext();
    } else if (deltaX > threshold && safeIndex > 0) {
      goPrev();
    }
    pointerStartX.current = null;
  };

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* IMAGE SLIDER */}
      <div
        className={`w-full aspect-video md:aspect-auto md:h-[450px] rounded-3xl overflow-hidden relative border border-white/5 bg-zinc-950 shadow-2xl select-none ${
          hasMultiple ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {images.length > 0 ? (
          <div
            className="flex w-full h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${safeIndex * 100}%)` }}
          >
            {images.map((imgUrl, idx) => (
              <div key={`${imgUrl}-${idx}`} className="w-full h-full flex-shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Spill ${experience.name} (${idx + 1}/${images.length}) - ${experience.type} hos KRS VR Arena i Kristiansand`}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            <Gamepad2 className="w-20 h-20 text-zinc-800" />
          </div>
        )}

        {/* Left Arrow */}
        {hasMultiple && safeIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Forrige bilde"
            className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/55 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        {/* Right Arrow */}
        {hasMultiple && safeIndex < images.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Neste bilde"
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/55 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}
      </div>

      {/* INSTAGRAM-STYLE DOTS NAVBAR */}
      {hasMultiple && (
        <div className="mt-4 flex items-center justify-center gap-2" aria-label="Bildegalleri navigasjon">
          {images.map((_, idx) => {
            const isActive = idx === safeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Vis bilde ${idx + 1}`}
                aria-current={isActive ? "true" : undefined}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-2.5 h-2.5 bg-[#9C39FF] shadow-[0_0_8px_rgba(156,57,255,0.8)] scale-110"
                    : "w-2 h-2 bg-zinc-600 hover:bg-zinc-400"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* STANDALONE VIDEO TRAILER BUTTON BELOW CAROUSEL */}
      {experience.videoUrl && onPlayVideo && (
        <button
          type="button"
          onClick={onPlayVideo}
          className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 hover:bg-[#9C39FF]/20 border border-[#9C39FF]/50 hover:border-[#9C39FF] text-white text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(156,57,255,0.15)] hover:shadow-[0_0_20px_rgba(156,57,255,0.35)] transition-all cursor-pointer group/trailer"
        >
          <Play className="w-3.5 h-3.5 text-[#9C39FF] fill-[#9C39FF] group-hover/trailer:scale-110 transition-transform" />
          <span>VIDEO TRAILER</span>
        </button>
      )}
    </div>
  );
}

function LanguageFlagsRow({ languages }: { languages: string[] }) {
  const [activeLang, setActiveLang] = useState<string | null>(null);

  if (!languages || languages.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm md:text-base">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-white shrink-0" />
        <span>Available languages:</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {languages.map((lang) => {
          const info = getLanguageInfo(lang);
          const isOpen = activeLang === lang;
          return (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang((prev) => (prev === lang ? null : lang))}
              onMouseLeave={() => setActiveLang((prev) => (prev === lang ? null : prev))}
              aria-label={info.label}
              className="relative group/flag inline-flex items-center justify-center p-1 rounded-md hover:bg-white/10 active:scale-110 transition-all cursor-pointer focus:outline-none"
            >
              <span className="text-lg md:text-xl leading-none select-none" aria-hidden="true">
                {info.flag}
              </span>
              <span className="sr-only">
                {info.label} ({info.labelNo})
              </span>
              <span
                className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-white text-[11px] font-bold tracking-wider uppercase whitespace-nowrap shadow-xl transition-all z-50 ${
                  isOpen
                    ? "opacity-100 visible -translate-y-0.5"
                    : "opacity-0 invisible group-hover/flag:opacity-100 group-hover/flag:visible group-hover/flag:-translate-y-0.5"
                }`}
              >
                {info.label.toUpperCase()}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ExperiencesView({ 
  initialExperiences = [],
  initialTypeSlug, 
  initialExpSlug,
  locale = "no"
}: { 
  initialExperiences?: any[];
  initialTypeSlug?: string | null;
  initialExpSlug?: string | null;
  locale?: "no" | "en";
}) {
  const isEn = locale === "en";
  const [experiences, setExperiences] = useState<any[]>(
    initialExperiences
      .filter((e: any) => e.isActive && e.type !== "Vipps test")
      .map((e: any) => ({ ...localizeExperience(e, locale), rawName: e.name }))
  );
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(experiences.length === 0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activePrimaryFilter, setActivePrimaryFilter] = useState<string>(() => {
    if (initialTypeSlug === "familie" || initialTypeSlug === "family" || initialTypeSlug === "familiepakke" || initialTypeSlug === "archer") return "Familie";
    if (initialTypeSlug === "action-strategi" || initialTypeSlug === "action-strategy" || initialTypeSlug === "action" || initialTypeSlug === "rask-action" || initialTypeSlug === "fast-action" || initialTypeSlug === "mixed-reality" || initialTypeSlug === "zombie") return "Action Strategi";
    if (initialTypeSlug === "escape-room" || initialTypeSlug === "escape-rooms") return "Escape Room";
    return "Alle";
  });
  const [isExpanded, setIsExpanded] = useState(false);
  // Prevents selectedId useEffect from overriding a URL already set by a filter button click,
  // and also skips the initial URL push when arriving via a category filter URL without a specific experience slug.
  const skipNextUrlUpdate = useRef(Boolean(initialTypeSlug && !initialExpSlug));
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

          exps = exps
            .filter((e: any) => e.isActive && e.type !== "Vipps test")
            .map((e: any) => ({ ...localizeExperience(e, locale), rawName: e.name }));
          setExperiences(exps);
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, [initialExperiences.length, locale]);

  const normalizeTypeSlug = (slug: string) => {
    if (slug === "family") return "familie";
    if (slug === "action-strategy") return "action-strategi";
    return slug;
  };

  useEffect(() => {
    if (experiences.length > 0) {
      let initialId = "";
      const rawTypeSlug = initialTypeSlug || "alle";
      const typeSlug = normalizeTypeSlug(rawTypeSlug);
      // Initialize selectedId based on typeSlug and initialExpSlug
      if (typeSlug !== "alle" && initialExpSlug) {
        const matchedExp = experiences.find(
          e =>
            getTypeSlug(e) === typeSlug &&
            (slugify(e.rawName || e.name) === initialExpSlug || slugify(e.name) === initialExpSlug)
        );
        if (matchedExp) initialId = matchedExp.id;
      } else if (typeSlug !== "alle") {
        const matchedExp = experiences.find(e => getTypeSlug(e) === typeSlug);
        if (matchedExp) initialId = matchedExp.id;
      }
      
      if (!initialId) {
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

    // Skip URL update if a filter click (or virtual filter init) already set the URL
    if (skipNextUrlUpdate.current) {
      skipNextUrlUpdate.current = false;
      return;
    }
    
    // Update URL when selectedId changes (specific experience navigation)
    const exp = experiences.find(e => e.id === selectedId);
    if (exp) {
      const tSlug = getTypeSlug(exp);
      const enTypeSlug = tSlug === "familie" ? "family" : tSlug === "action-strategi" ? "action-strategy" : tSlug;
      const expSlug = slugify(exp.rawName || exp.name);
      const newUrl = isEn
        ? `/en/experiences/${enTypeSlug}/${expSlug}`
        : `/vr-opplevelser/${tSlug}/${expSlug}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
    
  }, [selectedId, experiences, isEn]);

  const matchesPrimaryFilter = (exp: any, filter: string) => {
    if (filter === "Alle") return true;
    if (Array.isArray(exp.filterCategories) && exp.filterCategories.length > 0) {
      return exp.filterCategories.includes(filter);
    }
    const tSlug = getTypeSlug(exp);
    if (filter === "Familie") return tSlug === "familie" || exp.familyFriendly;
    if (filter === "Action Strategi" || filter === "Action" || filter === "Rask Action") return tSlug === "action-strategi" || tSlug === "action" || tSlug === "rask-action";
    if (filter === "Escape Room") return tSlug === "escape-room" || tSlug.includes("escape");
    return true;
  };

  const filteredExperiences = experiences.filter(exp => matchesPrimaryFilter(exp, activePrimaryFilter));

  const selected = filteredExperiences.find(e => e.id === selectedId) || filteredExperiences[0] || experiences[0];

  useEffect(() => {
    setIsExpanded(false);
  }, [selectedId]);

  const handlePrimaryFilterClick = (filter: string) => {
    setActivePrimaryFilter(filter);

    skipNextUrlUpdate.current = true;
    if (isEn) {
      if (filter === "Familie") {
        window.history.pushState({}, '', '/en/experiences/family');
      } else if (filter === "Action Strategi" || filter === "Action" || filter === "Rask Action") {
        window.history.pushState({}, '', '/en/experiences/action-strategy');
      } else if (filter === "Escape Room") {
        window.history.pushState({}, '', '/en/experiences/escape-room');
      } else {
        window.history.pushState({}, '', '/en/experiences');
      }
    } else {
      if (filter === "Familie") {
        window.history.pushState({}, '', '/vr-opplevelser/familie');
      } else if (filter === "Action Strategi" || filter === "Action" || filter === "Rask Action") {
        window.history.pushState({}, '', '/vr-opplevelser/action-strategi');
      } else if (filter === "Escape Room") {
        window.history.pushState({}, '', '/vr-opplevelser/escape-room');
      } else {
        window.history.pushState({}, '', '/vr-opplevelser');
      }
    }
    
    const newFiltered = experiences.filter(exp => matchesPrimaryFilter(exp, filter));

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
    if (ltype.includes("shooter") || lname.includes("shooter") || lname.includes("tactical") || lname.includes("hunter") || lname.includes("jakt")) return <Crosshair className="w-10 h-10" />;
    if (ltype.includes("zomb") || lname.includes("zomb") || lname.includes("fear") || lname.includes("blood")) return <Skull className="w-10 h-10" />;
    if (ltype.includes("archer") || lname.includes("archer") || lname.includes("arrow")) return <Mountain className="w-10 h-10" />;
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
        <h2 className="text-2xl font-bold text-white mb-4">
          {isEn ? "No experiences available right now" : "Ingen opplevelser lagt til enda"}
        </h2>
        <p className="text-zinc-400">
          {isEn ? "Please check back soon." : "Kom tilbake senere for å se våre opplevelser."}
        </p>
      </div>
    );
  }

  const getHeadingTitle = () => {
    if (isEn) {
      switch (activePrimaryFilter) {
        case "Familie":
          return "Family-Friendly VR Experiences";
        case "Action Strategi":
        case "Action":
        case "Rask Action":
          return "Action & Strategy in VR";
        case "Escape Room":
          return "VR Escape Rooms";
        default:
          return "VR Experiences in Kristiansand";
      }
    }
    switch (activePrimaryFilter) {
      case "Familie":
        return "Familievennlige VR-opplevelser";
      case "Action Strategi":
      case "Action":
      case "Rask Action":
        return "Action & Strategi i VR";
      case "Escape Room":
        return "VR Escape Room";
      default:
        return "VR-opplevelser i Kristiansand";
    }
  };

  const filterDisplayLabel = (filter: string) => {
    if (!isEn) return filter;
    if (filter === "Alle") return "All";
    if (filter === "Familie") return "Family";
    if (filter === "Action Strategi") return "Action & Strategy";
    return filter;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-6 md:mb-10 text-center px-3 md:px-4 w-full"
      >
        <h1 className="text-3xl md:text-5xl font-light tracking-tighter mb-3 md:mb-4">
          {getHeadingTitle()}
        </h1>

        {/* Simple Primary Filter Row */}
        <p className="text-zinc-400 text-sm md:text-lg text-center font-light mb-5 md:mb-8 max-w-2xl mx-auto px-2">
          {isEn
            ? "Gather family, friends, or colleagues for wireless VR experiences at KRS VR Arena in Kristiansand. Designed for teamwork, communication, and shared excitement."
            : "Samle familie, venner eller kolleger til unike opplevelser hos KRS VR Arena i Kristiansand. Laget for samarbeid, kommunikasjon og felles mestring."}
        </p>
        <div className="flex items-center justify-center w-full max-w-2xl mx-auto px-2 mb-2 sm:mb-4">
          <div className="inline-flex items-center justify-center gap-1 sm:gap-1.5 p-1 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-md overflow-x-auto max-w-full hide-scrollbar shadow-inner">
            {["Alle", "Familie", "Action Strategi", "Escape Room"].map((filter) => {
              const isActive = activePrimaryFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => handlePrimaryFilterClick(filter)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm tracking-wide whitespace-nowrap transition-all cursor-pointer font-medium ${
                    isActive
                      ? "bg-[#9C39FF] text-white font-semibold shadow-[0_0_12px_rgba(156,57,255,0.45)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {filterDisplayLabel(filter)}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {filteredExperiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 w-full">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
            <X className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 text-center">
            {isEn ? "No experiences found" : "Ingen opplevelser funnet"}
          </h2>
          <p className="text-zinc-400 text-center max-w-md">
            {isEn ? "No experiences match your current filter." : "Ingen opplevelser matcher filtrene. Prøv å fjerne ett filter."}
          </p>
        </div>
      ) : (
        <>
          {/* HORIZONTAL CAROUSEL NAV */}
          <div className="relative w-full bg-black py-2 mb-8 md:mb-12 border-b border-white/5">
            <div className="relative w-full max-w-6xl mx-auto flex items-center">
              <button 
                onClick={scrollLeft} 
                className="absolute -left-4 md:-left-12 z-10 p-2 text-zinc-500 hover:text-[#9C39FF] transition-colors"
              >
                <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
              </button>

              <div 
                ref={scrollRef}
                className="w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 px-4 py-4 w-max min-w-full">
                {filteredExperiences.map((exp) => {
                const isSelected = selected ? exp.id === selected.id : false;
                return (
                  <button
                    key={exp.id}
                    data-id={exp.id}
                    onClick={() => setSelectedId(exp.id)}
                    className={`relative flex flex-col items-center justify-between flex-shrink-0 snap-center focus:outline-none group w-[125px] sm:w-[140px] md:w-[165px] px-2 py-3 rounded-2xl border transition-all duration-300 min-h-[124px] sm:min-h-[134px] md:min-h-[144px] ${
                      isSelected 
                        ? "border-[#9C39FF] bg-[#9C39FF]/10 shadow-[0_0_15px_rgba(156,57,255,0.2)]" 
                        : "border-transparent hover:border-zinc-800 hover:bg-zinc-800/30"
                    }`}
                  >
                    {exp.isNew && (
                      <span className="absolute -top-2 right-2 bg-[#19EB5B] text-black text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(25,235,91,0.45)]">
                        {isEn ? "New" : "Nyhet"}
                      </span>
                    )}
                    <div 
                      className={`mb-1.5 transition-colors duration-300 flex items-center justify-center h-10 w-10 ${
                        isSelected 
                          ? "text-[#9C39FF]" 
                          : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    >
                      {getIconForType(exp.type, exp.name)}
                    </div>
                    <div className="w-full min-h-[2.5rem] sm:min-h-[2.75rem] flex items-center justify-center mb-1.5 px-1">
                      <span 
                        className={`w-full text-center text-xs sm:text-sm md:text-[15px] font-medium transition-colors [text-wrap:balance] leading-tight ${
                          isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                        }`}
                      >
                        {exp.name}
                      </span>
                    </div>
                    <span 
                      className={`text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wider px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                        isSelected ? "bg-[#9C39FF] text-white" : "text-zinc-500 bg-zinc-900"
                      }`}
                    >
                      {exp.displayType || exp.type}
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
            className="w-full max-w-6xl mx-auto flex flex-col items-center"
          >
            {/* HERO IMAGE CAROUSEL */}
            <div className="relative mb-10 w-full">
              <MediaGallery experience={selected} onPlayVideo={() => setIsVideoOpen(true)} />
            </div>

            {/* SWIPEABLE CONTENT AREA BELOW IMAGE */}
            <motion.div
              className="w-full flex flex-col items-center cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
            >
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
                {selected.isNew && (
                  <span className="text-xs md:text-sm uppercase tracking-wider px-3.5 py-1.5 rounded bg-[#19EB5B] text-black font-extrabold shadow-[0_0_15px_rgba(25,235,91,0.3)]">
                    {isEn ? "New" : "Nyhet"}
                  </span>
                )}
                <span className="text-xs md:text-sm uppercase tracking-wider px-4 py-1.5 rounded bg-[#9C39FF] text-white font-medium">
                  {selected.displayType || selected.type}
                </span>
                {selected.mixedReality && <span title={isEn ? "Physical movement blending the real arena with the virtual world" : "Fysisk bevegelse der det virkelige rommet blandes med den virtuelle verdenen"} className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Mixed Reality</span>}
                {selected.cinematic && <span title={isEn ? "Cinematic experience with strong story and atmosphere" : "Filmatisk opplevelse med sterk historie og atmosfære"} className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Cinematic</span>}
                {selected.action && <span title={isEn ? "Fast-paced action!" : "Høyt tempo og spenning!"} className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Action</span>}
                {selected.jumpScare && <span title={isEn ? "Note: May contain sudden scary elements" : "Advarsel: Kan inneholde skremmende elementer"} className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Jump Scare</span>}
                {selected.highscore && <span title={isEn ? "Compete for points and set new records!" : "Jakt på poeng og sett nye rekorder!"} className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Highscore</span>}
                {selected.fantasy && <span title={isEn ? "Explore magical fantasy worlds" : "Opplev magiske og eventyrlige verdener"} className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">Fantasy</span>}
                {selected.mystic && <span title={isEn ? "Mysterious puzzles await" : "Gåtefulle og spennende mysterier venter"} className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">{isEn ? "Mystery" : "Mystikk"}</span>}
                {selected.codeSolving && <span title={isEn ? "Requires logic and teamwork to crack the codes" : "Krever kløkt og logisk tenkning for å løse kodene"} className="text-xs uppercase tracking-wider px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 font-medium cursor-help">{isEn ? "Code Solving" : "Kodeløsning"}</span>}
              </div>
            </div>

            {/* AWARDS / RECOGNITIONS */}
            {selected.awards && Array.isArray(selected.awards) && selected.awards.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-8 max-w-4xl mx-auto px-4">
                {selected.awards.map((awardUrl: string, index: number) => (
                  <div key={index} className="relative h-12 md:h-16 flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={awardUrl} 
                      alt={`Award for ${selected.name}`} 
                      className="max-h-full max-w-[150px] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" 
                    />
                  </div>
                ))}
              </div>
            )}

            {/* STATS ROW (3 METADATA LINES) */}
            <div className="flex flex-col items-center gap-5 md:gap-6 text-zinc-300 font-medium mb-10 pb-10 border-b border-white/10 w-full max-w-4xl mx-auto px-4">
              {/* Line 1: Core stats */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-10">
                <div className="flex items-center gap-2 text-sm md:text-base relative group cursor-help whitespace-nowrap">
                  <Timer className="w-5 h-5 text-white shrink-0" />
                  <span>{selected.duration || "90 min"}</span>
                  <Info className="w-4 h-4 text-zinc-400 shrink-0" />
                  
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-left whitespace-normal">
                    <h4 className="font-bold text-white mb-2 text-sm">
                      {isEn ? "90-minute total experience" : "90 minutter totalopplevelse"}
                    </h4>
                    <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4">
                      {isEn ? (
                        <>
                          <li>10–15 min briefing & equipment setup</li>
                          <li>Approx. 60 min active in-game session</li>
                          <li>Group photo & complimentary water</li>
                          <li>Mission debrief & scoreboard in the lounge</li>
                          <li>30 min access to the party lounge after the game</li>
                          <li>Complimentary coffee & water</li>
                        </>
                      ) : (
                        <>
                          <li>10-15 min forberedelse og intro</li>
                          <li>Rundt 60 min in-game session</li>
                          <li>Gruppebilde og gratis vann</li>
                          <li>Mission debrief og scoreboard i lounge</li>
                          <li>Lån av party lounge i 30 min etter spill</li>
                          <li>Gratis kaffe og vann (servering kan forhåndsbestilles)</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm md:text-base whitespace-nowrap">
                  <Users className="w-5 h-5 text-white shrink-0" />
                  <span>
                    {isEn
                      ? selected.maxPlayers
                        ? `2–${selected.maxPlayers} players`
                        : "2–10 players"
                      : selected.maxPlayers
                      ? `Fra 2-${selected.maxPlayers} personer`
                      : "Fra 2-10 personer"}
                  </span>
                </div>

                {selected.arenaSize && (
                  <div className="flex items-center gap-2 text-sm md:text-base whitespace-nowrap">
                    <Maximize className="w-5 h-5 text-white shrink-0" />
                    <span>{isEn ? selected.arenaSize.replace("kvm", "sqm") : selected.arenaSize}</span>
                  </div>
                )}

                {selected.age && (
                  <div className="flex items-center gap-2 text-sm md:text-base whitespace-nowrap">
                    <UserCheck className="w-5 h-5 text-white shrink-0" />
                    <span>{isEn ? `Age ${selected.age.replace("+", "")}+` : `Fra ${selected.age} år`}</span>
                  </div>
                )}

                {selected.difficulty && (
                  <div className="flex items-center gap-2 text-sm md:text-base whitespace-nowrap">
                    <Activity className="w-5 h-5 text-white shrink-0" />
                    <span>{selected.difficulty}</span>
                  </div>
                )}
              </div>

              {/* Line 2: Passer for */}
              {Array.isArray(selected.suitableFor) && selected.suitableFor.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-sm md:text-base max-w-3xl">
                  <div className="flex items-center gap-2 text-white whitespace-nowrap mr-0.5">
                    <Users className="w-5 h-5 text-white shrink-0" />
                    <span>{isEn ? "Suitable for:" : "Passer for:"}</span>
                  </div>
                  {selected.suitableFor.map((audience: string, idx: number) => (
                    <React.Fragment key={audience}>
                      <span className="text-zinc-200 whitespace-nowrap">{audience}</span>
                      {idx < selected.suitableFor.length - 1 && (
                        <span className="text-[#9C39FF] font-bold select-none" aria-hidden="true">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Line 3: Available languages */}
              {selected.languages && selected.languages.length > 0 && (
                <LanguageFlagsRow key={`lang-${selected.id}`} languages={selected.languages} />
              )}
            </div>

            {/* CONTENT MERGED */}
            <div className="flex flex-col gap-12 w-full max-w-3xl mx-auto px-4 items-center">
              {/* DESCRIPTION */}
              <div className="flex flex-col items-center w-full">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  {isEn ? "About the experience" : "Om opplevelsen"}
                </h3>
                <div className="prose prose-invert prose-lg max-w-none text-zinc-400 text-center">
                  {selected.shortDescription && selected.shortDescription.split('\n').map((paragraph: string, i: number) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* PRICING IF AVAILABLE */}
              <div className="w-full">
                {selected.pricing && Array.isArray(selected.pricing) && selected.pricing.length > 0 && (
                  <div className="bg-gradient-to-br from-zinc-900 to-black p-6 md:p-8 rounded-3xl border border-zinc-800 w-full">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">{isEn ? "Pricing" : "Priser"}</h3>
                    <div className="flex flex-col gap-3">
                      {selected.pricing.map((p: any, i: number) => (
                        <div key={i} className="flex justify-between items-center border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                          <span className="text-zinc-400">{p.label}</span>
                          <span className="text-white font-bold">{p.price} NOK</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* BOOK BUTTON */}
            <div className="mt-16 mb-8 w-full px-4 flex justify-center">
              <Link href={isEn ? `/en/booking?opplevelse=${selected.id}` : `/booking?opplevelse=${selected.id}`}>
                <Button size="lg" className="bg-[#9C39FF] hover:bg-[#8A2BE2] text-white px-12 py-8 text-xl rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)] hover:shadow-[0_0_40px_rgba(156,57,255,0.6)] hover:-translate-y-1 transition-all duration-300">
                  {isEn ? `Book ${selected.name}` : `Book ${selected.name}`}
                </Button>
              </Link>
            </div>
            </motion.div>
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
