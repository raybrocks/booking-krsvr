"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

const TripAdvisorIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 0 0 4.04 10.43 5.976 5.976 0 0 0 4.075-1.6L12 19.705l1.922-2.09a5.972 5.972 0 0 0 4.072 1.598 6 6 0 0 0 6-5.998 5.982 5.982 0 0 0-1.957-4.432L24 6.648h-4.35a13.573 13.573 0 0 0-7.644-2.353zM12 6.255c1.531 0 3.063.303 4.504.903C13.943 8.138 12 10.43 12 13.1c0-2.671-1.942-4.962-4.504-5.942A11.72 11.72 0 0 1 12 6.256zM6.002 9.157a4.059 4.059 0 1 1 0 8.118 4.059 4.059 0 0 1 0-8.118zm11.992.002a4.057 4.057 0 1 1 .003 8.115 4.057 4.057 0 0 1-.003-8.115zm-11.992 1.93a2.128 2.128 0 0 0 0 4.256 2.128 2.128 0 0 0 0-4.256zm11.992 0a2.128 2.128 0 0 0 0 4.256 2.128 2.128 0 0 0 0-4.256z"/>
  </svg>
);

export default function Footer() {
  const [adminEmail, setAdminEmail] = useState("post@krsvr.no");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.general && data.general.adminEmail) {
            setAdminEmail(data.general.adminEmail);
          }
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
              Sørlandets arena for VR Escape Room, Mixed Reality og unike gruppeopplevelser.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://www.facebook.com/krs.vr.arena" target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Facebook" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#9C39FF] hover:border-[#9C39FF] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/krs.vr.arena" target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#9C39FF] hover:border-[#9C39FF] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://no.tripadvisor.com/Attraction_Review-g190492-d34257006-Reviews-Krs_VR_Arena-Kristiansand_Vest_Agder_Southern_Norway.html" target="_blank" rel="noopener noreferrer" title="Tripadvisor" aria-label="Tripadvisor" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#00aa6c] hover:border-[#00aa6c] transition-colors">
                <TripAdvisorIcon size={20} />
              </a>
              <a href="https://www.tiktok.com/@krs.vr.arena" target="_blank" rel="noopener noreferrer" title="TikTok" aria-label="TikTok" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#9C39FF] hover:border-[#9C39FF] transition-colors">
                <TikTokIcon size={20} />
              </a>
              <a href="https://www.youtube.com/@KrsVRArena" target="_blank" rel="noopener noreferrer" title="YouTube" aria-label="YouTube" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#9C39FF] hover:border-[#9C39FF] transition-colors">
                <Youtube size={20} />
              </a>
            </div>

            {/* TripAdvisor & Visit Sørlandet */}
            <div className="mt-5 pt-4 border-t border-zinc-900 flex flex-col items-start gap-2.5">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://no.tripadvisor.com/Attraction_Review-g190492-d34257006-Reviews-Krs_VR_Arena-Kristiansand_Vest_Agder_Southern_Norway.html"
                className="inline-block transition-transform hover:scale-105"
                title="Rated on Tripadvisor"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/tripadvisor_horizontal.svg"
                  alt="Rated on Tripadvisor"
                  className="h-8 md:h-9 w-auto rounded-full shadow-sm"
                />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.visitsorlandet.com/listing/krs-vr-arena-%E2%80%93-vr-escape-room-%26-mixed-reality-arkade/867197306/"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                title="KRS VR Arena på Visit Sørlandet"
              >
                <span>
                  Du finner oss også på{" "}
                  <span className="underline decoration-zinc-700 underline-offset-4 hover:decoration-[#9C39FF]">
                    Visit Sørlandet
                  </span>
                </span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Snarveier</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-zinc-400 hover:text-[#9C39FF] text-sm transition-colors">Hovedside</Link></li>
              <li><Link href="/vr-opplevelser" className="text-zinc-400 hover:text-[#9C39FF] text-sm transition-colors">VR Opplevelser</Link></li>
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
              <li className="text-zinc-400 text-sm">
                Industrigata 12<br/>4632 Kristiansand
              </li>
              <li className="text-zinc-400 text-sm">
                <a href="https://maps.app.goo.gl/JdnDJvuqd3rX9cDb8" target="_blank" rel="noopener noreferrer" className="hover:text-[#9C39FF] transition-colors flex items-center">
                  Google Maps Veibeskrivelse
                </a>
              </li>
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
