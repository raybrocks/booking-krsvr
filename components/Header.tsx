"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { motion } from "motion/react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Hovedside" },
    { href: "/vr-opplevelser", label: "VR Opplevelser" },
    { href: "/arrangementer", label: "Arrangementer" },
    { href: "/priser", label: "Priser" },
    { href: "/faq", label: "FAQ" },
    { href: "/kontakt", label: "Kontakt" },
    { href: "/booking", label: "Booking" },
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
            <img src="/logo.svg" alt="KRS VR ARENA" className="h-[52px] md:h-[70px] lg:h-[80px] object-contain" />
          </Link>
        </div>

        {/* Right side Actions */}
        <div className="flex flex-1 justify-end items-center gap-3 md:gap-4">
          
          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger render={<button className="text-zinc-200 hover:text-white p-2" />}>
                <Menu size={28} />
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0a0c]/95 border-zinc-800/50 backdrop-blur-xl text-zinc-100 flex flex-col pt-20">
                <SheetTitle className="sr-only">Navigasjonsmeny</SheetTitle>
                <nav className="flex flex-col items-center gap-8 flex-1 w-full mt-8">
                  {navLinks.map((link) => {
                    const isBooking = link.href === "/booking";
                    const isActive = pathname === link.href;
                    
                    if (isBooking) {
                      return (
                        <div key={link.href} className="w-full flex justify-center mt-4">
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
                        ) : link.label}
                      </Link>
                    )
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
            const isActive = pathname === link.href;
            const isBooking = link.href === "/booking";

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
