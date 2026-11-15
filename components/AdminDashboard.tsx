"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Loader2, Calendar as CalendarIcon, Users, Clock, Mail, Phone, CheckCircle2, XCircle, Clock4, Settings, Gamepad2, ListOrdered, Receipt, Trash2, Plus, Wallet, Menu, X, LogOut, MailQuestion, Pencil, Star, Building2, Copy, Check, Bell, Gift } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import SettingsManager from "./SettingsManager";
import ExperiencesManager from "./ExperiencesManager";
import TransactionsManager from "./TransactionsManager";
import ManualBookingManager, { ManualBookingInitialData } from "./ManualBookingManager";
import ShiftManager from "./ShiftManager";
import EmployeesManager from "./EmployeesManager";
import InquiriesManager, { ContactInquiryItem } from "./InquiriesManager";
import ClientsManager from "./ClientsManager";
import EditBookingModal from "./EditBookingModal";
import ReviewRequestModal from "./ReviewRequestModal";
import AdminGiftCardsTab from "./AdminGiftCardsTab";
import RedeemBookingGiftCardModal from "./RedeemBookingGiftCardModal";
import { getBookingPaymentBreakdown } from "@/lib/booking-utils";

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

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0].slice(-2);
      const month = parts[1];
      const day = parts[2];
      return `${day}.${month}.${year}`;
    }
  }
  return dateStr;
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "archive" | "inquiries" | "experiences" | "clients" | "transactions" | "giftcards" | "settings" | "manual" | "shifts" | "employees">("upcoming");
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const isFirstLoad = useRef(true);
  const notifiedBookingIds = useRef<Set<string>>(new Set());

  // Manual booking pre-fill state & Inquiries count
  const [manualBookingInitialData, setManualBookingInitialData] = useState<ManualBookingInitialData | null>(null);
  const [newInquiriesCount, setNewInquiriesCount] = useState<number>(0);

  // Sorting and Filtering State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'dateTime', direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [experiencesMap, setExperiencesMap] = useState<Record<string, string>>({});
  const [experiencesList, setExperiencesList] = useState<any[]>([]);
  const [pricingTiers, setPricingTiers] = useState<Record<string, number> | undefined>(undefined);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(null);
  const [redeemGiftCardBooking, setRedeemGiftCardBooking] = useState<any | null>(null);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);
  const [copiedBookingId, setCopiedBookingId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  const handleCopyPlayerNames = async (bookingId: string, names: string[]) => {
    const validNames = (names || []).map((n) => (n || "").trim()).filter((n) => n.length > 0);
    if (validNames.length === 0) {
      toast.error("Ingen navn å kopiere");
      return;
    }

    const jsonOutput = JSON.stringify(
      validNames.map((name) => ({ displayName: name })),
      null,
      2
    );

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(jsonOutput);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = jsonOutput;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedBookingId(bookingId);
      toast.success(`Kopierte ${validNames.length} navn i JSON-format!`);
      setTimeout(() => {
        setCopiedBookingId((prev) => (prev === bookingId ? null : prev));
      }, 2000);
    } catch (err) {
      console.error("Feil ved kopiering:", err);
      toast.error("Kunne ikke kopiere til utklippstavle");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const fetchInquiriesCount = async () => {
    try {
      const res = await fetch('/api/admin/inquiries?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        const today = new Date().toISOString().split("T")[0];
        const openCount = data.filter((item: any) => {
          const isClosed = item.status === 'booked' || !!item.bookingId || item.status === 'rejected' || (item.date && item.date < today);
          return !isClosed;
        }).length;
        setNewInquiriesCount(openCount);
      }
    } catch (e) {
      console.error("Failed to fetch inquiries count:", e);
    }
  };

  const handleCreateBookingFromInquiry = (inquiry: ContactInquiryItem) => {
    const nameParts = (inquiry.name || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    let playersCount = 1;
    if (inquiry.peopleCount) {
      const match = inquiry.peopleCount.match(/\d+/);
      if (match) playersCount = parseInt(match[0], 10) || 1;
    }

    // Match inquiry.eventType or packageType to arrangement
    let matchedExpId = "arrangement";
    const eventLower = ((inquiry.eventType || "") + " " + (inquiry.packageType || "") + " " + (inquiry.message || "")).toLowerCase();
    if (eventLower.includes("teambuilding")) matchedExpId = "teambuilding";
    else if (eventLower.includes("bursdag")) matchedExpId = "bursdag";
    else if (eventLower.includes("utdrikningslag")) matchedExpId = "utdrikningslag";
    else if (eventLower.includes("julebord")) matchedExpId = "julebord";
    else if (eventLower.includes("on-site") || eventLower.includes("onsite")) matchedExpId = "vr-on-site";
    else if (eventLower.includes("arrangement") || eventLower.includes("firma")) matchedExpId = "arrangement";

    let duration = 90;
    if (inquiry.packageType?.includes("2,5") || inquiry.packageType?.includes("150")) duration = 150;
    else if (inquiry.packageType?.includes("2 timer") || inquiry.packageType?.includes("120")) duration = 120;
    else if (inquiry.packageType?.includes("3 timer") || inquiry.packageType?.includes("180")) duration = 180;

    const notesParts = [];
    if (inquiry.eventType) notesParts.push(`Type arrangement: ${inquiry.eventType}`);
    if (inquiry.packageType) notesParts.push(`Pakke: ${inquiry.packageType}`);
    if (inquiry.food) notesParts.push(`Matønsker: ${inquiry.food}`);
    if (inquiry.message) notesParts.push(`Kundens melding: ${inquiry.message}`);
    const internalNotes = notesParts.join("\n\n");

    setManualBookingInitialData({
      firstName,
      lastName,
      email: inquiry.email,
      phone: inquiry.phone || "",
      companyName: inquiry.companyName || "",
      bookingType: (inquiry.groupType === "bedrift" || inquiry.companyName) ? "corporate" : "private",
      experienceId: matchedExpId,
      date: inquiry.date || "",
      time: inquiry.time || "",
      duration,
      players: playersCount,
      internalNotes,
      inquiryId: inquiry.id,
    });
    setActiveTab("manual");
    setMobileMenuOpen(false);
    toast.info(`Forhåndsutfylte data fra ${inquiry.name}`);
  };

  useEffect(() => {
    // Pre-register service worker for Web Push if supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }

    // Check URL parameters for tab (e.g. ?tab=inquiries from push notification)
    const syncTabFromUrl = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const validTabs = ['upcoming', 'archive', 'inquiries', 'experiences', 'clients', 'transactions', 'giftcards', 'settings', 'manual', 'shifts', 'employees'];
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
      const searchParam = params.get('search');
      if (searchParam) {
        setSearchQuery(searchParam);
      }
    };
    syncTabFromUrl();
    window.addEventListener('popstate', syncTabFromUrl);

    const fetchData = async () => {
      try {
        const [bookingsRes, experiencesRes, settingsRes] = await Promise.all([
          fetch('/api/admin/bookings'),
          fetch('/api/experiences'),
          fetch('/api/settings')
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
          setExperiencesList(exps);
          const expsMap: Record<string, string> = {};
          exps.forEach((e: any) => {
            expsMap[e.id] = e.title || e.name || e.id;
          });
          setExperiencesMap(expsMap);
        }

        if (settingsRes.ok) {
          const sett = await settingsRes.json();
          if (sett?.pricing?.pricing) {
            setPricingTiers(sett.pricing.pricing);
          } else if (sett?.pricing && typeof sett.pricing === 'object') {
            setPricingTiers(sett.pricing);
          } else if (sett?.general?.pricing) {
            setPricingTiers(sett.general.pricing);
          }
        }

        fetchInquiriesCount();
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
    const intervalData = setInterval(fetchData, 10000);
    const intervalTime = setInterval(() => setCurrentTime(Date.now()), 5000);

    return () => {
      window.removeEventListener('popstate', syncTabFromUrl);
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
              return { ...b, vippsStatus: 'CAPTURED', status: 'confirmed', amountPaid: amount || b.totalPrice };
            }
            if (action === 'cancel') {
              return { ...b, vippsStatus: 'CANCELLED', status: 'cancelled', amountPaid: 0 };
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

  const handleMarkTerminalPaid = async (bookingId: string) => {
    if (!confirm("Bekreft at kunden har betalt i kortterminalen i arenaen.")) return;
    const loadingToastId = toast.loading("Registrerer betaling...");
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/mark-paid`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kunne ikke markere som betalt');
      toast.success(data.message || 'Booking markert som fullt betalt i arenaen!', { id: loadingToastId });
      setBookings(prev => prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            amountPaid: data.booking?.amountPaid ?? b.totalPrice,
            status: data.booking?.status || 'confirmed',
            paymentType: data.booking?.paymentType || 'terminal',
            vippsStatus: 'TERMINAL_BETALT',
          };
        }
        return b;
      }));
    } catch (err: any) {
      toast.error(err.message || 'Feil ved registrering av betaling', { id: loadingToastId });
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

  const handleResendConfirmation = async (booking: any) => {
    if (!booking.email || booking.email.includes('system@sperret')) {
      toast.error("Ingen gyldig e-post registrert på denne bookingen");
      return;
    }
    const confirmSend = window.confirm(`Ønsker du å sende bestillingsbekreftelse på nytt til ${booking.email}?`);
    if (!confirmSend) return;

    setResendingEmailId(booking.id);
    const loadingToastId = toast.loading(`Sender bekreftelse til ${booking.email}...`);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/send-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUpdate: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke sende bekreftelse");
      }
      toast.success(data.message || `Bekreftelse sendt til ${booking.email}!`, { id: loadingToastId });
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke sende e-post", { id: loadingToastId });
    } finally {
      setResendingEmailId(null);
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
    if (searchQuery.trim()) {
      const queryWords = searchQuery.toLowerCase().trim().split(/\s+/);
      result = result.filter(booking => {
        const experienceTitle = booking.experienceName || experiencesMap[booking.experienceId] || "";
        const playersString = Array.isArray(booking.playerNames) ? booking.playerNames.join(" ") : "";
        
        const searchableText = [
          booking.companyName,
          booking.firstName,
          booking.lastName,
          `${booking.firstName} ${booking.lastName}`,
          booking.companyName ? `${booking.companyName} ${booking.firstName} ${booking.lastName}` : "",
          booking.email,
          booking.phone,
          booking.internalNotes,
          booking.id,
          booking.paymentRef,
          booking.discountCode,
          booking.giftCardCode,
          experienceTitle,
          playersString,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return queryWords.every(word => searchableText.includes(word));
      });
    }

    // Sort
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle specific sorting cases
      if (sortConfig.key === 'customer') {
        aValue = (a.companyName ? `${a.companyName} ${a.firstName} ${a.lastName}` : `${a.firstName} ${a.lastName}`).toLowerCase();
        bValue = (b.companyName ? `${b.companyName} ${b.firstName} ${b.lastName}` : `${b.firstName} ${b.lastName}`).toLowerCase();
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
  }, [bookings, sortConfig, statusFilter, dateFilter, searchQuery, activeTab, currentTime, experiencesMap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  const renderTodaySummary = (todayBookings: any[]) => {
    const active = todayBookings.filter((b) => {
      const p = getBookingPaymentBreakdown(b);
      return !p.isCancelled && !p.isSystem;
    });

    if (active.length === 0) return null;

    let totalValue = 0;
    let totalPlayers = 0;
    let totalVipps = 0;
    let totalGiftCard = 0;
    let totalTerminal = 0;
    let totalRemaining = 0;
    let vippsCount = 0;
    let giftCardCount = 0;
    let terminalCount = 0;

    active.forEach((b) => {
      const p = getBookingPaymentBreakdown(b);
      totalValue += p.totalPrice;
      totalPlayers += Number(b.players || 0);
      totalVipps += p.vippsPaid;
      totalGiftCard += p.giftCardUsed;
      totalTerminal += p.terminalPaid;
      totalRemaining += p.remaining;
      if (p.vippsPaid > 0) vippsCount += 1;
      if (p.giftCardUsed > 0) giftCardCount += 1;
      if (p.terminalPaid > 0) terminalCount += 1;
    });

    const fmt = (n: number) => `${Math.round(n).toLocaleString('nb-NO')} kr`;

    return (
      <div className="mb-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3">
          <div className="text-[11px] font-medium text-zinc-400">Dagens omsetning</div>
          <div className="text-lg sm:text-xl font-semibold text-white mt-0.5 tabular-nums">{fmt(totalValue)}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {active.length} {active.length === 1 ? 'booking' : 'bookinger'} · {totalPlayers} spillere
          </div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3">
          <div className="text-[11px] font-medium text-zinc-400">Vipps (nett)</div>
          <div className="text-lg sm:text-xl font-semibold text-emerald-400 mt-0.5 tabular-nums">{fmt(totalVipps)}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {vippsCount} {vippsCount === 1 ? 'booking' : 'bookinger'}
          </div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3">
          <div className="text-[11px] font-medium text-zinc-400">Gavekort innløst</div>
          <div className="text-lg sm:text-xl font-semibold text-amber-300 mt-0.5 tabular-nums">{fmt(totalGiftCard)}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {giftCardCount} {giftCardCount === 1 ? 'booking' : 'bookinger'}
          </div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3">
          <div className="text-[11px] font-medium text-zinc-400">Kortterminal (arena)</div>
          <div className="text-lg sm:text-xl font-semibold text-purple-300 mt-0.5 tabular-nums">{fmt(totalTerminal)}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {terminalCount} {terminalCount === 1 ? 'betaling' : 'betalinger'}
            {totalRemaining > 0 && (
              <span className="text-amber-400 font-medium"> · {fmt(totalRemaining)} gjenstår</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentDetails = (booking: any) => {
    const {
      totalPrice,
      amountPaid,
      giftCardUsed,
      vippsPaid,
      terminalPaid,
      remaining,
      status,
      isRefunded,
      isPending,
      isTerminal,
    } = getBookingPaymentBreakdown(booking);

    const isAuthorizedUncaptured =
      (status === 'AUTHORIZED' || status.includes('RESERVED')) && status !== 'CAPTURED';
    const isCancelledUnpaid = booking.status === 'cancelled' && amountPaid === 0 && giftCardUsed === 0;
    const nowMs = new Date(currentTime).getTime();
    const createdMs = booking.createdAt ? new Date(booking.createdAt).getTime() : nowMs;
    const isPendingExpired = isPending && nowMs - createdMs > 15 * 60 * 1000;
    const isFree = totalPrice === 0 && booking.status === 'confirmed';
    const isFullySettled = !isPending && remaining === 0 && totalPrice > 0 && status !== 'EXPIRED' && status !== 'ABORTED';

    let badgeLabel = `GJENSTÅR: ${remaining} NOK`;
    let badgeSub = 'ubetalt';
    let badgeClass = 'bg-red-500/15 text-red-300 border-red-500/40';
    let subClass = 'text-red-400';

    if (isRefunded) {
      badgeSub = 'refundert';
      badgeLabel = 'REFUNDERT (VIPPS)';
      badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      subClass = 'text-blue-400';
    } else if (isCancelledUnpaid) {
      badgeSub = 'ikke betalt';
      badgeLabel = 'AVBRUTT / UTLØPT (0 KR)';
      badgeClass = 'bg-zinc-800 text-zinc-400 border-zinc-700/60';
      subClass = 'text-zinc-400';
    } else if (isAuthorizedUncaptured) {
      badgeSub = 'reservert i vipps';
      badgeLabel = 'RESERVERT (MÅ TREKKES)';
      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      subClass = 'text-amber-400';
    } else if (isPending) {
      if (isPendingExpired) {
        badgeSub = 'ikke betalt';
        badgeLabel = 'UTLØPT (IKKE BETALT)';
        badgeClass = 'bg-red-500/15 text-red-300 border-red-500/30';
        subClass = 'text-red-400';
      } else {
        badgeSub = 'venter på vipps';
        badgeLabel = 'VENTER PÅ BETALING';
        badgeClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
        subClass = 'text-yellow-400';
      }
    } else if (isFree) {
      badgeSub = 'gratis';
      badgeLabel = '0 KR';
      badgeClass = 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
      subClass = 'text-zinc-400';
    } else if (isFullySettled) {
      if (giftCardUsed > 0 && terminalPaid > 0) {
        badgeSub = 'gavekort + terminal';
        badgeLabel = 'GAVEKORT + TERMINAL';
      } else if (giftCardUsed > 0 && vippsPaid > 0) {
        badgeSub = 'gavekort + vipps';
        badgeLabel = 'GAVEKORT + VIPPS';
      } else if (giftCardUsed >= totalPrice) {
        badgeSub = 'gavekort';
        badgeLabel = 'BETALT MED GAVEKORT';
      } else if (isTerminal) {
        badgeSub = 'betalt (terminal)';
        badgeLabel = 'OPPGJORT (TERMINAL)';
      } else {
        badgeSub = 'betalt (vipps)';
        badgeLabel = 'OPPGJORT (VIPPS)';
      }
      badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      subClass = 'text-emerald-400';
    } else if (isTerminal) {
      badgeSub = giftCardUsed > 0 ? 'delbetalt med gavekort' : 'betales i arena';
      badgeLabel = `BETALES I ARENA: ${remaining} NOK`;
      badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      subClass = 'text-purple-400';
    } else if (amountPaid > 0 || giftCardUsed > 0) {
      badgeSub = 'delbetalt';
      badgeLabel = `GJENSTÅR: ${remaining} NOK`;
      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      subClass = 'text-amber-400';
    }

    const canCaptureOrCancel = isAuthorizedUncaptured;
    const canRefund =
      ['vipps', 'reservation', 'full'].includes(booking.paymentType) &&
      vippsPaid > 0 &&
      status === 'CAPTURED' &&
      !isPending;
    const canMarkTerminalPaid =
      isTerminal && remaining > 0 && booking.status !== 'cancelled';

    return (
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex flex-col gap-1">
          <span className={`${subClass} font-medium text-xs`}>{badgeSub}</span>
          <span
            className={`text-[10.5px] font-bold uppercase px-2 py-0.5 rounded-md inline-flex items-center border shadow-sm w-fit max-w-full whitespace-normal leading-tight ${badgeClass}`}
          >
            {badgeLabel}
          </span>
        </div>

        {isPending ? (
          <div className="text-xs font-medium">
            {isPendingExpired ? (
              <span className="text-zinc-500 text-[11px]">Ingen betaling mottatt (0 NOK)</span>
            ) : (
              <span className="text-amber-400">Venter på betaling fra kunde</span>
            )}
          </div>
        ) : (
          <div className="text-xs space-y-0.5">
            <div className="text-zinc-200 font-medium">Totalt: {totalPrice} NOK</div>
            {giftCardUsed > 0 && (
              <div className="text-amber-300 text-[11px] font-medium">
                Gavekort: {giftCardUsed} NOK
              </div>
            )}
            {terminalPaid > 0 && (
              <div className="text-zinc-300 text-[11px]">
                Kortterminal: <span className="text-purple-300 font-medium">{terminalPaid} NOK</span>
              </div>
            )}
            {vippsPaid > 0 && (
              <div className="text-zinc-300 text-[11px]">
                Vipps: <span className="text-emerald-300 font-medium">{vippsPaid} NOK</span>
              </div>
            )}
            {isTerminal && remaining > 0 && (
              <div className="text-zinc-400 text-[11px]">
                Gjenstår i arena: <span className="text-purple-300 font-medium">{remaining} NOK</span>
              </div>
            )}
            {!isTerminal && vippsPaid === 0 && giftCardUsed === 0 && remaining > 0 && (
              <div className="text-zinc-500 text-[11px] italic">Innbetalt: 0 NOK</div>
            )}
          </div>
        )}

        {(booking.discountCode || booking.giftCardCode) && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {booking.discountCode && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 w-fit max-w-full"
                title={`Rabattkode brukt: ${booking.discountCode}`}
              >
                Rabattkode: <span className="font-mono">{booking.discountCode}</span>
              </span>
            )}
            {booking.giftCardCode && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 w-fit max-w-full"
                title={`Gavekort brukt: ${booking.giftCardCode}${booking.giftCardAmount ? ` (${booking.giftCardAmount} NOK)` : ''}`}
              >
                Gavekort: <span className="font-mono">{booking.giftCardCode}</span>
              </span>
            )}
          </div>
        )}

        {(canCaptureOrCancel || canRefund) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {canCaptureOrCancel && (
              <>
                <button
                  onClick={() => handleVippsAction(booking.id, 'capture', booking.totalPrice)}
                  className="text-[11px] bg-[#9C39FF] hover:bg-[#8A2BE2] text-white px-2 py-0.5 rounded transition-colors whitespace-nowrap"
                >
                  Complete (Capture)
                </button>
                <button
                  onClick={() => handleVippsAction(booking.id, 'cancel')}
                  className="text-[11px] bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2 py-0.5 rounded transition-colors whitespace-nowrap"
                >
                  Frigi (Avbryt)
                </button>
              </>
            )}

            {canRefund && (
              <button
                onClick={() => {
                  const defaultAmt = vippsPaid || booking.totalPrice || 0;
                  const amt = prompt(
                    `Hvor mye ønsker du å refundere til ${booking.firstName} ${booking.lastName} via Vipps? (i NOK)\n\nKunden vil automatisk motta en refusjonskvittering på e-post.`,
                    String(defaultAmt)
                  );
                  if (amt && !isNaN(Number(amt.replace(',', '.'))) && Number(amt.replace(',', '.')) > 0) {
                    handleVippsAction(booking.id, 'refund', Number(amt.replace(',', '.')));
                  }
                }}
                className="text-[11px] bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded transition-colors whitespace-nowrap font-medium"
                title="Refunder via Vipps og send refusjonskvittering på e-post"
              >
                Refunder (Vipps)
              </button>
            )}
          </div>
        )}

        {(canMarkTerminalPaid || (remaining > 0 && booking.status !== 'cancelled' && booking.bookingType !== 'system' && !booking.email?.includes('system@sperret'))) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {canMarkTerminalPaid && (
              <button
                onClick={() => handleMarkTerminalPaid(booking.id)}
                className="text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded transition-colors whitespace-nowrap font-medium"
                title="Registrer at kunden har betalt restbeløpet i kortterminalen"
              >
                ✓ Registrer betalt ({remaining} kr)
              </button>
            )}
            {remaining > 0 && booking.status !== 'cancelled' && booking.bookingType !== 'system' && !booking.email?.includes('system@sperret') && (
              <button
                onClick={() => setRedeemGiftCardBooking(booking)}
                className="text-[11px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded transition-colors whitespace-nowrap font-medium inline-flex items-center gap-1"
                title="Trekk hele eller deler av beløpet med gavekort"
              >
                <Gift className="w-3 h-3" />
                Trekk gavekort
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBookingActions = (booking: any) => {
    const now = new Date(currentTime);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isEligibleForReview =
      booking.status !== 'cancelled' &&
      booking.bookingType !== 'system' &&
      !booking.email?.includes('system@sperret') &&
      booking.date <= todayStr;
    const hasSentReview = !!booking.reviewEmailSentAt;
    const platformLabel =
      booking.reviewEmailType === 'tripadvisor'
        ? 'TripAdvisor'
        : booking.reviewEmailType === 'google'
        ? 'Google'
        : 'Begge';

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setEditingBooking(booking)}
          className="text-xs text-purple-300 hover:text-white bg-[#9C39FF]/15 hover:bg-[#9C39FF]/30 border border-[#9C39FF]/30 px-2.5 py-1.5 rounded-lg transition-colors font-medium inline-flex items-center gap-1 shadow-sm"
          title="Rediger opplevelse, deltakere, navneliste, tidspunkt og kundedetaljer"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Rediger</span>
        </button>

        <button
          onClick={() => handleResendConfirmation(booking)}
          disabled={resendingEmailId === booking.id || !booking.email || booking.email.includes('system@sperret')}
          className="text-xs text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 border border-zinc-700/60 p-1.5 rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-30"
          title={booking.email ? `Send bestillingsbekreftelse på nytt til ${booking.email}` : 'Mangler e-post'}
        >
          {resendingEmailId === booking.id ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <Mail className="w-3.5 h-3.5" />
          )}
        </button>

        {isEligibleForReview && (
          <button
            onClick={() => setReviewModalBooking(booking)}
            className={`text-xs px-2 py-1.5 rounded-lg border transition-all inline-flex items-center gap-1 font-medium ${
              hasSentReview
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
            title={
              hasSentReview
                ? `Omtale sendt (${platformLabel}) ${booking.reviewEmailSentAt ? new Intl.DateTimeFormat('no-NO', { dateStyle: 'short' }).format(new Date(booking.reviewEmailSentAt)) : ''}. Klikk for å se eller sende på nytt.`
                : 'Send forespørsel om omtale (TripAdvisor / Google Reviews)'
            }
          >
            <Star
              className={`w-3.5 h-3.5 ${
                hasSentReview ? 'fill-emerald-400 text-emerald-400' : 'fill-amber-300/30 text-amber-300'
              }`}
            />
            <span className="hidden xl:inline">
              {hasSentReview ? `Sendt (${platformLabel})` : 'Be om omtale'}
            </span>
          </button>
        )}

        <select
          value={booking.status}
          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border focus:outline-none appearance-none cursor-pointer ${
            booking.status === 'confirmed'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : booking.status === 'pending'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}
        >
          <option value="pending" className="bg-zinc-900 text-amber-400">
            Pending
          </option>
          <option value="confirmed" className="bg-zinc-900 text-emerald-400">
            Confirmed
          </option>
          <option value="cancelled" className="bg-zinc-900 text-red-400">
            Cancelled
          </option>
        </select>

        {booking.status !== 'cancelled' && (
          <button
            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors"
            title="Cancel Booking"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => deleteBooking(booking.id)}
          className="text-xs text-zinc-500 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors ml-1"
          title="Permanently Delete Booking"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderBookingsTable = (tableBookings: any[], title?: string) => (
    <div className="mb-8 last:mb-0" key={title || 'table'}>
      {title && <h2 className="text-xl font-medium mb-4 text-zinc-200">{title}</h2>}
      {title === 'Today' && renderTodaySummary(tableBookings)}

      {/* Mobil-kortvisning (< lg) */}
      <div className="lg:hidden space-y-3">
        {tableBookings.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 text-sm">
            No bookings yet.
          </div>
        ) : (
          tableBookings.map((booking) => {
            const now = new Date(currentTime).getTime();
            const createdAt = booking.createdAt ? new Date(booking.createdAt).getTime() : now;
            const isExpired = booking.status === 'pending' && now - createdAt > 15 * 60 * 1000;
            const validNames = (booking.playerNames || []).filter((n: string) => n && n.trim() !== '');

            return (
              <div
                key={`mobile-${booking.id}`}
                className={`rounded-2xl border p-4 space-y-3 ${
                  isExpired ? 'bg-red-950/10 border-red-900/30 opacity-75' : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <span>{formatDateShort(booking.date)}</span>
                      <span>·</span>
                      <span className="text-white font-semibold">{getBookingTimeRange(booking.time, booking.duration)}</span>
                      <span className="text-zinc-500">({booking.duration || 90}m)</span>
                    </div>
                    <div
                      className="text-base font-medium text-white mt-1 cursor-pointer"
                      onClick={() => setEditingBooking(booking)}
                    >
                      {experiencesMap[booking.experienceId] || booking.experienceId}
                      <span className="text-xs text-zinc-400 font-normal ml-2">
                        ({booking.players} {booking.players === 1 ? 'spiller' : 'spillere'})
                      </span>
                    </div>
                  </div>
                  {booking.bookingType === 'corporate' && booking.companyName && (
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                      Bedrift
                    </span>
                  )}
                </div>

                <div className="text-sm">
                  <div className="font-medium text-zinc-200">
                    {booking.companyName
                      ? `${booking.companyName} (${booking.firstName} ${booking.lastName})`
                      : `${booking.firstName} ${booking.lastName}`}
                  </div>
                  {booking.bookingType !== 'system' && !booking.email?.includes('system@sperret') && (
                    <div className="text-xs text-zinc-400 mt-0.5 break-all">
                      {booking.phone} · {booking.email}
                    </div>
                  )}
                  {validNames.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {validNames.map((name: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded border border-zinc-700/50"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  {booking.internalNotes && (
                    <div className="mt-2 text-xs text-zinc-400 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800 italic">
                      {booking.internalNotes}
                    </div>
                  )}
                </div>

                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
                  {renderPaymentDetails(booking)}
                </div>

                <div className="pt-1 flex items-center justify-between gap-2 flex-wrap border-t border-zinc-800/70">
                  {renderBookingActions(booking)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop-tabell (>= lg) */}
      <div className="hidden lg:flex bg-zinc-900/50 border border-zinc-800 rounded-2xl flex-col w-full max-w-full">
        <div className="overflow-x-auto max-h-[70vh] rounded-2xl relative w-full">
          <table className="w-full text-left text-sm table-fixed min-w-[1000px]">
            <colgroup>
              <col className="w-[11%]" />
              <col className="w-[17%]" />
              <col className="w-[24%]" />
              <col className="w-[21%]" />
              <col className="w-[10%]" />
              <col className="w-[17%]" />
            </colgroup>
            <thead className="bg-zinc-900 shadow-[0_1px_0_0_#27272a] text-zinc-400 sticky top-0 z-20">
              <tr>
                <th className="px-3 sm:px-5 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors w-[11%]" onClick={() => handleSort('dateTime')}>
                  Date & Time {sortConfig.key === 'dateTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 sm:px-5 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors w-[17%]" onClick={() => handleSort('experienceId')}>
                  Experience {sortConfig.key === 'experienceId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 sm:px-5 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors w-[24%]" onClick={() => handleSort('customer')}>
                  Customer {sortConfig.key === 'customer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 sm:px-5 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors w-[21%]" onClick={() => handleSort('totalPrice')}>
                  Payment {sortConfig.key === 'totalPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 sm:px-5 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors w-[10%]" onClick={() => handleSort('createdAt')}>
                  Placed At {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 sm:px-5 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors w-[17%]" onClick={() => handleSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {tableBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 py-8 sm:py-12 text-left sm:text-center text-zinc-500 font-medium">
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
                  <td className="px-3 sm:px-5 py-3.5 sm:py-4">
                    <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-xs sm:text-sm">
                      <CalendarIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      {formatDateShort(booking.date)}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-zinc-200 text-xs font-semibold whitespace-nowrap">
                      <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
                      {getBookingTimeRange(booking.time, booking.duration)}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      <span className="text-[11px] text-zinc-400 font-medium pl-4">
                        {booking.duration || 90}m
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
                  <td className="px-3 sm:px-5 py-3.5 sm:py-4">
                    <div 
                      className="text-zinc-200 font-medium hover:text-[#9C39FF] cursor-pointer transition-colors flex items-center gap-1.5 group w-fit"
                      onClick={() => setEditingBooking(booking)}
                      title="Klikk for å endre opplevelse eller deltakere"
                    >
                      <span>{experiencesMap[booking.experienceId] || booking.experienceId}</span>
                      <Pencil className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div 
                      className="flex items-center gap-1.5 mt-1 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors w-fit"
                      onClick={() => setEditingBooking(booking)}
                      title="Klikk for å endre antall spillere"
                    >
                      <Users className="w-3 h-3 text-zinc-500" /> {booking.players} {booking.players === 1 ? 'spiller' : 'spillere'}
                    </div>
                    {(() => {
                      if (!booking.players || booking.players <= 0 || booking.bookingType === 'system') return null;
                      const validNames = (booking.playerNames || []).filter((n: string) => n && n.trim() !== '');
                      const isComplete = validNames.length >= booking.players;
                      const hasSome = validNames.length > 0;
                      
                      const today = new Date().toISOString().split('T')[0];
                      const isUpcomingSoon = booking.date >= today;

                      return (
                        <div 
                          className="mt-1.5 space-y-1 cursor-pointer group"
                          onClick={() => setEditingBooking(booking)}
                          title="Klikk for å fylle ut eller redigere navneliste"
                        >
                          {isComplete ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 group-hover:border-emerald-500/40">
                                ✓ Navneliste ({validNames.length}/{booking.players})
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyPlayerNames(booking.id, validNames);
                                }}
                                className="text-[10px] font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/70 hover:border-zinc-500 px-1.5 py-0.5 rounded flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                                title="Kopier navneliste i JSON-format"
                              >
                                {copiedBookingId === booking.id ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    <span className="text-emerald-400 font-semibold">Kopiert!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5 text-zinc-400" />
                                    <span>Kopier JSON</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ) : hasSome ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded group-hover:border-amber-500/40">
                                Delvis navneliste ({validNames.length}/{booking.players})
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyPlayerNames(booking.id, validNames);
                                }}
                                className="text-[10px] font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/70 hover:border-zinc-500 px-1.5 py-0.5 rounded flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                                title="Kopier navneliste i JSON-format"
                              >
                                {copiedBookingId === booking.id ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    <span className="text-emerald-400 font-semibold">Kopiert!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5 text-zinc-400" />
                                    <span>Kopier JSON</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ) : isUpcomingSoon ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded group-hover:border-amber-500/50">
                                Mangler navn (0/{booking.players})
                              </span>
                              {booking.reminderCount > 0 && (
                                <span className="text-[10px] text-zinc-500" title={`Purret ${booking.reminderCount}x, sist ${booking.lastReminderDate}`}>
                                  ({booking.reminderCount}x purret)
                                </span>
                              )}
                            </div>
                          ) : null}

                          {validNames.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {validNames.map((name: string, idx: number) => (
                                <span key={idx} className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded border border-zinc-700/50 group-hover:border-purple-500/40">
                                  {name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-3 sm:px-5 py-3.5 sm:py-4 whitespace-normal">
                    <div 
                      className="font-medium text-zinc-200 flex items-center flex-wrap gap-1.5 hover:text-[#9C39FF] cursor-pointer transition-colors group w-fit"
                      onClick={() => setEditingBooking(booking)}
                      title="Klikk for å redigere kundeinformasjon"
                    >
                      {booking.bookingType === 'corporate' && booking.companyName ? (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-amber-500/30">Bedrift</span>
                      ) : null}
                      {booking.bookingType === 'system' || booking.email?.includes('system@sperret') || booking.firstName === 'Sperret' ? (
                        <span className="bg-red-500/20 text-red-300 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-red-500/30">Sperret</span>
                      ) : null}
                      <span>
                        {booking.companyName ? `${booking.companyName} (${booking.firstName} ${booking.lastName})` : `${booking.firstName} ${booking.lastName}`}
                      </span>
                      <Pencil className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      {booking.bookingType !== 'system' && !booking.email?.includes('system@sperret') ? (
                        <>
                          <span className="flex items-center gap-1">
                            <Mail className={`w-3 h-3 ${booking.confirmationEmailSent ? "text-emerald-400" : ""}`} /> 
                            {booking.email}
                          </span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {booking.phone}</span>
                        </>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">Blokkert tidspunkt (ikke tilgjengelig for kunder)</span>
                      )}
                    </div>
                    {booking.internalNotes ? (
                       <div 
                         className="mt-2 text-xs text-zinc-400 bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-700/50 italic w-full whitespace-normal break-words cursor-pointer hover:bg-zinc-800 transition-colors"
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
                  <td className="px-3 sm:px-5 py-3.5 sm:py-4 align-top whitespace-normal">
                    {renderPaymentDetails(booking)}
                  </td>
                  <td className="px-3 sm:px-5 py-3.5 sm:py-4 text-xs text-zinc-400 align-top whitespace-nowrap">
                    {booking.createdAt ? (
                      <div>
                        <div>{new Intl.DateTimeFormat("no-NO", { dateStyle: "short" }).format(new Date(booking.createdAt))}</div>
                        <div className="mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{new Intl.DateTimeFormat("no-NO", { timeStyle: "short" }).format(new Date(booking.createdAt))}</div>
                      </div>
                    ) : "N/A"}
                  </td>
                  <td className="px-3 sm:px-5 py-3.5 sm:py-4 align-top">
                    {renderBookingActions(booking)}
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
    <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 pt-0 md:pt-4 pb-20">
      {/* Sticky header */}
      <header className="mb-8 sticky top-0 md:top-4 z-40 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/80 rounded-2xl px-4 py-3 md:px-6 md:py-3.5 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Branding */}
          <div className="flex-shrink-0">
            <span className="text-[10px] font-bold tracking-[0.15em] text-zinc-950 uppercase bg-white px-2.5 py-0.5 rounded-full inline-block mb-1 shadow-sm">
              KRS VR Arena
            </span>
            <h1 className="text-xl md:text-2xl font-light tracking-tight text-white">
              Admin Dashboard
            </h1>
          </div>

          {/* Center: Desktop nav pill menu */}
          <nav className="hidden xl:flex items-center bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800/80 shadow-inner gap-1 flex-wrap">
            <button onClick={() => { setActiveTab("upcoming"); setSortConfig({ key: 'dateTime', direction: 'asc' }); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'upcoming' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}><Clock4 className="w-4 h-4" /> Upcoming</button>
            <button onClick={() => setActiveTab("manual")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'manual' ? 'bg-[#9C39FF]/20 text-[#9C39FF]' : 'text-zinc-400 hover:text-zinc-200'}`}><Plus className="w-4 h-4" /> Booking</button>
            <button onClick={() => setActiveTab("inquiries")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inquiries' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <MailQuestion className="w-4 h-4" /> 
              Forespørsler
              {newInquiriesCount > 0 && (
                <span className="ml-1 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {newInquiriesCount}
                </span>
              )}
            </button>
            <button onClick={() => { setActiveTab("archive"); setSortConfig({ key: 'dateTime', direction: 'desc' }); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'archive' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}><ListOrdered className="w-4 h-4" /> Arkiv</button>
            <button onClick={() => setActiveTab("experiences")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'experiences' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}><Gamepad2 className="w-4 h-4" /> Spill</button>
            <button onClick={() => setActiveTab("clients")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'clients' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}><Building2 className="w-4 h-4" /> Kunder</button>
            <button onClick={() => setActiveTab("transactions")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}><Wallet className="w-4 h-4" /> Regnskap</button>
            <button onClick={() => setActiveTab("giftcards")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'giftcards' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}><Gift className="w-4 h-4" /> Gavekort</button>
            <button onClick={() => setActiveTab("shifts")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shifts' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}><CalendarIcon className="w-4 h-4" /> Vakter</button>
            <button onClick={() => setActiveTab("employees")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'employees' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}><Users className="w-4 h-4" /> Ansatte</button>
            <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}><Settings className="w-4 h-4" /> Innstillinger</button>
            <Link href="/admin/newsletter" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-purple-300 hover:text-white hover:bg-purple-900/20 border border-purple-500/20"><Mail className="w-4 h-4 text-purple-400" /> Nyhetsbrev</Link>
          </nav>

          {/* Right: Push Notifications, Logout button + Mobile/Tablet Hamburger */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-zinc-900/90 hover:bg-[#9C39FF]/15 hover:text-purple-300 hover:border-[#9C39FF]/30 text-zinc-300 border border-zinc-800 rounded-xl transition-all shadow-sm"
              title="Push-varsler innstillinger"
            >
              <Bell className="w-3.5 h-3.5 text-[#9C39FF]" />
              <span className="hidden sm:inline">Push-varsler</span>
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-zinc-900/90 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 text-zinc-300 border border-zinc-800 rounded-xl transition-all shadow-sm"
              title="Logg ut av admin"
            >
              <LogOut className="w-4 h-4" />
              <span>Logg ut</span>
            </button>

            {/* Hamburger button – mobile/tablet only */}
            <button
              className="xl:hidden p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? 'Lukk meny' : 'Åpne meny'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet nav dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-3 pt-3 border-t border-zinc-800/80">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
              <button onClick={() => { setActiveTab("upcoming"); setSortConfig({ key: 'dateTime', direction: 'asc' }); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'upcoming' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Clock4 className="w-4 h-4" /> Upcoming</button>
              <button onClick={() => { setActiveTab("manual"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'manual' ? 'bg-[#9C39FF]/20 text-[#9C39FF]' : 'text-zinc-400 hover:text-zinc-200'}`}><Plus className="w-4 h-4" /> Booking</button>
              <button onClick={() => { setActiveTab("inquiries"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inquiries' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
                <MailQuestion className="w-4 h-4" /> 
                Forespørsler
                {newInquiriesCount > 0 && (
                  <span className="ml-auto bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {newInquiriesCount}
                  </span>
                )}
              </button>
              <button onClick={() => { setActiveTab("archive"); setSortConfig({ key: 'dateTime', direction: 'desc' }); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'archive' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><ListOrdered className="w-4 h-4" /> Arkiv</button>
              <button onClick={() => { setActiveTab("experiences"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'experiences' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Gamepad2 className="w-4 h-4" /> Spill</button>
              <button onClick={() => { setActiveTab("clients"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'clients' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Building2 className="w-4 h-4" /> Kunder</button>
              <button onClick={() => { setActiveTab("transactions"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Wallet className="w-4 h-4" /> Regnskap</button>
              <button onClick={() => { setActiveTab("giftcards"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'giftcards' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Gift className="w-4 h-4" /> Gavekort</button>
              <button onClick={() => { setActiveTab("shifts"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shifts' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><CalendarIcon className="w-4 h-4" /> Vakter</button>
              <button onClick={() => { setActiveTab("employees"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'employees' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Users className="w-4 h-4" /> Ansatte</button>
              <button onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}><Settings className="w-4 h-4" /> Innstillinger</button>
              <button onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-purple-300 hover:text-white bg-purple-900/10 border border-purple-500/20"><Bell className="w-4 h-4 text-purple-400" /> Push-varsler</button>
              <Link href="/admin/newsletter" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-purple-300 hover:text-white bg-purple-900/10 border border-purple-500/20"><Mail className="w-4 h-4 text-purple-400" /> Nyhetsbrev</Link>
              <button onClick={handleLogout} className="col-span-2 sm:col-span-4 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 mt-1">
                <LogOut className="w-4 h-4" /> Logg ut
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Section heading */}
      {{
        upcoming: <h2 className="text-xl font-semibold text-white mb-6">Kommende bookinger</h2>,
        archive: <h2 className="text-xl font-semibold text-white mb-6">Arkiv</h2>,
        inquiries: <h2 className="text-xl font-semibold text-white mb-6">Forespørsler & Arrangementer</h2>,
        manual: <h2 className="text-xl font-semibold text-white mb-6">Manuell booking</h2>,
        experiences: <h2 className="text-xl font-semibold text-white mb-6">Spill & Opplevelser</h2>,
        clients: <h2 className="text-xl font-semibold text-white mb-6">Bedriftskunder, Logoer & Omtaler</h2>,
        transactions: <h2 className="text-xl font-semibold text-white mb-6">Regnskap</h2>,
        giftcards: <h2 className="text-xl font-semibold text-white mb-6">Gavekort</h2>,
        shifts: <h2 className="text-xl font-semibold text-white mb-6">Vakter & Timeføring</h2>,
        employees: <h2 className="text-xl font-semibold text-white mb-6">Ansatte</h2>,
        settings: <h2 className="text-xl font-semibold text-white mb-6">Innstillinger</h2>,
      }[activeTab]}

      {(activeTab === "upcoming" || activeTab === "archive") && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 w-full max-w-full">
            <div className="flex-1 w-full min-w-0">
              <input
                type="text"
                placeholder="Søk navn, bedrift, e-post, tlf, kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-full box-border bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <label className="w-full sm:w-auto flex items-center justify-between gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus-within:border-[#9C39FF]">
                <span className="text-xs text-zinc-400 shrink-0">Dato:</span>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none min-w-0"
                />
              </label>
              {activeTab === "archive" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto max-w-full box-border bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF] min-w-[120px]"
                >
                  <option value="all">Alle statuser</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Bekreftet</option>
                  <option value="cancelled">Kansellert</option>
                </select>
              )}
              {(searchQuery || dateFilter || (activeTab === "archive" && statusFilter !== 'all')) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDateFilter("");
                    setStatusFilter("all");
                  }}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded-md transition-colors"
                >
                  Nullstill
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

      {activeTab === "inquiries" && (
        <InquiriesManager 
          onCreateBooking={handleCreateBookingFromInquiry} 
          onInquiriesUpdated={fetchInquiriesCount} 
        />
      )}
      {activeTab === "experiences" && <ExperiencesManager />}
      {activeTab === "clients" && <ClientsManager />}
      {activeTab === "transactions" && <TransactionsManager />}
      {activeTab === "giftcards" && <AdminGiftCardsTab />}
      {activeTab === "settings" && <SettingsManager />}
      {activeTab === "manual" && (
        <ManualBookingManager 
          initialData={manualBookingInitialData} 
          onClearInitialData={() => setManualBookingInitialData(null)}
          onBookingCreated={() => {
            fetchInquiriesCount();
          }} 
        />
      )}
      {activeTab === "shifts" && <ShiftManager />}
      {activeTab === "employees" && <EmployeesManager />}

      {/* Edit Booking Modal */}
      <EditBookingModal
        booking={editingBooking}
        isOpen={!!editingBooking}
        onClose={() => setEditingBooking(null)}
        onSave={(updated) => {
          setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
          );
        }}
        experiences={experiencesList}
        pricingTiers={pricingTiers}
      />

      {/* Review Request Modal */}
      <ReviewRequestModal
        booking={reviewModalBooking}
        isOpen={!!reviewModalBooking}
        onClose={() => setReviewModalBooking(null)}
        onSent={(updated) => {
          setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
          );
        }}
      />

      {/* Redeem Gift Card Modal */}
      <RedeemBookingGiftCardModal
        booking={redeemGiftCardBooking}
        isOpen={!!redeemGiftCardBooking}
        onClose={() => setRedeemGiftCardBooking(null)}
        onRedeemed={(updated) => {
          setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
          );
        }}
      />
    </div>
  );
}
