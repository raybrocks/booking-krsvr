"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Calendar as CalendarIcon, Clock, Plus, Trash2, FileText, ChevronLeft, ChevronRight } from "lucide-react";

export default function ShiftManager() {
  const [view, setView] = useState<'availability' | 'timetracking'>('availability');
  
  const [shifts, setShifts] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form state for Availability
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  // Form state for Time Tracking
  const [timeNote, setTimeNote] = useState("");
  
  // Summary offsets
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  async function fetchData() {
    setLoading(true);
    try {
      const [meRes, shiftsRes, timeRes] = await Promise.all([
        fetch('/api/admin/me'),
        fetch('/api/admin/shifts'),
        fetch('/api/admin/time-entries')
      ]);

      if (meRes.ok) {
        const data = await meRes.json();
        setCurrentUser(data.user);
      }
      
      if (shiftsRes.ok) {
        const data = await shiftsRes.json();
        setShifts(data);
      }
      
      if (timeRes.ok) {
        const data = await timeRes.json();
        setTimeEntries(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, []);

  // --- Availability Logic ---
  const handleRegisterAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: currentUser.id, date, startTime, endTime })
      });
      if (res.ok) {
        setDate(""); setStartTime(""); setEndTime("");
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register shift");
      }
    } catch (e) {
      alert("Error saving shift");
    }
    setSubmitting(false);
  };

  const handleDeleteAvailability = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne tilgjengeligheten?")) return;
    try {
      const res = await fetch(`/api/admin/shifts/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- Time Tracking Logic ---
  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, startTime, endTime, note: timeNote })
      });
      if (res.ok) {
        setDate(""); setStartTime(""); setEndTime(""); setTimeNote("");
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to log time");
      }
    } catch (e) {
      alert("Error logging time");
    }
    setSubmitting(false);
  };

  const handleDeleteTimeEntry = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne timeføringen?")) return;
    try {
      const res = await fetch(`/api/admin/time-entries/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- Summary Calculations ---
  // Helper to get ISO week string
  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  };

  const now = new Date();

  const getDisplayWeek = (date: Date, offset: number) => {
    const targetDate = new Date(date);
    targetDate.setDate(targetDate.getDate() + (offset * 7));
    const year = targetDate.getFullYear();
    // Special case for ISO weeks where Jan 1 might belong to previous year's week
    const dayNum = targetDate.getUTCDay() || 7;
    targetDate.setUTCDate(targetDate.getUTCDate() + 4 - dayNum);
    const isoYear = targetDate.getUTCFullYear();
    return { week: getWeekNumber(new Date(targetDate)), year: isoYear };
  };

  const getDisplayMonth = (date: Date, offset: number) => {
    const targetDate = new Date(date.getFullYear(), date.getMonth() + offset, 1);
    return {
      month: targetDate.getMonth(),
      year: targetDate.getFullYear(),
      monthName: targetDate.toLocaleString('no-NO', { month: 'long' })
    };
  };

  const displayWeekData = getDisplayWeek(now, weekOffset);
  const displayMonthData = getDisplayMonth(now, monthOffset);

  let weekHours = 0;
  let weekEvening = 0;
  let monthHours = 0;
  let monthEvening = 0;

  timeEntries.forEach(entry => {
    const isMine = currentUser?.id === entry.employeeId;
    const isManager = currentUser?.email === 'post@krsvr.no';
    
    if (isMine || isManager) {
      const d = new Date(entry.date);
      const w = getWeekNumber(d);
      
      const dDayNum = d.getUTCDay() || 7;
      const dTarget = new Date(d);
      dTarget.setUTCDate(dTarget.getUTCDate() + 4 - dDayNum);
      const isoYear = dTarget.getUTCFullYear();
      
      if (isoYear === displayWeekData.year && w === displayWeekData.week) {
        weekHours += entry.hours;
        weekEvening += entry.eveningHours;
      }
      
      if (d.getFullYear() === displayMonthData.year && d.getMonth() === displayMonthData.month) {
        monthHours += entry.hours;
        monthEvening += entry.eveningHours;
      }
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* View Toggle */}
      <div className="flex bg-zinc-900 rounded-lg p-1 w-fit border border-zinc-800">
        <button 
          onClick={() => setView('availability')} 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'availability' ? 'bg-[#9C39FF] text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
        >
          Tilgjengelighet
        </button>
        <button 
          onClick={() => setView('timetracking')} 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'timetracking' ? 'bg-[#9C39FF] text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
        >
          Timeføring
        </button>
      </div>

      {view === 'availability' && (
        <>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Registrer Tilgjengelighet</h2>
            <form onSubmit={handleRegisterAvailability} className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm text-zinc-400">Dato</label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]" />
                </div>
              </div>
              <div className="w-full md:w-32 space-y-2">
                <label className="text-sm text-zinc-400">Fra (tt:mm)</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]" />
                </div>
              </div>
              <div className="w-full md:w-32 space-y-2">
                <label className="text-sm text-zinc-400">Til (tt:mm)</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full md:w-auto px-6 py-2.5 bg-[#9C39FF] text-white text-sm font-medium rounded-lg hover:bg-[#8A2BE2] transition-colors disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span className="flex items-center gap-2"><Plus className="w-4 h-4"/> Legg til</span>}
              </button>
            </form>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-900 shadow-[0_1px_0_0_#27272a] text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Dato</th>
                  <th className="px-6 py-4 font-medium">Tidsrom</th>
                  <th className="px-6 py-4 font-medium">Ansatt</th>
                  <th className="px-6 py-4 font-medium text-right">Handling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">Ingen tilgjengelighet registrert.</td>
                  </tr>
                ) : (
                  shifts.map((shift) => {
                    const isMine = currentUser?.id === shift.employeeId;
                    return (
                      <tr key={shift.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 text-zinc-300">
                          {new Date(shift.date).toLocaleDateString('no-NO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-zinc-200 font-medium">{shift.startTime} - {shift.endTime}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                              {shift.employee?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className={isMine ? "text-[#9C39FF] font-medium" : "text-zinc-300"}>
                              {shift.employee?.name} {isMine && "(Deg)"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {(isMine || currentUser?.email === 'post@krsvr.no') && (
                            <button onClick={() => handleDeleteAvailability(shift.id)} className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors" title="Slett">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'timetracking' && (
        <>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Timeføring</h2>
            <form onSubmit={handleLogTime} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 md:items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm text-zinc-400">Dato</label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]" />
                  </div>
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <label className="text-sm text-zinc-400">Fra (tt:mm)</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]" />
                  </div>
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <label className="text-sm text-zinc-400">Til (tt:mm)</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm text-zinc-400">Kommentar (valgfri)</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input type="text" placeholder="F.eks. Låsevakt, ryddet opp etter event..." value={timeNote} onChange={(e) => setTimeNote(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full md:w-auto px-6 py-2.5 bg-[#9C39FF] text-white text-sm font-medium rounded-lg hover:bg-[#8A2BE2] transition-colors disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span className="flex items-center gap-2"><Plus className="w-4 h-4"/> Lagre Timer</span>}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-900 shadow-[0_1px_0_0_#27272a] text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Dato</th>
                  <th className="px-6 py-4 font-medium">Tidsrom</th>
                  <th className="px-6 py-4 font-medium">Timer (Kveld)</th>
                  <th className="px-6 py-4 font-medium">Ansatt</th>
                  <th className="px-6 py-4 font-medium">Kommentar</th>
                  <th className="px-6 py-4 font-medium text-right">Handling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {timeEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">Ingen timer registrert.</td>
                  </tr>
                ) : (
                  timeEntries.map((entry) => {
                    const isMine = currentUser?.id === entry.employeeId;
                    return (
                      <tr key={entry.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 text-zinc-300">
                          {new Date(entry.date).toLocaleDateString('no-NO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-zinc-200 font-medium">{entry.startTime} - {entry.endTime}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-white">{entry.hours}t</span>
                          {entry.eveningHours > 0 && (
                            <span className="ml-2 text-xs text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                              +{entry.eveningHours}t kveld
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={isMine ? "text-[#9C39FF] font-medium" : "text-zinc-300"}>
                            {entry.employee?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400 max-w-[200px] truncate" title={entry.note}>
                          {entry.note || "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {(isMine || currentUser?.email === 'post@krsvr.no') && (
                            <button onClick={() => handleDeleteTimeEntry(entry.id)} className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors" title="Slett">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-zinc-400 text-sm font-medium">Timer Uke {displayWeekData.week} {displayWeekData.year !== (new Date()).getFullYear() ? displayWeekData.year : ''}</h3>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setWeekOffset(prev => prev - 1)} className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800"><ChevronLeft className="w-4 h-4"/></button>
                  <button type="button" onClick={() => setWeekOffset(0)} className="text-xs font-medium text-zinc-500 hover:text-white px-2">I dag</button>
                  <button type="button" onClick={() => setWeekOffset(prev => prev + 1)} className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800"><ChevronRight className="w-4 h-4"/></button>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-white">{weekHours.toFixed(1)}t</span>
                {weekEvening > 0 && (
                  <span className="text-sm font-medium text-amber-400 mb-1.5">
                    Hvorav {weekEvening.toFixed(1)}t kveldstillegg
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-zinc-400 text-sm font-medium capitalize">Timer {displayMonthData.monthName} {displayMonthData.year}</h3>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setMonthOffset(prev => prev - 1)} className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800"><ChevronLeft className="w-4 h-4"/></button>
                  <button type="button" onClick={() => setMonthOffset(0)} className="text-xs font-medium text-zinc-500 hover:text-white px-2">I dag</button>
                  <button type="button" onClick={() => setMonthOffset(prev => prev + 1)} className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800"><ChevronRight className="w-4 h-4"/></button>
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-[#9C39FF]">{monthHours.toFixed(1)}t</span>
                {monthEvening > 0 && (
                  <span className="text-sm font-medium text-amber-400 mb-1.5">
                    Hvorav {monthEvening.toFixed(1)}t kveldstillegg
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
