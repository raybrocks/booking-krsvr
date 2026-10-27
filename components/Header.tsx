"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { detectLocaleFromPath, getTranslatedPath, type Locale } from "@/lib/i18n";

const ARRANGEMENT_LINKS_NO = [
  { href: "/arrangementer", label: "Oversikt over arrangementer" },
  { href: "/arrangementer/vr-bursdag", label: "VR Bursdag" },
  { href: "/arrangementer/vr-utdrikningslag", label: "VR Utdrikningslag" },
  { href: "/arrangementer/vr-teambuilding", label: "VR Teambuilding & Firma" },
  { href: "/arrangementer/vr-on-site", label: "VR On-site (Vi kommer til deg)" },
];

const ARRANGEMENT_LINKS_EN = [
  { href: "/en/events", label: "All Group Events Overview" },
  { href: "/en/events#teambuilding", label: "Corporate & Team Building" },
  { href: "/en/events#bachelor-party", label: "Bachelor & Bachelorette Party" },
  { href: "/en/events#birthday", label: "VR Birthday Party" },
  { href: "/en/events#on-site", label: "Mobile VR On-Site" },
];

const LANGUAGES: { code: Locale; label: string; title: string }[] = [
  { code: "no", label: "NO", title: "Norsk" },
  { code: "en", label: "EN", title: "English" },
  { code: "de", label: "DE", title: "Deutsch (Info)" },
  { code: "nl", label: "NL", title: "Nederlands (Info)" },
];

