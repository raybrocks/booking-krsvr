import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ExperiencesPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter mb-6">VR Opplevelser</h1>
        <p className="text-xl text-zinc-400 font-light mb-12">
          Kommer snart... Her vil du finne en oversikt over alle våre fantastiske VR-opplevelser.
        </p>
        <Link href="/" className="inline-flex items-center text-[#9C39FF] hover:text-[#8b32e6] transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" /> Tilbake til forsiden
        </Link>
      </div>
    </main>
  );
}
