"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import HomeCarousel from "@/components/HomeCarousel";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { 
  ArrowRight, 
  CheckCircle2, 
  Handshake, 
  Footprints, 
  Users, 
  Glasses, 
  CalendarHeart, 
  Smile, 
  Info, 
  Clock, 
  Shirt,
  UsersRound,
  UserCheck,
  Crown,
  PartyPopper,
  Truck,
  Star
} from "lucide-react";

export default function LandingPage({ locale = "no" }: { locale?: "no" | "en" }) {
  const isEn = locale === "en";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    "name": "KRS VR Arena",
    "description": isEn
      ? "KRS VR Arena is Kristiansand's premier social free-roam VR and Mixed Reality entertainment center at Lund (Industrigata 12). We offer wireless VR Escape Rooms, Action Strategy (Tactical Arena), Zombie Shooter, and family-friendly adventures in our 300 sqm indoor arena with two game halls and a party lounge. Ideal for families, tourists, friends, corporate team building, bachelor/bachelorette parties, and birthday celebrations."
      : "KRS VR Arena er Kristiansands mest sosiale opplevelsesarena på Lund. Vi tilbyr engasjerende VR Escape Rooms, Action Strategi (Tactical Arena) og felles opplevelser i vår 300 kvm arkade med to spillsaler og lounge. Perfekt for teambuilding, firmaevent, utdrikningslag, bursdag samt vennegjenger og familier.",
    "url": isEn ? "https://www.krsvr.no/en" : "https://www.krsvr.no", 
    "telephone": "+4740828302",
    "hasMap": "https://maps.app.goo.gl/eiVo2wuEaJhXJXENA?g_st=ic",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Industrigata 12",
      "postalCode": "4632",
      "addressLocality": "Kristiansand",
      "addressCountry": "NO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "58.152302",
      "longitude": "8.025888"
    },
    "availableLanguage": ["nb", "en", "de"],
    "keywords": isEn
      ? "VR Kristiansand, Things to do in Kristiansand, Indoor activities Kristiansand, Rainy day activities Southern Norway, VR Escape Room Kristiansand, Escape Room Kristiansand, Family activities Kristiansand, Tactical Arena, Zombie Shooter, Team building Kristiansand"
      : "VR Kristiansand, Mixed Reality Kristiansand, Escape Room Kristiansand, VR Escape Room, Tactical Arena Kristiansand, Action Strategi Kristiansand, Zombie Shooter Kristiansand, Teambuilding Kristiansand, Utdrikningslag Kristiansand, Bursdag Kristiansand",
    "offers": {
      "@type": "AggregateOffer",
      "offerCount": 10,
      "lowPrice": 375,
      "highPrice": 460,
      "priceCurrency": "NOK"
    },
    "memberOf": {
      "@type": "Organization",
      "name": "Visit Sørlandet",
      "url": "https://www.visitsorlandet.com"
    },
    "subjectOf": [
      {
        "@type": "NewsArticle",
        "headline": "Åpnet VR-arena i Kristiansand: – Nytt konsept på Sørlandet (Deler lokale med dansestudio: Nå fyller de storsalen med virtuell moro)",
        "description": "På Lund har byens nyeste virtuelle lekeplass åpnet dørene for både store og små.",
        "abstract": "Reportasje i KRS – Avisen Kristiansand om KRS VR Arena på Lund i Kristiansand, drevet av daglig leder Jan Lewi Skeie og game master Marius Fjermedal. Konseptet er det første av sitt slag på Sørlandet og spesialiserer seg på sosiale VR-opplevelser, virtuelle Escape Rooms og actionspill der man beveger seg fritt på over 140 kvadratmeter med kapasitet fra 2 til 64 spillere. Artikkelen følger blant annet 17 ansatte fra Verkstedet Spiseri på teambuilding fordelt på tre rullerende lag med visning på storskjerm, og omtaler tilbudet for bedrifter (som Ingeniørvesenet), familier, studenter, turister, utdrikningslag og barnebursdager.",
        "keywords": "VR-briller, Lund, Kristiansand, KRS VR Arena, Teambuilding, Virtuelle Escape Rooms, Utdrikningslag, Barnebursdag, Næringsliv",
        "url": "https://www.krs.no/apnet-vr-arena-i-kristiansand-nytt-konsept-pa-sorlandet/s/80-157-40800",
        "datePublished": "2026-10-19T21:49:30+02:00",
        "author": {
          "@type": "Person",
          "name": "Jasmine Marie Agas Ramos"
        },
        "publisher": {
          "@type": "Organization",
          "name": "KRS - Avisen Kristiansand",
          "url": "https://www.krs.no"
        }
      },
      {
        "@type": "Article",
        "headline": "Mini-intervju med KRS VR Arena | Visit Sørlandet",
        "description": "Visit Sørlandet presenterer KRS VR Arena – Sørlandets eneste trådløse free-roam VR-arena på Lund i Kristiansand med teambuilding, firmaevent og unike helårsopplevelser.",
        "abstract": "Mini-intervju publisert av Visit Sørlandet med KRS VR Arena som ny partner. Omtaler arenaen på Lund i Kristiansand med 143 kvm spillflate for opptil 10 samtidige spillere i frittgående VR og opptil 64 personer i sosialt turneringsformat med partylounge og storskjerm for teambuilding, firmaevent, bursdag og utdrikningslag.",
        "url": "https://www.visitsorlandet.com/bransje/visit-sorlandet-utvikling/nyheter/mini-intervjuer-med-vare-partnere/mini-intervju-med-krs-vr-arena/",
        "datePublished": "2026-10-29",
        "publisher": {
          "@type": "Organization",
          "name": "Visit Sørlandet",
          "url": "https://www.visitsorlandet.com"
        }
      }
    ],
    "sameAs": [
      "https://www.visitsorlandet.com/bransje/visit-sorlandet-utvikling/nyheter/mini-intervjuer-med-vare-partnere/mini-intervju-med-krs-vr-arena/",
      "https://www.visitsorlandet.com/listing/krs-vr-arena-%E2%80%93-vr-escape-room-%26-mixed-reality-arkade/867197306/",
      "https://en.visitsorlandet.com/listing/krs-vr-arena-%e2%80%93-vr-escape-room-%26-mixed-reality-arkade/867197306/",
      "https://no.tripadvisor.com/Attraction_Review-g190492-d34257006-Reviews-Krs_VR_Arena-Kristiansand_Vest_Agder_Southern_Norway.html",
      "https://www.krs.no/apnet-vr-arena-i-kristiansand-nytt-konsept-pa-sorlandet/s/80-157-40800",
      "https://www.instagram.com/krs.vr.arena",
      "https://www.tiktok.com/@krs.vr.arena",
      "https://www.facebook.com/krs.vr.arena",
      "https://www.youtube.com/@KrsVRArena"
    ]
  };

  const groupCards = isEn
    ? [
        {
          title: "Corporate Team Building",
          badge: "375 NOK + VAT/pers · 2–64 players",
          description: "Strengthen team spirit with cooperative puzzles for 2–10 players, or a rolling tournament format with live spectator screen in the lounge for up to 64 colleagues. Pizza delivery and pre-ordered bar available.",
          href: "/en/events#teambuilding",
          image: "/images/vr-teambuilding-firmaevent-kristiansand.jpg",
          alt: "Colleagues celebrating together after VR team building at KRS VR Arena in Kristiansand",
          icon: Handshake,
        },
        {
          title: "Bachelor & Bachelorette",
          badge: "Group favorite · 1.5–3 hours",
          description: "A social and engaging celebration where everyone participates on equal footing. Includes private party lounge access with optional hot pizza delivery and pre-ordered drinks.",
          href: "/en/events#bachelor-party",
          image: "/images/vr-utdrikningslag-kristiansand.jpg",
          alt: "Group enjoying a bachelor or bachelorette party in the VR arena at Lund in Kristiansand",
          icon: Crown,
        },
        {
          title: "Friends, Tourists & Students",
          badge: "2–10 players · 0 NOK upfront online",
          description: "Gather your group for 90 minutes of cooperative puzzle-solving in VR Escape Rooms or fast-paced action in Tactical Arena and Zombie Shooter — completely wireless.",
          href: "/en/experiences",
          image: "/images/vr-vennegjeng.jpg",
          alt: "Group of friends playing wireless free-roam VR in a 140 sqm arena",
          icon: Users,
        },
        {
          title: "VR Birthday Parties",
          badge: "From 375 NOK (approx. €32)/pers · Lounge included",
          description: "An active celebration with a dedicated gamemaster and 30 minutes in the party lounge after the game. Tailored packages for kids (8–12 yrs), teens (12+), and adults (18+).",
          href: "/en/events#birthday",
          image: "/images/vr-familiepakke-ungdom-12pluss.jpg",
          imagePosition: "object-[center_18%]",
          alt: "Youth group and birthday celebration with VR headsets at KRS VR Arena",
          icon: CalendarHeart,
        },
        {
          title: "Families with Kids & Teens",
          badge: "Ages 8–12 & 12+ · Safe adventures",
          description: "Explore imaginative worlds and solve exciting challenges together as an active family — no previous VR experience needed. Just 5 minutes from the Kristiansand ferry port.",
          href: "/en/experiences/family",
          image: "/images/vr-familiepakke-8-12-aar.jpg",
          imagePosition: "object-center",
          alt: "Family with children and parents collaborating in VR at KRS VR Arena",
          icon: Glasses,
        },
        {
          title: "VR On-Site – We Come to You",
          badge: "Across Southern Norway · Conferences & Events",
          description: "Hosting a company party, conference, or event at your own venue? We set up a mobile wireless VR arena with dedicated instructors at your location.",
          href: "/en/events#on-site",
          image: "/arrangement-hero.jpg",
          imagePosition: "object-[center_15%]",
          alt: "Players in front of the KRS VR Arena neon sign ready for a VR experience",
          icon: Truck,
        },
      ]
    : [
        {
          title: "Teambuilding & Bedrift",
          badge: "375 kr + mva/pers · 2–64 personer",
          description: "Styrk samholdet med utfordrende samarbeid for 2–10 spillere, eller dynamisk turneringsformat med storskjerm i loungen for opptil 64 kolleger. Mulighet for pizzalevering og forhåndsbestilt bar.",
          href: "/arrangementer/vr-teambuilding",
          image: "/images/vr-teambuilding-firmaevent-kristiansand.jpg",
          alt: "Kolleger som feirer sammen etter VR teambuilding hos KRS VR Arena i Kristiansand",
          icon: Handshake,
        },
        {
          title: "Utdrikningslag",
          badge: "Forloverens favoritt · 1,5–3 timer",
          description: "En energisk og sosial start på feiringen der alle deltar på lik linje. Inkluderer egen partylounge med mulighet for varm pizzalevering og forhåndsbestilt drikke.",
          href: "/arrangementer/vr-utdrikningslag",
          image: "/images/vr-utdrikningslag-kristiansand.jpg",
          alt: "Glad gjeng i utdrikningslag med VR-briller i arenaen på Lund i Kristiansand",
          icon: Crown,
        },
        {
          title: "Vennegjeng & Studenter",
          badge: "2–10 spillere · 20 % studentrabatt søn–tor",
          description: "Samle gjengen til 90 minutter med gåteløsing i VR Escape Room eller høy puls i Tactical Arena og Zombie Shooter – helt uten kabler.",
          href: "/vr-opplevelser",
          image: "/images/vr-vennegjeng.jpg",
          alt: "Vennegjeng i full action med trådløse VR-briller på 140 kvm arena",
          icon: Users,
        },
        {
          title: "VR Bursdag",
          badge: "Fra 375 kr/pers · Partylounge inkludert",
          description: "En aktiv feiring med egen spillvert og 30 minutter i partyloungen etter spillet. Tilpassede opplegg for barnebursdag (8–12 år), ungdom og voksenbursdag (18+).",
          href: "/arrangementer/vr-bursdag",
          image: "/images/vr-familiepakke-ungdom-12pluss.jpg",
          imagePosition: "object-[center_18%]",
          alt: "Ungdomsgjeng og bursdagsfeiring med VR-utstyr hos KRS VR Arena",
          icon: CalendarHeart,
        },
        {
          title: "Familier med barn & ungdom",
          badge: "8–12 år & 12+ · Trygge eventyr",
          description: "Utforsk nye verdener og løs spennende oppgaver sammen som en aktiv familie – helt uavhengig av tidligere VR-erfaring.",
          href: "/vr-opplevelser/familie",
          image: "/images/vr-familiepakke-8-12-aar.jpg",
          imagePosition: "object-center",
          alt: "Familie med barn og voksne som samarbeider i VR hos KRS VR Arena",
          icon: Glasses,
        },
        {
          title: "VR On-site – Vi kommer til dere",
          badge: "I hele Agder · Konferanse & Kickoff",
          description: "Skal dere ha firmafest, konferanse eller arrangement i egne lokaler? Vi rigger opp mobil VR-arena med egne instruktører der dere er.",
          href: "/arrangementer/vr-on-site",
          image: "/arrangement-hero.jpg",
          imagePosition: "object-[center_15%]",
          alt: "Spillere foran KRS VR Arena sitt neonskilt klare for VR-opplevelse",
          icon: Truck,
        },
      ];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const bgX1 = useTransform(springX, [-1000, 1000], [50, -50]);
  const bgY1 = useTransform(springY, [-1000, 1000], [50, -50]);

  const bgX2 = useTransform(springX, [-1000, 1000], [-30, 30]);
  const bgY2 = useTransform(springY, [-1000, 1000], [-30, 30]);

  const abstractX1 = useTransform(springX, [-1000, 1000], [-80, 80]);
  const abstractY1 = useTransform(springY, [-1000, 1000], [-80, 80]);
  const abstractRotate1 = useTransform(springX, [-1000, 1000], [-45, 45]);

  const abstractX2 = useTransform(springX, [-1000, 1000], [60, -60]);
  const abstractY2 = useTransform(springY, [-1000, 1000], [60, -60]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-6 md:pt-12 pb-16">
        <motion.div 
          className="absolute inset-0 -z-10"
          style={{ x: bgX1, y: bgY1 }}
        >
          <div className="absolute inset-[-100px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/15 via-black to-black"></div>
        </motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#9C39FF]/5 rounded-full blur-3xl -z-10"
          style={{ x: bgX2, y: bgY2 }}
        ></motion.div>

        {/* Abstract 2.5D Elements */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full border border-[#9C39FF]/20 -z-10 opacity-50"
          style={{ x: abstractX1, y: abstractY1, rotate: abstractRotate1 }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] rounded-full border border-[#9C39FF]/10 -z-10 opacity-30"
          style={{ x: abstractX2, y: abstractY2 }}
        ></motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto space-y-5 md:space-y-6"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-white leading-[1.12] max-w-4xl mx-auto">
            {isEn
              ? "Kristiansand's Most Social VR Experiences"
              : "Kristiansands mest sosiale VR-opplevelser"}
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed">
            {isEn ? (
              <>
                Laughter, communication, and teamwork across ages and experience levels — from cooperative puzzle-solving in <strong className="font-semibold text-white">VR Escape Rooms</strong> to wireless <strong className="font-semibold text-white">Action Strategy</strong> in our 300 sqm indoor arena.
              </>
            ) : (
              <>
                Latter, kommunikasjon og samarbeid som <strong className="font-semibold text-white">begeistrer</strong> på tvers av alder og teknisk erfaring – fra gåteløsing i VR Escape Rooms til fysisk Action Strategi i vår 300 kvm arkade.
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm sm:text-base text-zinc-300 font-light pt-1">
            <span className="flex items-center gap-2">
              <span className="text-[#9C39FF] font-bold text-base leading-none">•</span>
              {isEn ? "Families, tourists & friends" : "Venne- og familieopplevelser"}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#9C39FF] font-bold text-base leading-none">•</span>
              {isEn ? "Bachelor parties & birthdays" : "Utdrikningslag & bursdag"}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#9C39FF] font-bold text-base leading-none">•</span>
              {isEn ? "Team building & corporate events" : "Teambuilding & firmaevent"}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button nativeButton={false} render={<Link href={isEn ? "/en/booking" : "/booking"} />} size="lg" className="h-13 md:h-14 px-8 text-base md:text-lg bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)] transition-all hover:scale-105 min-w-[230px]">
              {isEn ? "Book Experience" : "Book opplevelse"} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button nativeButton={false} render={<Link href={isEn ? "/en/experiences" : "/vr-opplevelser"} />} size="lg" variant="outline" className="h-13 md:h-14 px-8 text-base md:text-lg border-zinc-700 hover:bg-zinc-800 rounded-full text-white min-w-[230px]">
              {isEn ? "Explore Games" : "Se opplevelser"}
            </Button>
          </div>

          {/* 3-Photo Showcase Row Above the Fold */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 md:gap-5 pt-4 md:pt-6 max-w-5xl mx-auto text-left">
            <Link
              href={isEn ? "/en/experiences" : "/vr-opplevelser"}
              className="group relative h-44 sm:h-48 md:h-56 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 hover:border-[#9C39FF]/60 transition-all duration-300 shadow-xl"
            >
              <Image
                src="/images/vr-familiepakke-8-12-aar.jpg"
                alt={isEn ? "Family and friends playing wireless VR together at KRS VR Arena in Kristiansand" : "Familie og vennegjeng som spiller VR og utforsker spennende verdener hos KRS VR Arena i Kristiansand"}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4">
                <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-[#9C39FF] text-white font-medium mb-1.5 shadow">
                  {isEn ? "2–10 players simultaneously" : "2–10 spillere samtidig"}
                </span>
                <div className="text-base md:text-lg font-semibold text-white group-hover:text-[#9C39FF] transition-colors leading-tight">
                  {isEn ? "Families, Tourists & Friends" : "Familie eller vennegjeng"}
                </div>
                <div className="text-xs text-zinc-300 font-light mt-0.5">
                  {isEn ? "Family Packages, Action Strategy & Escape Rooms" : "Spennende verdener, Action Strategi eller Escape Rooms"}
                </div>
              </div>
            </Link>

            <Link
              href={isEn ? "/en/events#teambuilding" : "/arrangementer/vr-teambuilding"}
              className="group relative h-44 sm:h-48 md:h-56 rounded-2xl md:rounded-3xl overflow-hidden border border-[#9C39FF]/40 hover:border-[#9C39FF] transition-all duration-300 shadow-[0_0_25px_rgba(156,57,255,0.18)]"
            >
              <Image
                src="/images/vr-teambuilding-firmaevent-kristiansand.jpg"
                alt={isEn ? "Company team building and corporate event at KRS VR Arena in Kristiansand" : "Bedrift på VR teambuilding og firmaevent hos KRS VR Arena i Kristiansand"}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4">
                <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white font-medium mb-1.5">
                  {isEn ? "2–64 players · Invoice & Bar" : "2–64 pers · EHF & Bar"}
                </span>
                <div className="text-base md:text-lg font-semibold text-white group-hover:text-[#9C39FF] transition-colors leading-tight">
                  {isEn ? "Team Building & Corporate" : "Teambuilding & Bedrift"}
                </div>
                <div className="text-xs text-zinc-300 font-light mt-0.5">
                  {isEn ? "Cooperation, tournament & catering" : "Samarbeid, turnering & servering"}
                </div>
              </div>
            </Link>

            <Link
              href={isEn ? "/en/events#bachelor-party" : "/arrangementer/vr-utdrikningslag"}
              className="group relative h-44 sm:h-48 md:h-56 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 hover:border-[#9C39FF]/60 transition-all duration-300 shadow-xl"
            >
              <Image
                src="/images/vr-utdrikningslag-kristiansand.jpg"
                alt={isEn ? "Bachelor party and birthday celebration in the VR arena in Kristiansand" : "Utdrikningslag og bursdagsfeiring i VR-arenaen i Kristiansand"}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4">
                <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white font-medium mb-1.5">
                  {isEn ? "Private party lounge" : "Egen partylounge"}
                </span>
                <div className="text-base md:text-lg font-semibold text-white group-hover:text-[#9C39FF] transition-colors leading-tight">
                  {isEn ? "Bachelor Parties & Birthdays" : "Utdrikningslag & Bursdag"}
                </div>
                <div className="text-xs text-zinc-300 font-light mt-0.5">
                  {isEn ? "Social celebration for the whole group" : "Sosial feiring for hele gjengen"}
                </div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* 2. Tillitslinje (Trust Line) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 sm:mt-14 w-full max-w-6xl mx-auto flex flex-wrap justify-center gap-6 lg:gap-12 px-4"
        >
          <div className="flex flex-col items-center gap-2 text-zinc-400 p-2 w-[140px] md:w-[160px]">
            <Smile className="w-6 h-6 text-[#9C39FF]/70" />
            <span className="text-sm font-medium text-center leading-tight">
              {isEn ? "No prior VR experience needed" : "Ingen erfaring nødvendig"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 text-zinc-400 p-2 w-[140px] md:w-[160px]">
            <UserCheck className="w-6 h-6 text-[#9C39FF]/70" />
            <span className="text-sm font-medium text-center leading-tight">
              {isEn ? "Dedicated English-speaking gamemaster" : "Dere får en dedikert gamemaster"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 text-zinc-400 p-2 w-[140px] md:w-[160px]">
            <UsersRound className="w-6 h-6 text-[#9C39FF]/70" />
            <span className="text-sm font-medium text-center leading-tight">
              {isEn ? "Work together in small or large groups" : "Jobb sammen i små eller store grupper"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 text-zinc-400 p-2 w-[140px] md:w-[160px]">
            <Footprints className="w-6 h-6 text-[#9C39FF]/70" />
            <span className="text-sm font-medium text-center leading-tight">
              {isEn ? "Walk freely inside the game — wireless VR" : "Beveg dere fysisk i spillet - gående opplevelse"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 text-zinc-400 p-2 w-[140px] md:w-[160px]">
            <PartyPopper className="w-6 h-6 text-[#9C39FF]/70" />
            <span className="text-sm font-medium text-center leading-tight">
              {isEn ? "30 min party lounge access after your game" : "Tilgang til vår partylounge i 30 min etter spillet"}
            </span>
          </div>
        </motion.div>

        {/* Trust Pill below feature icons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-8 sm:mt-10"
        >
          <div className="inline-flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-1 sm:gap-2 px-5 py-2.5 sm:px-4 sm:py-2 rounded-2xl sm:rounded-full bg-zinc-900/80 border border-white/10 text-xs sm:text-sm text-zinc-300">
            <span className="inline-flex items-center gap-1.5 text-[#19EB5B] font-medium">
              <Star className="w-3.5 h-3.5 fill-[#19EB5B] text-[#19EB5B]" />
              {isEn ? "5.0 on Google Maps & TripAdvisor" : "5,0 på Google Maps & TripAdvisor"}
            </span>
            <span className="hidden sm:inline text-zinc-600">&middot;</span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-zinc-300">
              <span>{isEn ? "90 min total visit" : "90 min totalopplevelse"}</span>
              <span className="text-zinc-600">&middot;</span>
              <span>{isEn ? "2–64 players" : "2–64 personer"}</span>
              <span className="text-zinc-600">&middot;</span>
              <span>{isEn ? "From 375 NOK (approx. €32)/pers" : "Fra 375 kr/pers"}</span>
            </div>
          </div>
        </motion.div>
      </section>


      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              {isEn ? "How It Works" : "Slik fungerer det"}
            </h2>
            <p className="text-xl text-zinc-400 font-light">
              {isEn ? "Simple, safe, and engaging for everyone." : "Enkelt og veldig engasjerende."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 max-w-5xl mx-auto text-center relative px-2">
            {/* Connecting Line (desktop only) */}
            <div className="hidden md:block absolute top-[44px] left-[15%] w-[70%] h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center group">
              <div className="w-20 h-20 rounded-full bg-zinc-950 border-2 border-zinc-800 text-2xl font-light text-white flex items-center justify-center mb-8 shadow-xl transition-colors group-hover:border-zinc-600">
                1
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">
                {isEn ? "Choose Time & VR Experience" : "Velg tidspunkt og VR opplevelse"}
              </h3>
              <p className="text-zinc-400 font-light leading-relaxed">
                {isEn
                  ? "Pick the adventure that suits your group best and reserve a time slot online — 0 NOK upfront, pay by card upon arrival."
                  : "Finn den opplevelsen som appellerer mest til din gruppe, og reserver et tidspunkt."}
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center group">
              <div className="w-20 h-20 rounded-full bg-zinc-950 border-2 border-zinc-800 text-2xl font-light text-white flex items-center justify-center mb-8 shadow-xl transition-colors group-hover:border-zinc-600">
                2
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">
                {isEn ? "Arrive at the Arena" : "Møt opp"}
              </h3>
              <p className="text-zinc-400 font-light leading-relaxed">
                {isEn
                  ? "Our gamemaster welcomes your group at Industrigata 12 and guides you safely through the equipment and rules."
                  : "Vår gamemaster tar dere imot, og veileder dere gjennom hele opplevelsen."}
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center group">
              <div className="w-20 h-20 rounded-full bg-[#9C39FF] border-2 border-[#9C39FF] text-2xl font-medium text-white flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(156,57,255,0.4)]">
                3
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">
                {isEn ? "Share the VR Experience Together" : "Del VR opplevelsen sammen"}
              </h3>
              <p className="text-zinc-400 font-light leading-relaxed">
                {isEn
                  ? "Step into virtual worlds together, followed by 30 minutes in our lounge to relax and compare scores."
                  : "En kveld som får gruppa engasjert og dere sent glemmer."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Seksjon: Perfekt for grupper */}
      <section className="py-24 bg-zinc-950/50 border-y border-white/5 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight">
              {isEn ? "Designed for Groups & Families" : "Perfekt for grupper"}
            </h2>
            <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto">
              {isEn
                ? "Activities tailored for both small and large groups, ensuring a safe and welcoming experience regardless of prior VR familiarity."
                : "Aktiviteten kan tilpasses både små og store grupper, og alle får en trygg og god opplevelse – helt uavhengig av tidligere VR-erfaring."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {groupCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-3xl bg-zinc-900/40 border border-zinc-800/60 overflow-hidden flex flex-col hover:border-[#9C39FF]/50 hover:bg-zinc-900/70 transition-all duration-300 cursor-pointer group shadow-lg"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      className={`object-cover ${"imagePosition" in card && card.imagePosition ? card.imagePosition : "object-center"} group-hover:scale-105 transition-transform duration-700`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                    <div className="absolute top-3.5 left-3.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-zinc-200">
                      {card.badge}
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-grow justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-[#9C39FF]/15 flex items-center justify-center text-[#9C39FF] group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-medium text-white group-hover:text-[#9C39FF] transition-colors">
                          {card.title}
                        </h3>
                      </div>
                      <p className="text-zinc-400 text-sm font-light leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    <div className="inline-flex items-center text-sm font-medium text-white group-hover:text-[#9C39FF] transition-colors pt-1">
                      {isEn ? "Read more" : "Les mer"} <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5.5. Seksjon: Våre Opplevelser (Carousel) */}
      <section className="py-28 relative overflow-hidden bg-zinc-950/80 border-y border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#9C39FF]/15 via-transparent to-transparent opacity-80 pointer-events-none" />
        
        {/* Subtle blur overlay at edges for smoother scrolling effect */}
        <div className="hidden md:block absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent z-10 pointer-events-none" />
        <div className="hidden md:block absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-zinc-950 via-zinc-950/70 to-transparent z-10 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-5 tracking-tight">
              {isEn ? "Virtual Worlds to Explore" : "Spennende verdener å utforske"}
            </h2>
            <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto">
              {isEn
                ? "From family-friendly cooperative quests and escape rooms to tactical team shooters — all games are available with English audio and text."
                : "Utvalget er stort, og opplevelsene varierer i sjangre fra spenningsfylte eventyr til taktisk action."}
            </p>
          </div>
          <HomeCarousel locale={locale} />
          
          <div className="mt-14 text-center">
            <Link href={isEn ? "/en/experiences" : "/vr-opplevelser"} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-medium transition-all bg-[#9C39FF] text-white hover:bg-[#b05aff] hover:shadow-[0_0_20px_rgba(156,57,255,0.4)]">
              {isEn ? "See All VR Experiences" : "Se alle VR-opplevelser"} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Seksjon: Teambuilding Testimonials Carousel */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-transparent to-[#9C39FF]/5">
        <div className="container mx-auto px-4">
          <div className="mb-20">
             <div className="max-w-4xl mx-auto text-center mb-12">
               <h2 className="text-4xl md:text-5xl font-light text-white mb-5 tracking-tight">
                 {isEn ? "Team Building That Connects Colleagues" : "Teambuilding som begeistrer"}
               </h2>
               <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto">
                 {isEn
                   ? "Shared experiences your team will talk about long after the event. From smaller departments to social company tournaments for up to 64 participants."
                   : "Opplevelser de ansatte faktisk snakker om etterpå. Fra mindre avdelinger til sosiale bedriftsturneringer for opptil 64 deltakere."}
               </p>
             </div>
             <TestimonialsCarousel />
          </div>

          <div className="max-w-5xl mx-auto bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-6 sm:p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#9C39FF]/10 rounded-full blur-3xl -z-10 absolute-center translate-x-1/3 -translate-y-1/2"></div>
            
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-5 sm:mb-6">
              {isEn ? "Looking for an activity that strengthens team bonds?" : "Ser dere etter en aktivitet som virkelig bygger relasjoner?"}
            </h3>
            <p className="text-base sm:text-xl text-zinc-300 font-light max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              {isEn
                ? "In our experiences, participants must collaborate, communicate, and solve challenges together. For larger companies (10–64 players), we run a social tournament format with a big screen in the lounge, custom team wristbands, hot pizza delivery, pre-ordered bar, and corporate invoicing."
                : "I våre opplevelser må deltakerne samarbeide, kommunisere og løse oppgaver i fellesskap. For større bedrifter (10–64 personer) kjører vi et sosialt turneringsformat med storskjerm i loungen, egne lag-armbånd, varm pizzalevering, forhåndsbestilt bar og EHF-faktura."}
            </p>
            <Button nativeButton={false} render={<Link href={isEn ? "/en/events#teambuilding" : "/arrangementer/vr-teambuilding"} />} size="lg" className="w-full sm:w-auto max-w-full whitespace-normal h-auto min-h-12 sm:h-14 py-3 px-5 sm:px-8 text-sm sm:text-lg bg-white text-black hover:bg-zinc-200 rounded-full font-medium transition-transform hover:scale-105">
              <span>{isEn ? "View Corporate & Group Packages" : "Se bedriftsopplegg og teambuilding"}</span>
              <ArrowRight className="ml-1.5 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Seksjon: Hvorfor velge KRS VR Arena? */}
      <section className="py-24 bg-zinc-950 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-light text-white mb-16 text-center">
            {isEn ? "Why Choose KRS VR Arena?" : "Hvorfor velge KRS VR Arena?"}
          </h2>
          <div className="max-w-4xl mx-auto">
            <ul className="space-y-4">
              {(isEn
                ? [
                    "Social team activities where up to 10 players play simultaneously across 143 sqm of free-roam arena space.",
                    "Dynamic tournament format with big-screen spectator view and team competition for groups of 10 to 64 people.",
                    "Safe, friendly guidance from a dedicated English-speaking gamemaster throughout your entire visit.",
                    "Wireless, free-walking experience inside virtual worlds — comfortable for both first-timers and experienced gamers.",
                    "All games are carefully selected and tested for high teamwork value and zero motion sickness.",
                    "Access to our party lounge after the game, with optional hot pizza delivery and pre-ordered bar packages.",
                    "Centrally located at Lund in Kristiansand (Industrigata 12) — 5 minutes from the ferry port & E18 with easy parking."
                  ]
                : [
                    "Sosiale team-aktiviteter der opptil 10 personer spiller samtidig i 143 m² arena.",
                    "Dynamisk turneringsformat med storskjerm og lagkonkurranse for grupper fra 10 til 64 personer.",
                    "Engasjerende og trygg veiledning fra dedikert spillvert gjennom hele besøket.",
                    "Trådløs, gående opplevelse inni virtuelle verdener – passer både nybegynnere og erfarne.",
                    "Alle spill er nøye utvalgt og testet for høy samarbeids- og underholdningsverdi.",
                    "Tilgang til partylounge etter spillet, med mulighet for varm pizzalevering og forhåndsbestilt bar (øl/cider eller vin/bobler).",
                    "Sentralt på Lund i Kristiansand (Industrigata 12) med gratis gateparkering i nærområdet."
                  ]
              ).map((item, idx) => (
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
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              {isEn ? "Practical Information" : "Praktisk informasjon"}
            </h2>
            <p className="text-xl text-zinc-400 font-light">
              {isEn ? "Helpful details before visiting our arena in Kristiansand." : "Greit å vite før dere besøker oss i arenaen."}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex gap-5 p-8 bg-zinc-950/50 rounded-3xl border border-zinc-800/50">
              <Clock className="w-10 h-10 text-[#9C39FF] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-medium text-white mb-2">
                  {isEn ? "Arrive on Time" : "Møt presist"}
                </h4>
                <p className="text-zinc-400 font-light leading-relaxed">
                  {isEn
                    ? "Please arrive on time so you do not lose any game time. We begin registration and briefing at your scheduled start time."
                    : "Møt presist for å ikke miste spilletid. Vi starter med registrering og gjennomgang til oppsatt tid."}
                </p>
              </div>
            </div>
            <div className="flex gap-5 p-8 bg-zinc-950/50 rounded-3xl border border-zinc-800/50">
              <Shirt className="w-10 h-10 text-[#9C39FF] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-medium text-white mb-2">
                  {isEn ? "Glasses & Clothing" : "Briller og klær"}
                </h4>
                <p className="text-zinc-400 font-light leading-relaxed">
                  {isEn
                    ? "Normal eyeglasses fit inside the VR headsets, though contact lenses are even more comfortable. Wear comfortable clothes and flat shoes — you will walk freely around the arena."
                    : "Vi anbefaler å bruke linser fremfor briller. Bruk komfortable klær og flate sko. T-skjorte anbefales. Dere vil bevege dere fritt rundt på arenaen gjennom hele opplevelsen."}
                </p>
              </div>
            </div>
            <div className="flex gap-5 p-8 bg-zinc-950/50 rounded-3xl border border-zinc-800/50">
              <Info className="w-10 h-10 text-[#9C39FF] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-medium text-white mb-2">
                  {isEn ? "48-Hour Cancellation" : "48 timer"}
                </h4>
                <p className="text-zinc-400 font-light leading-relaxed">
                  {isEn
                    ? "Free cancellation up to 48 hours before your scheduled session. You can adjust player count and names anytime via your booking link."
                    : "Avbookinger innen 48 timer før oppsatt spill. Se fullstendige vilkår før booking."}
                </p>
              </div>
            </div>
            <div className="flex gap-5 p-8 bg-zinc-950/50 rounded-3xl border border-zinc-800/50">
              <Users className="w-10 h-10 text-[#9C39FF] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-medium text-white mb-2">
                  {isEn ? "Groups Larger Than 10 Players" : "Grupper større enn 10 personer"}
                </h4>
                <p className="text-zinc-400 font-light leading-relaxed">
                  {isEn
                    ? "Use our contact form for groups of 10–64 people. Up to 10 players play simultaneously, and larger groups enjoy a rolling tournament format so everyone shares the event together."
                    : "Bruk kontaktskjema. Opptil 10 personer kan spille samtidig. For større grupper kjører vi et sosialt turneringsformat med rullerende runder, slik at alle deltar på samme arrangement."}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
             <p className="text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
               {isEn
                 ? "Upon request, children up to 14 years receive a 10% discount and students receive a 20% discount Sunday–Thursday (in groups of 3+ players). International visitors can reserve online with 0 NOK upfront and pay by Visa, Mastercard, or Apple Pay on arrival."
                 : "Ved forespørsel får barn til og med 14 år 10 %, og studenter 20 %, rabatt alle dager, bortsett fra fredag og lørdag (i grupper på 3+ pers). Om du booker på nett refunderer vi rabatten ved forespørsel."}
             </p>
          </div>
        </div>
      </section>

      {/* 9. Avsluttende CTA */}
      <section className="py-32 relative text-center px-4 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-[#9C39FF]/10 to-transparent -z-10"></div>
        <h2 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight">
          {isEn ? "Ready to Try VR Together?" : "Klar for å prøve VR sammen?"}
        </h2>
        <p className="text-xl text-zinc-400 font-light mb-12 max-w-2xl mx-auto">
          {isEn
            ? "Reserve your time slot online, or send us an inquiry for larger groups. We look forward to welcoming you."
            : "Reserver tid på nett, eller send oss en forespørsel for større grupper. Vi gleder oss til å ta imot dere."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md sm:max-w-none mx-auto">
          <Button nativeButton={false} render={<Link href={isEn ? "/en/booking" : "/booking"} />} size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl bg-[#9C39FF] hover:bg-[#8b32e6] text-white rounded-full shadow-[0_0_30px_rgba(156,57,255,0.4)] transition-all hover:scale-105 sm:min-w-[300px]">
            {isEn ? "Book Experience" : "Book opplevelse"}
          </Button>
          <Button nativeButton={false} render={<Link href={isEn ? "/en/contact" : "/kontakt"} />} size="lg" variant="outline" className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 text-lg sm:text-xl border-zinc-700 hover:bg-zinc-800 rounded-full text-white sm:min-w-[300px]">
            {isEn ? "Group Inquiry (10+ players)" : "Send gruppeforespørsel (10+)"}
          </Button>
        </div>
      </section>

    </main>
  );
}

