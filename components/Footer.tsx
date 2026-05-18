"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Footer() {
  const [adminEmail, setAdminEmail] = useState("post@krsvr.no");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().adminEmail) {
          setAdminEmail(docSnap.data().adminEmail);
        }
      } catch (error) {
        console.error("Failed to fetch settings for footer:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="w-full bg-zinc-950 border-t border-white/5 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="KRS VR ARENA" className="h-10 mb-6 object-contain" />
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Sørlandets Råeste VR Opplevelse. Vi tilbyr de nyeste og mest spennende virtual reality-opplevelsene.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#9C39FF] hover:border-[#9C39FF] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#9C39FF] hover:border-[#9C39FF] transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Snarveier</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-zinc-400 hover:text-[#9C39FF] text-sm transition-colors">Hovedside</Link></li>
              <li><Link href="/opplevelser" className="text-zinc-400 hover:text-[#9C39FF] text-sm transition-colors">VR Opplevelser</Link></li>
              <li><Link href="/arrangementer" className="text-zinc-400 hover:text-[#9C39FF] text-sm transition-colors">Arrangementer</Link></li>
              <li><Link href="/booking" className="text-zinc-400 hover:text-[#9C39FF] text-sm transition-colors">Booking</Link></li>
              <li><Link href="/faq" className="text-zinc-400 hover:text-[#9C39FF] text-sm transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Informasjon</h4>
            <ul className="space-y-3">
              <li><Link href="/kontakt" className="text-zinc-400 hover:text-[#9C39FF] text-sm transition-colors">Kontakt Oss</Link></li>
              <li><span className="text-zinc-400 text-sm">Åpningstider:</span></li>
              <li><span className="text-zinc-500 text-sm">Se bookingside for tilgjengelighet</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Kontakt</h4>
            <ul className="space-y-3">
              <li className="text-zinc-400 text-sm">Industrigata 12<br/>4632 Kristiansand</li>
              <li className="text-zinc-400 text-sm"><a href={`mailto:${adminEmail}`} className="hover:text-[#9C39FF] transition-colors">{adminEmail}</a></li>
              <li className="text-zinc-400 text-sm"><a href="tel:+4740828302" className="hover:text-[#9C39FF] transition-colors">+47 40828302</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs">
            © {new Date().getFullYear()} Krs VR Arena AS (Org.nr 936318878). Alle rettigheter reservert.
          </p>
          <div className="flex gap-4">
            <Link href="/personvern" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">Personvern</Link>
            <Link href="/vilkar" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">Kjøpsvilkår</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