export default function Header() {
  const pathname = usePathname();
  const locale = detectLocaleFromPath(pathname);
  const isIntl = locale !== "no";

  const [isOpen, setIsOpen] = useState(false);
  const [mobileArrangementerOpen, setMobileArrangementerOpen] = useState(true);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setDesktopDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setDesktopDropdownOpen(false);
    }, 150);
    setCloseTimeout(timeout);
  };

  const navLinks = isIntl
    ? [
        { href: "/en", label: "Home" },
        { href: "/en/experiences", label: "VR Experiences" },
        { href: "/en/events", label: "Events & Groups", hasDropdown: true },
        { href: "/en/prices", label: "Prices" },
        { href: "/en/faq", label: "FAQ" },
        { href: "/en/contact", label: "Contact" },
        { href: "/en/booking", label: "Book Now" },
      ]
    : [
        { href: "/", label: "Hovedside" },
        { href: "/vr-opplevelser", label: "VR Opplevelser" },
        { href: "/arrangementer", label: "Arrangementer", hasDropdown: true },
        { href: "/priser", label: "Priser" },
        { href: "/faq", label: "FAQ" },
        { href: "/kontakt", label: "Kontakt" },
        { href: "/booking", label: "Booking" },
      ];

  const arrangementSubLinks = isIntl ? ARRANGEMENT_LINKS_EN : ARRANGEMENT_LINKS_NO;
  const logoHref = locale === "no" ? "/" : "/en";

  return (
    <header className="w-full relative md:sticky top-0 z-50 pointer-events-none flex flex-col md:pt-4">
      {/* Background container */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md border-b border-white/5 md:bg-gradient-to-b md:from-background md:via-background/90 md:to-transparent md:border-none md:h-[200px]" />

      {/* TOP ROW: Logo & Actions */}
      <div className="relative w-full px-4 md:px-8 py-4 md:py-2 flex justify-between items-center max-w-[1600px] mx-auto pointer-events-auto">
        {/* Left spacer for Logo centering */}
        <div className="flex flex-1" />

        {/* Center Logo */}
        <div className="flex justify-center flex-shrink-0">
          <Link href={logoHref} className="flex items-center justify-center transition-transform hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="KRS VR ARENA" className="h-[52px] md:h-[70px] lg:h-[80px] object-contain" />
          </Link>
        </div>

        {/* Right side Actions: Language Switcher & Mobile Menu Trigger */}
        <div className="flex flex-1 justify-end items-center gap-2 md:gap-4">
          {/* Desktop & Tablet Language Switcher */}
          <div
            className="hidden sm:inline-flex items-center gap-0.5 bg-zinc-900/80 border border-white/10 backdrop-blur-md rounded-full px-1.5 py-1"
            aria-label="Language switcher"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-400 ml-1.5 mr-1" />
            {LANGUAGES.map((lang) => {
              const active = locale === lang.code;
              const targetHref = getTranslatedPath(pathname, lang.code);
              return (
                <Link
                  key={lang.code}
                  href={targetHref}
                  title={lang.title}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium tracking-wider transition-all ${
                    active
                      ? "bg-[#9C39FF] text-white shadow-[0_0_10px_rgba(156,57,255,0.4)]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {lang.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-1.5">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger render={<button className="text-zinc-200 hover:text-white p-2" aria-label="Menu" />}>
                <Menu size={28} />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-[#0a0a0c]/95 border-zinc-800/50 backdrop-blur-xl text-zinc-100 flex flex-col pt-14 overflow-y-auto"
              >
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>

                {/* Mobile Language Switcher */}
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-full p-1">
                    {LANGUAGES.map((lang) => {
                      const active = locale === lang.code;
                      const targetHref = getTranslatedPath(pathname, lang.code);
                      return (
                        <Link
                          key={lang.code}
                          href={targetHref}
                          onClick={() => setIsOpen(false)}
                          title={lang.title}
                          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-all ${
                            active
                              ? "bg-[#9C39FF] text-white shadow-[0_0_10px_rgba(156,57,255,0.4)]"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          {lang.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <nav className="flex flex-col items-center gap-6 flex-1 w-full mt-2 pb-12">
                  {navLinks.map((link) => {
                    const isBooking = link.href === "/booking" || link.href === "/en/booking";
                    const isArrangementer = link.hasDropdown;
                    const isActive = isArrangementer
                      ? pathname === link.href || pathname.startsWith("/arrangementer/")
                      : pathname === link.href;

                    if (isBooking) {
                      return (
                        <div key={link.href} className="w-full flex justify-center mt-2">
                          <Link
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center h-12 px-10 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(156,57,255,0.3)] transition-all hover:scale-105"
                          >
                            {link.label}
                          </Link>
                        </div>
                      );
                    }

                    if (isArrangementer) {
                      return (
                        <div key={link.href} className="w-full flex flex-col items-center">
                          <button
                            onClick={() => setMobileArrangementerOpen(!mobileArrangementerOpen)}
                            className={`flex items-center gap-2 text-2xl font-light tracking-wide transition-all ${
                              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                            }`}
                          >
                            <span>{link.label}</span>
                            <ChevronDown
                              size={20}
                              className={`transition-transform duration-200 text-zinc-400 ${
                                mobileArrangementerOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {mobileArrangementerOpen && (
                            <div className="flex flex-col items-center gap-3.5 mt-3 pt-2 pb-1 border-y border-white/5 w-full bg-white/[0.02] rounded-2xl">
                              {arrangementSubLinks.map((sub) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`text-sm tracking-wide transition-colors ${
                                      isSubActive ? "text-[#9C39FF] font-semibold" : "text-zinc-400 hover:text-white"
                                    }`}
                                  >
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-2xl font-light tracking-wide transition-all ${
                          isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                        }`}
                      >
                        {isActive ? (
                          <span className="relative flex flex-col items-center">
                            {link.label}
                            <span className="absolute -bottom-3 w-1 h-1 rounded-full bg-[#9C39FF]" />
                          </span>
                        ) : (
                          link.label
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Desktop Pill Nav */}
      <div className="hidden md:flex relative justify-center w-full mt-4 pointer-events-auto">
        <nav className="flex relative gap-1 md:gap-2">
          {navLinks.map((link) => {
            const isArrangementer = link.hasDropdown;
            const isActive = isArrangementer
              ? pathname === link.href || pathname.startsWith("/arrangementer/")
              : pathname === link.href;
            const isBooking = link.href === "/booking" || link.href === "/en/booking";

            if (isBooking) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-center h-10 px-6 ml-2 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-sm font-bold uppercase transition-all shadow-[0_0_15px_rgba(156,57,255,0.5)] hover:shadow-[0_0_25px_rgba(156,57,255,0.7)] hover:scale-105"
                >
                  {link.label}
                </Link>
              );
            }

            if (isArrangementer) {
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={link.href}
                    className={`relative inline-flex items-center gap-1.5 px-6 py-2.5 outline-none rounded-full text-sm font-medium tracking-wide transition-colors ${
                      isActive ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 bg-[#9C39FF] rounded-full shadow-[0_0_15px_rgba(156,57,255,0.4)]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                    <ChevronDown size={14} className="relative z-10 opacity-70" />
                  </Link>

                  {/* Dropdown panel */}
                  <AnimatePresence>
                    {desktopDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 min-w-[240px]"
                      >
                        <div className="bg-[#0c0c0e]/95 border border-zinc-800/80 backdrop-blur-2xl rounded-2xl p-2 shadow-2xl shadow-black/80 flex flex-col gap-1">
                          {arrangementSubLinks.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setDesktopDropdownOpen(false)}
                                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm tracking-wide transition-all ${
                                  isSubActive
                                    ? "bg-[#9C39FF]/15 text-white font-medium"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-6 py-2.5 outline-none rounded-full text-sm font-medium tracking-wide transition-colors ${
                  isActive ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 bg-[#9C39FF] rounded-full shadow-[0_0_15px_rgba(156,57,255,0.4)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
