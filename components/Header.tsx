"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Menu, X } from "lucide-react";
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
    <header className="w-full py-4 md:py-6 flex justify-between items-center border-b border-white/5 bg-background/90 backdrop-blur-md sticky top-0 z-50 px-4 md:px-6">
      {/* Mobile Menu Trigger & Language Select */}
      <div className="flex md:hidden flex-1 justify-start gap-2 items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="text-zinc-200 hover:text-white p-2">
              <Menu size={24} />
            </button>
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

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-1 justify-start">
        <nav className="flex gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                pathname === link.href ? "text-[#9C39FF]" : "text-zinc-400 hover:text-zinc-200 hover:text-[#9C39FF]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Logo */}
      <div className="flex justify-center flex-shrink-0">
        <Link href="/">
          <img src="/logo.svg" alt="KRS VR ARENA" className="h-[40px] md:h-16 object-contain" />
        </Link>
      </div>

      {/* Language Select Container (Desktop & Mobile) */}
      <div className="flex flex-1 justify-end">
        <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
          <SelectTrigger className="w-[120px] md:w-[140px] bg-zinc-900/50 border-zinc-800 focus:ring-[#9C39FF]">
            <SelectValue placeholder="Language">
              <span className="flex items-center">
                <span className="mr-2">{languageMap[language]?.flag}</span>
                <span className="hidden sm:inline">{languageMap[language]?.name}</span>
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
    </header>
  );
}
