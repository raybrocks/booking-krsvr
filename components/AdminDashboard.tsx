"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Loader2,
  Calendar as CalendarIcon,
  Clock4,
  Settings,
  Gamepad2,
  ListOrdered,
  Plus,
  Wallet,
  Menu,
  X,
  LogOut,
  MailQuestion,
  Star,
  Building2,
  Copy,
  Check,
  Bell,
  Gift,
  ChevronRight,
  Users,
  Search,
  ArrowUpDown,
} from "lucide-react";
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
import BookingInspectorSheet from "./BookingInspectorSheet";
import { getBookingPaymentBreakdown, getPaymentDisplayFlags } from "@/lib/booking-utils";

type AdminTab =
  | "upcoming"
  | "archive"
  | "inquiries"
  | "experiences"
  | "clients"
  | "transactions"
  | "giftcards"
  | "settings"
  | "manual"
  | "shifts"
  | "employees";

const playDing = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
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
  if (!startTime || !startTime.includes(":")) return startTime || "";
  const [hoursStr, minutesStr] = startTime.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return startTime;

  const duration = durationMinutes || 90;
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  const endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  return `${startTime}–${endTime}`;
};

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return "";
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parts[0].slice(-2);
      const month = parts[1];
      const day = parts[2];
      return `${day}.${month}.${year}`;
    }
  }
  return dateStr;
};

const getNorwegianWeekday = (dateStr: string) => {
  if (!dateStr || !dateStr.includes("-")) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return "";
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
  const raw = new Intl.DateTimeFormat("nb-NO", { weekday: "long", timeZone: "UTC" }).format(dt);
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "";
};

