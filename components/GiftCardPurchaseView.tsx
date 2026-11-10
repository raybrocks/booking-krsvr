"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Users, Sparkles, CheckCircle2, ShieldCheck, Clock, Gift, Loader2 } from 'lucide-react';
import { GIFT_CARD_PRESETS, calculateTotalPriceForPersons, getPricePerPerson } from '@/lib/pricing';

export default function GiftCardPurchaseView() {
  const [selectedPersons, setSelectedPersons] = useState<number>(4);
  const [isCustomPersons, setIsCustomPersons] = useState<boolean>(false);
  const [customPersonsInput, setCustomPersonsInput] = useState<string>("4");

  // Form state
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [greetingMessage, setGreetingMessage] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const activePersons = isCustomPersons
    ? Math.max(1, Math.min(10, parseInt(customPersonsInput, 10) || 1))
    : selectedPersons;

  const totalPrice = calculateTotalPriceForPersons(activePersons);
  const pricePerPerson = getPricePerPerson(activePersons);

  const handleSelectPreset = (persons: number) => {
    setIsCustomPersons(false);
    setSelectedPersons(persons);
    setCustomPersonsInput(persons.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomPersonsInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
      setSelectedPersons(parsed);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName.trim()) {
      toast.error('Vennligst oppgi ditt navn.');
      return;
    }
    if (!buyerEmail.trim() || !buyerEmail.includes('@')) {
      toast.error('Vennligst oppgi en gyldig e-postadresse.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/gift-cards/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPersons: activePersons,
          buyerName,
          buyerEmail,
          buyerPhone,
          recipientName: recipientName.trim() || null,
          senderName: senderName.trim() || null,
          greetingMessage: greetingMessage.trim() || null,
          locale: 'no',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Kunne ikke starte betalingen');
      }

      // Send brukeren til Vipps
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Gift card checkout error:', err);
      toast.error(err.message || 'Noe gikk galt under opprettelse av gavekortet. Vennligst prøv igjen.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9C39FF]/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#9C39FF]/20 text-[#c084fc] border border-[#9C39FF]/30 tracking-wide uppercase mb-4">
            <Gift size={14} />
            Digitalt Gavekort
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Gi en opplevelse som huskes
          </h1>
          <p className="text-base sm:text-lg text-zinc-400">
            Kjøp gavekort på valgfri VR-opplevelse hos KRS VR Arena på Lund. Perfekt til bursdager, jubileum eller en morsom kveld med vennegjengen.
          </p>
        </div>

        {/* Main Grid: Form Left, Preview Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Velg personantall */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="text-[#a855f7]" size={20} />
                  1. Velg antall spillere
                </h2>
                <span className="text-xs text-zinc-400">
                  {pricePerPerson} kr per person
                </span>
              </div>

              <p className="text-xs text-zinc-400 mb-5">
                Velg hvor mange personer gavekortet skal dekke. Hvis mottakeren blir flere, betaler de kun for de ekstra deltakerne ved booking.
              </p>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GIFT_CARD_PRESETS.map((preset) => {
                  const isSelected = !isCustomPersons && selectedPersons === preset.persons;
                  return (
                    <button
                      key={preset.persons}
                      type="button"
                      onClick={() => handleSelectPreset(preset.persons)}
                      className={`relative flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#9C39FF]/15 border-[#9C39FF] shadow-[0_0_20px_rgba(156,57,255,0.25)]'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      {preset.isPopular && (
                        <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9C39FF] text-white">
                          Populær
                        </span>
                      )}
                      <span className="text-sm font-bold text-white">{preset.label}</span>
                      <span className="text-xs text-zinc-400 mt-1">{preset.pricePerPerson} kr/pers</span>
                      <span className="text-base font-extrabold text-[#c084fc] mt-2">
                        {preset.totalPrice} kr
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Person Toggle */}
              <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCustomPersons(!isCustomPersons)}
                  className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  {isCustomPersons ? 'Bruk forhåndsvalgte pakker' : 'Velg annet antall (1–10 personer)'}
                </button>
                {isCustomPersons && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={customPersonsInput}
                      onChange={handleCustomChange}
                      className="w-16 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-center font-bold text-white focus:outline-none focus:border-[#9C39FF]"
                    />
                    <span className="text-xs text-zinc-400">personer</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Kjøper & Personlig Hilsen */}
            <form onSubmit={handleSubmit} className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="text-[#a855f7]" size={20} />
                2. Kjøper og personlig hilsen
              </h2>

              {/* Kjøpers info */}
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Dine kontaktopplysninger (gavekortet sendes hit)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-300 mb-1.5 font-medium">Ditt fulle navn *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ola Nordmann"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-300 mb-1.5 font-medium">Din e-post *</label>
                    <input
                      type="email"
                      required
                      placeholder="ola@eksempel.no"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1.5 font-medium">Mobilnummer (valgfritt)</label>
                  <input
                    type="tel"
                    placeholder="+47 900 00 000"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>

              {/* Hilsen */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Tekst på gavekortet (valgfritt)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-300 mb-1.5 font-medium">Til (mottakers navn)</label>
                    <input
                      type="text"
                      placeholder="f.eks. Kari"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-300 mb-1.5 font-medium">Fra (ditt navn / kallenavn)</label>
                    <input
                      type="text"
                      placeholder="f.eks. Ola & Jonas"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1.5 font-medium">
                    Personlig hilsen (maks 250 tegn)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={250}
                    placeholder="Gratulerer med dagen! Gleder meg til vi skal løse VR Escape Room sammen."
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF] resize-none"
                  />
                  <div className="text-right text-[11px] text-zinc-500 mt-1">
                    {greetingMessage.length}/250 tegn
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-zinc-800/80">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white font-bold text-base uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(156,57,255,0.45)] hover:shadow-[0_0_35px_rgba(156,57,255,0.7)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Klargjør Vipps...
                    </>
                  ) : (
                    <>Kjøp med Vipps &bull; {totalPrice} kr</>
                  )}
                </button>
                <p className="text-center text-xs text-zinc-500 mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Trygg betaling via Vipps ePayment. Gavekortet leveres umiddelbart per e-post.
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Live Preview & Guarantee Badges (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            {/* Live Gift Card Preview */}
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                Forhåndsvisning av gavekortet
              </span>

              <motion.div
                layout
                className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Purple radial ambient bloom */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#9C39FF]/20 blur-[50px] pointer-events-none rounded-full" />

                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 relative z-10">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#c084fc] block">
                      Gavekort
                    </span>
                    <span className="text-xl font-black text-white tracking-wide">
                      KRS VR ARENA
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-zinc-200">
                    {activePersons} personer
                  </span>
                </div>

                {/* Value Center */}
                <div className="my-6 text-center py-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl relative z-10">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-1">
                    Gavekortverdi
                  </span>
                  <div className="text-4xl font-black text-white tracking-tight">
                    {totalPrice} <span className="text-xl font-bold text-[#c084fc]">kr</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block mt-1">
                    Dekker full opplevelse for {activePersons} personer
                  </span>
                </div>

                {/* To / From / Greeting */}
                <div className="space-y-3 text-xs text-zinc-300 relative z-10">
                  {recipientName && (
                    <div>
                      <span className="text-zinc-500 font-medium">Til: </span>
                      <span className="text-white font-semibold">{recipientName}</span>
                    </div>
                  )}
                  {senderName && (
                    <div>
                      <span className="text-zinc-500 font-medium">Fra: </span>
                      <span className="text-white font-semibold">{senderName}</span>
                    </div>
                  )}
                  {greetingMessage && (
                    <div className="bg-zinc-900/80 border-l-2 border-[#9C39FF] p-3 rounded-r-lg italic text-zinc-200 text-xs">
                      &ldquo;{greetingMessage}&rdquo;
                    </div>
                  )}
                </div>

                {/* Mock Code & Expiry */}
                <div className="mt-6 pt-5 border-t border-dashed border-zinc-800/80 flex items-center justify-between text-xs relative z-10">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">Kode ved booking</span>
                    <span className="font-mono font-bold text-sm text-[#c084fc] tracking-wider">
                      KRS-XXXX-XXXX
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-zinc-500 block">Gyldighet</span>
                    <span className="text-zinc-300 font-medium">12 måneder</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Why buy gift card here */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md space-y-3.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Gavekortets Fordeler
              </h3>
              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Fleksibelt for mottaker:</strong> Kan brukes fritt på alle opplevelser (VR Escape Room, Arcade, Tactical Arena m.m.).
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <Clock size={16} className="text-[#c084fc] shrink-0 mt-0.5" />
                <span>
                  <strong>12 måneders gyldighet:</strong> God tid til å planlegge og samle gjengen på Lund.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <Users size={16} className="text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Enkel utvidelse:</strong> Blir de flere personer ved booking, betaler de kun differansen i Vipps. Blir de færre, spares restbeløpet.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <Gift size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Klar til å gis bort:</strong> Sendes som PDF på e-post umiddelbart, klar til å skrives ut eller videresendes.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
