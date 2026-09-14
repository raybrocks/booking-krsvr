"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Trash2, Save, Calendar as CalendarIcon, AlertTriangle, Lock, Unlock, Users, RotateCcw, X, ShieldAlert, Pencil, Clock, Copy } from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { nb } from "date-fns/locale";
import DiscountCodesManager from "./DiscountCodesManager";
import EmailPreviewClient from "./EmailPreviewClient";

export default function SettingsManager() {
  const [activeSettingsTab, setActiveSettingsTab] = useState<"hours" | "general" | "discounts" | "emails">("hours");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newOverrideDate, setNewOverrideDate] = useState("");
  
  // Real-time bookings lookup for special dates
  const [dateBookings, setDateBookings] = useState<Record<string, any[]>>({});
  const [togglingSlot, setTogglingSlot] = useState<string | null>(null);

  // Modal states for adding multiple times to a special date
  const [addingTimeToDate, setAddingTimeToDate] = useState<string | null>(null);
  const [newTimeSlots, setNewTimeSlots] = useState<string[]>(["", "", "", "", ""]);

  // Modal state for editing an existing time slot
  const [editingSlot, setEditingSlot] = useState<{
    date: string;
    timeIndex: number;
    oldTime: string;
    newTime: string;
  } | null>(null);

  // Modal state for duplicating times from one date to other date(s)
  const [duplicateSourceDate, setDuplicateSourceDate] = useState<string | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<"specific" | "range">("specific");
  const [targetDates, setTargetDates] = useState<string[]>([]);
  const [targetDateInput, setTargetDateInput] = useState<string>("");
  const [targetRangeStart, setTargetRangeStart] = useState<string>("");
  const [targetRangeEnd, setTargetRangeEnd] = useState<string>("");
  const [duplicateMergeStrategy, setDuplicateMergeStrategy] = useState<"overwrite" | "merge">("overwrite");
  
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

  const handleSave = async (explicitSettings?: any) => {
    setSaving(true);
    try {
      const settingsToSave = explicitSettings ? { ...explicitSettings } : { ...settings };
      
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
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Kunne ikke lagre innstillinger");
      return false;
    } finally {
      setSaving(false);
    }
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
    const dayOfWeek = new Date(newOverrideDate + "T12:00:00").getDay().toString();
    newSettings.specialHours[newOverrideDate] = [...(newSettings.openingHours[dayOfWeek] || [])];
    
    setSettings(newSettings);
    setNewOverrideDate("");
    fetchBookingsForDates();
  };

  const removeOverrideDate = async (date: string) => {
    if (!window.confirm(`Er du sikker på at du vil fjerne unntaksdatoen ${date}?`)) return;
    const newSettings = { ...settings };
    delete newSettings.specialHours[date];
    setSettings(newSettings);
    await handleSave(newSettings);
    toast.success(`Fjernet unntaksdato ${date}.`);
  };

  const openAddTimeModal = (date: string) => {
    setAddingTimeToDate(date);
    setNewTimeSlots(["", "", "", "", ""]);
  };

  const handleFill90MinIntervals = () => {
    const startTime = newTimeSlots.find(t => t.trim().length > 0) || "10:30";
    const [hStr, mStr] = startTime.split(":");
    let totalMins = (parseInt(hStr, 10) || 10) * 60 + (parseInt(mStr, 10) || 0);

    const generated: string[] = [];
    for (let i = 0; i < newTimeSlots.length; i++) {
      const mins = totalMins + i * 90;
      const hours = Math.floor(mins / 60) % 24;
      const remainingMins = mins % 60;
      generated.push(`${String(hours).padStart(2, "0")}:${String(remainingMins).padStart(2, "0")}`);
    }
    setNewTimeSlots(generated);
  };

  const handleAddField = () => {
    setNewTimeSlots(prev => [...prev, ""]);
  };

  const handleSaveNewTimes = async () => {
    if (!addingTimeToDate) return;

    const validTimes = newTimeSlots
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (validTimes.length === 0) {
      toast.error("Vennligst fyll ut minst ett klokkeslett.");
      return;
    }

    const existing: string[] = settings.specialHours?.[addingTimeToDate] || [];
    const alreadyExist = validTimes.filter(t => existing.includes(t));
    const toAdd = Array.from(new Set(validTimes.filter(t => !existing.includes(t))));

    if (toAdd.length === 0) {
      toast.error(
        alreadyExist.length > 0 
          ? `Alle de oppgitte tidspunktene (${alreadyExist.join(", ")}) finnes allerede på denne datoen.`
          : "Ingen nye tidspunkter å legge til."
      );
      return;
    }

    const updatedTimes = Array.from(new Set([...existing, ...toAdd])).sort();
    const newSettings = {
      ...settings,
      specialHours: {
        ...(settings.specialHours || {}),
        [addingTimeToDate]: updatedTimes
      }
    };

    setSettings(newSettings);
    setAddingTimeToDate(null);
    await handleSave(newSettings);
    toast.success(`La til ${toAdd.length} nye klokkeslett for ${addingTimeToDate}!`);
  };

  const handleSaveEditSlot = async () => {
    if (!editingSlot || !editingSlot.newTime) return;
    const { date, timeIndex, oldTime, newTime } = editingSlot;
    const trimmedNew = newTime.trim();

    if (!trimmedNew) {
      toast.error("Vennligst oppgi et gyldig klokkeslett.");
      return;
    }

    if (oldTime === trimmedNew) {
      setEditingSlot(null);
      return;
    }

    const currentTimes = [...(settings.specialHours?.[date] || [])];
    if (currentTimes.includes(trimmedNew) && currentTimes[timeIndex] !== trimmedNew) {
      toast.error(`Klokkeslettet ${trimmedNew} finnes allerede på denne datoen.`);
      return;
    }

    currentTimes[timeIndex] = trimmedNew;
    currentTimes.sort();

    const newSettings = {
      ...settings,
      specialHours: {
        ...(settings.specialHours || {}),
        [date]: currentTimes
      }
    };

    setSettings(newSettings);
    setEditingSlot(null);
    await handleSave(newSettings);
    toast.success(`Endret klokkeslett fra ${oldTime} til ${trimmedNew}!`);
  };

  const removeSpecialTimeSlot = async (date: string, timeIndex: number) => {
    const timeToRemove = settings.specialHours?.[date]?.[timeIndex];
    const newSettings = { ...settings };
    if (newSettings.specialHours?.[date]) {
      newSettings.specialHours[date].splice(timeIndex, 1);
    }
    setSettings(newSettings);
    await handleSave(newSettings);
    toast.success(`Fjernet klokkeslett ${timeToRemove || ''}.`);
  };

  const resetSpecialHoursToDefault = async (date: string) => {
    const dayOfWeek = new Date(date + "T12:00:00").getDay().toString();
    const defaultHours = [...(settings.openingHours[dayOfWeek] || [])];
    const newSettings = { ...settings };
    newSettings.specialHours[date] = defaultHours;
    setSettings(newSettings);
    await handleSave(newSettings);
    toast.success("Tilbakestilt til ordinære åpningstider.");
  };

  const openDuplicateModal = (sourceDate: string) => {
    setDuplicateSourceDate(sourceDate);
    setDuplicateMode("specific");
    setTargetDates([]);
    const nextDay = format(addDays(new Date(sourceDate + "T12:00:00"), 1), "yyyy-MM-dd");
    setTargetDateInput(nextDay);
    setTargetRangeStart(nextDay);
    setTargetRangeEnd(format(addDays(new Date(sourceDate + "T12:00:00"), 5), "yyyy-MM-dd"));
    setDuplicateMergeStrategy("overwrite");
  };

  const handleAddTargetDate = (dateToAdd?: string) => {
    const val = (dateToAdd || targetDateInput).trim();
    if (!val) return;
    if (val === duplicateSourceDate) {
      toast.error("Kan ikke duplisere til samme dato som kilden.");
      return;
    }
    if (!targetDates.includes(val)) {
      setTargetDates(prev => [...prev, val].sort());
      setTargetDateInput("");
    } else {
      toast.error("Datoen er allerede lagt til i listen.");
    }
  };

  const handleRemoveTargetDate = (dateToRemove: string) => {
    setTargetDates(prev => prev.filter(d => d !== dateToRemove));
  };

  const handleAddNextDayPreset = () => {
    if (!duplicateSourceDate) return;
    const nextDay = format(addDays(new Date(duplicateSourceDate + "T12:00:00"), 1), "yyyy-MM-dd");
    handleAddTargetDate(nextDay);
  };

  const handleAddNextWeekSameDayPreset = () => {
    if (!duplicateSourceDate) return;
    const nextWeek = format(addDays(new Date(duplicateSourceDate + "T12:00:00"), 7), "yyyy-MM-dd");
    handleAddTargetDate(nextWeek);
  };

  const handleExecuteDuplicate = async () => {
    if (!duplicateSourceDate) return;
    const sourceTimes = settings.specialHours?.[duplicateSourceDate] || [];
    if (sourceTimes.length === 0) {
      toast.error("Kildedatoen har ingen klokkeslett å duplisere.");
      return;
    }

    let finalTargetDates: string[] = [];
    if (duplicateMode === "specific") {
      finalTargetDates = [...targetDates];
      if (targetDateInput && !finalTargetDates.includes(targetDateInput) && targetDateInput !== duplicateSourceDate) {
        finalTargetDates.push(targetDateInput);
      }
    } else {
      if (!targetRangeStart || !targetRangeEnd) {
        toast.error("Vennligst oppgi både fra- og til-dato for intervallet.");
        return;
      }
      if (targetRangeStart > targetRangeEnd) {
        toast.error("Fra-dato må være før eller lik til-dato.");
        return;
      }
      let curr = new Date(targetRangeStart + "T12:00:00");
      const end = new Date(targetRangeEnd + "T12:00:00");
      while (curr <= end) {
        const dStr = format(curr, "yyyy-MM-dd");
        if (dStr !== duplicateSourceDate && !finalTargetDates.includes(dStr)) {
          finalTargetDates.push(dStr);
        }
        curr = addDays(curr, 1);
      }
    }

    if (finalTargetDates.length === 0) {
      toast.error("Vennligst velg minst én måldato.");
      return;
    }

    const newSettings = {
      ...settings,
      specialHours: {
        ...(settings.specialHours || {})
      }
    };

    finalTargetDates.forEach(tDate => {
      if (duplicateMergeStrategy === "overwrite" || !newSettings.specialHours[tDate]) {
        newSettings.specialHours[tDate] = [...sourceTimes];
      } else {
        newSettings.specialHours[tDate] = Array.from(
          new Set([...(newSettings.specialHours[tDate] || []), ...sourceTimes])
        ).sort();
      }
    });

    setSettings(newSettings);
    setDuplicateSourceDate(null);
    await handleSave(newSettings);
    fetchBookingsForDates();
    toast.success(`Dupliserte ${sourceTimes.length} klokkeslett til ${finalTargetDates.length} dato(er)!`);
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
        <button 
          onClick={() => setActiveSettingsTab("emails")} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSettingsTab === 'emails' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          E-postmaler
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
                      {times.length > 0 && (
                        <button
                          type="button"
                          onClick={() => openDuplicateModal(date)}
                          className="text-xs bg-[#9C39FF]/15 hover:bg-[#9C39FF]/30 text-purple-200 hover:text-white border border-[#9C39FF]/30 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium shadow-sm cursor-pointer"
                          title="Dupliser disse klokkeslettene til en annen dato eller flere datoer"
                        >
                          <Copy className="w-3.5 h-3.5" /> Dupliser tider
                        </button>
                      )}

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
                                  onClick={() => setEditingSlot({ date, timeIndex: tIndex, oldTime: time, newTime: time })}
                                  className="p-1 text-zinc-500 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors"
                                  title="Endre dette klokkeslettet"
                                >
                                  <Pencil className="w-3 h-3" />
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
                                onClick={() => setEditingSlot({ date, timeIndex: tIndex, oldTime: time, newTime: time })}
                                className="p-1 text-zinc-500 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors"
                                title="Endre dette klokkeslettet"
                              >
                                <Pencil className="w-3 h-3" />
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
                          onClick={() => openAddTimeModal(date)}
                          className="flex items-center gap-1.5 text-xs bg-[#9C39FF]/15 hover:bg-[#9C39FF]/30 text-purple-200 hover:text-white px-3.5 py-1.5 rounded-xl transition-all border border-dashed border-[#9C39FF]/40 hover:border-[#9C39FF] h-[34px] font-medium shadow-sm cursor-pointer"
                          title="Åpne pop-up for å legge til nye klokkeslett"
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
      {activeSettingsTab === "emails" && (
        <EmailPreviewClient />
      )}

      {/* Modal for adding multiple time slots */}
      {addingTimeToDate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/15 border border-[#9C39FF]/30 flex items-center justify-center text-[#9C39FF]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Legg til klokkeslett</h3>
                  <p className="text-xs text-zinc-400 capitalize">
                    {format(new Date(addingTimeToDate + "T12:00:00"), "EEEE d. MMMM yyyy", { locale: nb })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddingTimeToDate(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
                title="Lukk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing slots preview */}
            {settings.specialHours?.[addingTimeToDate] && settings.specialHours[addingTimeToDate].length > 0 && (
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-xs">
                <span className="text-zinc-400 block mb-1.5 font-medium">Allerede oppsatte tider for denne datoen:</span>
                <div className="flex flex-wrap gap-1.5">
                  {settings.specialHours[addingTimeToDate].map((t: string) => (
                    <span key={t} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Fyll inn opptil 5 nye klokkeslett:</span>
                <button
                  type="button"
                  onClick={handleFill90MinIntervals}
                  className="text-xs text-[#9C39FF] hover:text-purple-300 font-medium transition-colors cursor-pointer"
                  title="Auto-fyll 90 minutters intervaller fra første felt (eller 10:30)"
                >
                  ⚡ Fyll 90 min intervaller
                </button>
              </div>

              {/* 5+ Input fields */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {newTimeSlots.map((time, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono w-14 shrink-0">Felt {idx + 1}:</span>
                    <div className="relative flex-1">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const updated = [...newTimeSlots];
                          updated[idx] = e.target.value;
                          setNewTimeSlots(updated);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9C39FF] transition-colors"
                      />
                    </div>
                    {time && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...newTimeSlots];
                          updated[idx] = "";
                          setNewTimeSlots(updated);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Tøm dette feltet"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddField}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Legg til ett felt til
                </button>
                {newTimeSlots.some((t) => t.trim().length > 0) && (
                  <button
                    type="button"
                    onClick={() => setNewTimeSlots(["", "", "", "", ""])}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Tøm alle felter
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setAddingTimeToDate(null)}
                disabled={saving}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors"
              >
                Avbryt
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveNewTimes}
                className="px-5 py-2 bg-[#9C39FF] hover:bg-[#8A2BE2] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-[#9C39FF]/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Lagrer...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Legg til klokkeslett
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing a single slot */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-zinc-800/80 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#9C39FF]/15 border border-[#9C39FF]/30 flex items-center justify-center text-[#9C39FF]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Endre klokkeslett</h3>
                  <p className="text-xs text-zinc-400 capitalize">
                    {format(new Date(editingSlot.date + "T12:00:00"), "EEEE d. MMMM yyyy", { locale: nb })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
                title="Lukk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-300 font-medium block">
                Nytt tidspunkt (erstatter <span className="font-mono text-[#9C39FF]">{editingSlot.oldTime}</span>):
              </label>
              <input
                type="time"
                value={editingSlot.newTime}
                onChange={(e) => setEditingSlot({ ...editingSlot, newTime: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-base focus:outline-none focus:border-[#9C39FF]"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                disabled={saving}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors"
              >
                Avbryt
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveEditSlot}
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
                    Lagre endring
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for duplicating times to other date(s) */}
      {duplicateSourceDate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/15 border border-[#9C39FF]/30 flex items-center justify-center text-[#9C39FF]">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Dupliser klokkeslett</h3>
                  <p className="text-xs text-zinc-400 capitalize">
                    Fra {format(new Date(duplicateSourceDate + "T12:00:00"), "EEEE d. MMMM yyyy", { locale: nb })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDuplicateSourceDate(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
                title="Lukk"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source times preview */}
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-xs">
              <span className="text-zinc-400 block mb-1.5 font-medium">
                Klokkeslett som kopieres ({settings.specialHours?.[duplicateSourceDate]?.length || 0} tider):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(settings.specialHours?.[duplicateSourceDate] || []).map((t: string) => (
                  <span key={t} className="px-2 py-0.5 bg-zinc-800 text-purple-200 border border-purple-500/20 rounded font-mono text-[11px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Mode selection: specific vs range */}
            <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setDuplicateMode("specific")}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  duplicateMode === "specific"
                    ? "bg-[#9C39FF] text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Velg spesifikke datoer
              </button>
              <button
                type="button"
                onClick={() => setDuplicateMode("range")}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  duplicateMode === "range"
                    ? "bg-[#9C39FF] text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Datointervall (fra - til)
              </button>
            </div>

            {duplicateMode === "specific" ? (
              <div className="space-y-3">
                <label className="text-xs text-zinc-300 font-medium block">
                  Velg måldato(er) som skal få disse tidene:
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={targetDateInput}
                    onChange={(e) => setTargetDateInput(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9C39FF]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTargetDate()}
                    disabled={!targetDateInput}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Legg til dato
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-zinc-500">Hurtigvalg:</span>
                  <button
                    type="button"
                    onClick={handleAddNextDayPreset}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    + Neste dag
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNextWeekSameDayPreset}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    + Samme ukedag neste uke
                  </button>
                </div>

                {/* Target dates list */}
                {targetDates.length > 0 ? (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs text-zinc-400 font-medium block">
                      Valgte måldatoer ({targetDates.length}):
                    </span>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                      {targetDates.map(d => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 text-white text-xs px-2.5 py-1 rounded-lg"
                        >
                          <span className="capitalize">{format(new Date(d + "T12:00:00"), "EEE d. MMM", { locale: nb })}</span>
                          <span className="text-zinc-500 font-mono text-[10px]">({d})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTargetDate(d)}
                            className="text-zinc-500 hover:text-red-400 p-0.5 rounded transition-colors ml-1"
                            title="Fjern dato"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">
                    Ingen måldatoer lagt til ennå. Velg en dato ovenfor og klikk «Legg til dato».
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs text-zinc-300 font-medium block">
                  Velg datointervall:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-zinc-500 block mb-1">Fra og med:</span>
                    <input
                      type="date"
                      value={targetRangeStart}
                      onChange={(e) => setTargetRangeStart(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block mb-1">Til og med:</span>
                    <input
                      type="date"
                      value={targetRangeEnd}
                      onChange={(e) => setTargetRangeEnd(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Overwrite vs merge strategy */}
            <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-2 text-xs">
              <span className="text-zinc-400 block font-medium">Håndtering av eksisterende tider på måldato:</span>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                  <input
                    type="radio"
                    name="mergeStrategy"
                    value="overwrite"
                    checked={duplicateMergeStrategy === "overwrite"}
                    onChange={() => setDuplicateMergeStrategy("overwrite")}
                    className="text-[#9C39FF] focus:ring-[#9C39FF] bg-zinc-900 border-zinc-700"
                  />
                  <span>Overskriv (erstatt tider)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                  <input
                    type="radio"
                    name="mergeStrategy"
                    value="merge"
                    checked={duplicateMergeStrategy === "merge"}
                    onChange={() => setDuplicateMergeStrategy("merge")}
                    className="text-[#9C39FF] focus:ring-[#9C39FF] bg-zinc-900 border-zinc-700"
                  />
                  <span>Slå sammen med eksisterende</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setDuplicateSourceDate(null)}
                disabled={saving}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors"
              >
                Avbryt
              </button>
              <button
                type="button"
                disabled={saving || (duplicateMode === "specific" && targetDates.length === 0 && !targetDateInput) || (duplicateMode === "range" && (!targetRangeStart || !targetRangeEnd))}
                onClick={handleExecuteDuplicate}
                className="px-5 py-2 bg-[#9C39FF] hover:bg-[#8A2BE2] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-[#9C39FF]/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Dupliserer...
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Dupliser klokkeslett
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