export default function AdminDashboard() {
  const shouldReduceMotion = useReducedMotion();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("upcoming");
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const isFirstLoad = useRef(true);
  const notifiedBookingIds = useRef<Set<string>>(new Set());

  // Manual booking pre-fill state & Inquiries count
  const [manualBookingInitialData, setManualBookingInitialData] = useState<ManualBookingInitialData | null>(null);
  const [newInquiriesCount, setNewInquiriesCount] = useState<number>(0);

  // Sorting and Filtering State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "dateTime",
    direction: "asc",
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [experiencesMap, setExperiencesMap] = useState<Record<string, string>>({});
  const [experiencesList, setExperiencesList] = useState<any[]>([]);
  const [pricingTiers, setPricingTiers] = useState<Record<string, number> | undefined>(undefined);

  // Modals & Inspector
  const [inspectedBookingId, setInspectedBookingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(null);
  const [redeemGiftCardBooking, setRedeemGiftCardBooking] = useState<any | null>(null);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);
  const [copiedBookingId, setCopiedBookingId] = useState<string | null>(null);
  const [copiedNameKey, setCopiedNameKey] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const supabase = createClient();

  const inspectedBooking = inspectedBookingId
    ? bookings.find((b) => b.id === inspectedBookingId) || null
    : null;

  const copyTextToClipboard = async (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  const handleCopyPlainText = async (label: string, text: string) => {
    try {
      await copyTextToClipboard(text);
      toast.success(`${label} kopiert`);
    } catch {
      toast.error(`Kunne ikke kopiere ${label.toLowerCase()}`);
    }
  };

  const handleCopySingleName = async (key: string, rawName: string) => {
    const cleanName = (rawName || "").trim();
    if (!cleanName) return;
    try {
      await copyTextToClipboard(cleanName);
      setCopiedNameKey(key);
      toast.success(`Kopierte «${cleanName}»`);
      setTimeout(() => {
        setCopiedNameKey((prev) => (prev === key ? null : prev));
      }, 1500);
    } catch (err) {
      console.error("Feil ved kopiering av navn:", err);
      toast.error("Kunne ikke kopiere navn");
    }
  };

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
      await copyTextToClipboard(jsonOutput);
      setCopiedBookingId(bookingId);
      toast.success(`Kopierte ${validNames.length} navn i JSON-format`);
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
      const res = await fetch("/api/admin/inquiries?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        const today = new Date().toISOString().split("T")[0];
        const openCount = data.filter((item: any) => {
          const isClosed =
            item.status === "booked" ||
            !!item.bookingId ||
            item.status === "rejected" ||
            (item.date && item.date < today);
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

    let matchedExpId = "arrangement";
    const eventLower = (
      (inquiry.eventType || "") +
      " " +
      (inquiry.packageType || "") +
      " " +
      (inquiry.message || "")
    ).toLowerCase();
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
      bookingType: inquiry.groupType === "bedrift" || inquiry.companyName ? "corporate" : "private",
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
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }

    const syncTabFromUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const validTabs: AdminTab[] = [
        "upcoming",
        "archive",
        "inquiries",
        "experiences",
        "clients",
        "transactions",
        "giftcards",
        "settings",
        "manual",
        "shifts",
        "employees",
      ];
      if (tabParam && validTabs.includes(tabParam as AdminTab)) {
        setActiveTab(tabParam as AdminTab);
      }
      const searchParam = params.get("search");
      if (searchParam) {
        setSearchQuery(searchParam);
      }
    };
    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);

    const fetchData = async () => {
      try {
        const [bookingsRes, experiencesRes, settingsRes] = await Promise.all([
          fetch("/api/admin/bookings"),
          fetch("/api/experiences"),
          fetch("/api/settings"),
        ]);

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data);
          setLoading(false);

          let newlyConfirmed = false;
          let newlyConfirmedCount = 0;

          data.forEach((docData: any) => {
            const isConfirmed = docData.status === "confirmed" || docData.status === "completed";

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
            toast.success(`Ny bestilling bekreftet (${newlyConfirmedCount})`);
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
          } else if (sett?.pricing && typeof sett.pricing === "object") {
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
      window.removeEventListener("popstate", syncTabFromUrl);
      clearInterval(intervalData);
      clearInterval(intervalTime);
    };
  }, []);

  const handleVippsAction = async (
    bookingId: string,
    action: "capture" | "cancel" | "refund",
    amount?: number
  ) => {
    const loadingToastId = toast.loading(`Behandler Vipps (${action})...`);
    try {
      let res;
      if (action === "capture") {
        const amountOre = amount ? Math.round(amount * 100) : 0;
        res = await fetch("/api/vipps/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions: [{ bookingId, amount: amountOre }] }),
        });
      } else if (action === "cancel") {
        res = await fetch("/api/vipps/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
      } else if (action === "refund") {
        const amountOre = amount ? Math.round(amount * 100) : 0;
        res = await fetch("/api/vipps/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, amount: amountOre }),
        });
      }

      const data = await res?.json();
      if (res?.ok) {
        toast.success(data?.message || `Vipps ${action} fullført`, { id: loadingToastId });
        setBookings((prev) =>
          prev.map((b) => {
            if (b.id === bookingId) {
              if (action === "refund") return { ...b, vippsStatus: "REFUNDED", status: "cancelled" };
              if (action === "capture")
                return { ...b, vippsStatus: "CAPTURED", status: "confirmed", amountPaid: amount || b.totalPrice };
              if (action === "cancel") return { ...b, vippsStatus: "CANCELLED", status: "cancelled", amountPaid: 0 };
            }
            return b;
          })
        );
      } else {
        toast.error(`Feil: ${data?.error || data?.message || "Ukjent feil"}`, { id: loadingToastId });
      }
    } catch (e: any) {
      toast.error(`Nettverksfeil: ${e.message}`, { id: loadingToastId });
    }
  };

  const handleMarkTerminalPaid = async (bookingId: string) => {
    const loadingToastId = toast.loading("Registrerer betaling...");
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/mark-paid`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kunne ikke markere som betalt");
      toast.success(data.message || "Betaling registrert i kortterminal", { id: loadingToastId });
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === bookingId) {
            return {
              ...b,
              amountPaid: data.booking?.amountPaid ?? b.totalPrice,
              status: data.booking?.status || "confirmed",
              paymentType: data.booking?.paymentType || "terminal",
              vippsStatus: "TERMINAL_BETALT",
            };
          }
          return b;
        })
      );
    } catch (err: any) {
      toast.error(err.message || "Feil ved registrering av betaling", { id: loadingToastId });
    }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
      const label = newStatus === "confirmed" ? "Bekreftet" : newStatus === "pending" ? "Venter" : "Avbestilt";
      toast.success(`Status satt til ${label}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Kunne ikke oppdatere status");
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Booking slettet permanent");
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Kunne ikke slette booking");
    }
  };

  const handleResendConfirmation = async (booking: any) => {
    if (!booking.email || booking.email.includes("system@sperret")) {
      toast.error("Ingen gyldig e-post registrert på denne bookingen");
      return;
    }

    setResendingEmailId(booking.id);
    const loadingToastId = toast.loading(`Sender bekreftelse til ${booking.email}...`);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isUpdate: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kunne ikke sende bekreftelse");
      toast.success(data.message || `Bekreftelse sendt til ${booking.email}`, { id: loadingToastId });
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke sende e-post", { id: loadingToastId });
    } finally {
      setResendingEmailId(null);
    }
  };

  const extendBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Feilet ved utvidelse");
      } else {
        toast.success(`Utvidet med 90 minutter (${data.newDuration} min totalt)`);
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, duration: data.newDuration } : b)));
      }
    } catch {
      toast.error("Nettverksfeil oppstod.");
    }
  };

  const reduceBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}/reduce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Feilet ved fjerning av utvidet tid");
      } else {
        toast.success(`Redusert med 90 minutter (${data.newDuration} min totalt)`);
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, duration: data.newDuration } : b)));
      }
    } catch {
      toast.error("Nettverksfeil oppstod.");
    }
  };

  const handleSaveNote = async (id: string, newNote: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: newNote.trim() }),
      });

      if (!response.ok) {
        toast.error("Feilet ved oppdatering av kommentar");
        return false;
      } else {
        toast.success("Notat lagret");
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, internalNotes: newNote.trim() } : b)));
        return true;
      }
    } catch {
      toast.error("Nettverksfeil oppstod.");
      return false;
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedBookings = React.useMemo(() => {
    let result = [...bookings];

    if (activeTab === "upcoming") {
      const now = new Date(currentTime);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      result = result.filter(
        (booking) => booking.status === "confirmed" && booking.date >= todayStr && booking.bookingType !== "system"
      );
    } else {
      result = result.filter((booking) => booking.bookingType !== "system");
    }

    if (activeTab === "archive" && statusFilter !== "all") {
      result = result.filter((booking) => booking.status === statusFilter);
    }

    if (dateFilter) {
      result = result.filter((booking) => booking.date === dateFilter);
    }

    if (searchQuery.trim()) {
      const queryWords = searchQuery.toLowerCase().trim().split(/\s+/);
      result = result.filter((booking) => {
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

        return queryWords.every((word) => searchableText.includes(word));
      });
    }

    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "customer") {
        aValue = (a.companyName
          ? `${a.companyName} ${a.firstName} ${a.lastName}`
          : `${a.firstName} ${a.lastName}`
        ).toLowerCase();
        bValue = (b.companyName
          ? `${b.companyName} ${b.firstName} ${b.lastName}`
          : `${b.firstName} ${b.lastName}`
        ).toLowerCase();
      } else if (sortConfig.key === "dateTime") {
        aValue = new Date(`${a.date}T${a.time}`).getTime();
        bValue = new Date(`${b.date}T${b.time}`).getTime();
      } else if (sortConfig.key === "createdAt") {
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [bookings, sortConfig, statusFilter, dateFilter, searchQuery, activeTab, currentTime, experiencesMap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-7 h-7 animate-spin text-[#9C39FF]" />
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
    let totalGoodwillGiftCard = 0;
    let totalTerminal = 0;
    let totalRemaining = 0;
    let vippsCount = 0;
    let giftCardCount = 0;
    let goodwillCount = 0;
    let terminalCount = 0;

    active.forEach((b) => {
      const p = getBookingPaymentBreakdown(b);
      totalValue += p.netRevenue;
      totalPlayers += Number(b.players || 0);
      totalVipps += p.vippsPaid;
      totalGiftCard += p.paidGiftCardUsed;
      totalGoodwillGiftCard += p.goodwillGiftCardUsed;
      totalTerminal += p.terminalPaid;
      totalRemaining += p.remaining;
      if (p.vippsPaid > 0) vippsCount += 1;
      if (p.paidGiftCardUsed > 0) giftCardCount += 1;
      if (p.goodwillGiftCardUsed > 0) goodwillCount += 1;
      if (p.terminalPaid > 0) terminalCount += 1;
    });

    const fmt = (n: number) => `${Math.round(n).toLocaleString("nb-NO")} kr`;

    return (
      <div className="mb-5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="apple-surface rounded-2xl p-3.5 sm:p-4">
          <div className="text-[11px] font-medium text-zinc-400">Dagens omsetning</div>
          <div className="apple-display text-lg sm:text-2xl font-semibold text-white mt-1 tabular-nums">
            {fmt(totalValue)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 tabular-nums">
            {active.length} {active.length === 1 ? "booking" : "bookinger"} · {totalPlayers} spillere
            {totalGoodwillGiftCard > 0 && ` · ekskl. ${fmt(totalGoodwillGiftCard)} goodwill`}
          </div>
        </div>

        <div className="apple-surface rounded-2xl p-3.5 sm:p-4">
          <div className="text-[11px] font-medium text-zinc-400">Forhåndsbetalt (Webshop)</div>
          <div className="apple-display text-lg sm:text-2xl font-semibold text-white mt-1 tabular-nums">
            {fmt(totalVipps)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 tabular-nums">
            {vippsCount} {vippsCount === 1 ? "booking" : "bookinger"}
          </div>
        </div>

        <div className="apple-surface rounded-2xl p-3.5 sm:p-4">
          <div className="text-[11px] font-medium text-zinc-400">Gavekort innløst (solgt)</div>
          <div className="apple-display text-lg sm:text-2xl font-semibold text-white mt-1 tabular-nums">
            {fmt(totalGiftCard)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 tabular-nums">
            {giftCardCount} {giftCardCount === 1 ? "booking" : "bookinger"}
            {totalGoodwillGiftCard > 0 && ` · +${fmt(totalGoodwillGiftCard)} goodwill (${goodwillCount})`}
          </div>
        </div>

        <div className="apple-surface rounded-2xl p-3.5 sm:p-4">
          <div className="text-[11px] font-medium text-zinc-400">Kortterminal (arena)</div>
          <div className="apple-display text-lg sm:text-2xl font-semibold text-white mt-1 tabular-nums">
            {fmt(totalTerminal)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 tabular-nums">
            {terminalCount} {terminalCount === 1 ? "betaling" : "betalinger"}
            {totalRemaining > 0 && (
              <span className="text-amber-300 font-medium"> · {fmt(totalRemaining)} gjenstår</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBookingRows = (tableBookings: any[], sectionTitle?: string) => (
    <section className="mb-8 last:mb-0" key={sectionTitle || "list"}>
      {sectionTitle && (
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="apple-display text-lg font-semibold text-white">{sectionTitle}</h2>
          <span className="text-xs text-zinc-400 tabular-nums">
            {tableBookings.length} {tableBookings.length === 1 ? "booking" : "bookinger"}
          </span>
        </div>
      )}

      {sectionTitle === "I dag" && renderTodaySummary(tableBookings)}

      <div className="apple-surface rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
        {tableBookings.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-400">
            Ingen bookinger funnet.
          </div>
        ) : (
          tableBookings.map((booking) => {
            const p = getBookingPaymentBreakdown(booking);
            const nowMs = new Date(currentTime).getTime();
            const flags = getPaymentDisplayFlags(p, booking.createdAt, nowMs);
            const isExpired = flags.isPendingExpired;
            const isSystem = booking.bookingType === "system" || booking.email?.includes("system@sperret");
            const validNames: string[] = (booking.playerNames || []).filter(
              (n: string) => n && n.trim() !== ""
            );
            const isTodayOrFuture = booking.date >= new Date(currentTime).toISOString().split("T")[0];
            const missingNames = !isSystem && isTodayOrFuture && validNames.length === 0 && booking.players > 0;
            const hasPartialNames =
              !isSystem && validNames.length > 0 && validNames.length < booking.players;

            // Monochrome calm payment summary with color ONLY when action or attention is needed
            let paymentLine = "";
            let paymentTone = "text-zinc-300";
            if (p.isRefunded) {
              paymentLine = `Refundert (${p.totalPrice.toLocaleString("nb-NO")} kr)`;
              paymentTone = "text-zinc-400";
            } else if (flags.isCancelledUnpaid) {
              paymentLine = "Avbrutt / 0 kr";
              paymentTone = "text-zinc-500";
            } else if (flags.isAuthorizedUncaptured) {
              paymentLine = "Reservert (må trekkes)";
              paymentTone = "text-amber-300";
            } else if (p.isPending) {
              paymentLine = flags.isPendingExpired ? "Utløpt (ikke betalt)" : "Venter på Vipps";
              paymentTone = flags.isPendingExpired ? "text-red-300" : "text-amber-300";
            } else if (flags.isFree) {
              paymentLine = "0 kr";
              paymentTone = "text-zinc-400";
            } else if (flags.isFullySettled) {
              paymentLine = p.isTerminal
                ? `Oppgjort i terminal · ${p.totalPrice.toLocaleString("nb-NO")} kr`
                : `Forhåndsbetalt (Webshop) · ${p.totalPrice.toLocaleString("nb-NO")} kr`;
              paymentTone = "text-zinc-200";
            } else if (p.isTerminal) {
              paymentLine = `Betales i arena · ${p.remaining.toLocaleString("nb-NO")} kr`;
              paymentTone = "text-zinc-200";
            } else {
              paymentLine = `Gjenstår · ${p.remaining.toLocaleString("nb-NO")} kr`;
              paymentTone = "text-amber-300";
            }

            const expTitle = experiencesMap[booking.experienceId] || booking.experienceId;
            const weekday = getNorwegianWeekday(booking.date);
            const shortDate = formatDateShort(booking.date);
            const timeRange = getBookingTimeRange(booking.time, booking.duration);
            const isSelected = inspectedBookingId === booking.id;

            return (
              <div
                key={booking.id}
                role="button"
                tabIndex={0}
                onClick={() => setInspectedBookingId(booking.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setInspectedBookingId(booking.id);
                  }
                }}
                className={`group w-full text-left px-4 sm:px-5 py-4 transition-colors cursor-pointer flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5 ${
                  isSelected
                    ? "bg-white/[0.07]"
                    : isExpired
                    ? "bg-red-950/10 hover:bg-red-950/20"
                    : "hover:bg-white/[0.035]"
                }`}
              >
                {/* 1. Date & Time Block */}
                <div className="lg:w-44 shrink-0 flex lg:flex-col items-baseline lg:items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-zinc-400 font-medium">
                      {weekday} · <span className="tabular-nums">{shortDate}</span>
                    </div>
                    <div className="text-base font-semibold text-white tabular-nums mt-0.5">
                      {timeRange}
                      <span className="text-xs font-normal text-zinc-400 ml-1.5">
                        ({booking.duration || 90}m)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Experience + Customer + Inline Player Copy Buttons */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <span className="text-sm sm:text-base font-semibold text-white group-hover:text-[#c48fff] transition-colors">
                      {expTitle}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {booking.players} {booking.players === 1 ? "spiller" : "spillere"}
                    </span>
                    {booking.bookingType === "corporate" && booking.companyName && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-300">
                        Bedrift
                      </span>
                    )}
                    {booking.status === "pending" && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                        Venter
                      </span>
                    )}
                    {booking.status === "cancelled" && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-500/15 text-red-300">
                        Avbestilt
                      </span>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm text-zinc-200 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-medium">
                      {booking.companyName
                        ? `${booking.companyName} (${booking.firstName} ${booking.lastName})`
                        : `${booking.firstName} ${booking.lastName}`}
                    </span>
                    {!isSystem && booking.phone && (
                      <span className="text-xs text-zinc-400 tabular-nums">· {booking.phone}</span>
                    )}
                    {!isSystem && booking.email && (
                      <span className="text-xs text-zinc-400 hidden sm:inline">· {booking.email}</span>
                    )}
                  </div>

                  {/* Quick Arena Name Copy Strip (preserved 1-tap workflow without heavy borders) */}
                  {validNames.length > 0 ? (
                    <div
                      className="flex flex-wrap items-center gap-1 pt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleCopyPlayerNames(booking.id, validNames)}
                        title="Kopier alle navn i JSON-format"
                        className="apple-press inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 mr-1"
                      >
                        {copiedBookingId === booking.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Kopiert</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-zinc-400" />
                            <span>Kopier alle</span>
                          </>
                        )}
                      </button>
                      {hasPartialNames && (
                        <span className="text-[11px] font-medium text-amber-300 mr-1">
                          ({validNames.length}/{booking.players})
                        </span>
                      )}
                      {validNames.map((rawName, idx) => {
                        const cleanName = rawName.trim();
                        const key = `${booking.id}-${idx}`;
                        const isCopied = copiedNameKey === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleCopySingleName(key, cleanName)}
                            title={`Klikk for å kopiere «${cleanName}»`}
                            className={`apple-press inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                              isCopied
                                ? "bg-emerald-500/20 text-emerald-200 font-medium"
                                : "bg-white/[0.05] hover:bg-white/[0.12] text-zinc-200"
                            }`}
                          >
                            <span>{cleanName}</span>
                            {isCopied && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : missingNames ? (
                    <div className="text-[11px] font-medium text-amber-300 pt-0.5">
                      Mangler navn (0/{booking.players})
                      {booking.reminderCount > 0 ? ` · ${booking.reminderCount}x purret` : ""}
                    </div>
                  ) : null}

                  {booking.internalNotes && (
                    <p className="text-xs text-zinc-400 truncate max-w-2xl pt-0.5">
                      Notat: <span className="text-zinc-300">{booking.internalNotes}</span>
                    </p>
                  )}
                </div>

                {/* 3. Right Summary + Inspector Arrow */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-1.5 shrink-0 pt-1 lg:pt-0 border-t border-white/[0.05] lg:border-t-0">
                  <div className={`text-xs sm:text-sm font-medium tabular-nums ${paymentTone}`}>
                    {paymentLine}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    {booking.discountCode && (
                      <span className="font-mono text-zinc-400">{booking.discountCode}</span>
                    )}
                    <span className="inline-flex items-center gap-0.5 text-zinc-400 group-hover:text-white transition-colors">
                      <span>Detaljer</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );

  const navGroups: Array<{
    title: string;
    items: Array<{
      id: AdminTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: number;
      onSelect?: () => void;
    }>;
  }> = [
    {
      title: "Daglig drift",
      items: [
        {
          id: "upcoming",
          label: "Kommende",
          icon: Clock4,
          onSelect: () => {
            setActiveTab("upcoming");
            setSortConfig({ key: "dateTime", direction: "asc" });
          },
        },
        { id: "manual", label: "Ny booking", icon: Plus },
        {
          id: "inquiries",
          label: "Forespørsler",
          icon: MailQuestion,
          badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
        },
        {
          id: "archive",
          label: "Arkiv",
          icon: ListOrdered,
          onSelect: () => {
            setActiveTab("archive");
            setSortConfig({ key: "dateTime", direction: "desc" });
          },
        },
      ],
    },
    {
      title: "Økonomi",
      items: [
        { id: "transactions", label: "Regnskap", icon: Wallet },
        { id: "giftcards", label: "Gavekort", icon: Gift },
      ],
    },
    {
      title: "Arena & Team",
      items: [
        { id: "experiences", label: "Spill", icon: Gamepad2 },
        { id: "clients", label: "Kunder", icon: Building2 },
        { id: "shifts", label: "Vakter", icon: CalendarIcon },
        { id: "employees", label: "Ansatte", icon: Users },
        { id: "settings", label: "Innstillinger", icon: Settings },
      ],
    },
  ];

  const tabTitles: Record<AdminTab, string> = {
    upcoming: "Kommende bookinger",
    archive: "Arkiv",
    inquiries: "Forespørsler & Arrangementer",
    manual: "Manuell booking",
    experiences: "Spill & Opplevelser",
    clients: "Bedriftskunder, Logoer & Omtaler",
    transactions: "Regnskap",
    giftcards: "Gavekort",
    shifts: "Vakter & Timeføring",
    employees: "Ansatte",
    settings: "Innstillinger",
  };

  const todayStrForReview = (() => {
    const now = new Date(currentTime);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
  })();

  const inspectedEligibleForReview =
    !!inspectedBooking &&
    inspectedBooking.status !== "cancelled" &&
    inspectedBooking.bookingType !== "system" &&
    !inspectedBooking.email?.includes("system@sperret") &&
    inspectedBooking.date <= todayStrForReview;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col xl:flex-row">
      {/* Desktop Left Sidebar (Apple Finder / Mail pattern) */}
      <aside className="hidden xl:flex flex-col w-60 shrink-0 border-r border-white/[0.08] bg-[#0b0b0d] sticky top-0 h-screen px-3 py-5 justify-between">
        <div className="space-y-6 overflow-y-auto pr-1">
          <div className="px-2.5">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
              KRS VR Arena
            </div>
            <div className="apple-display text-lg font-semibold text-white mt-0.5">
              Kontrollpanel
            </div>
          </div>

          <nav aria-label="Admin navigasjon" className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.onSelect) item.onSelect();
                        else setActiveTab(item.id);
                      }}
                      className={`apple-press w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? "bg-white/[0.11] text-white"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? "text-[#9C39FF]" : "text-zinc-400"}`} />
                        <span>{item.label}</span>
                      </span>
                      {item.badge !== undefined && (
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 tabular-nums">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="space-y-1 pt-1 border-t border-white/[0.06]">
              <Link
                href="/admin/newsletter"
                className="apple-press w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-zinc-400" />
                  <span>Nyhetsbrev</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
            </div>
          </nav>
        </div>

        <div className="pt-3 border-t border-white/[0.08] space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="apple-press w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05]"
          >
            <Bell className="w-4 h-4 text-[#9C39FF]" />
            <span>Push-varsler</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="apple-press w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Logg ut</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col pb-24 xl:pb-16">
        {/* Sticky Translucent Mobile/Tablet Chrome + Desktop Header */}
        <header className="apple-chrome sticky top-0 z-30 border-b border-white/[0.08] px-4 sm:px-6 xl:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="xl:hidden text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
              KRS VR Arena
            </div>
            <h1 className="apple-display text-xl sm:text-2xl font-semibold text-white truncate">
              {tabTitles[activeTab]}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(activeTab === "upcoming" || activeTab === "archive") && (
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className="apple-press hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ny booking</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              aria-label="Push-varsler innstillinger"
              className="apple-press xl:hidden p-2 rounded-full bg-white/[0.07] text-zinc-200 hover:bg-white/[0.12]"
            >
              <Bell className="w-4 h-4 text-[#9C39FF]" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Åpne meny"
              className="apple-press xl:hidden p-2 rounded-full bg-white/[0.07] text-zinc-200 hover:bg-white/[0.12]"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 xl:px-8 pt-6 space-y-6">
          {(activeTab === "upcoming" || activeTab === "archive") && (
            <div className="space-y-5">
              {/* Calm Search & Filter Bar */}
              <div className="apple-surface rounded-2xl p-3 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Søk navn, bedrift, e-post, tlf, kode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/50 border border-white/[0.07] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 bg-black/50 border border-white/[0.07] rounded-xl px-3 py-1.5 text-sm text-white focus-within:border-[#9C39FF]">
                    <span className="text-xs text-zinc-400 shrink-0">Dato</span>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm text-white focus:outline-none min-w-0"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleSort("dateTime")}
                    className="apple-press inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/50 border border-white/[0.07] text-xs font-medium text-zinc-300 hover:text-white"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Tid {sortConfig.key === "dateTime" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}</span>
                  </button>

                  {activeTab === "archive" && (
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-black/50 border border-white/[0.07] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#9C39FF]"
                    >
                      <option value="all">Alle statuser</option>
                      <option value="pending">Venter</option>
                      <option value="confirmed">Bekreftet</option>
                      <option value="cancelled">Avbestilt</option>
                    </select>
                  )}

                  {(searchQuery || dateFilter || (activeTab === "archive" && statusFilter !== "all")) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setDateFilter("");
                        setStatusFilter("all");
                      }}
                      className="apple-press text-xs font-medium text-zinc-300 hover:text-white px-2.5 py-2 bg-white/[0.07] rounded-xl"
                    >
                      Nullstill
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                if (activeTab === "archive") {
                  return renderBookingRows(filteredAndSortedBookings);
                }

                const now = new Date(currentTime);
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
                  2,
                  "0"
                )}-${String(now.getDate()).padStart(2, "0")}`;

                const tomorrow = new Date(currentTime);
                tomorrow.setDate(now.getDate() + 1);
                const tomorrowStr = `${tomorrow.getFullYear()}-${String(
                  tomorrow.getMonth() + 1
                ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

                const todayBookings = filteredAndSortedBookings.filter((b) => b.date === todayStr);
                const tomorrowBookings = filteredAndSortedBookings.filter((b) => b.date === tomorrowStr);
                const upcomingBookings = filteredAndSortedBookings.filter((b) => b.date > tomorrowStr);

                return (
                  <div className="space-y-6">
                    {todayBookings.length === 0 && tomorrowBookings.length === 0 ? (
                      <div className="apple-surface rounded-2xl px-4 py-3 text-sm text-zinc-400">
                        Ingen bookinger i dag eller i morgen.
                      </div>
                    ) : (
                      <>
                        {todayBookings.length > 0 ? (
                          renderBookingRows(todayBookings, "I dag")
                        ) : (
                          <div className="apple-surface rounded-2xl px-4 py-2.5 text-xs text-zinc-400">
                            <span className="font-medium text-zinc-200">I dag:</span> Ingen bookinger.
                          </div>
                        )}
                        {tomorrowBookings.length > 0 ? (
                          renderBookingRows(tomorrowBookings, "I morgen")
                        ) : (
                          <div className="apple-surface rounded-2xl px-4 py-2.5 text-xs text-zinc-400">
                            <span className="font-medium text-zinc-200">I morgen:</span> Ingen bookinger.
                          </div>
                        )}
                      </>
                    )}
                    {renderBookingRows(upcomingBookings, "Kommende")}
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
        </main>
      </div>

      {/* Mobile Translucent Bottom Tab Bar (Apple iOS pattern) */}
      <nav
        aria-label="Mobil navigasjon"
        className="xl:hidden fixed bottom-0 inset-x-0 z-30 apple-chrome border-t border-white/[0.09] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around"
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab("upcoming");
            setSortConfig({ key: "dateTime", direction: "asc" });
          }}
          className={`apple-press flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-medium ${
            activeTab === "upcoming" ? "text-[#c48fff]" : "text-zinc-400"
          }`}
        >
          <Clock4 className="w-5 h-5" />
          <span>Kommende</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`apple-press flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-medium ${
            activeTab === "manual" ? "text-[#c48fff]" : "text-zinc-400"
          }`}
        >
          <Plus className="w-5 h-5" />
          <span>Booking</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inquiries")}
          className={`relative apple-press flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-medium ${
            activeTab === "inquiries" ? "text-[#c48fff]" : "text-zinc-400"
          }`}
        >
          <MailQuestion className="w-5 h-5" />
          <span>Forespørsler</span>
          {newInquiriesCount > 0 && (
            <span className="absolute top-0.5 right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center tabular-nums">
              {newInquiriesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="apple-press flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-medium text-zinc-400"
        >
          <Menu className="w-5 h-5" />
          <span>Meny</span>
        </button>
      </nav>

      {/* Mobile Full Navigation Spring Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="xl:hidden fixed inset-0 z-50 flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            />
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 56 }}
              transition={{ type: "spring", bounce: 0, duration: 0.32 }}
              className="relative z-10 w-full max-h-[85vh] bg-[#141417] border-t border-white/10 rounded-t-3xl p-5 overflow-y-auto space-y-5"
            >
              <div className="flex items-center justify-between">
                <span className="apple-display text-lg font-semibold text-white">Alle seksjoner</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Lukk meny"
                  className="apple-press p-2 rounded-full bg-white/[0.08] text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
                    {group.title}
                  </div>
                  <div className="apple-surface-raised rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (item.onSelect) item.onSelect();
                            else setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`apple-press w-full flex items-center justify-between px-4 py-3 text-sm font-medium ${
                            active ? "text-[#c48fff] bg-white/[0.05]" : "text-zinc-200"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-zinc-400" />
                            <span>{item.label}</span>
                          </span>
                          {item.badge !== undefined ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                              {item.badge}
                            </span>
                          ) : (
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="apple-surface-raised rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
                <Link
                  href="/admin/newsletter"
                  onClick={() => setMobileMenuOpen(false)}
                  className="apple-press w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-200"
                >
                  <span className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-zinc-400" />
                    <span>Nyhetsbrev</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="apple-press w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logg ut</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apple Slide-in Booking Inspector / Draggable Mobile Sheet */}
      <BookingInspectorSheet
        booking={inspectedBooking}
        experienceName={
          inspectedBooking
            ? experiencesMap[inspectedBooking.experienceId] || inspectedBooking.experienceId
            : ""
        }
        weekday={inspectedBooking ? getNorwegianWeekday(inspectedBooking.date) : ""}
        formattedDate={inspectedBooking ? formatDateShort(inspectedBooking.date) : ""}
        timeRange={
          inspectedBooking ? getBookingTimeRange(inspectedBooking.time, inspectedBooking.duration) : ""
        }
        isEligibleForReview={inspectedEligibleForReview}
        resendingEmail={!!inspectedBooking && resendingEmailId === inspectedBooking.id}
        copiedAll={!!inspectedBooking && copiedBookingId === inspectedBooking.id}
        copiedNameKey={copiedNameKey}
        onClose={() => setInspectedBookingId(null)}
        onEditFull={(b) => setEditingBooking(b)}
        onCopyAllNames={handleCopyPlayerNames}
        onCopySingleName={handleCopySingleName}
        onCopyText={handleCopyPlainText}
        onResendConfirmation={handleResendConfirmation}
        onOpenReviewModal={(b) => setReviewModalBooking(b)}
        onExtendDuration={extendBooking}
        onReduceDuration={reduceBooking}
        onUpdateStatus={updateBookingStatus}
        onSaveNote={handleSaveNote}
        onMarkTerminalPaid={handleMarkTerminalPaid}
        onOpenRedeemGiftCard={(b) => setRedeemGiftCardBooking(b)}
        onVippsAction={handleVippsAction}
        onDeleteBooking={deleteBooking}
      />

      {/* Full Edit Booking Modal */}
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
