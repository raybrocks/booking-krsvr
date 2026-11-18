"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

export default function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: testimonials.length > 1, align: "center", skipSnaps: false });

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({ loop: testimonials.length > 1, align: "center", skipSnaps: false });
    }
  }, [emblaApi, testimonials.length]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/testimonials?testimonials=true');
        if (res.ok) {
           const data = await res.json();
           data.sort((a: any, b: any) => {
             const orderA = typeof a.order === 'number' ? a.order : 999;
             const orderB = typeof b.order === 'number' ? b.order : 999;
             return orderA - orderB;
           });
           setTestimonials(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load testimonials:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" /></div>;
  }

  if (testimonials.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto overflow-hidden mt-8 mb-16 px-4" ref={emblaRef}>
      <div className="flex justify-center touch-pan-y -ml-4">
        {testimonials.map((testi) => (
          <div key={testi.id} className={`min-w-0 pl-4 ${testimonials.length === 1 ? 'flex-[0_0_100%] max-w-4xl' : 'flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%]'}`}>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden h-full flex flex-col group hover:border-zinc-700 transition-colors">
              <div className="relative w-full aspect-[16/10] md:aspect-[16/9] bg-zinc-950 overflow-hidden">
                {testi.mainImage ? (
                  <Image 
                    src={testi.mainImage} 
                    alt={`${testi.companyName} på teambuilding hos KRS VR Arena i Kristiansand`} 
                    fill 
                    className="object-cover object-[center_18%]" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">Ingen bilde</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="px-6 pb-6 pt-3 flex flex-col flex-grow items-center text-center -mt-10 md:-mt-12 relative z-10">
                {testi.logoImage ? (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-zinc-950 border-2 border-zinc-700 shadow-lg flex items-center justify-center p-3 mb-3.5 group-hover:border-zinc-500 transition-colors">
                    <Image 
                      src={testi.logoImage} 
                      alt={`${testi.companyName} – Bedriftskunde hos KRS VR Arena i Kristiansand`} 
                      width={96} 
                      height={96} 
                      className="object-contain w-full h-full" 
                      unoptimized
                    />
                  </div>
                ) : (
                   <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-zinc-800 border-2 border-zinc-900 mb-3.5" />
                )}
                <h3 className="text-lg md:text-xl font-medium text-white">{testi.companyName}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
