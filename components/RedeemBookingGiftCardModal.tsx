"use client";

import React, { useState, useEffect } from "react";
import { X, Gift, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface RedeemBookingGiftCardModalProps {
  booking: any | null;
  isOpen: boolean;
  onClose: () => void;
  onRedeemed: (updatedBooking: any) => Promise<void> | void;
}

export default function RedeemBookingGiftCardModal({
  booking,
  isOpen,
  onClose,
  onRedeemed,
}: RedeemBookingGiftCardModalProps) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [validatedCard, setValidatedCard] = useState<any | null>(null);
  const [validationError, setValidationError] = useState("");
  const [amountToDeduct, setAmountToDeduct] = useState<string>("");
  const [note, setNote] = useState("");

  const totalPrice = Math.max(0, Number(booking?.totalPrice || 0));
  const existingGiftCardAmt = Math.max(0, Number(booking?.giftCardAmount || 0));
  const alreadySettled = Math.max(Number(booking?.amountPaid || 0), existingGiftCardAmt);
  const remainingDue = Math.max(0, Number((totalPrice - alreadySettled).toFixed(2)));

  const bookingId = booking?.id;

  useEffect(() => {
    if (isOpen && bookingId) {
      setCode("");
      setValidatedCard(null);
      setValidationError("");
      setAmountToDeduct("");
      setNote("");
    }
  }, [isOpen, bookingId]);

  if (!isOpen || !booking) return null;

  const handleCheckCode = async (overrideCode?: string) => {
    const cleanCode = (overrideCode ?? code).trim().toUpperCase();
    if (!cleanCode) return;

    setChecking(true);
    setValidationError("");
    setValidatedCard(null);

    try {
      const res = await fetch("/api/gift-cards/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode }),
      });
      const data = await res.json();

      if (!res.ok || !data.isValid || !data.giftCard) {
        setValidationError(data.error || "Ugyldig gavekortkode");
        return;
      }

      const card = data.giftCard;
      setValidatedCard(card);
      const suggested = Math.min(remainingDue, Number(card.balance || 0));
      setAmountToDeduct(String(suggested > 0 ? suggested : card.balance));
    } catch {
      setValidationError("Kunne ikke kontrollere gavekortkode");
    } finally {
      setChecking(false);
    }
  };

  const parsedAmount = Number(String(amountToDeduct).replace(",", ".")) || 0;
  const maxAllowed = validatedCard
    ? Math.min(remainingDue, Number(validatedCard.balance || 0))
    : remainingDue;
  const remainingAfterRedemption = Math.max(0, Number((remainingDue - parsedAmount).toFixed(2)));

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setValidationError("Skriv inn gavekortkode");
      return;
    }
    if (!validatedCard) {
      await handleCheckCode(cleanCode);
      return;
    }
    if (parsedAmount <= 0 || parsedAmount > maxAllowed) {
      setValidationError(`Beløp må være mellom 1 og ${maxAllowed} kr.`);
      return;
    }

    setRedeeming(true);
    setValidationError("");
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/redeem-gift-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          amount: parsedAmount,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setValidationError(data.error || "Kunne ikke trekke gavekort");
        return;
      }

      toast.success(data.message || "Gavekort trukket!");
      await onRedeemed(data.booking);
      onClose();
    } catch {
      setValidationError("Nettverksfeil ved trekk av gavekort");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-[2px] overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141417] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="apple-chrome flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.07] flex items-center justify-center text-[#c48fff]">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h2 className="apple-display text-base font-semibold text-white">Trekk gavekort på booking</h2>
              <p className="text-xs text-zinc-400 tabular-nums">
                {booking.firstName} {booking.lastName} · Gjenstår{" "}
                <span className="text-white font-medium">{remainingDue} NOK</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="apple-press p-2 text-zinc-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRedeem} className="p-5 space-y-4">
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>Totalpris på booking:</span>
              <span className="text-zinc-200 font-semibold">{totalPrice} NOK</span>
            </div>
            {alreadySettled > 0 && (
              <div className="flex justify-between text-zinc-400">
                <span>Allerede oppgjort:</span>
                <span className="text-emerald-400 font-semibold">{alreadySettled} NOK</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-300 pt-1 border-t border-zinc-800">
              <span>Gjenstående å betale:</span>
              <span className="text-amber-300 font-bold">{remainingDue} NOK</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Gavekortkode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (validatedCard) setValidatedCard(null);
                  if (validationError) setValidationError("");
                }}
                placeholder="F.eks. KRS-C956-B7K5"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono uppercase text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleCheckCode()}
                disabled={!code.trim() || checking}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Sjekk kode
              </button>
            </div>
          </div>

          {validationError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {validatedCard && (
            <div className="space-y-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gyldig gavekort</span>
                </div>
                <span className="text-xs font-mono text-zinc-300">{validatedCard.code}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                  <div className="text-zinc-400 text-[11px]">Tilgjengelig saldo</div>
                  <div className="text-white font-bold text-sm">{validatedCard.balance} NOK</div>
                </div>
                <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                  <div className="text-zinc-400 text-[11px]">Ny saldo etter trekk</div>
                  <div className="text-emerald-300 font-bold text-sm">
                    {Math.max(0, Number((validatedCard.balance - parsedAmount).toFixed(2)))} NOK
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Beløp som trekkes nå (NOK)
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxAllowed}
                  step="any"
                  value={amountToDeduct}
                  onChange={(e) => setAmountToDeduct(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                />
                <div className="mt-1.5 text-[11px] text-zinc-300">
                  {remainingAfterRedemption > 0 ? (
                    <span>
                      Restbeløp på booking etter trekk:{" "}
                      <strong className="text-amber-300">{remainingAfterRedemption} NOK</strong> (betales i arenaen)
                    </span>
                  ) : (
                    <span className="text-emerald-300 font-semibold">
                      Hele restbeløpet dekkes – bookingen blir fullt oppgjort!
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Notat (valgfritt)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="F.eks. Innløst i skranken"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={checking || redeeming || !code.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {(checking || redeeming) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {validatedCard
                ? `Trekk ${parsedAmount > 0 ? `${parsedAmount} kr` : "gavekort"}`
                : "Kontroller gavekort"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
