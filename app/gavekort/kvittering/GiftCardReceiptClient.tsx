"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Printer, ArrowRight, AlertCircle, Loader2, Gift, Mail } from 'lucide-react';

export default function GiftCardReceiptClient() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [giftCard, setGiftCard] = useState<any>(null);

  useEffect(() => {
    if (!ref) {
      setError('Mangler referanse for gavekortet.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function verify() {
      try {
        const res = await fetch(`/api/gift-cards/verify?ref=${encodeURIComponent(ref!)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Kunne ikke verifisere betalingen.');
        }

        if (isMounted) {
          setGiftCard(data.giftCard);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Noe gikk galt under verifiseringen.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [ref]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-full border-2 border-[#9C39FF]/30 border-t-[#9C39FF] animate-spin mb-6" />
        <h1 className="text-xl font-bold text-white mb-2">Verifiserer betaling med Vipps</h1>
        <p className="text-sm text-zinc-400 text-center max-w-sm">
          Et øyeblikk mens vi bekrefter kjøpet og klargjør gavekortet ditt...
        </p>
      </div>
    );
  }

  if (error || !giftCard) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-red-500/30 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Kunne ikke bekrefte betaling</h1>
          <p className="text-sm text-zinc-400 mb-6">{error || 'Ukjent feil oppstod.'}</p>
          <div className="space-y-3">
            <Link
              href="/gavekort"
              className="block w-full py-3 px-4 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white font-semibold text-sm transition-all"
            >
              Prøv på nytt
            </Link>
            <Link
              href="/kontakt"
              className="block w-full py-3 px-4 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm transition-all"
            >
              Kontakt kundeservice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const expiryFormatted = new Date(giftCard.expiresAt).toLocaleDateString('no-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-zinc-950/80 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-1">
            Betaling godkjent
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Takk for ditt kjøp, {giftCard.buyerName}!
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Gavekortet er nå aktivert og gyldig for booking i 12 måneder.
          </p>
        </div>

        {/* Gift Card Card */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#9C39FF]/20 blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#c084fc] block">Gavekort</span>
              <span className="text-lg font-black text-white">KRS VR ARENA</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#9C39FF]/20 text-[#c084fc] border border-[#9C39FF]/30">
              {giftCard.targetPersons} personer ({giftCard.initialAmount} kr)
            </span>
          </div>

          {(giftCard.recipientName || giftCard.senderName) && (
            <div className="py-4 space-y-1 text-sm border-b border-zinc-800/80">
              {giftCard.recipientName && (
                <div>
                  <span className="text-zinc-500 font-medium">Til: </span>
                  <span className="text-white font-semibold">{giftCard.recipientName}</span>
                </div>
              )}
              {giftCard.senderName && (
                <div>
                  <span className="text-zinc-500 font-medium">Fra: </span>
                  <span className="text-white font-semibold">{giftCard.senderName}</span>
                </div>
              )}
            </div>
          )}

          {giftCard.greetingMessage && (
            <div className="my-4 p-3 bg-zinc-900/60 border-l-2 border-[#9C39FF] rounded-r-lg italic text-xs text-zinc-300">
              &ldquo;{giftCard.greetingMessage}&rdquo;
            </div>
          )}

          <div className="my-6 text-center py-5 bg-zinc-950 border border-dashed border-zinc-700 rounded-xl">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">
              Gavekortkode for booking
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#c084fc] tracking-widest">
              {giftCard.code}
            </div>
            <span className="text-xs text-zinc-500 block mt-1">
              Gyldig til {expiryFormatted}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 justify-center">
            <Mail size={14} className="text-[#a855f7]" />
            <span>En bekreftelse og kopi er sendt til <strong>{giftCard.buyerEmail}</strong></span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3">
          <Link
            href={`/gavekort/print/${giftCard.code}`}
            target="_blank"
            className="w-full py-3.5 px-6 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white font-bold text-sm uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(156,57,255,0.4)] hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Åpne utskriftsvennlig gavekort (PDF)
          </Link>

          <Link
            href="/booking"
            className="w-full py-3.5 px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-zinc-800"
          >
            <span>Gå til booking på nett</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
