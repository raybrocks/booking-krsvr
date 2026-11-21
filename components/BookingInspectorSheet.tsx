"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, PanInfo } from "motion/react";
import {
  X,
  Pencil,
  Mail,
  Phone,
  Copy,
  Check,
  Star,
  Gift,
  Trash2,
  XCircle,
  Loader2,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";
import { getBookingPaymentBreakdown, getPaymentDisplayFlags } from "@/lib/booking-utils";

interface BookingInspectorSheetProps {
  booking: any | null;
  experienceName: string;
  weekday: string;
  formattedDate: string;
  timeRange: string;
  isEligibleForReview: boolean;
  resendingEmail: boolean;
  copiedAll: boolean;
  copiedNameKey: string | null;
  onClose: () => void;
  onEditFull: (booking: any) => void;
  onCopyAllNames: (bookingId: string, names: string[]) => void;
  onCopySingleName: (key: string, name: string) => void;
  onCopyText: (label: string, text: string) => void;
  onResendConfirmation: (booking: any) => void;
  onOpenReviewModal: (booking: any) => void;
  onExtendDuration: (id: string) => Promise<void>;
  onReduceDuration: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, newStatus: string) => Promise<void>;
  onSaveNote: (id: string, note: string) => Promise<boolean>;
  onMarkTerminalPaid: (id: string) => Promise<void>;
  onOpenRedeemGiftCard: (booking: any) => void;
  onVippsAction: (bookingId: string, action: "capture" | "cancel" | "refund", amount?: number) => Promise<void>;
  onDeleteBooking: (id: string) => Promise<void>;
}

export default function BookingInspectorSheet(props: BookingInspectorSheetProps) {
  return (
    <AnimatePresence>
      {props.booking && (
        <BookingInspectorContent
          key={props.booking.id}
          {...props}
          booking={props.booking}
        />
      )}
    </AnimatePresence>
  );
}

