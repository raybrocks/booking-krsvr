import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass, Gamepad2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Siden ble ikke funnet | KRS VR Arena",
  description: "Beklager, vi fant ikke siden du så etter hos KRS VR Arena.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-black px-4 py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#9C39FF]/15 via-transparent to-transparent -z-10 blur-2xl" />

      <div className="max-w-xl w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 text-[#00F0FF] mb-2 shadow-lg shadow-purple-900/20">
          <Compass className="w-10 h-10 animate-pulse text-[#00F0FF]" />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-wider text-[#00F0FF] uppercase">Feilkode 404</p>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Siden ble ikke funnet
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Beklager, siden du leter etter eksisterer ikke, har blitt flyttet eller nettadressen er feil.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <Link href="/vr-opplevelser" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-[#00F0FF] hover:bg-[#00D0DF] text-black font-bold px-8 shadow-lg shadow-cyan-500/20"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Se alle VR-opplevelser
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Gå til forsiden
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
