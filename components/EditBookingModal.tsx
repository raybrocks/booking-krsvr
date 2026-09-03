"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Loader2, 
  Users, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  Building2, 
  Gamepad2, 
  Save, 
  Plus, 
  Minus, 
  RotateCcw,
  Tag,
  Lock
} from "lucide-react";
import { toast } from "sonner";

export interface ExperienceItem {
  id: string;
  name?: string;
  title?: string;
  maxPlayers?: number;
  type?: string;
  duration?: number;
}

interface EditBookingModalProps {
  booking: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBooking: any) => Promise<void> | void;
  experiences: ExperienceItem[];
  pricingTiers?: Record<string, number>;
}

const DEFAULT_PRICING_TIERS: Record<string, number> = {
  "1": 595,
  "2": 460,
  "3": 395,
  "4": 395,
  "5": 385,
  "6": 385,
  "7": 385,
  "8": 375,
};

export default function EditBookingModal({
  booking,
  isOpen,
  onClose,
  onSave,
  experiences,
  pricingTiers = DEFAULT_PRICING_TIERS,
}: EditBookingModalProps) {
  const [saving, setSaving] = useState(false);

  // Customer Details Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingType, setBookingType] = useState<"private" | "corporate">("private");
  const [companyName, setCompanyName] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // Experience & Booking Details State
  const [experienceId, setExperienceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(90);

  // Players & Names State
  const [players, setPlayers] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>([]);

  // Price & Payment State
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const initializedBookingId = useRef<string | null>(null);

  // Initialize form ONLY when modal opens for a new booking ID
  useEffect(() => {
    if (isOpen && booking && booking.id !== initializedBookingId.current) {
      initializedBookingId.current = booking.id;
      setFirstName(booking.firstName || "");
      setLastName(booking.lastName || "");
      setEmail(booking.email || "");
      setPhone(booking.phone || "");
      setBookingType(booking.bookingType === "corporate" ? "corporate" : "private");
      setCompanyName(booking.companyName || "");
      setInternalNotes(booking.internalNotes || "");

      setExperienceId(booking.experienceId || (experiences[0]?.id || ""));
      setDate(booking.date || "");
      setTime(booking.time || "");
      setDuration(booking.duration || 90);

      const pCount = Math.max(1, Number(booking.players) || 1);
      setPlayers(pCount);

      // Pad player names array to match players count
      const existingNames = Array.isArray(booking.playerNames) ? [...booking.playerNames] : [];
      while (existingNames.length < pCount) {
        existingNames.push("");
      }
      setPlayerNames(existingNames);

      setTotalPrice(Number(booking.totalPrice) || 0);
      setAmountPaid(Number(booking.amountPaid) || 0);
    } else if (!isOpen) {
      initializedBookingId.current = null;
    }
  }, [isOpen, booking, experiences]);

  if (!isOpen || !booking) return null;

  // Handler for changing player count
  const handlePlayerCountChange = (newCount: number) => {
    const validCount = Math.max(1, Math.min(20, newCount));
    const previousPlayers = players;
    setPlayers(validCount);

    // Adjust player names array
    setPlayerNames((prev) => {
      const next = [...prev];
      if (validCount > next.length) {
        while (next.length < validCount) {
          next.push("");
        }
      } else if (validCount < next.length) {
        next.splice(validCount);
      }
      return next;
    });

    // Proportional auto-price update if total price exists
    if (previousPlayers > 0 && totalPrice > 0) {
      const pricePerPerson = totalPrice / previousPlayers;
      const newTotal = Math.round(pricePerPerson * validCount);
      setTotalPrice(newTotal);
    } else {
      // Fallback to pricing tier
      const tierKey = validCount > 8 ? "8" : validCount.toString();
      const perPerson = pricingTiers[tierKey] || 385;
      setTotalPrice(perPerson * validCount);
    }
  };

  const handlePlayerNameChange = (index: number, val: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleApplyTierPricing = () => {
    const tierKey = players > 8 ? "8" : players.toString();
    const perPerson = pricingTiers[tierKey] || 385;
    const calculated = perPerson * players;
    setTotalPrice(calculated);
    toast.success(`Totalpris satt til ${calculated} NOK (${perPerson} kr/pers)`);
  };

  const remainingPrice = Math.max(0, totalPrice - amountPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("Vennligst oppgi fornavn.");
      return;
    }
    if (!experienceId) {
      toast.error("Vennligst velg opplevelse.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bookingType,
        companyName: bookingType === "corporate" ? companyName.trim() : null,
        internalNotes: internalNotes.trim() || null,
        experienceId,
        date,
        time,
        duration: Number(duration) || 90,
        players: Number(players) || 1,
        playerNames: playerNames.map((n) => n.trim()),
        totalPrice: Number(totalPrice) || 0,
      };

      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Kunne ikke oppdatere booking");
      }

      const updated = await res.json();
      await onSave(updated);
      toast.success("Booking ble oppdatert!");
      onClose();
    } catch (err: any) {
      console.error("Error saving booking:", err);
      toast.error(err.message || "Feil ved lagring av booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Rediger booking
              <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                #{booking.id.substring(0, 8)}
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Endre kundedetaljer, opplevelse, deltakere, navneliste og pris.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Lukk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* Section 1: Kundeinformasjon */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#9C39FF] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Kundeinformasjon
            </h3>
            
            {/* Kundetype Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBookingType("private")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  bookingType === "private" 
                    ? "bg-[#9C39FF] text-white shadow-sm" 
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                Privatperson
              </button>
              <button
                type="button"
                onClick={() => setBookingType("corporate")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  bookingType === "corporate" 
                    ? "bg-[#9C39FF] text-white shadow-sm" 
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                Bedrift
              </button>
            </div>

            {bookingType === "corporate" && (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Bedriftsnavn
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Bedrift AS"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Fornavn *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Etternavn
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  E-postadresse
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Telefon
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Interne notater / Kommentarer
              </label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="F.eks. spesielle ønsker, matservering, firmaavtale..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
          </div>

          <hr className="border-zinc-800/80" />

          {/* Section 2: Opplevelse, Dato & Tid */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#9C39FF] flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5" />
              Opplevelse, Dato & Tid
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Valgt Opplevelse *
                </label>
                <select
                  value={experienceId}
                  onChange={(e) => setExperienceId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF] cursor-pointer"
                >
                  {experiences.map((exp) => (
                    <option key={exp.id} value={exp.id} className="bg-zinc-900">
                      {exp.title || exp.name || exp.id} {exp.maxPlayers ? `(Maks ${exp.maxPlayers} pers)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Dato
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Starttid
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={time}
                    placeholder="12:00"
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Varighet (minutter)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                >
                  <option value={60} className="bg-zinc-900">60 minutter</option>
                  <option value={90} className="bg-zinc-900">90 minutter (Standard)</option>
                  <option value={120} className="bg-zinc-900">120 minutter</option>
                  <option value={180} className="bg-zinc-900">180 minutter (2 slots)</option>
                  <option value={270} className="bg-zinc-900">270 minutter (3 slots)</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-zinc-800/80" />

          {/* Section 3: Antall Spillere & Navneliste */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#9C39FF] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Deltakere & Navneliste
              </h3>
              <span className="text-xs text-zinc-400">
                {playerNames.filter((n) => n.trim().length > 0).length} av {players} navn registrert
              </span>
            </div>

            {/* Players Stepper */}
            <div className="flex items-center gap-4 bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">Antall spillere:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePlayerCountChange(players - 1)}
                  disabled={players <= 1}
                  className="w-8 h-8 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg border border-zinc-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-base text-white">
                  {players}
                </span>
                <button
                  type="button"
                  onClick={() => handlePlayerCountChange(players + 1)}
                  disabled={players >= 20}
                  className="w-8 h-8 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg border border-zinc-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-zinc-500 italic ml-auto hidden sm:inline">
                Endring av antall justerer automatisk restpris.
              </span>
            </div>

            {/* Player Names Input List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {Array.from({ length: players }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500 w-16 text-right">
                    Spiller {idx + 1}:
                  </span>
                  <input
                    type="text"
                    value={playerNames[idx] || ""}
                    onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                    placeholder={`Fornavn på deltaker ${idx + 1}...`}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-zinc-800/80" />

          {/* Section 4: Pris & Restbeløp */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#9C39FF] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Prisberegning & Restpris
              </h3>
              <button
                type="button"
                onClick={handleApplyTierPricing}
                className="text-xs text-[#9C39FF] hover:text-purple-300 flex items-center gap-1 transition-colors"
                title="Beregn pris etter standard tabell"
              >
                <RotateCcw className="w-3 h-3" />
                Kalkuler fra prisstige
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Totalpris (NOK)
                </label>
                <input
                  type="number"
                  min="0"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-[#9C39FF]"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  {players > 0 ? `${Math.round(totalPrice / players)} kr per pers` : ""}
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Innbetalt beløp (NOK)</span>
                  <span className="text-[10px] text-zinc-500 font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3 text-zinc-500" /> Låst
                  </span>
                </label>
                <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm font-bold text-emerald-400 flex items-center justify-between">
                  <span>{amountPaid} NOK</span>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    {amountPaid > 0 ? "Vipps / Kort" : "0 NOK"}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Registrert via betalingsløsning
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Gjenstående restpris
                </label>
                <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center justify-between ${
                  remainingPrice === 0 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}>
                  <span>{remainingPrice} NOK</span>
                  <span className="text-[10px] font-normal uppercase">
                    {remainingPrice === 0 ? "Oppgjort" : "Gjenstår"}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  {remainingPrice > 0 ? "Betales ved oppmøte" : "Fullt betalt"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#9C39FF] hover:bg-[#8A2BE2] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-[#9C39FF]/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Lagrer...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Lagre endringer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
