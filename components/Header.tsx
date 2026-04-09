"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Header() {
  const { language, setLanguage } = useI18n();

  const languageMap: Record<string, { name: string; flag: string }> = {
    no: { name: "Norsk", flag: "🇳🇴" },
    en: { name: "English", flag: "🇬🇧" },
    de: { name: "Deutsch", flag: "🇩🇪" },
    uk: { name: "Українська", flag: "🇺🇦" },
    pl: { name: "Polski", flag: "🇵🇱" },
    es: { name: "Español", flag: "🇪🇸" },
  };

  return (
    <header className="w-full py-4 md:py-6 flex justify-between items-center border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-6">
      <div className="hidden md:block w-32"></div> {/* Spacer for centering on desktop */}
      
      <div className="flex-1 flex justify-start md:justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="KRS VR ARENA" className="h-[52px] md:h-20 object-contain" />
      </div>

      <div className="flex justify-end md:w-32">
        <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
          <SelectTrigger className="w-[130px] md:w-[140px] bg-zinc-900/50 border-zinc-800 focus:ring-[#9C39FF]">
            <SelectValue placeholder="Language">
              <span className="flex items-center">
                <span className="mr-2">{languageMap[language]?.flag}</span>
                {languageMap[language]?.name}
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
