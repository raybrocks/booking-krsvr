"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ManualBookingManager() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [experienceId, setExperienceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(90); // default 90 mins
  const [players, setPlayers] = useState(1);
  const [bookingType, setBookingType] = useState("private"); // private or corporate
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [customEmailText, setCustomEmailText] = useState("");

  // available times based on selected date
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

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
          setSettings(sett);
          if (exps.length > 0) setExperienceId(exps[0].id);
        }
      } catch (error) {
        console.error("Failed to load generic options", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update available times when date changes
  useEffect(() => {
    async function fetchBookingsForDate() {
      if (!date || !settings) {
        setAvailableTimes([]);
        setBookedTimes([]);
        return;
      }
      
      const selDate = new Date(date);
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
          const bTimes = activeBookings.map((b: any) => typeof b.time === 'string' ? b.time.trim() : b.time);
          setBookedTimes(bTimes);
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
          customEmailText
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Booking opprettet!");
        // Reset form except standard selections
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setCompanyName("");
        setInternalNotes("");
        setTotalPrice(0);
        setDuration(90);
        setCustomEmailText("");
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
      <h2 className="text-xl font-medium mb-6">Opprett Manuell Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-300">Reservering</h3>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Opplevelse</label>
              <select
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                value={experienceId}
                onChange={(e) => setExperienceId(e.target.value)}
                required
              >
                {experiences.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.title || ex.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Dato</label>
              <input
                type="date"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Tidspunkt</label>
              <div className="flex gap-2 items-center">
                <select
                  className="w-1/2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
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
                <span className="text-zinc-500 text-sm">eller</span>
                <input
                  type="time"
                  className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Varighet (minutter)</label>
              <select
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
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
              <input
                type="number"
                min="1"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                value={players}
                onChange={(e) => setPlayers(Number(e.target.value))}
              />
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Total Pris (NOK)</label>
              <input
                type="number"
                min="0"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-[#9C39FF]"
                value={totalPrice}
                onChange={(e) => setTotalPrice(Number(e.target.value))}
              />
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
