"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Calendar as CalendarIcon, Clock, Plus, Trash2 } from "lucide-react";

export default function ShiftManager() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  async function fetchData() {
    setLoading(true);
    try {
      const [meRes, shiftsRes] = await Promise.all([
        fetch('/api/admin/me'),
        fetch('/api/admin/shifts')
      ]);

      if (meRes.ok) {
        const data = await meRes.json();
        setCurrentUser(data.user);
      }
      
      if (shiftsRes.ok) {
        const data = await shiftsRes.json();
        setShifts(data);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.id,
          date,
          startTime,
          endTime
        })
      });
      if (res.ok) {
        setDate("");
        setStartTime("");
        setEndTime("");
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register shift");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving shift");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne tilgjengeligheten?")) return;
    try {
      const res = await fetch(`/api/admin/shifts/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Registrer Tilgjengelighet</h2>
        <form onSubmit={handleRegister} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm text-zinc-400">Dato</label>
            <div className="relative">
              <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
          </div>
          <div className="w-full md:w-32 space-y-2">
            <label className="text-sm text-zinc-400">Fra (tt:mm)</label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
          </div>
          <div className="w-full md:w-32 space-y-2">
            <label className="text-sm text-zinc-400">Til (tt:mm)</label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-2.5 bg-[#9C39FF] text-white text-sm font-medium rounded-lg hover:bg-[#8A2BE2] transition-colors disabled:opacity-50"
          >
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
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  Ingen tilgjengelighet registrert.
                </td>
              </tr>
            ) : (
              shifts.map((shift) => {
                const isMine = currentUser?.id === shift.employeeId;
                return (
                  <tr key={shift.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 text-zinc-300">
                      {new Date(shift.date).toLocaleDateString('no-NO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-zinc-200 font-medium">
                      {shift.startTime} - {shift.endTime}
                    </td>
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
                      {isMine && (
                        <button
                          onClick={() => handleDelete(shift.id)}
                          className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                          title="Slett tilgjengelighet"
                        >
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
    </div>
  );
}
