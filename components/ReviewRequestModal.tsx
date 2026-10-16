"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Star, Globe, Check, Send, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ReviewRequestModalProps {
  booking: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSent: (updatedBooking: any) => void;
}

export default function ReviewRequestModal({
  booking,
  isOpen,
  onClose,
  onSent,
}: ReviewRequestModalProps) {
  const [platform, setPlatform] = useState<"tripadvisor" | "google" | "both">("both");
  const [language, setLanguage] = useState<"no" | "en">("no");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset defaults when modal opens
      setPlatform("both");
      setLanguage("no");
      setSending(false);
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const firstName = booking.firstName || "Kunde";
  const isEn = language === "en";

  const emailSubject = isEn
    ? "Thank you for visiting KRS VR Arena"
    : "Takk for besøket hos oss i KRS VR Arena";

  const handleSend = async () => {
    if (!booking.email || booking.email.includes("system@sperret")) {
      toast.error("Bookingen har ingen gyldig e-postadresse");
      return;
    }

    setSending(true);
    const loadingToastId = toast.loading(`Sender e-post til ${booking.email}...`);

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/send-review-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke sende e-post");
      }

      toast.success(data.message || `Forespørsel om omtale sendt til ${booking.email}!`, { id: loadingToastId });
      if (data.booking) {
        onSent(data.booking);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Feil under sending av e-post", { id: loadingToastId });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/15 border border-[#9C39FF]/30 flex items-center justify-center text-[#9C39FF]">
              <Star className="w-5 h-5 fill-[#9C39FF]/20" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Be om omtale fra gjest</h2>
              <p className="text-xs text-zinc-400">
                Send til <span className="text-zinc-200 font-medium">{booking.firstName} {booking.lastName}</span> ({booking.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Innhold */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Booking-oppsummering */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-zinc-300">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Aktivitet</span>
                <span className="font-medium text-white">{booking.experience?.name || "VR-opplevelse"}</span>
              </div>
              <div className="border-l border-zinc-800 pl-4">
                <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Dato & Tid</span>
                <span>{booking.date} kl. {booking.time}</span>
              </div>
              <div className="border-l border-zinc-800 pl-4">
                <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Spillere</span>
                <span>{booking.players} pers</span>
              </div>
            </div>

            {booking.reviewEmailSentAt && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <Check className="w-3.5 h-3.5" />
                Sendt tidligere ({booking.reviewEmailType || "omtale"} &middot; {new Intl.DateTimeFormat("no-NO", { dateStyle: "short" }).format(new Date(booking.reviewEmailSentAt))})
              </div>
            )}
          </div>

          {/* Steg 1: Velg plattform (3 knapper) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
              1. Velg hvilken plattform du vil be om omtale på:
            </label>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {/* TripAdvisor */}
              <button
                type="button"
                onClick={() => setPlatform("tripadvisor")}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  platform === "tripadvisor"
                    ? "bg-[#00aa6c]/15 border-[#00aa6c] text-white shadow-[0_0_15px_rgba(0,170,108,0.2)]"
                    : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-[#00aa6c] flex items-center gap-1">
                      ★ TripAdvisor
                    </span>
                    {platform === "tripadvisor" && <Check className="w-4 h-4 text-[#00aa6c]" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Anbefalt for turister og internasjonale gjester.
                  </p>
                </div>
              </button>

              {/* Google Reviews */}
              <button
                type="button"
                onClick={() => setPlatform("google")}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  platform === "google"
                    ? "bg-[#1a73e8]/15 border-[#1a73e8] text-white shadow-[0_0_15px_rgba(26,115,232,0.2)]"
                    : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-[#4285F4] flex items-center gap-1">
                      ★ Google Reviews
                    </span>
                    {platform === "google" && <Check className="w-4 h-4 text-[#4285F4]" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Anbefalt for lokale gjester og synlighet på Google Maps.
                  </p>
                </div>
              </button>

              {/* Begge */}
              <button
                type="button"
                onClick={() => setPlatform("both")}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  platform === "both"
                    ? "bg-[#9C39FF]/15 border-[#9C39FF] text-white shadow-[0_0_15px_rgba(156,57,255,0.2)]"
                    : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-[#9C39FF] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 inline" /> Begge to
                    </span>
                    {platform === "both" && <Check className="w-4 h-4 text-[#9C39FF]" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    Viser begge knapper slik at kunden kan velge plattform selv.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Steg 2: Velg språk */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
              2. Velg språk for e-posten:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage("no")}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  language === "no"
                    ? "bg-zinc-800 border-[#9C39FF] text-white shadow-sm"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>🇳🇴 Norsk (standard)</span>
                {language === "no" && <Check className="w-3.5 h-3.5 text-[#9C39FF]" />}
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  language === "en"
                    ? "bg-zinc-800 border-[#9C39FF] text-white shadow-sm"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>🇬🇧 English (for tourists)</span>
                {language === "en" && <Check className="w-3.5 h-3.5 text-[#9C39FF]" />}
              </button>
            </div>
          </div>

          {/* Steg 3: Sanntids forhåndsvisning */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Forhåndsvisning av e-posten som sendes via Resend:
            </label>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-xs space-y-3 font-sans">
              <div className="border-b border-zinc-800 pb-2.5 space-y-1">
                <div className="text-zinc-400">
                  <span className="text-zinc-500 inline-block w-14">Emne:</span>
                  <span className="text-white font-medium">{emailSubject}</span>
                </div>
                <div className="text-zinc-400">
                  <span className="text-zinc-500 inline-block w-14">Mottaker:</span>
                  <span className="text-zinc-300">{booking.firstName} {booking.lastName} &lt;{booking.email}&gt;</span>
                </div>
                <div className="text-zinc-400">
                  <span className="text-zinc-500 inline-block w-14">Avsender:</span>
                  <span className="text-zinc-400">KRS VR Arena &lt;post@krsvr.no&gt;</span>
                </div>
              </div>

              {/* Simulert e-posttekst */}
              <div className="bg-white text-zinc-900 p-5 rounded-lg space-y-3 shadow-inner">
                <div className="font-semibold text-sm text-zinc-900">
                  {isEn ? `Hi ${firstName}, thank you for visiting us!` : `Hei ${firstName}, takk for besøket!`}
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {isEn
                    ? `We hope you had a great experience with us at Lund in Kristiansand.`
                    : `Vi håper dere hadde en fin opplevelse hos oss på Lund i Kristiansand.`}
                </p>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {isEn
                    ? `As a local arena in Kristiansand, feedback from our visitors means the world to our team. If you have a minute to spare, we would truly appreciate it if you could share a brief review.`
                    : `Som en lokal arena i Kristiansand betyr tilbakemeldinger fra gjestene våre utrolig mye for teamet vårt. Dersom du har et lite minutt til overs, ville vi satt stor pris på om du delte en kort omtale.`}
                </p>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {isEn
                    ? `The most valuable reviews often describe who you were, the occasion for your visit, and how you experienced it.`
                    : `De mest verdifulle tilbakemeldingene beskriver gjerne hvem dere var, i hvilken anledning dere besøkte oss, og hvordan opplevelsen var.`}
                </p>

                {/* Knapper i preview */}
                <div className="pt-2 flex flex-wrap gap-2 justify-center">
                  {(platform === "tripadvisor" || platform === "both") && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00aa6c] text-white font-semibold text-[11px] shadow-sm">
                      ★ {isEn ? "Review us on Tripadvisor" : "Legg igjen vurdering på Tripadvisor"}
                    </span>
                  )}
                  {(platform === "google" || platform === "both") && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1a73e8] text-white font-semibold text-[11px] shadow-sm">
                      ★ {isEn ? "Write a review on Google" : "Skriv en anmeldelse på Google"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Avbryt
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#9C39FF] hover:bg-[#8A2BE2] text-white transition-all inline-flex items-center gap-2 shadow-[0_0_15px_rgba(156,57,255,0.3)] disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sender via Resend...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Send forespørsel nå
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
