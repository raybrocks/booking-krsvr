"use client";

import React, { useState, useEffect } from "react";
import { 
  Loader2, 
  Search, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  Building2, 
  Users, 
  Utensils, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles,
  RefreshCw,
  Tag,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export interface ContactInquiryItem {
  id: string;
  formType: "arrangement" | "annet" | string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  groupType?: string | null;
  companyName?: string | null;
  eventType?: string | null;
  packageType?: string | null;
  peopleCount?: string | null;
  date?: string | null;
  altDate?: string | null;
  time?: string | null;
  food?: string | null;
  status: "new" | "contacted" | "booked" | "rejected" | string;
  internalNotes?: string | null;
  bookingId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InquiriesManagerProps {
  onCreateBooking?: (inquiry: ContactInquiryItem) => void;
  onInquiriesUpdated?: () => void;
}

export default function InquiriesManager({ onCreateBooking, onInquiriesUpdated }: InquiriesManagerProps) {
  const [inquiries, setInquiries] = useState<ContactInquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Note editing modal or inline
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const fetchInquiries = React.useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/inquiries?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
        if (onInquiriesUpdated) onInquiriesUpdated();
      } else {
        toast.error("Kunne ikke laste henvendelser");
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      toast.error("Nettverksfeil ved henting av henvendelser");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [onInquiriesUpdated]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        toast.success(`Status endret til ${getStatusLabel(newStatus)}`);
        if (onInquiriesUpdated) onInquiriesUpdated();
      } else {
        toast.error("Kunne ikke oppdatere status");
      }
    } catch (err) {
      toast.error("Feil ved oppdatering av status");
    }
  };

  const handleSaveNote = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: noteDraft }),
      });
      if (res.ok) {
        setInquiries(prev => prev.map(item => item.id === id ? { ...item, internalNotes: noteDraft } : item));
        setEditingNoteId(null);
        toast.success("Notat lagret");
      } else {
        toast.error("Kunne ikke lagre notat");
      }
    } catch (err) {
      toast.error("Feil ved lagring av notat");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Er du sikker på at du vil slette denne henvendelsen?")) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setInquiries(prev => prev.filter(item => item.id !== id));
        toast.success("Henvendelse slettet");
        if (onInquiriesUpdated) onInquiriesUpdated();
      } else {
        toast.error("Kunne ikke slette henvendelse");
      }
    } catch (err) {
      toast.error("Feil ved sletting");
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "Ny";
      case "contacted": return "Kontaktet";
      case "booked": return "Booket";
      case "rejected": return "Avslått";
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Ny</span>;
      case "contacted":
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 shadow-sm">Kontaktet</span>;
      case "booked":
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 shadow-sm"><CheckCircle2 className="w-3.5 h-3.5" /> Booket</span>;
      case "rejected":
        return <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5 shadow-sm">Avslått</span>;
      default:
        return <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-md font-semibold">{status}</span>;
    }
  };

  const formatDateShort = (dateStr: string | null | undefined) => {
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

  const isDatePassed = (dateStr: string | null | undefined) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split("T")[0];
    return dateStr < today;
  };

  // Filter items
  const filteredInquiries = inquiries.filter(item => {
    // Search
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      item.name?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q) ||
      item.companyName?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q) ||
      item.eventType?.toLowerCase().includes(q)
    );

    // Status
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    // Type
    const matchesType = typeFilter === "all" || item.formType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Split into active and archive
  const activeInquiries = filteredInquiries.filter(item => {
    // If date passed or status is rejected/booked, belongs to archive unless explicitly filtering
    if (statusFilter !== "all" || typeFilter !== "all" || searchQuery) {
      return true; // when filtering, show all matches in main list
    }
    const passed = isDatePassed(item.date);
    return !passed && item.status !== "rejected";
  });

  const archiveInquiries = filteredInquiries.filter(item => {
    if (statusFilter !== "all" || typeFilter !== "all" || searchQuery) {
      return false; // already shown above
    }
    const passed = isDatePassed(item.date);
    return passed || item.status === "rejected";
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  const renderInquiryCard = (item: ContactInquiryItem) => {
    const isArrangement = item.formType === "arrangement";

    return (
      <div 
        key={item.id} 
        className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-5 md:p-6 transition-all shadow-sm space-y-4"
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white">
                {item.companyName ? `${item.companyName} (${item.name})` : item.name}
              </h3>
              {item.groupType === "bedrift" || item.companyName ? (
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold px-2 py-0.5 rounded uppercase">
                  Bedrift
                </span>
              ) : null}
              <span className="bg-zinc-800 text-zinc-400 text-[11px] px-2 py-0.5 rounded">
                {isArrangement ? "Arrangement" : "Generell"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                {item.email}
              </a>
              {item.phone && (
                <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  {item.phone}
                </a>
              )}
              <span className="text-zinc-500">
                Mottatt: {new Intl.DateTimeFormat("no-NO", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt))}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(item.status)}
            <select
              value={item.status}
              onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-[#9C39FF] cursor-pointer"
            >
              <option value="new">Ny</option>
              <option value="contacted">Kontaktet</option>
              <option value="booked">Booket</option>
              <option value="rejected">Avslått</option>
            </select>
          </div>
        </div>

        {/* Arrangement details grid (if arrangement) */}
        {isArrangement && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/60 text-xs">
            <div>
              <span className="text-zinc-500 block mb-0.5">Type arrangement:</span>
              <span className="font-medium text-zinc-200">{item.eventType || "Ikke oppgitt"}</span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Antall personer:</span>
              <span className="font-medium text-zinc-200 flex items-center gap-1">
                <Users className="w-3 h-3 text-zinc-500" />
                {item.peopleCount ? `${item.peopleCount} pers` : "Ikke oppgitt"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Ønsket dato:</span>
              <span className="font-medium text-zinc-200 font-mono flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-500" />
                {formatDateShort(item.date) || "Ikke oppgitt"}
                {item.time && ` kl. ${item.time}`}
              </span>
              {item.altDate && (
                <span className="text-[10px] text-zinc-400 block font-mono mt-0.5">
                  Alt: {formatDateShort(item.altDate)}
                </span>
              )}
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Ønsket opplegg/Pakke:</span>
              <span className="font-medium text-zinc-200">{item.packageType || "Standard"}</span>
              {item.food && (
                <span className="text-[10px] text-amber-300 flex items-center gap-1 mt-0.5">
                  <Utensils className="w-2.5 h-2.5" /> {item.food}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Customer Message */}
        <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-3.5">
          <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Melding fra kunden:
          </div>
          <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {item.message}
          </p>
        </div>

        {/* Internal notes */}
        <div className="pt-1">
          {editingNoteId === item.id ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Skriv internt notat..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-[#9C39FF]"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveNote(item.id)}
                  className="px-3 py-1 bg-[#9C39FF] text-white text-xs font-medium rounded hover:bg-[#8A2BE2] transition-colors"
                >
                  Lagre notat
                </button>
                <button
                  onClick={() => setEditingNoteId(null)}
                  className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-medium rounded hover:text-white transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <div 
                className="text-zinc-400 cursor-pointer hover:text-zinc-200 flex items-center gap-1.5"
                onClick={() => {
                  setEditingNoteId(item.id);
                  setNoteDraft(item.internalNotes || "");
                }}
              >
                <Tag className="w-3 h-3 text-zinc-500" />
                {item.internalNotes ? (
                  <span className="italic text-zinc-300">Notat: {item.internalNotes}</span>
                ) : (
                  <span className="text-zinc-500 underline decoration-dotted">+ Legg til internt notat</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center gap-2">
            {onCreateBooking && item.status !== "booked" && (
              <button
                onClick={() => onCreateBooking(item)}
                className="px-4 py-2 bg-[#9C39FF] hover:bg-[#8A2BE2] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#9C39FF]/20"
                title="Åpne manuell booking forhåndsutfylt med denne kundens data"
              >
                <Plus className="w-3.5 h-3.5" />
                Opprett booking
              </button>
            )}

            {item.status === "booked" && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Booking er opprettet {item.bookingId ? `(#${item.bookingId.substring(0, 8)})` : ""}
              </span>
            )}
          </div>

          <button
            onClick={() => handleDelete(item.id)}
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-auto"
            title="Slett henvendelse"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top filter toolbar */}
      <div className="flex flex-col md:flex-row gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 w-full">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Søk i henvendelser (navn, e-post, bedrift, type)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full box-border bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
          >
            <option value="all">Alle statuser</option>
            <option value="new">Kun Nye</option>
            <option value="contacted">Kontaktet</option>
            <option value="booked">Booket</option>
            <option value="rejected">Avslått</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
          >
            <option value="all">Alle typer</option>
            <option value="arrangement">Arrangement / Gruppe</option>
            <option value="annet">Generell henvendelse</option>
          </select>

          <button
            onClick={() => fetchInquiries(true)}
            disabled={refreshing}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            title="Oppdater henvendelser"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#9C39FF]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main active inquiries list */}
      <div className="space-y-4">
        {activeInquiries.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10 text-center text-zinc-500">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "Ingen henvendelser matchet søket/filteret."
              : "Ingen aktive henvendelser å behandle akkurat nå."}
          </div>
        ) : (
          activeInquiries.map(renderInquiryCard)
        )}
      </div>

      {/* Archive Accordion (for passed dates & completed/rejected) */}
      {statusFilter === "all" && typeFilter === "all" && !searchQuery && archiveInquiries.length > 0 && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/30 mt-8">
          <button
            onClick={() => setArchiveOpen(prev => !prev)}
            className="w-full flex items-center justify-between p-4 sm:p-5 bg-zinc-900/60 hover:bg-zinc-800/40 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-semibold text-zinc-300">
                Arkiv (Passerte datoer / Fullførte henvendelser)
              </h3>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium">
                {archiveInquiries.length}
              </span>
            </div>
            {archiveOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
          </button>

          {archiveOpen && (
            <div className="p-4 sm:p-5 space-y-4 border-t border-zinc-800/60 bg-zinc-950/40">
              {archiveInquiries.map(renderInquiryCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
