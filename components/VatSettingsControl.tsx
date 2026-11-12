"use client";

import React, { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Percent } from "lucide-react";
import { toast } from "sonner";

export interface StoreSettingsState {
  id: string;
  isVatRegistered: boolean;
  defaultVatRate: number;
  updatedAt?: string;
}

interface VatSettingsControlProps {
  compact?: boolean;
  onUpdated?: (settings: StoreSettingsState) => void;
}

export default function VatSettingsControl({
  compact = false,
  onUpdated,
}: VatSettingsControlProps) {
  const [storeSettings, setStoreSettings] = useState<StoreSettingsState | null>(null);
  const [vatRateInput, setVatRateInput] = useState<string>("25");
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
            setVatRateInput(String(data.defaultVatRate ?? 25));
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
    isVatRegistered?: boolean;
    defaultVatRate?: number;
  }) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke oppdatere MVA-innstilling");
      }
      setStoreSettings(data);
      setVatRateInput(String(data.defaultVatRate ?? 25));
      onUpdated?.(data);

      if (payload.isVatRegistered !== undefined) {
        toast.success(
          data.isVatRegistered
            ? `MVA-registrering er nå PÅ (${data.defaultVatRate} % på nye kvitteringer)`
            : "MVA-registrering er nå AV (0 % på nye kvitteringer)"
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

  const handleToggle = async (nextVal: boolean) => {
    const rate = storeSettings?.defaultVatRate ?? 25;
    const confirmed = window.confirm(
      nextVal
        ? `Vil du skru PÅ global MVA-registrering?\n\nFra og med neste gjennomførte Vipps-betaling vil nye kvitteringer få ${rate} % MVA og «936 318 878 MVA».\n\nEksisterende historiske kvitteringer i databasen forblir helt uendret på 0 % MVA.`
        : `Vil du skru AV global MVA-registrering?\n\nNye kvitteringer vil føres med 0 % MVA uten MVA-spesifikasjon. Eksisterende historiske kvitteringer forblir uendret.`
    );
    if (!confirmed) return;
    await persistUpdate({ isVatRegistered: nextVal });
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

  const isRegistered = Boolean(storeSettings?.isVatRegistered);
  const currentRate = storeSettings?.defaultVatRate ?? 25;

  if (compact) {
    return (
      <div
        className={`border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 ${
          isRegistered
            ? "bg-emerald-950/20 border-emerald-500/30"
            : "bg-zinc-900/60 border-zinc-800"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isRegistered
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">
                Global MVA-bryter
              </span>
              <span
                className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${
                  isRegistered
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700"
                }`}
              >
                {isRegistered
                  ? `PÅ · ${currentRate} % MVA (Org.nr 936 318 878 MVA)`
                  : "AV · 0 % MVA (Ikke MVA-registrert)"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Gjelder kun nye Vipps-kvitteringer etter aktivering. Historiske kvitteringer i databasen forblir uendret.
            </p>
          </div>
        </div>

        <label className="inline-flex items-center gap-2.5 cursor-pointer shrink-0">
          <span className="text-xs font-medium text-zinc-300">
            {saving ? "Lagrer..." : isRegistered ? "MVA aktivert" : "MVA avslått"}
          </span>
          <div className="relative w-12 h-6 shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              disabled={saving}
              checked={isRegistered}
              onChange={(e) => handleToggle(e.target.checked)}
            />
            <div className="w-12 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </div>
        </label>
      </div>
    );
  }

  return (
    <div
      className={`mb-6 border p-6 rounded-2xl transition-colors ${
        isRegistered
          ? "bg-emerald-950/15 border-emerald-800/50"
          : "bg-zinc-950/60 border-zinc-800"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <ShieldCheck
              className={`w-5 h-5 ${
                isRegistered ? "text-emerald-400" : "text-zinc-400"
              }`}
            />
            <h3 className="text-lg font-medium text-white">
              MVA-registrering (Merverdiavgiftsregisteret)
            </h3>
            <span
              className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                isRegistered
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700"
              }`}
            >
              {isRegistered ? `PÅ (${currentRate} % MVA)` : "AV (0 % MVA)"}
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Skru denne bryteren PÅ så snart Krs VR Arena AS er registrert i Merverdiavgiftsregisteret (over 50 000 kr). Nye Vipps-kvitteringer vil da automatisk beregne {currentRate} % utgående MVA og vise «936 318 878 MVA». Eksisterende kvitteringer forblir helt urørt.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer ml-0 sm:ml-4 shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            disabled={saving}
            checked={isRegistered}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-3">
        <label
          htmlFor="default-vat-rate-input"
          className="text-xs font-medium text-zinc-400"
        >
          Standard MVA-sats ved registrering (%):
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
