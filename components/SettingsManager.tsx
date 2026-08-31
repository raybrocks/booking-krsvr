"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Trash2, Save, Calendar as CalendarIcon, AlertTriangle, Lock, Unlock, Users, RotateCcw, X, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { nb } from "date-fns/locale";
import DiscountCodesManager from "./DiscountCodesManager";

export default function SettingsManager() {
  const [activeSettingsTab, setActiveSettingsTab] = useState<"hours" | "general" | "discounts">("hours");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newOverrideDate, setNewOverrideDate] = useState("");
  
  // Real-time bookings lookup for special dates
  const [dateBookings, setDateBookings] = useState<Record<string, any[]>>({});
  const [togglingSlot, setTogglingSlot] = useState<string | null>(null);
  
  // Vacation Mode States
  const [vacationStart, setVacationStart] = useState("");
  const [vacationEnd, setVacationEnd] = useState("");
  const [vacationWarning, setVacationWarning] = useState<any[] | null>(null);
  const [applyingVacation, setApplyingVacation] = useState(false);

  const daysOfWeek = [
    { name: "Monday", index: "1" },
    { name: "Tuesday", index: "2" },
    { name: "Wednesday", index: "3" },
    { name: "Thursday", index: "4" },
    { name: "Friday", index: "5" },
    { name: "Saturday", index: "6" },
    { name: "Sunday", index: "0" }
  ];

  const fetchBookingsForDates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.ok) {
        const allBookings = await res.json();
        const map: Record<string, any[]> = {};
        allBookings.forEach((b: any) => {
          if (b.status !== 'cancelled' && b.status !== 'terminated') {
            if (!map[b.date]) map[b.date] = [];
            map[b.date].push(b);
          }
        });
        setDateBookings(map);
      }
    } catch (e) {
      console.error("Failed to fetch bookings for dates:", e);
    }
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.general) {
            setSettings({
              ...data.general,
              specialHours: data.general.specialHours || {}
            });
          } else {
            // Default settings if missing
            setSettings({
              openingHours: {
                "0": [], "1": ["16:00", "17:30", "19:00", "20:30"],
                "2": ["16:00", "17:30", "19:00", "20:30"], "3": ["16:00", "17:30", "19:00", "20:30"],
                "4": ["16:00", "17:30", "19:00", "20:30"], "5": ["14:00", "15:30", "17:00", "18:30", "20:00", "21:30"],
                "6": ["12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"]
              },
              specialHours: {},
              reservationFee: 500,
              adminEmail: "post@krsvr.no"
            });
          }
        }
      } catch (err) {
        console.error("Failed to load settings from API", err);
      }
      setLoading(false);
      fetchBookingsForDates();
    };
    fetchSettings();
  }, [fetchBookingsForDates]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = { ...settings };
      
      // Sort times before saving so they appear chronologically on the website
      if (settingsToSave.openingHours) {
        settingsToSave.openingHours = { ...settingsToSave.openingHours };
        Object.keys(settingsToSave.openingHours).forEach(day => {
          settingsToSave.openingHours[day] = [...settingsToSave.openingHours[day]].sort();
        });
      }
      if (settingsToSave.specialHours) {
        settingsToSave.specialHours = { ...settingsToSave.specialHours };
        Object.keys(settingsToSave.specialHours).forEach(date => {
          settingsToSave.specialHours[date] = [...settingsToSave.specialHours[date]].sort();
        });
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'general', value: settingsToSave })
      });
      
      if (!res.ok) {
        throw new Error("Failed to save settings");
      }
      
      setSettings(settingsToSave);
      toast.success("Innstillinger lagret!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Kunne ikke lagre innstillinger");
    }
    setSaving(false);
  };

  const addTimeSlot = (dayIndex: string) => {
    const newSettings = { ...settings };
    if (!newSettings.openingHours[dayIndex]) newSettings.openingHours[dayIndex] = [];
    newSettings.openingHours[dayIndex].push("12:00");
    newSettings.openingHours[dayIndex].sort();
    setSettings(newSettings);
  };

  const removeTimeSlot = (dayIndex: string, timeIndex: number) => {
    const newSettings = { ...settings };
    newSettings.openingHours[dayIndex].splice(timeIndex, 1);
    setSettings(newSettings);
  };

  const updateTimeSlot = (dayIndex: string, timeIndex: number, value: string) => {
    const newSettings = { ...settings };
    newSettings.openingHours[dayIndex][timeIndex] = value;
    setSettings(newSettings);
  };

  // Special Hours Handlers
  const addOverrideDate = () => {
    if (!newOverrideDate) return;
    const newSettings = { ...settings };
    if (!newSettings.specialHours) newSettings.specialHours = {};
    
    // Initialize with default hours for that day of week to make it easier to edit
    const dayOfWeek = new Date(newOverrideDate).getDay().toString();
    newSettings.specialHours[newOverrideDate] = [...(newSettings.openingHours[dayOfWeek] || [])];
    
    setSettings(newSettings);
    setNewOverrideDate("");
    fetchBookingsForDates();
  };

  const removeOverrideDate = (date: string) => {
    const newSettings = { ...settings };
    delete newSettings.specialHours[date];
    setSettings(newSettings);
  };

  const addSpecialTimeSlot = (date: string) => {
    const newSettings = { ...settings };
    if (!newSettings.specialHours[date]) newSettings.specialHours[date] = [];
    newSettings.specialHours[date].push("12:00");
    newSettings.specialHours[date].sort();
    setSettings(newSettings);
  };

  const removeSpecialTimeSlot = (date: string, timeIndex: number) => {
    const newSettings = { ...settings };
    newSettings.specialHours[date].splice(timeIndex, 1);
    setSettings(newSettings);
  };

  const updateSpecialTimeSlot = (date: string, timeIndex: number, value: string) => {
    const newSettings = { ...settings };
    newSettings.specialHours[date][timeIndex] = value;
    setSettings(newSettings);
  };

  const resetSpecialHoursToDefault = (date: string) => {
    const dayOfWeek = new Date(date).getDay().toString();
    const defaultHours = [...(settings.openingHours[dayOfWeek] || [])];
    const newSettings = { ...settings };
    newSettings.specialHours[date] = defaultHours;
    setSettings(newSettings);
    toast.success("Tilbakestilt til ordinære åpningstider. Husk å lagre!");
  };

  const handleToggleSlotBlock = async (date: string, time: string, isBlocked: boolean) => {
    const slotKey = `${date}-${time}`;
    setTogglingSlot(slotKey);
    const newBlockState = !isBlocked;

    // Optimistic update
    setDateBookings(prev => {
      const list = prev[date] ? [...prev[date]] : [];
      if (newBlockState) {
        list.push({
          date,
          time,
          bookingType: 'system',
          firstName: 'Sperret',
          status: 'confirmed'
        });
      } else {
        const filtered = list.filter(b => !(b.time === time && (b.bookingType === 'system' || b.email?.includes('system@sperret') || b.firstName === 'Sperret')));
        return { ...prev, [date]: filtered };
      }
      return { ...prev, [date]: list };
    });

    try {
      const res = await fetch('/api/admin/slots/toggle-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          time,
          block: newBlockState
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Klarte ikke å endre slot-status");
      }

      toast.success(newBlockState ? `Kl ${time} er nå sperret (opptatt i kalender)` : `Kl ${time} er nå åpnet og ledig`);
      fetchBookingsForDates();
    } catch (e: any) {
      toast.error(e.message);
      fetchBookingsForDates();
    } finally {
      setTogglingSlot(null);
    }
  };

  const handleBulkSlotBlock = async (date: string, times: string[], block: boolean) => {
    try {
      const res = await fetch('/api/admin/slots/toggle-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          times,
          block
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Klarte ikke å endre tider");
      }

      toast.success(block ? `Alle tider den ${date} er nå sperret` : `Alle tider den ${date} er nå åpnet`);
      fetchBookingsForDates();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleApplyVacation = async (force: boolean = false) => {
    if (!vacationStart || !vacationEnd) return;
    if (vacationStart > vacationEnd) {
      toast.error("Start date must be before end date");
      return;
    }

    setApplyingVacation(true);
    
    try {
      if (!force) {
        // Check for conflicting bookings
        const qRes = await fetch(`/api/admin/bookings`);
        if (qRes.ok) {
          const allBookings = await qRes.json();
          const conflictingBookings = allBookings.filter((b: any) => {
            return b.status !== "cancelled" && b.date >= vacationStart && b.date <= vacationEnd;
          });

          if (conflictingBookings.length > 0) {
            setVacationWarning(conflictingBookings);
            setApplyingVacation(false);
            return;
          }
        }
      }

      // Apply vacation
      const newSettings = { ...settings };
      if (!newSettings.specialHours) newSettings.specialHours = {};
      
      let currentDate = new Date(vacationStart);
      const endDate = new Date(vacationEnd);
      
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        newSettings.specialHours[dateStr] = [];
        currentDate = addDays(currentDate, 1);
      }
      
      setSettings(newSettings);
      setVacationStart("");
      setVacationEnd("");
      setVacationWarning(null);
      toast.success("Vacation mode applied. Don't forget to save changes!");
    } catch (error) {
      console.error("Error applying vacation:", error);
      toast.error("Failed to apply vacation mode");
    }
    setApplyingVacation(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" /></div>;
  }

  const specialDates = Object.keys(settings.specialHours || {}).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4 mb-6">
        <button 
          onClick={() => setActiveSettingsTab("hours")} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSettingsTab === 'hours' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          Åpningstider
        </button>
        <button 
          onClick={() => setActiveSettingsTab("general")} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSettingsTab === 'general' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          Generelle Innstillinger
        </button>
        <button 
          onClick={() => setActiveSettingsTab("discounts")} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSettingsTab === 'discounts' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          Rabattkoder
        </button>
      </div>

      {(activeSettingsTab === "general" || activeSettingsTab === "hours") && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-light">
                {activeSettingsTab === "hours" ? "Åpningstider" : "Generelle Innstillinger"}
              </h2>
              <p className="text-zinc-400 text-sm">
                {activeSettingsTab === "hours" ? "Administrer faste og spesielle åpningstider for arenaen." : "Administrer kontaktinfo, vilkår og sikkerhetsfunksjoner."}
              </p>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#9C39FF] text-white px-4 py-2 rounded-xl hover:bg-[#8b32e6] transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lagre Endringer
            </button>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            {activeSettingsTab === "general" && (
              <>
                <div className="mb-6 bg-red-950/20 border border-red-900/50 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-red-400 mb-1">Emergency Booking Kill-Switch</h3>
              <p className="text-sm text-zinc-400">When enabled, the final checkout button in the booking flow will be replaced with a message saying bookings are temporarily closed. Use this if you need to pause all incoming reservations immediately.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.bookingsClosed || false}
                onChange={async (e) => {
                  const newValue = e.target.checked;
                  const newSettings = {...settings, bookingsClosed: newValue};
                  setSettings(newSettings);
                  
                  // Auto-save emergency switch to ensure it takes effect immediately
                  try {
                    await fetch('/api/settings', {
                      method: 'PUT',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ key: 'general', value: newSettings })
                    });
                    toast.success(newValue ? "Bookings are now CLOSED" : "Bookings are now OPEN");
                  } catch (error) {
                    console.error("Error saving emergency switch:", error);
                    toast.error("Failed to update emergency switch");
                  }
                }}
              />
              <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Administrator Email</label>
          <p className="text-zinc-500 text-xs mb-2">This email will receive contact form submissions, new booking notifications, and will be displayed in the footer.</p>
          <input 
            type="email"
            value={settings.adminEmail || "post@krsvr.no"} 
            onChange={(e) => setSettings({...settings, adminEmail: e.target.value})} 
            placeholder="admin@example.com"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#9C39FF]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Påminnelse om Navneliste (Dager før ankomst)</label>
          <p className="text-zinc-500 text-xs mb-2">Hvor mange dager før arrangementsdatoen den daglige påminnelsesjobben skal begynne å purre kunden på e-post dersom navnelisten ikke er registrert (standard: 3 dager).</p>
          <input 
            type="number"
            min="1"
            max="30"
            value={settings.nameListReminderDays ?? 3} 
            onChange={(e) => setSettings({...settings, nameListReminderDays: parseInt(e.target.value, 10) || 3})} 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#9C39FF]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Booking Confirmation Email Text</label>
          <p className="text-zinc-500 text-xs mb-2">This text will be included in the booking confirmation and receipt email sent to the customer.</p>
          <textarea 
            value={settings.bookingConfirmationText || ""} 
            onChange={(e) => setSettings({...settings, bookingConfirmationText: e.target.value})} 
            placeholder="Write the custom text for the booking confirmation email..."
            className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#9C39FF]"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Terms of Service Content (Shown in booking step 5)</label>
          <textarea 
            value={settings.termsContent || ""} 
            onChange={(e) => setSettings({...settings, termsContent: e.target.value})} 
            placeholder="Write your terms of service here..."
            className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#9C39FF]"
          />
        </div>
              </>
            )}

            {activeSettingsTab === "hours" && (
              <>
                <h3 className="text-lg font-medium mb-4 border-b border-zinc-800 pb-2">Weekly Schedule</h3>
        <div className="space-y-6">
          {daysOfWeek.map(({ name: day, index: dayIndex }) => {
            const times = settings.openingHours[dayIndex] || [];
            
            return (
              <div key={day} className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-32 font-medium text-zinc-300 pt-2">{day}</div>
                <div className="flex-1 flex flex-wrap gap-3">
                  {times.map((time: string, tIndex: number) => (
                    <div key={tIndex} className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                      <input 
                        type="time" 
                        value={time}
                        onChange={(e) => updateTimeSlot(dayIndex, tIndex, e.target.value)}
                        className="bg-transparent text-sm text-white px-2 py-1 focus:outline-none"
                      />
                      <button 
                        onClick={() => removeTimeSlot(dayIndex, tIndex)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => addTimeSlot(dayIndex)}
                    className="flex items-center gap-1 text-sm bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg transition-colors border border-dashed border-zinc-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Time
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <h3 className="text-lg font-medium mb-4 border-b border-zinc-800 pb-2 mt-10">Special Dates & Exceptions</h3>
        <p className="text-sm text-zinc-400 mb-4">Override opening hours for specific dates (e.g. holidays). To close for a full day, add the date and remove all time slots.</p>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input 
            type="date" 
            value={newOverrideDate}
            onChange={(e) => setNewOverrideDate(e.target.value)}
            className="w-full sm:w-auto max-w-full box-border bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
          />
          <button 
            onClick={addOverrideDate}
            disabled={!newOverrideDate}
            className="flex items-center justify-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Date Exception
          </button>
        </div>

        <div className="mb-8 p-5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
          <h4 className="text-md font-medium text-zinc-200 mb-2 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#9C39FF]" /> Vacation Mode (Bulk Close)
          </h4>
          <p className="text-sm text-zinc-400 mb-4">Close all booking slots between two dates.</p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-end">
            <div className="w-full sm:w-auto">
              <label className="block text-xs text-zinc-500 mb-1">From</label>
              <input 
                type="date" 
                value={vacationStart}
                onChange={(e) => setVacationStart(e.target.value)}
                className="w-full sm:w-auto max-w-full box-border bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-xs text-zinc-500 mb-1">To</label>
              <input 
                type="date" 
                value={vacationEnd}
                onChange={(e) => setVacationEnd(e.target.value)}
                className="w-full sm:w-auto max-w-full box-border bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <button 
              onClick={() => handleApplyVacation(false)}
              disabled={!vacationStart || !vacationEnd || applyingVacation}
              className="flex items-center justify-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50 h-[42px]"
            >
              {applyingVacation ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Vacation"}
            </button>
          </div>

          {vacationWarning && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <h5 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Warning: Conflicting Bookings Found
              </h5>
              <p className="text-sm text-amber-200/70 mb-4">
                There are {vacationWarning.length} active booking(s) during this period. Applying vacation mode will close the slots, but you still need to manually cancel these bookings and notify the customers.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleApplyVacation(true)}
                  className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors"
                >
                  Apply Anyway
                </button>
                <button 
                  onClick={() => setVacationWarning(null)}
                  className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {specialDates.length === 0 ? (
          <div className="text-sm text-zinc-500 italic p-6 bg-zinc-950/40 rounded-xl border border-zinc-800 text-center">
            Ingen unntaksdatoer opprettet enda. Velg en dato ovenfor for å overstyre åpningstider eller sperre tidspunkter.
          </div>
        ) : (
          <div className="space-y-6">
            {specialDates.map((date) => {
              const times = settings.specialHours[date] || [];
              const dateObj = new Date(date);
              const formattedDate = format(dateObj, "EEEE d. MMMM yyyy", { locale: nb });
              const dayBookings = dateBookings[date] || [];

              // Determine slot statuses
              const blockedTimes = times.filter((t: string) => {
                const b = dayBookings.find(bk => bk.time === t);
                return b && (b.bookingType === 'system' || b.email?.includes('system@sperret') || b.firstName === 'Sperret');
              });
              const customerBookedTimes = times.filter((t: string) => {
                const b = dayBookings.find(bk => bk.time === t);
                return b && b.bookingType !== 'system' && !b.email?.includes('system@sperret') && b.firstName !== 'Sperret';
              });
              const availableTimes = times.filter((t: string) => !blockedTimes.includes(t) && !customerBookedTimes.includes(t));

              return (
                <div key={date} className="p-5 bg-zinc-950/60 rounded-2xl border border-zinc-800 hover:border-[#9C39FF]/30 transition-all space-y-4">
                  {/* Date Header & Quick Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-[#9C39FF]" />
                        <span className="font-semibold text-white text-base capitalize">{formattedDate}</span>
                        <span className="text-xs text-zinc-500 font-mono">({date})</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {times.length === 0 ? (
                          <span className="text-red-400 font-medium">Stengt hele dagen</span>
                        ) : (
                          <span>
                            <strong className="text-emerald-400">{availableTimes.length} ledige</strong>
                            {blockedTimes.length > 0 && <span className="text-red-400 font-medium">, {blockedTimes.length} sperret</span>}
                            {customerBookedTimes.length > 0 && <span className="text-blue-400 font-medium">, {customerBookedTimes.length} kundebooket</span>}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {times.length > 0 && availableTimes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleBulkSlotBlock(date, availableTimes, true)}
                          className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                          title="Sperr alle gjenværende ledige tider på denne datoen"
                        >
                          <Lock className="w-3 h-3" /> Sperr alle ledige
                        </button>
                      )}

                      {times.length > 0 && blockedTimes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleBulkSlotBlock(date, blockedTimes, false)}
                          className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                          title="Åpne alle sperrede tider på denne datoen"
                        >
                          <Unlock className="w-3 h-3" /> Åpne alle sperrede
                        </button>
                      )}

                      {times.length === 0 && (
                        <button
                          type="button"
                          onClick={() => resetSpecialHoursToDefault(date)}
                          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                        >
                          <RotateCcw className="w-3 h-3" /> Gjenopprett åpningstider
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeOverrideDate(date)}
                        className="text-xs text-zinc-500 hover:text-red-400 px-2.5 py-1.5 rounded transition-colors ml-auto underline decoration-dotted"
                        title="Fjern unntaksdato helt fra listen"
                      >
                        Slett unntaksdato
                      </button>
                    </div>
                  </div>

                  {/* Visual Slot Grid */}
                  <div className="space-y-3">
                    {times.length === 0 ? (
                      <div className="flex items-center justify-between p-3.5 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-300">
                        <span>🔴 Hele denne datoen er satt som stengt for bookinger.</span>
                        <button
                          type="button"
                          onClick={() => resetSpecialHoursToDefault(date)}
                          className="underline text-red-400 hover:text-red-200 font-medium"
                        >
                          Åpne ordinære timer
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5 items-center">
                        {times.map((time: string, tIndex: number) => {
                          const customerBooking = dayBookings.find(bk => bk.time === time && bk.bookingType !== 'system' && !bk.email?.includes('system@sperret') && bk.firstName !== 'Sperret');
                          const isBlocked = !customerBooking && dayBookings.some(bk => bk.time === time && (bk.bookingType === 'system' || bk.email?.includes('system@sperret') || bk.firstName === 'Sperret'));
                          const isToggling = togglingSlot === `${date}-${time}`;

                          if (customerBooking) {
                            return (
                              <div
                                key={time}
                                className="flex items-center gap-2 bg-blue-950/30 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-xl text-xs font-medium"
                                title={`Booket av ${customerBooking.firstName} ${customerBooking.lastName}`}
                              >
                                <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span>{time}</span>
                                <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded">
                                  Booket ({customerBooking.firstName})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeSpecialTimeSlot(date, tIndex)}
                                  className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors ml-1"
                                  title="Slett klokkeslett fra unntaket"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          }

                          if (isBlocked) {
                            return (
                              <div
                                key={time}
                                className="flex items-center gap-1.5 bg-red-950/30 border border-red-500/40 text-red-300 rounded-xl p-1 pr-1.5 transition-all group"
                              >
                                <button
                                  type="button"
                                  disabled={isToggling}
                                  onClick={() => handleToggleSlotBlock(date, time, true)}
                                  className="flex items-center gap-2 px-2.5 py-1 text-xs font-semibold hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                                  title="Klikk for å gjøre tidspunktet LEDIG igjen"
                                >
                                  {isToggling ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-red-400" />
                                  )}
                                  <span>{time}</span>
                                  <span className="bg-red-500/20 text-red-300 text-[10px] uppercase px-1.5 py-0.5 rounded font-bold">
                                    Sperret
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeSpecialTimeSlot(date, tIndex)}
                                  className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                  title="Slett klokkeslett helt fra denne datoen"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          }

                          // Available slot
                          return (
                            <div
                              key={time}
                              className="flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 rounded-xl p-1 pr-1.5 transition-all group hover:border-emerald-500/50"
                            >
                              <button
                                type="button"
                                disabled={isToggling}
                                onClick={() => handleToggleSlotBlock(date, time, false)}
                                className="flex items-center gap-2 px-2.5 py-1 text-xs font-semibold hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                                title="Klikk for å SPERRE dette tidspunktet"
                              >
                                {isToggling ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                                ) : (
                                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                <span>{time}</span>
                                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase px-1.5 py-0.5 rounded font-medium">
                                  Ledig
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSpecialTimeSlot(date, tIndex)}
                                className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                title="Slett klokkeslett helt fra denne datoen"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}

                        {/* Add custom time button */}
                        <button
                          type="button"
                          onClick={() => addSpecialTimeSlot(date)}
                          className="flex items-center gap-1 text-xs bg-[#9C39FF]/10 hover:bg-[#9C39FF]/20 text-[#9C39FF] px-3 py-1.5 rounded-xl transition-colors border border-dashed border-[#9C39FF]/30 h-[34px] font-medium"
                        >
                          <Plus className="w-3.5 h-3.5" /> Legg til tid
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
            </>
          )}
        </div>
      </div>
    )}
      {activeSettingsTab === "discounts" && (
        <DiscountCodesManager />
      )}
    </div>
  );
}
