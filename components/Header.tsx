"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Menu } from "lucide-react";
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

  const leftLinks = navLinks.slice(0, 3);
  const rightLinks = navLinks.slice(3);

  return (
    <header className="w-full sticky top-0 z-50 pointer-events-none md:pt-6">
      {/* Mobile Header Background */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md border-b border-white/5 md:hidden pointer-events-auto" />
      
      <div className="relative w-full px-4 md:px-8 py-4 md:py-0 flex justify-between items-center max-w-[1600px] mx-auto pointer-events-auto">
        
        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden flex-1 justify-start gap-2 items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger render={<button className="text-zinc-200 hover:text-white p-2" />}>
              <Menu size={24} />
            </SheetTrigger>
            <SheetContent side="left" className="bg-zinc-950 border-zinc-800 text-zinc-100 flex flex-col pt-12">
              <SheetTitle className="sr-only">Navigasjonsmeny</SheetTitle>
              <nav className="flex flex-col gap-6 mt-8">
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
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Left Nav (Pill) */}
        <div className="hidden md:flex flex-1 justify-end md:mr-8 xl:mr-12">
          <nav className="flex bg-zinc-950/80 backdrop-blur-md rounded-full border border-zinc-800 shadow-xl overflow-hidden h-14 items-center divide-x divide-zinc-800/50">
            {leftLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-full px-5 lg:px-7 flex items-center text-sm font-medium tracking-wide transition-colors ${
                    isActive 
                      ? "bg-[#9C39FF] text-white" 
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center Logo */}
        <div className="flex justify-center flex-shrink-0">
          <Link href="/" className="flex items-center justify-center transition-transform hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="KRS VR ARENA" className="h-[40px] md:h-14 object-contain" />
          </Link>
        </div>

        {/* Desktop Right Nav (Pill) AND Language */}
        <div className="hidden md:flex flex-1 justify-start md:ml-8 xl:ml-12 items-center gap-4">
          <nav className="flex bg-zinc-950/80 backdrop-blur-md rounded-full border border-zinc-800 shadow-xl overflow-hidden h-14 items-center divide-x divide-zinc-800/50">
            {rightLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-full px-5 lg:px-7 flex items-center text-sm font-medium tracking-wide transition-colors ${
                    isActive 
                      ? "bg-[#9C39FF] text-white" 
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          
          <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
            <SelectTrigger className="h-14 w-[140px] rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 shadow-xl focus:ring-[#9C39FF] px-5">
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

        {/* Mobile Language Edge */}
        <div className="flex md:hidden flex-1 justify-end">
          <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
            <SelectTrigger className="w-[120px] bg-zinc-900/50 border-zinc-800 focus:ring-[#9C39FF]">
              <SelectValue placeholder="Language">
                <span className="flex items-center">
                  <span className="mr-2">{languageMap[language]?.flag}</span>
                  <span className="sm:hidden">{language}</span>
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
      </div>
    </header>
  );
}
