import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ArrangementPage() {
  return (
    <main className="min-h-screen pb-20 pt-16">
      <div className="mb-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-light tracking-tighter">
          Arrangement
        </h1>
        <p className="mt-3 text-zinc-400 max-w-lg mx-auto">
          Kommer snart... Her kommer mer informasjon om teambuilding, utdrikningslag og bursdager.
        </p>
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <Link href="/" className="inline-flex items-center text-[#9C39FF] hover:text-[#8b32e6] transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" /> Tilbake til forsiden
        </Link>
      </div>
    </main>
  );
}
