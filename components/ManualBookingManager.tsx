"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Minus, RotateCcw, Tag } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_PRICING_TIERS: Record<string, number> = {
  "1": 460,
  "2": 460,
  "3": 395,
  "4": 395,
  "5": 385,
  "6": 385,
  "7": 385,
  "8": 375,
};

function getGlobalTierPricePerPerson(count: number, tiers: Record<string, number>): number {
  const validCount = Math.max(1, count || 1);
  if (validCount === 1) return Number(tiers["1"] ?? tiers["2"] ?? 460);
  const tierKey = validCount >= 8 ? "8" : validCount.toString();
  return Number(tiers[tierKey] ?? 375);
}

export interface ManualBookingInitialData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  bookingType?: string;
  experienceId?: string;
  date?: string;
  time?: string;
  duration?: number;
  players?: number;
  internalNotes?: string;
  totalPrice?: number;
  inquiryId?: string;
}

export const MANUAL_ARRANGEMENTS = [
  { id: "bursdag", name: "Bursdag" },
  { id: "teambuilding", name: "Teambuilding" },
  { id: "utdrikningslag", name: "Utdrikningslag" },
  { id: "vr-on-site", name: "VR On-Site" },
  { id: "arrangement", name: "Arrangement" },
  { id: "julebord", name: "Julebord" },
];

interface ManualBookingManagerProps {
  initialData?: ManualBookingInitialData | null;
  onBookingCreated?: (booking: any, inquiryId?: string) => void;
  onClearInitialData?: () => void;
}

