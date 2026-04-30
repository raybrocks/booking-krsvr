"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Plus, Trash2, Save, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

export default function SettingsManager() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newOverrideDate, setNewOverrideDate] = useState("");
  
  // Vacation Mode States
  const [vacationStart, setVacationStart] = useState("");
  const [vacationEnd, setVacationEnd] = useState("");
  const [vacationWarning, setVacationWarning] = useState<any[] | null>(null);
  const [applyingVacation, setApplyingVacation] = useState(false);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", "general");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          ...data,
          specialHours: data.specialHours || {}
        });
      } else {
        // Default settings if none exist
        setSettings({
          openingHours: {
            "0": [],
            "1": ["16:00", "17:30", "19:00", "20:30"],
            "2": ["16:00", "17:30", "19:00", "20:30"],
            "3": ["16:00", "17:30", "19:00", "20:30"],
            "4": ["16:00", "17:30", "19:00", "20:30"],
            "5": ["14:00", "15:30", "17:00", "18:30", "20:00", "21:30"],
            "6": ["12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"]
          },
          specialHours: {},
          reservationFee: 500
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "general"), settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
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
    newSettings.openingHours[dayIndex].sort();
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
    newSettings.specialHours[date].sort();
    setSettings(newSettings);
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
        const q = query(
          collection(db, "bookings"), 
          where("date", ">=", vacationStart),
          where("date", "<=", vacationEnd)
        );
        const snapshot = await getDocs(q);
        
        const conflictingBookings = snapshot.docs
          .map(d => ({id: d.id, ...d.data()}))
          .filter((b: any) => b.status !== "cancelled");

        if (conflictingBookings.length > 0) {
          setVacationWarning(conflictingBookings);
          setApplyingVacation(false);
          return;
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light">Opening Hours & Settings</h2>
          <p className="text-zinc-400 text-sm">Manage available time slots for each day of the week.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#9C39FF] text-white px-4 py-2 rounded-xl hover:bg-[#8b32e6] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Reservation Fee (NOK)</label>
            <input 
              type="number" 
              value={settings.reservationFee}
              onChange={(e) => setSettings({...settings, reservationFee: Number(e.target.value)})}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white w-full focus:outline-none focus:border-[#9C39FF]"
            />
          </div>
        </div>

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
                onChange={(e) => setSettings({...settings, bookingsClosed: e.target.checked})}
              />
              <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
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

        <h3 className="text-lg font-medium mb-4 border-b border-zinc-800 pb-2">Weekly Schedule</h3>
        <div className="space-y-6">
          {daysOfWeek.map((day, index) => {
            const dayIndex = index.toString();
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
        
        <div className="flex gap-3 mb-6">
          <input 
            type="date" 
            value={newOverrideDate}
            onChange={(e) => setNewOverrideDate(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
          />
          <button 
            onClick={addOverrideDate}
            disabled={!newOverrideDate}
            className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Date Exception
          </button>
        </div>

        <div className="mb-8 p-5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
          <h4 className="text-md font-medium text-zinc-200 mb-2 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#9C39FF]" /> Vacation Mode (Bulk Close)
          </h4>
          <p className="text-sm text-zinc-400 mb-4">Close all booking slots between two dates.</p>
          
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">From</label>
              <input 
                type="date" 
                value={vacationStart}
                onChange={(e) => setVacationStart(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">To</label>
              <input 
                type="date" 
                value={vacationEnd}
                onChange={(e) => setVacationEnd(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <button 
              onClick={() => handleApplyVacation(false)}
              disabled={!vacationStart || !vacationEnd || applyingVacation}
              className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50 h-[42px]"
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
          <div className="text-sm text-zinc-500 italic">No special dates configured.</div>
        ) : (
          <div className="space-y-6">
            {specialDates.map((date) => {
              const times = settings.specialHours[date] || [];
              const formattedDate = format(new Date(date), "EEEE, MMM d, yyyy");
              
              return (
                <div key={date} className="flex flex-col md:flex-row md:items-start gap-4 p-4 bg-zinc-950/50 rounded-xl border border-[#9C39FF]/20">
                  <div className="w-48 font-medium text-zinc-200 pt-2 flex flex-col">
                    <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-[#9C39FF]" /> {date}</span>
                    <span className="text-xs text-zinc-500 mt-1">{formattedDate}</span>
                    <button 
                      onClick={() => removeOverrideDate(date)}
                      className="text-xs text-red-400 hover:text-red-300 mt-2 text-left w-fit"
                    >
                      Remove Exception
                    </button>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-3">
                    {times.length === 0 ? (
                      <div className="flex items-center h-10 px-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
                        Closed (No time slots)
                      </div>
                    ) : (
                      times.map((time: string, tIndex: number) => (
                        <div key={tIndex} className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg p-1">
                          <input 
                            type="time" 
                            value={time}
                            onChange={(e) => updateSpecialTimeSlot(date, tIndex, e.target.value)}
                            className="bg-transparent text-sm text-white px-2 py-1 focus:outline-none"
                          />
                          <button 
                            onClick={() => removeSpecialTimeSlot(date, tIndex)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                    <button 
                      onClick={() => addSpecialTimeSlot(date)}
                      className="flex items-center gap-1 text-sm bg-[#9C39FF]/10 hover:bg-[#9C39FF]/20 text-[#9C39FF] px-3 py-2 rounded-lg transition-colors border border-dashed border-[#9C39FF]/30"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Time
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
