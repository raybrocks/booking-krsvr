"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader2, Calendar as CalendarIcon, Users, Clock, Mail, Phone, CheckCircle2, XCircle, Clock4, Settings, Gamepad2, ListOrdered, Receipt, Trash2, Plus, Wallet, Menu, X } from "lucide-react";
import { toast } from "sonner";
import SettingsManager from "./SettingsManager";
import ExperiencesManager from "./ExperiencesManager";
import TransactionsManager from "./TransactionsManager";
import ManualBookingManager from "./ManualBookingManager";
import ShiftManager from "./ShiftManager";
import EmployeesManager from "./EmployeesManager";

const playDing = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    // Create a pleasant "ding" sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, context.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start();
    oscillator.stop(context.currentTime + 0.5);
  } catch (error) {
    console.error("Error playing audio ding:", error);
  }
};

const getBookingTimeRange = (startTime: string, durationMinutes?: number) => {
  if (!startTime || !startTime.includes(':')) return startTime || '';
  const [hoursStr, minutesStr] = startTime.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return startTime;

  const duration = durationMinutes || 90;
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  return `${startTime}–${endTime}`;
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "archive" | "experiences" | "transactions" | "settings" | "manual" | "shifts" | "employees">("upcoming");
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const isFirstLoad = useRef(true);
  const notifiedBookingIds = useRef<Set<string>>(new Set());

  // Sorting and Filtering State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'dateTime', direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [experiencesMap, setExperiencesMap] = useState<Record<string, string>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, experiencesRes] = await Promise.all([
          fetch('/api/admin/bookings'),
          fetch('/api/experiences') 
        ]);

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data);
          setLoading(false);

          let newlyConfirmed = false;
          let newlyConfirmedCount = 0;

          data.forEach((docData: any) => {
            const isConfirmed = docData.status === 'confirmed' || docData.status === 'completed';
            
            if (isConfirmed && !notifiedBookingIds.current.has(docData.id)) {
              notifiedBookingIds.current.add(docData.id);
              if (!isFirstLoad.current) {
                newlyConfirmed = true;
                newlyConfirmedCount++;
              }
            }
          });

          if (newlyConfirmed) {
            playDing();
            toast.success(`Ny bestilling bekreftet! / New booking confirmed! (${newlyConfirmedCount})`);
          }
          isFirstLoad.current = false;
        }

        if (experiencesRes.ok) {
          const exps = await experiencesRes.json();
          const expsMap: Record<string, string> = {};
          exps.forEach((e: any) => {
            expsMap[e.id] = e.title || e.name || e.id;
          });
          setExperiencesMap(expsMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
    const intervalData = setInterval(fetchData, 10000);
    const intervalTime = setInterval(() => setCurrentTime(Date.now()), 5000);

    return () => {
      clearInterval(intervalData);
      clearInterval(intervalTime);
    };
  }, []);

  const handleVippsAction = async (bookingId: string, action: 'capture' | 'cancel' | 'refund', amount?: number) => {
    const loadingToastId = toast.loading(`Prøver å ${action} via Vipps...`);
    try {
      let res;
      if (action === 'capture') {
        const amountOre = amount ? Math.round(amount * 100) : 0;
        res = await fetch("/api/vipps/capture", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: [{ bookingId, amount: amountOre }] })
        });
      } else if (action === 'cancel') {
        res = await fetch("/api/vipps/cancel", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId })
        });
      } else if (action === 'refund') {
        const amountOre = amount ? Math.round(amount * 100) : 0;
        res = await fetch("/api/vipps/refund", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, amount: amountOre })
        });
      }

      const data = await res?.json();
      if (res?.ok) {
        toast.success(data?.message || `Vipps ${action} vellykket!`, { id: loadingToastId });
        setBookings(prev => prev.map(b => {
          if (b.id === bookingId) {
            if (action === 'refund') {
              return { ...b, vippsStatus: 'REFUNDED', status: 'cancelled' };
            }
            if (action === 'capture') {
              return { ...b, vippsStatus: 'CAPTURED', amountPaid: amount || b.totalPrice };
            }
            if (action === 'cancel') {
              return { ...b, vippsStatus: 'CANCELLED', status: 'cancelled' };
            }
          }
          return b;
        }));
      } else {
        toast.error(`Feil: ${data?.error || data?.message || 'Ukjent feil'}`, { id: loadingToastId });
      }
    } catch (e: any) {
      toast.error(`Feil ved oppkobling: ${e.message}`, { id: loadingToastId });
    }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Booking marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const deleteBooking = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) {
      try {
        await fetch(`/api/admin/bookings/${id}`, {
          method: 'DELETE'
        });
        toast.success("Booking permanently deleted");
      } catch (error) {
        console.error("Error deleting booking:", error);
        toast.error("Failed to delete booking");
      }
    }
  };

  const extendBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || "Feilet ved utvidelse");
      } else {
        toast.success(`Suksess! Utvidet med 90 minutter (${data.newDuration} min totalt).`);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, duration: data.newDuration } : b));
      }
    } catch (error) {
       toast.error("Nettverksfeil oppstod.");
    }
  };

  const reduceBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}/reduce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || "Feilet ved fjerning av utvidet tid");
      } else {
        toast.success(`Suksess! Redusert med 90 minutter (${data.newDuration} min totalt).`);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, duration: data.newDuration } : b));
      }
    } catch (error) {
       toast.error("Nettverksfeil oppstod.");
    }
  };

  const handleEditNote = async (id: string, currentNote: string) => {
    const newNote = window.prompt("Rediger kommentar for booking:", currentNote || "");
    if (newNote === null) return; // Avbrutt

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: newNote.trim() })
      });
      
      if (!response.ok) {
        toast.error("Feilet ved oppdatering av kommentar");
      } else {
        toast.success("Kommentar oppdatert!");
        setBookings(prev => prev.map(b => b.id === id ? { ...b, internalNotes: newNote.trim() } : b));
      }
    } catch (error) {
       toast.error("Nettverksfeil oppstod.");
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedBookings = React.useMemo(() => {
    let result = [...bookings];

    if (activeTab === "upcoming") {
      const now = new Date(currentTime);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      result = result.filter(booking => {
        return booking.status === "confirmed" && booking.date >= todayStr && booking.bookingType !== 'system';
      });
    } else {
       result = result.filter(booking => booking.bookingType !== 'system');
    }

    // Filter by status
    if (activeTab === "archive" && statusFilter !== "all") {
      result = result.filter(booking => booking.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      result = result.filter(booking => booking.date === dateFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(booking => 
        booking.firstName?.toLowerCase().includes(lowerQuery) ||
        booking.lastName?.toLowerCase().includes(lowerQuery) ||
        booking.email?.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle specific sorting cases
      if (sortConfig.key === 'customer') {
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (sortConfig.key === 'dateTime') {
        aValue = new Date(`${a.date}T${a.time}`).getTime();
        bValue = new Date(`${b.date}T${b.time}`).getTime();
      } else if (sortConfig.key === 'createdAt') {
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [bookings, sortConfig, statusFilter, dateFilter, searchQuery, activeTab, currentTime]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  const renderBookingsTable = (tableBookings: any[], title?: string) => (
    <div className="mb-8 last:mb-0" key={title || 'table'}>
      {title && <h2 className="text-xl font-medium mb-4 text-zinc-200">{title}</h2>}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col">
        <div className="overflow-auto max-h-[70vh] rounded-2xl relative">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900 shadow-[0_1px_0_0_#27272a] text-zinc-400 sticky top-0 z-20">
              <tr>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('dateTime')}>
                  Date & Time {sortConfig.key === 'dateTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('experienceId')}>
                  Experience {sortConfig.key === 'experienceId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('customer')}>
                  Customer {sortConfig.key === 'customer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('totalPrice')}>
                  Payment {sortConfig.key === 'totalPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('createdAt')}>
                  Placed At {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {tableBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                tableBookings.map((booking) => {
                  const now = new Date(currentTime).getTime();
                  const createdAt = booking.createdAt ? new Date(booking.createdAt).getTime() : now;
                  const isExpired = booking.status === 'pending' && ((now - createdAt) > 15 * 60 * 1000);
                  
                  return (
                <tr key={booking.id} className={`transition-colors ${isExpired ? 'bg-red-950/10 opacity-70' : 'hover:bg-zinc-800/20'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <CalendarIcon className="w-4 h-4 text-zinc-500" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-zinc-200 text-xs font-semibold whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {getBookingTimeRange(booking.time, booking.duration)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                      <span className="text-[11px] text-zinc-400 font-medium pl-5">
                        {booking.duration || 90} min
                      </span>
                      {booking.status !== 'cancelled' && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => extendBooking(booking.id)} 
                            className="text-xs text-zinc-400 hover:text-white px-1.5 py-0.5 rounded transition-colors bg-zinc-800/80 border border-zinc-700/50 font-medium leading-none" 
                            title="Legg til 90 minutter (+90 min)"
                          >
                            +
                          </button>
                          {booking.duration && booking.duration > 90 && (
                            <button 
                              onClick={() => reduceBooking(booking.id)} 
                              className="text-xs text-zinc-400 hover:text-red-400 px-1.5 py-0.5 rounded transition-colors bg-zinc-800/80 border border-zinc-700/50 font-medium leading-none" 
                              title="Trekk fra 90 minutter (-90 min)"
                            >
                              -
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-300">{experiencesMap[booking.experienceId] || booking.experienceId}</div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
                      <Users className="w-3 h-3" /> {booking.players} Spillere
                    </div>
                    {booking.playerNames && booking.playerNames.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {booking.playerNames.filter((n: string) => n.trim() !== '').map((name: string, idx: number) => (
                          <span key={idx} className="bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded border border-zinc-700/50">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-200">
                      {booking.bookingType === 'corporate' && booking.companyName ? (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded mr-2">Bedrift</span>
                      ) : null}
                      {booking.companyName ? `${booking.companyName} (${booking.firstName} ${booking.lastName})` : `${booking.firstName} ${booking.lastName}`}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Mail className={`w-3 h-3 ${booking.confirmationEmailSent ? "text-emerald-400" : ""}`} /> 
                        {booking.email}
                      </span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {booking.phone}</span>
                    </div>
                    {booking.internalNotes ? (
                       <div 
                         className="mt-2 text-xs text-zinc-400 bg-zinc-800/40 p-2 rounded-lg border border-zinc-700/50 italic max-w-xs whitespace-normal cursor-pointer hover:bg-zinc-800 transition-colors"
                         onClick={() => handleEditNote(booking.id, booking.internalNotes)}
                         title="Klikk for å redigere kommentar"
                       >
                          {booking.internalNotes}
                       </div>
                    ) : (
                       <button 
                         onClick={() => handleEditNote(booking.id, "")} 
                         className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline decoration-dotted underline-offset-2"
                       >
                         + Legg til kommentar
                       </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {/* Handlingsorientert betalingsmerke */}
                      <div>
                        {(() => {
                          const totalPrice = booking.totalPrice || 0;
                          const amountPaid = booking.amountPaid || 0;
                          const remaining = Math.max(0, totalPrice - amountPaid);
                          const status = (booking.vippsStatus || '').toUpperCase();
                          const isRefunded = status === 'REFUNDED' || status.includes('REFUND');
                          const isPending = status === 'VENTER_PAA_BETALING' || (booking.paymentType === 'vipps' && amountPaid === 0 && booking.status === 'pending');
                          const isFullyPaid = (booking.paymentType === 'full' || amountPaid >= totalPrice) && totalPrice > 0;
                          const isFree = totalPrice === 0;

                          if (isRefunded) {
                            return (
                              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                🔵 Refundert (Vipps)
                              </span>
                            );
                          }
                          if (isPending) {
                            return (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                                🟠 Venter på Vipps
                              </span>
                            );
                          }
                          if (isFree) {
                            return (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded inline-flex items-center gap-1 bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                                ⚪ Gratis / 0 kr
                              </span>
                            );
                          }
                          if (isFullyPaid) {
                            return (
                              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                🟢 Fullt oppgjort (0 kr igjen)
                              </span>
                            );
                          }
                          if (amountPaid > 0 && remaining > 0) {
                            return (
                              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded inline-flex items-center gap-1 bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm">
                                🟡 Krev inn: {remaining} NOK
                              </span>
                            );
                          }
                          return (
                            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded inline-flex items-center gap-1 bg-zinc-800 text-amber-300 border border-zinc-700/60">
                              ⚪ Krev inn: {remaining} NOK (Oppmøte)
                            </span>
                          );
                        })()}
                      </div>

                      {/* Tydelig spesifikasjon av hva som er betalt og hva som gjenstår */}
                      {booking.status === 'pending' ? (
                        <div className="text-xs font-medium">
                          {(() => {
                            const now = new Date(currentTime).getTime();
                            const createdAt = booking.createdAt ? new Date(booking.createdAt).getTime() : now;
                            const isExpired = (now - createdAt) > 15 * 60 * 1000;
                            return isExpired ? (
                              <span className="text-red-400">Utløpt bestilling (ikke betalt)</span>
                            ) : (
                              <span className="text-amber-400">Venter på betaling fra kunde</span>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-xs space-y-0.5">
                          <div className="text-zinc-200 font-medium">
                            Totalt: {booking.totalPrice || 0} NOK
                          </div>
                          {booking.amountPaid > 0 ? (
                            <div className="text-zinc-400 text-[11px]">
                              Innbetalt (Vipps): <span className="text-zinc-200 font-medium">{booking.amountPaid} NOK</span>
                            </div>
                          ) : (
                            <div className="text-zinc-500 text-[11px] italic">
                              Innbetalt: 0 NOK
                            </div>
                          )}
                          {(booking.totalPrice || 0) > (booking.amountPaid || 0) ? (
                            <div className="text-amber-400 font-semibold text-[11px]">
                              Gjenstår i kasse: {(booking.totalPrice || 0) - (booking.amountPaid || 0)} NOK
                            </div>
                          ) : (
                            (booking.totalPrice || 0) > 0 ? (
                              <div className="text-emerald-400 font-medium text-[11px]">
                                Alt er betalt på forhånd
                              </div>
                            ) : null
                          )}
                        </div>
                      )}

                      {/* Handlingsknapper for Vipps (Capture, Frigi, Refunder) */}
                      {((booking.vippsStatus?.toUpperCase().includes("RESERVED") || booking.vippsStatus === "AUTHORIZED") || (['vipps', 'reservation', 'full'].includes(booking.paymentType) && booking.amountPaid > 0 && booking.vippsStatus !== 'REFUNDED')) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(booking.vippsStatus?.toUpperCase().includes("RESERVED") || booking.vippsStatus === "AUTHORIZED") && (
                            <>
                              <button onClick={() => handleVippsAction(booking.id, 'capture', booking.totalPrice)} className="text-[11px] bg-[#9C39FF] hover:bg-[#8A2BE2] text-white px-2 py-0.5 rounded transition-colors whitespace-nowrap">
                                Complete (Capture)
                              </button>
                              <button onClick={() => handleVippsAction(booking.id, 'cancel')} className="text-[11px] bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2 py-0.5 rounded transition-colors whitespace-nowrap">
                                Frigi (Avbryt)
                              </button>
                            </>
                          )}
                          
                          {['vipps', 'reservation', 'full'].includes(booking.paymentType) && booking.amountPaid > 0 && booking.vippsStatus !== 'REFUNDED' && (
                            <button onClick={() => {
                              const defaultAmt = booking.amountPaid || booking.totalPrice || 0;
                              const amt = prompt(`Hvor mye ønsker du å refundere til ${booking.firstName} ${booking.lastName} via Vipps? (i NOK)\n\nKunden vil automatisk motta en refusjonskvittering på e-post.`, String(defaultAmt));
                              if (amt && !isNaN(Number(amt.replace(',', '.'))) && Number(amt.replace(',', '.')) > 0) {
                                handleVippsAction(booking.id, 'refund', Number(amt.replace(',', '.')));
                              }
                            }} className="text-[11px] bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded transition-colors whitespace-nowrap font-medium" title="Refunder via Vipps og send refusjonskvittering på e-post">
                              Refunder (Vipps)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400">
                    {booking.createdAt ? (
                      <div>
                        <div>{new Intl.DateTimeFormat("no-NO", { dateStyle: "short" }).format(new Date(booking.createdAt))}</div>
                        <div className="mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{new Intl.DateTimeFormat("no-NO", { timeStyle: "short" }).format(new Date(booking.createdAt))}</div>
                      </div>
                    ) : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border focus:outline-none appearance-none cursor-pointer ${
                          booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        <option value="pending" className="bg-zinc-900 text-amber-400">Pending</option>
                        <option value="confirmed" className="bg-zinc-900 text-emerald-400">Confirmed</option>
                        <option value="cancelled" className="bg-zinc-900 text-red-400">Cancelled</option>
                      </select>
                      
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            // TODO: Add email alert integration here later
                            updateBookingStatus(booking.id, 'cancelled');
                          }}
                          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1.5 rounded-lg transition-colors"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteBooking(booking.id)}
                        className="text-xs text-zinc-500 hover:text-red-400 hover:bg-red-400/10 px-2 py-1.5 rounded-lg transition-colors ml-1"
                        title="Permanently Delete Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 pt-0 md:pt-4 pb-20">
      {/* Sticky header */}
      <div className="mb-8 sticky top-0 md:top-4 z-[60] bg-zinc-950/90 backdrop-blur-xl -mx-6 px-6 md:mx-0 md:px-0 border-b md:border border-zinc-800/80 md:rounded-xl shadow-2xl">
        {/* Top row: branding + hamburger (mobile) / branding + nav (desktop) */}
        <div className="flex items-center justify-between py-3 md:py-0 md:flex-row md:items-end md:gap-4 md:px-4 md:pt-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.15em] text-zinc-900 uppercase bg-white px-2 py-0.5 rounded-[12px] w-fit mb-1.5">KRS VR Arena</p>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">Admin Dashboard</h1>
          </div>

          {/* Hamburger button – mobile only */}
          <button
            className="md:hidden p-2 -mr-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label={mobileMenuOpen ? 'Lukk meny' : 'Åpne meny'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop nav – always visible */}
          <div className="hidden md:flex flex-wrap bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 shadow-lg shadow-black/50 lg:w-fit gap-1">
            <button onClick={() => { setActiveTab("upcoming"); setSortConfig({ key: 'dateTime', direction: 'asc' }); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'upcoming' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Clock4 className="w-4 h-4" /> Upcoming</button>
            <button onClick={() => setActiveTab("manual")} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'manual' ? 'bg-[#9C39FF]/20 text-[#9C39FF]' : 'text-zinc-400 hover:text-zinc-200'}`}><Plus className="w-4 h-4" /> Booking</button>
            <button onClick={() => { setActiveTab("archive"); setSortConfig({ key: 'dateTime', direction: 'desc' }); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'archive' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><ListOrdered className="w-4 h-4" /> Arkiv</button>
            <button onClick={() => setActiveTab("experiences")} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'experiences' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Gamepad2 className="w-4 h-4" /> Spill</button>
            <button onClick={() => setActiveTab("transactions")} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Wallet className="w-4 h-4" /> Regnskap</button>
            <button onClick={() => setActiveTab("shifts")} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shifts' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><CalendarIcon className="w-4 h-4" /> Vakter</button>
            <button onClick={() => setActiveTab("employees")} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'employees' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Users className="w-4 h-4" /> Ansatte</button>
            <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Settings className="w-4 h-4" /> Innstillinger</button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-3 pt-1">
            <div className="grid grid-cols-2 gap-1 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800">
              <button onClick={() => { setActiveTab("upcoming"); setSortConfig({ key: 'dateTime', direction: 'asc' }); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'upcoming' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Clock4 className="w-4 h-4" /> Upcoming</button>
              <button onClick={() => { setActiveTab("manual"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'manual' ? 'bg-[#9C39FF]/20 text-[#9C39FF]' : 'text-zinc-400 hover:text-zinc-200'}`}><Plus className="w-4 h-4" /> Booking</button>
              <button onClick={() => { setActiveTab("archive"); setSortConfig({ key: 'dateTime', direction: 'desc' }); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'archive' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><ListOrdered className="w-4 h-4" /> Arkiv</button>
              <button onClick={() => { setActiveTab("experiences"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'experiences' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Gamepad2 className="w-4 h-4" /> Spill</button>
              <button onClick={() => { setActiveTab("transactions"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Wallet className="w-4 h-4" /> Regnskap</button>
              <button onClick={() => { setActiveTab("shifts"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shifts' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><CalendarIcon className="w-4 h-4" /> Vakter</button>
              <button onClick={() => { setActiveTab("employees"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'employees' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Users className="w-4 h-4" /> Ansatte</button>
              <button onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Settings className="w-4 h-4" /> Innstillinger</button>
            </div>
          </div>
        )}
      </div>

      {/* Section heading */}
      {{
        upcoming: <h2 className="text-xl font-semibold text-white mb-6">Kommende bookinger</h2>,
        archive: <h2 className="text-xl font-semibold text-white mb-6">Arkiv</h2>,
        manual: <h2 className="text-xl font-semibold text-white mb-6">Manuell booking</h2>,
        experiences: <h2 className="text-xl font-semibold text-white mb-6">Spill & Opplevelser</h2>,
        transactions: <h2 className="text-xl font-semibold text-white mb-6">Regnskap</h2>,
        shifts: <h2 className="text-xl font-semibold text-white mb-6">Vakter & Timeføring</h2>,
        employees: <h2 className="text-xl font-semibold text-white mb-6">Ansatte</h2>,
        settings: <h2 className="text-xl font-semibold text-white mb-6">Innstillinger</h2>,
      }[activeTab]}

      {(activeTab === "upcoming" || activeTab === "archive") && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <div className="flex gap-4">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
              />
              {activeTab === "archive" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF] appearance-none min-w-[120px]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
              {(searchQuery || dateFilter || (activeTab === "archive" && statusFilter !== 'all')) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDateFilter("");
                    setStatusFilter("all");
                  }}
                  className="text-xs text-zinc-400 hover:text-white px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {(() => {
            if (activeTab === "archive") {
              return renderBookingsTable(filteredAndSortedBookings);
            }

            // For upcoming tab, split into Today, Tomorrow, Upcoming
            const now = new Date(currentTime);
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            
            const tomorrow = new Date(currentTime);
            tomorrow.setDate(now.getDate() + 1);
            const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

            const todayBookings = filteredAndSortedBookings.filter(b => b.date === todayStr);
            const tomorrowBookings = filteredAndSortedBookings.filter(b => b.date === tomorrowStr);
            const upcomingBookings = filteredAndSortedBookings.filter(b => b.date > tomorrowStr);

            return (
              <div className="space-y-8">
                {renderBookingsTable(todayBookings, "Today")}
                {renderBookingsTable(tomorrowBookings, "Tomorrow")}
                {renderBookingsTable(upcomingBookings, "Upcoming")}
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "experiences" && <ExperiencesManager />}
      {activeTab === "transactions" && <TransactionsManager />}
      {activeTab === "settings" && <SettingsManager />}
      {activeTab === "manual" && <ManualBookingManager />}
      {activeTab === "shifts" && <ShiftManager />}
      {activeTab === "employees" && <EmployeesManager />}
    </div>
  );
}