function BookingInspectorContent({
  booking,
  experienceName,
  weekday,
  formattedDate,
  timeRange,
  isEligibleForReview,
  resendingEmail,
  copiedAll,
  copiedNameKey,
  onClose,
  onEditFull,
  onCopyAllNames,
  onCopySingleName,
  onCopyText,
  onResendConfirmation,
  onOpenReviewModal,
  onExtendDuration,
  onReduceDuration,
  onUpdateStatus,
  onSaveNote,
  onMarkTerminalPaid,
  onOpenRedeemGiftCard,
  onVippsAction,
  onDeleteBooking,
}: Omit<BookingInspectorSheetProps, "booking"> & { booking: any }) {
  const shouldReduceMotion = useReducedMotion();
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const breakdown = getBookingPaymentBreakdown(booking);
  const [confirmAction, setConfirmAction] = useState<null | "terminal" | "resend" | "cancel" | "delete" | "refund">(null);
  const [refundAmountInput, setRefundAmountInput] = useState(() => String(breakdown.vippsPaid || booking.totalPrice || 0));
  const [noteDraft, setNoteDraft] = useState(() => booking.internalNotes || "");
  const [savingNote, setSavingNote] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleMobileDragEnd = (_: any, info: PanInfo) => {
    if (info.velocity.y > 420 || info.offset.y > 110) {
      onClose();
    }
  };
  const {
    totalPrice,
    netRevenue,
    paidGiftCardUsed,
    goodwillGiftCardUsed,
    giftCardUsed,
    vippsPaid,
    terminalPaid,
    remaining,
    status,
    isTerminal,
    isPending,
    isRefunded,
  } = breakdown;

  const {
    isAuthorizedUncaptured,
    isCancelledUnpaid,
    isFree,
    isFullySettled,
  } = getPaymentDisplayFlags(breakdown, booking.createdAt);

  const isSystem = booking.bookingType === "system" || booking.email?.includes("system@sperret");
  const validNames: string[] = (booking.playerNames || []).filter((n: string) => n && n.trim() !== "");
  const canCaptureOrCancel = isAuthorizedUncaptured;
  const canRefund =
    ["vipps", "reservation", "full"].includes(booking.paymentType) &&
    vippsPaid > 0 &&
    status === "CAPTURED" &&
    !isPending;
  const canMarkTerminalPaid = isTerminal && remaining > 0 && booking.status !== "cancelled";

  let paymentHeadline = `Gjenstår: ${remaining.toLocaleString("nb-NO")} kr`;
  let paymentAccentClass = "text-amber-300";
  if (isRefunded) {
    paymentHeadline = "Refundert via Vipps";
    paymentAccentClass = "text-zinc-300";
  } else if (isCancelledUnpaid) {
    paymentHeadline = "Avbrutt / Ikke betalt";
    paymentAccentClass = "text-zinc-400";
  } else if (isAuthorizedUncaptured) {
    paymentHeadline = "Reservert i Vipps (må trekkes)";
    paymentAccentClass = "text-amber-300";
  } else if (isPending) {
    paymentHeadline = "Venter på betaling fra kunde";
    paymentAccentClass = "text-amber-300";
  } else if (isFree) {
    paymentHeadline = "0 kr";
    paymentAccentClass = "text-zinc-400";
  } else if (isFullySettled) {
    if (giftCardUsed > 0 && terminalPaid > 0) paymentHeadline = "Oppgjort (Gavekort + Terminal)";
    else if (giftCardUsed > 0 && vippsPaid > 0) paymentHeadline = "Oppgjort (Gavekort + Webshop)";
    else if (giftCardUsed >= totalPrice) paymentHeadline = "Betalt med gavekort";
    else if (isTerminal) paymentHeadline = "Oppgjort (Kortterminal)";
    else paymentHeadline = "Forhåndsbetalt (Webshop)";
    paymentAccentClass = "text-white";
  } else if (isTerminal) {
    paymentHeadline = `Betales i arena · ${remaining.toLocaleString("nb-NO")} kr`;
    paymentAccentClass = "text-zinc-200";
  }

  const noteDirty = noteDraft.trim() !== (booking.internalNotes || "").trim();

  const handleSaveNoteSubmit = async () => {
    setSavingNote(true);
    await onSaveNote(booking.id, noteDraft.trim());
    setSavingNote(false);
  };

  const hasSentReview = !!booking.reviewEmailSentAt;
  const reviewPlatformLabel =
    booking.reviewEmailType === "tripadvisor"
      ? "TripAdvisor"
      : booking.reviewEmailType === "google"
      ? "Google"
      : "Begge";

  return (
        <div className="fixed inset-0 z-50 flex justify-end items-end md:items-stretch">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          {/* Inspector Drawer (desktop right) / Bottom Sheet (mobile) */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Bookingdetaljer for ${booking.firstName} ${booking.lastName}`}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : isMobileViewport
                ? { opacity: 0, y: 48 }
                : { opacity: 0, x: 48 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, x: 0, y: 0 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : isMobileViewport
                ? { opacity: 0, y: 48 }
                : { opacity: 0, x: 48 }
            }
            transition={{ type: "spring", bounce: 0, duration: 0.34 }}
            drag={!shouldReduceMotion && isMobileViewport ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.45 }}
            onDragEnd={isMobileViewport ? handleMobileDragEnd : undefined}
            className="relative z-10 w-full md:w-[460px] md:h-full max-h-[90vh] md:max-h-full bg-[#111114] border-t md:border-t-0 md:border-l border-white/10 rounded-t-3xl md:rounded-none shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Mobile Drag Grabber */}
            <div className="md:hidden flex justify-center pt-2.5 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Translucent Sticky Header */}
            <div className="apple-chrome px-5 py-4 border-b border-white/[0.08] flex items-start justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="text-xs font-medium text-zinc-400 tabular-nums">
                  {weekday} · {formattedDate} · <span className="text-zinc-200">{timeRange}</span>
                </div>
                <h2 className="apple-display text-xl font-semibold text-white mt-0.5 truncate">
                  {experienceName}
                </h2>
                <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                  <span>{booking.players} {booking.players === 1 ? "spiller" : "spillere"}</span>
                  <span>·</span>
                  <span className="tabular-nums">{booking.duration || 90} min</span>
                  <span>·</span>
                  <span className="font-mono text-zinc-500">#{booking.id.substring(0, 8)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Lukk detaljer"
                className="apple-press p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-zinc-300 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 text-sm">
              {/* Quick Toolbar: Status Segmented + Duration + Full Edit */}
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-400">Bookingstatus</span>
                  {booking.status !== "cancelled" && (
                    <div className="inline-flex items-center gap-1 bg-white/[0.05] rounded-lg p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => onReduceDuration(booking.id)}
                        disabled={!booking.duration || booking.duration <= 90}
                        title="Trekk fra 90 minutter"
                        className="apple-press px-2 py-1 rounded-md text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none inline-flex items-center gap-1"
                      >
                        <Minus className="w-3 h-3" /> 90m
                      </button>
                      <span className="px-1.5 text-zinc-400 tabular-nums">{booking.duration || 90}m</span>
                      <button
                        type="button"
                        onClick={() => onExtendDuration(booking.id)}
                        title="Legg til 90 minutter"
                        className="apple-press px-2 py-1 rounded-md text-zinc-300 hover:bg-white/10 inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> 90m
                      </button>
                    </div>
                  )}
                </div>

                {/* Apple Segmented Control for Status */}
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/[0.05]">
                  {[
                    { value: "pending", label: "Venter" },
                    { value: "confirmed", label: "Bekreftet" },
                    { value: "cancelled", label: "Avbestilt" },
                  ].map((opt) => {
                    const active = booking.status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onUpdateStatus(booking.id, opt.value)}
                        className={`apple-press py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          active
                            ? opt.value === "cancelled"
                              ? "bg-red-500/25 text-red-200"
                              : opt.value === "pending"
                              ? "bg-amber-500/25 text-amber-200"
                              : "bg-white/[0.14] text-white"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => onEditFull(booking)}
                  className="apple-press w-full py-2.5 px-4 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-white text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#9C39FF]" />
                  <span>Rediger spill, tidspunkt, deltakere & pris</span>
                </button>
              </section>

              {/* Player Names Section */}
              {!isSystem && (
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-zinc-400">
                      Navneliste ({validNames.length}/{booking.players})
                    </h3>
                    {validNames.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onCopyAllNames(booking.id, validNames)}
                        className="apple-press inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white/[0.07] hover:bg-white/[0.13] text-zinc-200"
                      >
                        {copiedAll ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Kopiert alle</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Kopier alle</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="apple-surface rounded-2xl p-3.5">
                    {validNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {validNames.map((name, idx) => {
                          const key = `insp-${booking.id}-${idx}`;
                          const isCopied = copiedNameKey === key;
                          const cleanName = name.trim();
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => onCopySingleName(key, cleanName)}
                              title={`Klikk for å kopiere «${cleanName}»`}
                              className={`apple-press inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                                isCopied
                                  ? "bg-emerald-500/20 text-emerald-200"
                                  : "bg-white/[0.07] hover:bg-white/[0.13] text-zinc-100"
                              }`}
                            >
                              <span>{cleanName}</span>
                              {isCopied && <Check className="w-3 h-3 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-300">
                        Ingen spillernavn registrert ennå ({booking.reminderCount > 0 ? `${booking.reminderCount}x purret` : "ikke purret"}).
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* Customer Info & Contact */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-medium text-zinc-400">Kunde & kommunikasjon</h3>
                <div className="apple-surface rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between gap-2">
                    <span className="text-zinc-400 text-xs">Navn</span>
                    <div className="flex items-center gap-2 text-right">
                      {booking.bookingType === "corporate" && booking.companyName && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/[0.08] text-zinc-200">
                          Bedrift
                        </span>
                      )}
                      <span className="text-white font-medium text-xs sm:text-sm">
                        {booking.companyName
                          ? `${booking.companyName} (${booking.firstName} ${booking.lastName})`
                          : `${booking.firstName} ${booking.lastName}`}
                      </span>
                    </div>
                  </div>

                  {!isSystem && booking.email && (
                    <button
                      type="button"
                      onClick={() => onCopyText("E-post", booking.email)}
                      className="apple-press w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-white/[0.03]"
                    >
                      <span className="text-zinc-400 text-xs flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> E-post
                      </span>
                      <span className="text-zinc-200 text-xs sm:text-sm truncate">{booking.email}</span>
                    </button>
                  )}

                  {!isSystem && booking.phone && (
                    <button
                      type="button"
                      onClick={() => onCopyText("Telefon", booking.phone)}
                      className="apple-press w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-white/[0.03]"
                    >
                      <span className="text-zinc-400 text-xs flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Telefon
                      </span>
                      <span className="text-zinc-200 text-xs sm:text-sm tabular-nums">{booking.phone}</span>
                    </button>
                  )}
                </div>

                {!isSystem && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {confirmAction === "resend" ? (
                      <div className="sm:col-span-2 apple-surface rounded-xl p-3 flex items-center justify-between gap-2">
                        <span className="text-xs text-zinc-200 truncate">Sende bekreftelse til {booking.email}?</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setConfirmAction(null)}
                            className="apple-press px-2.5 py-1 rounded-lg bg-white/[0.07] text-xs text-zinc-300"
                          >
                            Avbryt
                          </button>
                          <button
                            type="button"
                            disabled={resendingEmail}
                            onClick={() => {
                              setConfirmAction(null);
                              onResendConfirmation(booking);
                            }}
                            className="apple-press px-3 py-1 rounded-lg bg-[#9C39FF] text-xs font-medium text-white"
                          >
                            Send nå
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={resendingEmail || !booking.email}
                        onClick={() => setConfirmAction("resend")}
                        className="apple-press py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-40"
                      >
                        {resendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5 text-zinc-400" />}
                        <span>Send bekreftelse</span>
                      </button>
                    )}

                    {isEligibleForReview && confirmAction !== "resend" && (
                      <button
                        type="button"
                        onClick={() => onOpenReviewModal(booking)}
                        className="apple-press py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <Star className={`w-3.5 h-3.5 ${hasSentReview ? "fill-emerald-400 text-emerald-400" : "text-zinc-400"}`} />
                        <span>{hasSentReview ? `Omtale sendt (${reviewPlatformLabel})` : "Be om omtale"}</span>
                      </button>
                    )}
                  </div>
                )}
              </section>

              {/* Payment & Settlement */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-medium text-zinc-400">Betaling & oppgjør</h3>
                <div className="apple-surface rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-400">Status</span>
                    <span className={`text-xs font-semibold ${paymentAccentClass}`}>{paymentHeadline}</span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Totalt</span>
                    <span className="text-white font-medium tabular-nums">
                      {totalPrice.toLocaleString("nb-NO")} NOK
                      {goodwillGiftCardUsed > 0 && (
                        <span className="text-zinc-400 font-normal"> (oms. {netRevenue} NOK)</span>
                      )}
                    </span>
                  </div>
                  {vippsPaid > 0 && (
                    <div className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Forhåndsbetalt (Webshop)</span>
                      <span className="text-zinc-100 tabular-nums">{vippsPaid.toLocaleString("nb-NO")} NOK</span>
                    </div>
                  )}
                  {terminalPaid > 0 && (
                    <div className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Kortterminal (arena)</span>
                      <span className="text-zinc-100 tabular-nums">{terminalPaid.toLocaleString("nb-NO")} NOK</span>
                    </div>
                  )}
                  {paidGiftCardUsed > 0 && (
                    <div className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Gavekort innløst</span>
                      <span className="text-zinc-100 tabular-nums">{paidGiftCardUsed.toLocaleString("nb-NO")} NOK</span>
                    </div>
                  )}
                  {goodwillGiftCardUsed > 0 && (
                    <div className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Goodwill-gavekort</span>
                      <span className="text-zinc-300 tabular-nums">{goodwillGiftCardUsed.toLocaleString("nb-NO")} NOK (0 kr oms.)</span>
                    </div>
                  )}
                  {booking.discountCode && (
                    <div className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Rabattkode</span>
                      <span className="font-mono text-zinc-200">{booking.discountCode}</span>
                    </div>
                  )}
                  {booking.giftCardCode && (
                    <div className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Gavekortkode</span>
                      <span className="font-mono text-zinc-200">{booking.giftCardCode}</span>
                    </div>
                  )}
                </div>

                {/* Contextual Payment Actions (Inline confirm/amount — zero window.confirm/prompt) */}
                {canMarkTerminalPaid && (
                  confirmAction === "terminal" ? (
                    <div className="apple-surface-raised rounded-xl p-3 space-y-2.5">
                      <p className="text-xs text-zinc-200">
                        Bekreft at kunden har betalt <strong className="text-white tabular-nums">{remaining} NOK</strong> i arenaens kortterminal:
                      </p>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setConfirmAction(null)}
                          className="apple-press px-3 py-1.5 rounded-lg bg-white/[0.07] text-xs text-zinc-300"
                        >
                          Avbryt
                        </button>
                        <button
                          type="button"
                          disabled={busyAction}
                          onClick={async () => {
                            setBusyAction(true);
                            await onMarkTerminalPaid(booking.id);
                            setBusyAction(false);
                            setConfirmAction(null);
                          }}
                          className="apple-press px-3.5 py-1.5 rounded-lg bg-[#9C39FF] hover:bg-[#8A30E0] text-xs font-semibold text-white inline-flex items-center gap-1.5"
                        >
                          {busyAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Bekreft betalt i terminal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmAction("terminal")}
                      className="apple-press w-full py-2.5 px-4 rounded-xl bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registrer betalt i terminal ({remaining} kr)</span>
                    </button>
                  )
                )}

                <div className="flex flex-wrap gap-2">
                  {remaining > 0 && booking.status !== "cancelled" && !isSystem && (
                    <button
                      type="button"
                      onClick={() => onOpenRedeemGiftCard(booking)}
                      className="apple-press flex-1 py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <Gift className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Trekk gavekort</span>
                    </button>
                  )}

                  {canCaptureOrCancel && (
                    <>
                      <button
                        type="button"
                        onClick={() => onVippsAction(booking.id, "capture", booking.totalPrice)}
                        className="apple-press flex-1 py-2 px-3 rounded-xl bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-xs font-semibold"
                      >
                        Fullfør trekk (Capture)
                      </button>
                      <button
                        type="button"
                        onClick={() => onVippsAction(booking.id, "cancel")}
                        className="apple-press py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-200 text-xs font-medium"
                      >
                        Frigi reservasjon
                      </button>
                    </>
                  )}

                  {canRefund && confirmAction !== "refund" && (
                    <button
                      type="button"
                      onClick={() => setConfirmAction("refund")}
                      className="apple-press flex-1 py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-zinc-200 text-xs font-medium"
                    >
                      Refunder via Vipps
                    </button>
                  )}
                </div>

                {canRefund && confirmAction === "refund" && (
                  <div className="apple-surface-raised rounded-xl p-3.5 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Refusjonsbeløp (NOK)
                      </label>
                      <p className="text-[11px] text-zinc-400 mb-2">
                        Sender automatisk refusjonskvittering til {booking.email}.
                      </p>
                      <input
                        type="number"
                        min="1"
                        max={vippsPaid}
                        step="any"
                        value={refundAmountInput}
                        onChange={(e) => setRefundAmountInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-sm text-white tabular-nums focus:outline-none focus:border-[#9C39FF]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmAction(null)}
                        className="apple-press px-3 py-1.5 rounded-lg bg-white/[0.07] text-xs text-zinc-300"
                      >
                        Avbryt
                      </button>
                      <button
                        type="button"
                        disabled={busyAction || !(Number(refundAmountInput) > 0)}
                        onClick={async () => {
                          const amt = Number(refundAmountInput);
                          if (!(amt > 0)) return;
                          setBusyAction(true);
                          await onVippsAction(booking.id, "refund", amt);
                          setBusyAction(false);
                          setConfirmAction(null);
                        }}
                        className="apple-press px-3.5 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold disabled:opacity-40"
                      >
                        Bekreft refusjon
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Inline Note Editor */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-zinc-400">Internt notat</h3>
                  {noteDirty && (
                    <button
                      type="button"
                      disabled={savingNote}
                      onClick={handleSaveNoteSubmit}
                      className="apple-press px-2.5 py-1 rounded-lg bg-[#9C39FF] text-white text-xs font-medium"
                    >
                      {savingNote ? "Lagrer..." : "Lagre notat"}
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Legg til intern beskjed til spillvert..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#141417] border border-white/[0.07] text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#9C39FF] resize-none"
                />
              </section>

              {/* Destructive Zone */}
              <section className="pt-3 border-t border-white/[0.07] space-y-2">
                {confirmAction === "cancel" ? (
                  <div className="apple-surface-raised rounded-xl p-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-200">Sett booking som avbestilt?</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setConfirmAction(null)}
                        className="apple-press px-2.5 py-1 rounded-lg bg-white/[0.07] text-xs text-zinc-300"
                      >
                        Avbryt
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await onUpdateStatus(booking.id, "cancelled");
                          setConfirmAction(null);
                        }}
                        className="apple-press px-3 py-1 rounded-lg bg-red-500/80 text-white text-xs font-semibold"
                      >
                        Avbestill
                      </button>
                    </div>
                  </div>
                ) : confirmAction === "delete" ? (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3 space-y-2">
                    <p className="text-xs text-red-200">
                      Slette bookingen permanent? Dette kan ikke angres.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmAction(null)}
                        className="apple-press px-3 py-1 rounded-lg bg-white/[0.07] text-xs text-zinc-300"
                      >
                        Avbryt
                      </button>
                      <button
                        type="button"
                        disabled={busyAction}
                        onClick={async () => {
                          setBusyAction(true);
                          await onDeleteBooking(booking.id);
                          setBusyAction(false);
                          setConfirmAction(null);
                          onClose();
                        }}
                        className="apple-press px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                      >
                        Slett permanent
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {booking.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => setConfirmAction("cancel")}
                        className="apple-press flex-1 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-red-500/15 text-zinc-300 hover:text-red-200 text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Avbestill</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmAction("delete")}
                      className="apple-press flex-1 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-red-500/15 text-zinc-400 hover:text-red-200 text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Slett booking</span>
                    </button>
                  </div>
                )}
              </section>
            </div>
          </motion.aside>
        </div>
  );
}
