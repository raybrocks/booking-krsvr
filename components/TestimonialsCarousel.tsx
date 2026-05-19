"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
    // Note: We might not have order field indexed yet, so we pull all and sort client-side, 
    // or rely on order if indexed. For safety we pull all and sort.
    const unsubscribe = onSnapshot(collection(db, "testimonials"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      data.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999;
        const orderB = typeof b.order === 'number' ? b.order : 999;
        return orderA - orderB;
      });

      // User requested 3 items.
      setTestimonials(data.slice(0, 3));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" /></div>;
  }

  if (testimonials.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto overflow-hidden mt-8 mb-16 px-4" ref={emblaRef}>
      <div className="flex touch-pan-y -ml-4">
        {testimonials.map((testi) => (
          <div key={testi.id} className={`min-w-0 pl-4 ${testimonials.length === 1 ? 'flex-[0_0_100%]' : 'flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%]'}`}>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden h-full flex flex-col group hover:border-zinc-700 transition-colors">
              <div className="relative w-full aspect-video bg-zinc-950">
                {testi.mainImage ? (
                  <Image src={testi.mainImage} alt={testi.companyName} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">Ingen bilde</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
              </div>
              <div className="p-6 flex flex-col flex-grow items-center text-center -mt-12 relative z-10">
                {testi.logoImage ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-4 border-zinc-900 shadow-xl mb-4">
                    <Image src={testi.logoImage} alt="Logo" width={64} height={64} className="object-contain w-full h-full p-2" />
                  </div>
                ) : (
                   <div className="w-16 h-16 rounded-full bg-zinc-800 border-4 border-zinc-900 mb-4" />
                )}
                <h3 className="text-xl font-medium text-white">{testi.companyName}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
