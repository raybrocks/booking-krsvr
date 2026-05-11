"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Menu } from "lucide-react";
import { motion } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function Header() {
  const { language, setLanguage } = useI18n();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const languageMap: Record<string, { name: string; flag: string }> = {
    no: { name: "Norsk", flag: "🇳🇴" },
    en: { name: "English", flag: "🇬🇧" },
    de: { name: "Deutsch", flag: "🇩🇪" },
    uk: { name: "Українська", flag: "🇺🇦" },
    pl: { name: "Polski", flag: "🇵🇱" },
    es: { name: "Español", flag: "🇪🇸" },
  };

  const navLinks = [
    { href: "/", label: "Hovedside" },
    { href: "/opplevelser", label: "VR Opplevelser" },
    { href: "/arrangement", label: "Arrangement" },
    { href: "/booking", label: "Booking" },
    { href: "/faq", label: "FAQ" },
    { href: "/kontakt", label: "Kontakt" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 pointer-events-none flex flex-col md:pt-4">
      {/* Background container */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md border-b border-white/5 md:bg-gradient-to-b md:from-background md:via-background/90 md:to-transparent md:border-none md:h-[200px]" />
      
      {/* TOP ROW: Logo & Mobile Actions */}
      <div className="relative w-full px-4 md:px-8 py-4 md:py-2 flex justify-between items-center max-w-[1600px] mx-auto pointer-events-auto">
        
        {/* Left spacer for Logo centering */}
        <div className="flex flex-1" />

        {/* Center Logo */}
        <div className="flex justify-center flex-shrink-0">
          <Link href="/" className="flex items-center justify-center transition-transform hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="KRS VR ARENA" className="h-[40px] md:h-[64px] lg:h-[72px] object-contain" />
          </Link>
        </div>

        {/* Right side Language Select (Desktop) & Menu Trigger (Mobile) */}
        <div className="flex flex-1 justify-end items-center gap-4">
          
          {/* Desktop Language Select */}
          <div className="hidden md:block">
            <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
              <SelectTrigger className="w-[140px] h-12 bg-zinc-950/80 backdrop-blur-md rounded-full border-zinc-800 shadow-xl focus:ring-[#9C39FF] px-5">
                <SelectValue placeholder="Language">
                  <span className="flex items-center">
                    <span className="mr-2">{languageMap[language]?.flag}</span>
                    <span>{languageMap[language]?.name}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectItem value="no"><span className="mr-2">🇳🇴</span>Norsk</SelectItem>
                <SelectItem value="en"><span className="mr-2">🇬🇧</span>English</SelectItem>
                <SelectItem value="de"><span className="mr-2">🇩🇪</span>Deutsch</SelectItem>
                <SelectItem value="uk"><span className="mr-2">🇺🇦</span>Українська</SelectItem>
                <SelectItem value="pl"><span className="mr-2">🇵🇱</span>Polski</SelectItem>
                <SelectItem value="es"><span className="mr-2">🇪🇸</span>Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger render={<button className="text-zinc-200 hover:text-white p-2" />}>
                <Menu size={28} />
              </SheetTrigger>
              <SheetContent side="right" className="bg-zinc-950 border-zinc-800 text-zinc-100 flex flex-col pt-12">
                <SheetTitle className="sr-only">Navigasjonsmeny</SheetTitle>
                <nav className="flex flex-col gap-6 mt-8 flex-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-xl font-medium transition-colors ${
                        pathname === link.href ? "text-[#9C39FF]" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                
                {/* Mobile Language Select (Bottom of Menu) */}
                <div className="mt-auto mb-8">
                  <p className="text-sm text-zinc-500 mb-3 px-1">Språk / Language</p>
                  <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                    <SelectTrigger className="w-full h-14 bg-zinc-900/50 rounded-2xl border-zinc-800 focus:ring-[#9C39FF] px-5">
                      <SelectValue placeholder="Language">
                        <span className="flex items-center">
                          <span className="mr-3 text-lg">{languageMap[language]?.flag}</span>
                          <span className="text-base">{languageMap[language]?.name}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                      <SelectItem value="no"><span className="mr-2">🇳🇴</span>Norsk</SelectItem>
                      <SelectItem value="en"><span className="mr-2">🇬🇧</span>English</SelectItem>
                      <SelectItem value="de"><span className="mr-2">🇩🇪</span>Deutsch</SelectItem>
                      <SelectItem value="uk"><span className="mr-2">🇺🇦</span>Українська</SelectItem>
                      <SelectItem value="pl"><span className="mr-2">🇵🇱</span>Polski</SelectItem>
                      <SelectItem value="es"><span className="mr-2">🇪🇸</span>Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Desktop Pill Nav */}
      <div className="hidden md:flex relative justify-center w-full mt-4 pointer-events-auto">
        <nav className="flex relative gap-1 md:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-6 py-2.5 outline-none rounded-full text-sm font-medium tracking-wide transition-colors ${
                  isActive 
                    ? "text-white" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
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