export default function ManualBookingManager({ initialData, onBookingCreated, onClearInitialData }: ManualBookingManagerProps = {}) {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [globalPricing, setGlobalPricing] = useState<Record<string, number>>(DEFAULT_PRICING_TIERS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [experienceId, setExperienceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(90); // default 90 mins
  const [players, setPlayers] = useState(2);
  const [bookingType, setBookingType] = useState("private"); // private or corporate
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // Pricing State: "global" (follows global tiers), "custom_per_person" (fixed kr/pers), or "custom_total" (fixed total)
  const [pricingMode, setPricingMode] = useState<"global" | "custom_per_person" | "custom_total">("global");
  const [pricePerPerson, setPricePerPerson] = useState<number>(DEFAULT_PRICING_TIERS["2"]);
  const [totalPrice, setTotalPrice] = useState<number>(DEFAULT_PRICING_TIERS["2"] * 2);

  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [customEmailText, setCustomEmailText] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  // available times based on selected date
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      if (initialData.firstName !== undefined) setFirstName(initialData.firstName);
      if (initialData.lastName !== undefined) setLastName(initialData.lastName);
      if (initialData.email !== undefined) setEmail(initialData.email);
      if (initialData.phone !== undefined) setPhone(initialData.phone);
      if (initialData.companyName !== undefined) setCompanyName(initialData.companyName);
      if (initialData.bookingType !== undefined) setBookingType(initialData.bookingType);
      if (initialData.experienceId !== undefined) setExperienceId(initialData.experienceId);
      if (initialData.date !== undefined) setDate(initialData.date);
      if (initialData.time !== undefined) setTime(initialData.time);
      if (initialData.duration !== undefined) setDuration(initialData.duration);
      if (initialData.players !== undefined) setPlayers(Math.max(1, initialData.players));
      if (initialData.internalNotes !== undefined) setInternalNotes(initialData.internalNotes);
      if (initialData.totalPrice !== undefined) {
        setPricingMode("custom_total");
        setTotalPrice(initialData.totalPrice);
        const pCount = Math.max(1, initialData.players || 2);
        setPricePerPerson(Math.round((initialData.totalPrice / pCount) * 100) / 100);
      } else {
        setPricingMode("global");
      }
    }
  }, [initialData]);

  useEffect(() => {
    async function loadData() {
      try {
        const timestamp = new Date().getTime();
        const [expRes, settingsRes] = await Promise.all([
          fetch(`/api/experiences?active_only=true&t=${timestamp}`),
          fetch(`/api/settings?t=${timestamp}`)
        ]);

        if (expRes.ok && settingsRes.ok) {
          const exps = await expRes.json();
          const sett = await settingsRes.json();
          setExperiences(exps);
          setSettings(sett.general || sett);

          const fetchedPricing =
            sett?.pricing?.pricing ||
            (sett?.pricing && typeof sett.pricing === "object" ? sett.pricing : null) ||
            sett?.general?.pricing;
          if (fetchedPricing && typeof fetchedPricing === "object") {
            setGlobalPricing({ ...DEFAULT_PRICING_TIERS, ...fetchedPricing });
          }

          if (initialData?.experienceId) {
            setExperienceId(initialData.experienceId);
          } else if (exps.length > 0) {
            setExperienceId(exps[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load generic options", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialData?.experienceId]);

  const selectedExpObj = experiences.find((ex) => ex.id === experienceId);
  const isVippsTest = Boolean(selectedExpObj?.type && selectedExpObj.type.toLowerCase() === "vipps test");
  const currentGlobalTierPerPerson = isVippsTest ? 2 : getGlobalTierPricePerPerson(players, globalPricing);
  const currentGlobalTierTotal = isVippsTest ? 2 : currentGlobalTierPerPerson * Math.max(1, players);

  // Sync prices automatically when in global tier mode
  useEffect(() => {
    if (pricingMode === "global") {
      const validPlayers = Math.max(1, players || 1);
      const tierPerPerson = isVippsTest ? 2 : getGlobalTierPricePerPerson(validPlayers, globalPricing);
      const tierTotal = isVippsTest ? 2 : tierPerPerson * validPlayers;
      setPricePerPerson(tierPerPerson);
      setTotalPrice(tierTotal);
    }
  }, [players, globalPricing, isVippsTest, pricingMode]);

  const handlePlayersChange = (newCount: number) => {
    const valid = Math.max(1, newCount || 1);
    setPlayers(valid);
    if (pricingMode === "custom_per_person") {
      setTotalPrice(Math.round(pricePerPerson * valid));
    } else if (pricingMode === "custom_total") {
      setPricePerPerson(Math.round((totalPrice / valid) * 100) / 100);
    }
  };

  const handlePricePerPersonInputChange = (valStr: string) => {
    const num = valStr === "" ? 0 : Math.max(0, Number(valStr));
    setPricingMode("custom_per_person");
    setPricePerPerson(num);
    setTotalPrice(Math.round(num * Math.max(1, players)));
  };

  const handleTotalPriceInputChange = (valStr: string) => {
    const num = valStr === "" ? 0 : Math.max(0, Number(valStr));
    setPricingMode("custom_total");
    setTotalPrice(num);
    setPricePerPerson(Math.round((num / Math.max(1, players)) * 100) / 100);
  };

  const handleResetToGlobalPricing = () => {
    const validPlayers = Math.max(1, players || 1);
    const tierPerPerson = isVippsTest ? 2 : getGlobalTierPricePerPerson(validPlayers, globalPricing);
    const tierTotal = isVippsTest ? 2 : tierPerPerson * validPlayers;
    setPricingMode("global");
    setPricePerPerson(tierPerPerson);
    setTotalPrice(tierTotal);
  };

  // Update available times when date changes
  useEffect(() => {
    async function fetchBookingsForDate() {
      if (!date || !settings) {
        setAvailableTimes([]);
        setBookedTimes([]);
        return;
      }
      
      const [year, month, day] = date.split('-').map(Number);
      const selDate = new Date(year, month - 1, day);
      let times: string[] = [];
      if (settings.specialHours && settings.specialHours[date]) {
        times = settings.specialHours[date];
      } else {
        const dt = selDate.getDay(); // 0 is Sunday, etc.
        times = settings.openingHours[dt.toString()] || [];
      }
      setAvailableTimes(times);

      try {
        const response = await fetch(`/api/booking?date=${date}`);
        if (response.ok) {
          const existingBookings = await response.json();
          const activeBookings = existingBookings.filter((b: any) => {
            if (b.status === 'cancelled') return false;
            // Filter out pending bookings older than 15 min
            if (b.status === 'pending') {
               const now = new Date().getTime();
               const created = new Date(b.createdAt).getTime();
               if ((now - created) > 15 * 60 * 1000) return false;
            }
            return true;
          });

          const timeToMinutes = (t: string) => {
            if (!t || !t.includes(':')) return 0;
            const [h, m] = t.split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
          };

          const blocked = new Set<string>();
          activeBookings.forEach((b: any) => {
            if (b.time) blocked.add(b.time.trim());
            const bStart = timeToMinutes(b.time);
            const bDuration = Number(b.duration) || 90;
            const bEnd = bStart + bDuration;

            times.forEach(slot => {
              const slotStart = timeToMinutes(slot);
              const slotEnd = slotStart + 90;
              if (slotStart < bEnd && bStart < slotEnd) {
                blocked.add(slot.trim());
              }
            });
          });

          setBookedTimes(Array.from(blocked));
        }
      } catch (error) {
        console.error("Failed to fetch blocked times:", error);
      }
    }
    fetchBookingsForDate();
  }, [date, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experienceId || !date || !time) {
      toast.error("Vennligst fyll ut experience, date, and time.");
      return;
    }
    setSubmitting(true);
    
    // Calculate shadow times to block
    const allTimes = availableTimes;
    let shadowTimes: string[] = [];
    if (duration > 90) {
       const selectedIndex = allTimes.indexOf(time);
       if (selectedIndex !== -1) {
          const slotsToBlock = Math.ceil((duration - 90) / 90); // e.g. 180 means 1 extra slot, 270 means 2 extra.
          for (let i = 1; i <= slotsToBlock; i++) {
             if (selectedIndex + i < allTimes.length) {
                shadowTimes.push(allTimes[selectedIndex + i]);
             }
          }
       } else {
         // Custom time, calculate 90 minute intervals manually
         const [hours, minutes] = time.split(':').map(Number);
         const slotsToBlock = Math.ceil((duration - 90) / 90);
         for (let i = 1; i <= slotsToBlock; i++) {
            const totalMins = hours * 60 + minutes + (i * 90);
            const h = Math.floor(totalMins / 60) % 24;
            const m = totalMins % 60;
            shadowTimes.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
         }
       }
    }

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId,
          date,
          time,
          duration,
          players,
          bookingType,
          companyName,
          firstName,
          lastName,
          email,
          phone,
          internalNotes,
          totalPrice,
          paymentType: "manual",
          status: "confirmed",
          shadowTimes,
          sendConfirmation,
          customEmailText,
          subscribeNewsletter
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Booking opprettet!");
        
        if (initialData?.inquiryId) {
          try {
            await fetch(`/api/admin/inquiries/${initialData.inquiryId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: "booked",
                bookingId: data.id,
              }),
            });
          } catch (inqErr) {
            console.error("Failed to update inquiry status to booked:", inqErr);
          }
        }

        if (onBookingCreated) {
          onBookingCreated(data, initialData?.inquiryId);
        }

        // Reset form except standard selections
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setCompanyName("");
        setInternalNotes("");
        setPlayers(2);
        setPricingMode("global");
        setDuration(90);
        setCustomEmailText("");
        setSubscribeNewsletter(false);
        if (onClearInitialData) onClearInitialData();

        // refresh booked times
        setBookedTimes([...bookedTimes, time, ...shadowTimes]);
      } else {
        toast.error(data.error || "Failed to create booking");
      }
    } catch (error: any) {
      toast.error("Nettverksfeil: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
      {initialData?.inquiryId && (
        <div className="mb-6 p-4 bg-[#9C39FF]/15 border border-[#9C39FF]/30 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[#9C39FF]">
            <span className="font-semibold">Fyller ut fra henvendelse:</span>
            <span className="text-white font-medium">{initialData.firstName} {initialData.lastName} {initialData.companyName ? `(${initialData.companyName})` : ''}</span>
          </div>
          {onClearInitialData && (
            <button
              type="button"
              onClick={onClearInitialData}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              Nullstill forhåndsutfylling
            </button>
          )}
        </div>
      )}
      <h2 className="text-xl font-medium mb-6">Opprett Manuell Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-300">Reservering</h3>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Opplevelse</label>
              <select
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF] cursor-pointer"
                value={experienceId}
                onChange={(e) => setExperienceId(e.target.value)}
                required
              >
                <optgroup label="Arrangementer & Pakker (Manuell)">
                  {MANUAL_ARRANGEMENTS.map((arr) => (
                    <option key={arr.id} value={arr.id} className="bg-zinc-900 font-medium">
                      {arr.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Spill & Aktiviteter">
                  {experiences.filter(ex => !MANUAL_ARRANGEMENTS.some(arr => arr.id === ex.id)).map(ex => (
                    <option key={ex.id} value={ex.id} className="bg-zinc-900">
                      {ex.title || ex.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Dato</label>
              <input
                type="date"
                required
                className="w-full max-w-full box-border block min-w-0 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Tidspunkt</label>
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <select
                  className="flex-1 min-w-0 max-w-full box-border bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-[#9C39FF]"
                  value={availableTimes.includes(time) ? time : (time ? "custom" : "")}
                  onChange={(e) => {
                    if (e.target.value !== "custom") {
                       setTime(e.target.value);
                    }
                  }}
                >
                  <option value="">Velg fra liste</option>
                  {availableTimes.map(t => (
                    <option key={t} value={t}>
                      {t} {bookedTimes.includes(t) ? "(Opptatt)" : ""}
                    </option>
                  ))}
                  {time && !availableTimes.includes(time) && (
                     <option value="custom" hidden>Egendefinert</option>
                  )}
                </select>
                <span className="text-zinc-500 text-xs sm:text-sm text-center shrink-0">eller</span>
                <input
                  type="time"
                  className="flex-1 min-w-0 max-w-full box-border block bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-[#9C39FF]"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Varighet (minutter)</label>
              <select
                 className="w-full max-w-full box-border bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                 value={duration}
                 onChange={(e) => setDuration(Number(e.target.value))}
              >
                 <option value={90}>90 Minutter (1 blokk)</option>
                 <option value={180}>180 Minutter (2 blokker)</option>
                 <option value={270}>270 Minutter (3 blokker)</option>
                 <option value={360}>360 Minutter (4 blokker)</option>
              </select>
              <p className="text-xs leading-relaxed text-zinc-500 mt-1">
                 Å velge mer enn 90 min vil automatisk blokkere de påfølgende tidspunktene {time ? "etter " + time : ""} denne dagen.
              </p>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Antall spillere</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePlayersChange(players - 1)}
                  disabled={players <= 1}
                  className="w-10 h-10 flex items-center justify-center bg-zinc-950 hover:bg-zinc-900 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl border border-zinc-800 transition-colors shrink-0"
                  aria-label="Reduser antall spillere"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  required
                  className="flex-1 min-w-0 max-w-full box-border bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-center font-medium text-white outline-none focus:border-[#9C39FF]"
                  value={players}
                  onChange={(e) => handlePlayersChange(Number(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => handlePlayersChange(players + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl border border-zinc-800 transition-colors shrink-0"
                  aria-label="Øk antall spillere"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pricing Section: Global Tiers + Custom Per Person / Custom Total Override */}
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#9C39FF]">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Prisberegning</span>
                </div>
                {pricingMode !== "global" && (
                  <button
                    type="button"
                    onClick={handleResetToGlobalPricing}
                    className="text-xs text-[#9C39FF] hover:text-purple-300 flex items-center gap-1 transition-colors"
                    title="Tilbakestill til globalt pristrinn"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Bruk global pris ({currentGlobalTierPerPerson} kr/pers)</span>
                  </button>
                )}
              </div>

              {/* Mode Selector Pills */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={handleResetToGlobalPricing}
                  className={`py-1.5 px-2 rounded-md font-medium transition-all text-center ${
                    pricingMode === "global"
                      ? "bg-[#9C39FF] text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Globalt trinn
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode("custom_per_person")}
                  className={`py-1.5 px-2 rounded-md font-medium transition-all text-center ${
                    pricingMode === "custom_per_person"
                      ? "bg-[#9C39FF] text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Egen kr/pers
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode("custom_total")}
                  className={`py-1.5 px-2 rounded-md font-medium transition-all text-center ${
                    pricingMode === "custom_total"
                      ? "bg-[#9C39FF] text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Egen totalpris
                </button>
              </div>

              {/* Side-by-side Price Per Person & Total Price Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    Pris per deltaker (NOK)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={`w-full box-border bg-zinc-900 border rounded-xl px-3.5 py-2 text-white outline-none transition-colors ${
                      pricingMode === "custom_per_person"
                        ? "border-[#9C39FF] ring-1 ring-[#9C39FF]/30"
                        : "border-zinc-800 focus:border-[#9C39FF]"
                    }`}
                    value={pricePerPerson}
                    onChange={(e) => handlePricePerPersonInputChange(e.target.value)}
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    {pricingMode === "global"
                      ? `Automatisk trinn for ${players} pers`
                      : pricingMode === "custom_per_person"
                      ? `Overstyrt kr/pers (global: ${currentGlobalTierPerPerson} kr)`
                      : `Effektiv pris pr. pers ved fast total`}
                  </span>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    Total Pris (NOK)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    className={`w-full box-border bg-zinc-900 border rounded-xl px-3.5 py-2 font-semibold text-white outline-none transition-colors ${
                      pricingMode === "custom_total"
                        ? "border-[#9C39FF] ring-1 ring-[#9C39FF]/30"
                        : "border-zinc-800 focus:border-[#9C39FF]"
                    }`}
                    value={totalPrice}
                    onChange={(e) => handleTotalPriceInputChange(e.target.value)}
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    {pricingMode === "custom_total"
                      ? `Låst totalpris (global: ${currentGlobalTierTotal} kr)`
                      : `${players} pers × ${pricePerPerson} kr = ${totalPrice} kr`}
                  </span>
                </div>
              </div>

              {/* Global Pricing Reference Bar */}
              <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-1 text-[11px] text-zinc-500">
                <span>Globale pristrinn:</span>
                <span>
                  2p: {globalPricing["2"] ?? 460},- · 3–4p: {globalPricing["3"] ?? 395},- · 5–7p: {globalPricing["5"] ?? 385},- · 8+p: {globalPricing["8"] ?? 375},-
                </span>
              </div>
            </div>

          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-300">Kunde / Gruppe</h3>
            
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Booking Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="private" checked={bookingType === "private"} onChange={() => setBookingType("private")} className="accent-[#9C39FF]" />
                  <span className="text-sm text-zinc-200">Privat</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="corporate" checked={bookingType === "corporate"} onChange={() => setBookingType("corporate")} className="accent-[#9C39FF]" />
                  <span className="text-sm text-zinc-200">Bedrift</span>
                </label>
              </div>
            </div>

            {bookingType === "corporate" && (
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Bedriftsnavn (Valgfritt)</label>
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-4">
               <div className="flex-1">
                 <label className="text-sm text-zinc-400 mb-1 block">Fornavn</label>
                 <input
                   type="text"
                   required
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                   value={firstName}
                   onChange={(e) => setFirstName(e.target.value)}
                 />
               </div>
               <div className="flex-1">
                 <label className="text-sm text-zinc-400 mb-1 block">Etternavn</label>
                 <input
                   type="text"
                   required
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                   value={lastName}
                   onChange={(e) => setLastName(e.target.value)}
                 />
               </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">E-post</label>
              <input
                type="email"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Telefon</label>
              <input
                type="tel"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Interne Notater (Valgfritt)</label>
              <textarea
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF] min-h-[100px] resize-y"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Spesielle detaljer, diett for catering, faktura-info etc."
              />
            </div>
            
            <div className="pt-4 border-t border-zinc-800">
               <label className="flex items-center gap-3 cursor-pointer mb-3">
                 <input 
                   type="checkbox" 
                   checked={subscribeNewsletter}
                   onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                   className="w-5 h-5 accent-[#9C39FF] bg-zinc-900 border-zinc-700 rounded cursor-pointer"
                 />
                 <span className="text-zinc-200">Kunden ønsker å motta nyhetsbrev (tilbud/nyheter)</span>
               </label>

               <label className="flex items-center gap-3 cursor-pointer mb-3 mt-4">
                 <input 
                   type="checkbox" 
                   checked={sendConfirmation}
                   onChange={(e) => setSendConfirmation(e.target.checked)}
                   className="w-5 h-5 accent-[#9C39FF] bg-zinc-900 border-zinc-700 rounded cursor-pointer"
                 />
                 <span className="text-zinc-200">Send booking-bekreftelse på e-post til kunden</span>
               </label>
               
               {sendConfirmation && (
                 <div className="pl-8">
                    <label className="text-sm text-zinc-400 mb-1 block">Egendefinert melding i e-post (valgfritt)</label>
                    <textarea
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF] min-h-[80px] text-sm resize-y"
                      value={customEmailText}
                      onChange={(e) => setCustomEmailText(e.target.value)}
                      placeholder="Ekstra informasjon som kommer øverst i bekreftelsen (f.eks info om oppmøte, mat etc.)"
                    />
                 </div>
               )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-6 border-t border-zinc-800">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-[#9C39FF] hover:bg-[#8A2BE2] text-white px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Opprett Booking
          </button>
        </div>
      </form>
    </div>
  );
}
