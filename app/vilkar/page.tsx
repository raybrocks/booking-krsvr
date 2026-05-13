"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function KjøpsvilkårPage() {
  const [terms, setTerms] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTerms() {
      try {
        const docRef = doc(db, "settings", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTerms(docSnap.data().termsContent || "Ingen vilkår er fylt ut i systemet enda.");
        } else {
          setTerms("Ingen vilkår er fylt ut i systemet enda.");
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
        setTerms("Kunne ikke laste vilkår på grunn av en feil.");
      } finally {
        setLoading(false);
      }
    }

    fetchTerms();
  }, []);

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-2">
              Kjøpsvilkår
            </h1>
            <p className="text-zinc-400 text-lg">
              Sist oppdatert: Hentes live fra våre systemer
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-xl backdrop-blur-sm min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
                <p className="text-zinc-500 animate-pulse text-sm font-medium">Laster vilkår og betingelser...</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-headings:font-light prose-headings:text-white whitespace-pre-wrap text-sm md:text-base text-zinc-300">
                {terms}
              </div>
            )}
          </div>
        </motion.div>
      </main>
  );
}
