"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Calendar as CalendarIcon, Clock, AlertTriangle, ArrowRight, XCircle, Info } from 'lucide-react';
import { format, differenceInHours, getDay } from 'date-fns';
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";

export default function ManageBookingClient({ bookingId }: { bookingId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  
  const [experiences, setExperiences] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>("");
  
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimesForDate, setBookedTimesForDate] = useState<string[]>([]);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Mangler sikkerhetstoken i URL.");
      setLoading(false);
      return;
    }

    async function loadInitialData() {
      try {
        const [bookingRes, expRes, settingsRes, datesRes] = await Promise.all([
          fetch(`/api/booking/${bookingId}/manage?token=${token}`),
          fetch('/api/experiences?active_only=true'),
          fetch('/api/settings'),
          fetch('/api/booking/dates')
        ]);

        if (!bookingRes.ok) {
          const errData = await bookingRes.json();
          throw new Error(errData.error || "Failed to fetch booking");
        }

        const bData = await bookingRes.json();
        setBooking(bData);
        setSelectedExperienceId(bData.experienceId);
        
        // Initialize date if it's in the future
        const bDate = new Date(bData.date);
        bDate.setHours(0,0,0,0);
        if (bDate >= new Date(new Date().setHours(0,0,0,0))) {
          setSelectedDate(bDate);
          setSelectedTime(bData.time);
        }

        if (expRes.ok) setExperiences(await expRes.json());
        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          if (sData.general) setSettings(sData.general);
        }
        if (datesRes.ok) setBookedDates(await datesRes.json());
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadInitialData();
  }, [bookingId, token]);

  useEffect(() => {
    async function updateAvailableTimes() {
      if (!selectedDate || !settings) return;
      
      const dateString = format(selectedDate, "yyyy-MM-dd");
      
      // Calculate times based on opening hours
      let times: string[] = [];
      if (settings.specialHours && settings.specialHours[dateString]) {
        times = settings.specialHours[dateString];
      } else if (settings.openingHours) {
        const day = getDay(selectedDate);
        times = settings.openingHours[day.toString()] || [];
      }
      
      // Filter out past times for today
      const today = new Date();
      if (dateString === format(today, "yyyy-MM-dd")) {
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        times = times.filter(t => {
          const [h, m] = t.split(':').map(Number);
          return h > currentHour || (h === currentHour && m > currentMinute);
        });
      }
      
      setAvailableTimes(times);

      // Fetch booked times
      try {
        const res = await fetch(`/api/booking?date=${dateString}`);
        if (res.ok) {
          const bTimes = await res.json();
          // Filter out the current booking's time so it appears available
          const activeOthers = bTimes
            .filter((b: any) => b.status !== 'cancelled' && b.status !== 'terminated' && b.id !== bookingId)
            .map((b: any) => b.time);
          setBookedTimesForDate(activeOthers);
        }
      } catch (e) {
        console.error("Failed to fetch booked times", e);
      }
    }

    updateAvailableTimes();
  }, [selectedDate, settings, bookingId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#9C39FF]" /></div>;
  if (error) return <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center"><AlertTriangle className="w-8 h-8 mx-auto mb-3" />{error}</div>;
  if (!booking) return null;

  if (booking.status === 'cancelled' || booking.status === 'terminated') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center">
        <XCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
        <h2 className="text-2xl font-light mb-2">Denne bookingen er kansellert</h2>
        <p className="text-zinc-400">Du kan ikke lenger endre denne bookingen. Kontakt oss hvis du har spørsmål.</p>
      </div>
    );
  }

  const bookingDateObj = new Date(`${booking.date}T${booking.time}`);
  const hoursUntil = differenceInHours(bookingDateObj, new Date());
  const isTooLate = hoursUntil < 48;

  const handleUpdate = async () => {
    if (!selectedDate || !selectedTime || !selectedExperienceId) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/booking/${bookingId}/manage?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(selectedDate, "yyyy-MM-dd"),
          time: selectedTime,
          experienceId: selectedExperienceId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Klarte ikke å oppdatere");
      }

      toast.success("Bookingen din er oppdatert!");
      // Reload page to reflect changes
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Er du sikker på at du vil kansellere bookingen? Merk: Reservasjonsgebyret refunderes ikke automatisk.")) return;
    
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/booking/${bookingId}/manage?token=${token}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Klarte ikke å kansellere");
      }

      toast.success("Bookingen er kansellert");
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message);
      setIsCancelling(false);
    }
  };

  const allDisplayTimes = Array.from(new Set([...availableTimes, ...bookedTimesForDate])).sort();

  return (
    <div className="space-y-8">
      {/* Current Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-medium mb-6">Din Nåværende Booking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-zinc-500 mb-1">Navn</p>
            <p className="font-medium">{booking.firstName} {booking.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 mb-1">Opplevelse</p>
            <p className="font-medium">{booking.experience?.name || "VR Experience"}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 mb-1">Dato og Tid</p>
            <p className="font-medium">{format(new Date(booking.date), "dd. MMMM yyyy", { locale: nb })} kl {booking.time}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 mb-1">Antall personer</p>
            <p className="font-medium">{booking.players} personer</p>
          </div>
        </div>
      </div>

      {isTooLate ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex gap-4">
          <Info className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-amber-400 mb-2">For sent å endre automatisk</h3>
            <p className="text-amber-200/80 mb-4">Det er under 48 timer til bookingen din starter, og den kan derfor ikke endres eller kanselleres via denne portalen (ref. våre kjøpsvilkår).</p>
            <p className="text-amber-200/80">Vennligst kontakt oss på telefon eller e-post dersom du har akutte endringer.</p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-8">
          <h2 className="text-xl font-medium mb-4 border-b border-zinc-800 pb-4">Endre Tidspunkt eller Opplevelse</h2>
          
          <div className="space-y-4">
            <h3 className="font-medium text-zinc-300">1. Velg Spill / Opplevelse</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experiences.map(exp => (
                <button
                  key={exp.id}
                  onClick={() => setSelectedExperienceId(exp.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedExperienceId === exp.id 
                      ? 'border-[#9C39FF] bg-[#9C39FF]/10' 
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <p className="font-medium mb-1">{exp.name}</p>
                  <p className="text-xs text-zinc-500">{exp.shortDescription}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-medium text-zinc-300">2. Velg Ny Dato og Tid</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="w-full max-w-sm mx-auto">
                <Calendar
                  mode="single"
                  weekStartsOn={1}
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime("");
                  }}
                  disabled={(date) => {
                    const dateString = format(date, "yyyy-MM-dd");
                    const isPast = date < new Date(new Date().setHours(0,0,0,0));
                    if (isPast) return true;
                    if (bookedDates.includes(dateString)) return false;
                    if (settings?.specialHours && settings.specialHours[dateString]) {
                      return settings.specialHours[dateString].length === 0;
                    }
                    const day = getDay(date);
                    return !settings?.openingHours[day.toString()] || settings.openingHours[day.toString()].length === 0;
                  }}
                  className="rounded-xl border border-zinc-800 bg-zinc-950"
                />
              </div>

              <div>
                {selectedDate ? (
                  allDisplayTimes.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {allDisplayTimes.map((time) => {
                        const isBooked = bookedTimesForDate.includes(time);
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            disabled={isBooked}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 px-4 rounded-xl text-center transition-all border ${
                              isBooked 
                                ? 'opacity-30 cursor-not-allowed border-zinc-800 bg-zinc-950' 
                                : isSelected
                                  ? 'bg-[#9C39FF] text-white border-[#9C39FF]'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-[#9C39FF]/50'
                            }`}
                          >
                            {time} {isBooked && <span className="text-[10px] block opacity-70">(Opptatt)</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-center py-10 bg-zinc-950 rounded-xl border border-zinc-800">
                      Ingen ledige tider på denne datoen.
                    </p>
                  )
                ) : (
                  <p className="text-zinc-500 text-center py-10 bg-zinc-950 rounded-xl border border-zinc-800">
                    Velg en dato i kalenderen først for å se ledige tider.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={!selectedDate || !selectedTime || !selectedExperienceId || isUpdating}
              className="flex items-center gap-2 bg-[#9C39FF] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#8b32e6] transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Bekreft Nytt Tidspunkt"}
            </button>
          </div>
        </div>
      )}

      {!isTooLate && (
        <div className="text-center pt-10">
          <button 
            onClick={handleCancel}
            disabled={isCancelling}
            className="text-sm text-zinc-500 hover:text-red-400 transition-colors underline"
          >
            {isCancelling ? "Kansellerer..." : "Ønsker du heller å kansellere bookingen? Klikk her."}
          </button>
        </div>
      )}
    </div>
  );
}
