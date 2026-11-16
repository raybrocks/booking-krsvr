"use client";

import React, { useEffect, useState } from "react";
import { Loader2, ShieldCheck, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export interface StoreSettingsState {
  id: string;
  isVatRegistered: boolean;
  defaultVatRate: number;
  vatThresholdPassedDate?: string | null;
  voucherEmail?: string | null;
  updatedAt?: string;
}

interface VatSettingsControlProps {
  compact?: boolean;
  onUpdated?: (settings: StoreSettingsState) => void;
}

function getTodayOsloIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatNorwegianDate(isoDate?: string | null): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

export default function VatSettingsControl({
  compact = false,
  onUpdated,
}: VatSettingsControlProps) {
  const [storeSettings, setStoreSettings] = useState<StoreSettingsState | null>(null);
  const [thresholdDateInput, setThresholdDateInput] = useState<string>("2026-09-04");
  const [vatRateInput, setVatRateInput] = useState<string>("12");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/settings?t=" + Date.now());
        if (res.ok) {
          const data: StoreSettingsState = await res.json();
          if (active) {
            setStoreSettings(data);
            setThresholdDateInput(data.vatThresholdPassedDate ?? "");
            setVatRateInput(String(data.defaultVatRate ?? 12));
          }
        }
      } catch (err) {
        console.error("Failed to load StoreSettings:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const persistUpdate = async (payload: {
    vatThresholdPassedDate?: string | null;
    defaultVatRate?: number;
  }) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: StoreSettingsState & { error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke oppdatere MVA-innstilling");
      }
      setStoreSettings(data);
      setThresholdDateInput(data.vatThresholdPassedDate ?? "");
      setVatRateInput(String(data.defaultVatRate ?? 12));
      onUpdated?.(data);

      if (payload.vatThresholdPassedDate !== undefined) {
        toast.success(
          data.vatThresholdPassedDate
            ? `MVA-grensedato lagret (${formatNorwegianDate(data.vatThresholdPassedDate)})`
            : "MVA-grensedato nullstilt (0 % MVA aktiv)"
        );
      } else {
        toast.success(`Standard MVA-sats oppdatert til ${data.defaultVatRate} %`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Feil ved lagring av MVA-innstilling");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDate = async () => {
    const trimmed = thresholdDateInput.trim();
    if (trimmed && !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      toast.error("Velg en gyldig dato");
      return;
    }
    await persistUpdate({ vatThresholdPassedDate: trimmed || null });
  };

  const handleClearDate = async () => {
    setThresholdDateInput("");
    await persistUpdate({ vatThresholdPassedDate: null });
  };

  const handleSaveRate = async () => {
    const parsed = parseInt(vatRateInput, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast.error("Oppgi et gyldig heltall mellom 0 og 100");
      return;
    }
    await persistUpdate({ defaultVatRate: parsed });
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-2 text-xs text-zinc-400">
        <Loader2 className="w-4 h-4 animate-spin text-[#9C39FF]" />
        Laster MVA-innstilling...
      </div>
    );
  }

  const savedDate = storeSettings?.vatThresholdPassedDate ?? "";
  const todayIso = getTodayOsloIso();
  const isRegistered = Boolean(savedDate && todayIso >= savedDate);
  const isScheduledFuture = Boolean(savedDate && todayIso < savedDate);
  const currentRate = storeSettings?.defaultVatRate ?? 12;
  const formattedSavedDate = formatNorwegianDate(savedDate);
  const dateDirty = thresholdDateInput.trim() !== savedDate;

  const badgeClass = isRegistered
    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    : isScheduledFuture
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : "bg-zinc-800 text-zinc-300 border-zinc-700";

  const statusLabel = isRegistered
    ? `AKTIV · Passert ${formattedSavedDate} (${currentRate} % MVA)`
    : isScheduledFuture
    ? `PLANLAGT · Fra ${formattedSavedDate} (${currentRate} % MVA)`
    : "IKKE PASSERT · 0 % MVA";

  if (compact) {
    return (
      <div
        className={`border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 ${
          isRegistered
            ? "bg-emerald-950/20 border-emerald-500/30"
            : isScheduledFuture
            ? "bg-amber-950/15 border-amber-500/30"
            : "bg-zinc-900/60 border-zinc-800"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isRegistered
                ? "bg-emerald-500/15 text-emerald-400"
                : isScheduledFuture
                ? "bg-amber-500/15 text-amber-400"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">
                MVA-grense (50 000 kr)
              </span>
              <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${badgeClass}`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Datoen styrer automatisk fra og med hvilken dag {currentRate} % MVA gjelder. Eksisterende historiske bilag i databasen forblir urørt.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            type="date"
            aria-label="Dato MVA-grense på 50 000 kr passeres"
            value={thresholdDateInput}
            onChange={(e) => setThresholdDateInput(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#9C39FF]"
          />
          <button
            type="button"
            onClick={handleSaveDate}
            disabled={saving || !dateDirty}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Lagrer..." : "Lagre dato"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-6 border p-6 rounded-2xl transition-colors ${
        isRegistered
          ? "bg-emerald-950/15 border-emerald-800/50"
          : isScheduledFuture
          ? "bg-amber-950/15 border-amber-700/40"
          : "bg-zinc-950/60 border-zinc-800"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <ShieldCheck
              className={`w-5 h-5 ${
                isRegistered
                  ? "text-emerald-400"
                  : isScheduledFuture
                  ? "text-amber-400"
                  : "text-zinc-400"
              }`}
            />
            <h3 className="text-lg font-medium text-white">
              MVA-registrering (50 000 kr-grensen)
            </h3>
            <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md border ${badgeClass}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Legg inn datoen da grensen på 50 000 kr blir eller ble passert. Fra og med denne datoen beregnes nye kvitteringer automatisk med {currentRate} % MVA (lav sats for opplevelser) og «936 318 878 MVA». Eksisterende kvitteringer i databasen forblir uendret.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 pt-1">
          <div>
            <label
              htmlFor="vat-threshold-date-input"
              className="block text-xs font-medium text-zinc-400 mb-1.5"
            >
              Dato MVA-grense (50 000 kr) blir / er passert:
            </label>
            <input
              id="vat-threshold-date-input"
              type="date"
              value={thresholdDateInput}
              onChange={(e) => setThresholdDateInput(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveDate}
            disabled={saving || !dateDirty}
            className="px-4 py-2 rounded-xl bg-[#9C39FF] hover:bg-[#8b32e6] text-sm font-medium text-white disabled:opacity-50 transition-colors"
          >
            {saving ? "Lagrer..." : "Lagre dato"}
          </button>

          {savedDate && (
            <button
              type="button"
              onClick={handleClearDate}
              disabled={saving}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-700 disabled:opacity-50 transition-colors"
            >
              Nullstill
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-3">
        <label
          htmlFor="default-vat-rate-input"
          className="text-xs font-medium text-zinc-400"
        >
          MVA-sats for opplevelser (%):
        </label>
        <input
          id="default-vat-rate-input"
          type="number"
          min="0"
          max="100"
          value={vatRateInput}
          onChange={(e) => setVatRateInput(e.target.value)}
          className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
        />
        <button
          type="button"
          onClick={handleSaveRate}
          disabled={saving || Number(vatRateInput) === currentRate}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Lagrer..." : "Oppdater sats"}
        </button>
      </div>
    </div>
  );
}
