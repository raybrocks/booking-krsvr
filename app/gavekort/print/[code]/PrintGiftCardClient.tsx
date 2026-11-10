"use client";

import React from 'react';
import Link from 'next/link';
import { Printer, ArrowLeft } from 'lucide-react';

interface Props {
  code: string;
  targetPersons: number;
  initialAmount: number;
  balance: number;
  recipientName?: string | null;
  senderName?: string | null;
  greetingMessage?: string | null;
  expiresAt: string;
}

export default function PrintGiftCardClient({
  code,
  targetPersons,
  initialAmount,
  recipientName,
  senderName,
  greetingMessage,
  expiresAt,
}: Props) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center py-6 px-4 print:bg-white print:text-black print:p-0">
      {/* Top Action Bar (hidden in print) */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Tilbake til krsvr.no
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-[#9C39FF] hover:bg-[#8A30E0] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_0_15px_rgba(156,57,255,0.4)] hover:scale-105 cursor-pointer"
        >
          <Printer size={16} />
          Skriv ut gavekort
        </button>
      </div>

      {/* Printable Certificate Container */}
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl print:border print:border-zinc-300 print:shadow-none print:bg-white print:rounded-2xl print:p-10 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#9C39FF]/30 to-transparent pointer-events-none rounded-bl-full print:hidden" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-8 border-b border-zinc-800 print:border-zinc-300 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#a855f7] print:text-zinc-700">
              Offisielt Gavekort
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white print:text-black mt-1">
              KRS VR ARENA
            </h1>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-zinc-400 print:text-zinc-600 block">Opplevelse</span>
            <span className="text-lg font-bold text-white print:text-black">
              {targetPersons > 0 ? `${targetPersons} personer` : 'VR Opplevelse'}
            </span>
          </div>
        </div>

        {/* Value Callout */}
        <div className="my-8 text-center bg-zinc-950/70 border border-zinc-800 print:bg-zinc-50 print:border-zinc-300 rounded-2xl p-6">
          <span className="text-xs uppercase tracking-widest text-zinc-400 print:text-zinc-600 block mb-1">
            Gavekortets Verdi
          </span>
          <div className="text-4xl sm:text-5xl font-black text-white print:text-black tracking-tight">
            {initialAmount} <span className="text-2xl font-bold text-[#a855f7] print:text-zinc-700">kr</span>
          </div>
          <p className="text-xs text-zinc-400 print:text-zinc-600 mt-2">
            Gjelder valgfri opplevelse (VR Escape Room, Arcade, Shooter, m.m.)
          </p>
        </div>

        {/* To / From / Greeting */}
        {(recipientName || senderName || greetingMessage) && (
          <div className="space-y-4 py-4 border-b border-zinc-800 print:border-zinc-300">
            {recipientName && (
              <div className="text-sm">
                <span className="text-zinc-400 print:text-zinc-600 font-medium">Til: </span>
                <span className="text-white print:text-black font-semibold text-base">{recipientName}</span>
              </div>
            )}
            {senderName && (
              <div className="text-sm">
                <span className="text-zinc-400 print:text-zinc-600 font-medium">Fra: </span>
                <span className="text-white print:text-black font-semibold text-base">{senderName}</span>
              </div>
            )}
            {greetingMessage && (
              <div className="bg-zinc-950/50 print:bg-zinc-50 border-l-2 border-[#9C39FF] print:border-zinc-600 p-4 rounded-r-xl italic text-sm text-zinc-200 print:text-zinc-800">
                &ldquo;{greetingMessage}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Code & Expiry */}
        <div className="my-8 text-center bg-zinc-950 border border-dashed border-zinc-700 print:bg-white print:border-zinc-400 rounded-2xl p-6">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 print:text-zinc-600 block mb-2">
            Gavekortkode for booking
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-[#c084fc] print:text-black">
            {code}
          </div>
          <span className="text-xs text-zinc-400 print:text-zinc-600 block mt-2">
            Gyldig i 12 måneder &bull; Utløper: {expiresAt}
          </span>
        </div>

        {/* Instructions */}
        <div className="text-xs text-zinc-400 print:text-zinc-600 space-y-2 pt-2">
          <p className="font-semibold text-zinc-200 print:text-zinc-800">Slik booker du din opplevelse:</p>
          <p>1. Gå inn på <strong className="text-white print:text-black">www.krsvr.no/booking</strong> og velg opplevelse, dato og tid.</p>
          <p>2. Tast inn koden i feltet for rabattkode/gavekort ved bestilling.</p>
          <p>3. Er dere flere enn gavekortet dekker, betaler dere kun for de ekstra deltakerne ved utsjekk.</p>
        </div>

        {/* Footer with location */}
        <div className="mt-8 pt-4 border-t border-zinc-800/80 print:border-zinc-300 text-center text-[11px] text-zinc-500 print:text-zinc-600">
          KRS VR Arena &bull; Industrigata 12, 4632 Kristiansand &bull; post@krsvr.no &bull; www.krsvr.no
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
