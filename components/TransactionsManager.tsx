"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Receipt, Search, Printer, Download, CalendarDays, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import VatSettingsControl from "./VatSettingsControl";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatNok(value: number | string | null | undefined): string {
  return Number(value || 0).toLocaleString("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getReceiptDisplayCode(tx: any): string {
  if (!tx) return "";
  if (tx.receiptCode) return String(tx.receiptCode);
  if (tx.receiptNumber) return `KV-${tx.receiptNumber}`;
  return String(tx.id || "").substring(0, 8).toUpperCase();
}

function printHtmlDocument(title: string, bodyHtml: string, landscape = false) {
  if (typeof document === "undefined") return;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc || !iframe.contentWindow) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="nb">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.45;
      background: #ffffff;
    }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    h1, h2, h3, p { margin: 0; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 10px; margin-bottom: 14px; }
    .header-title { font-size: 18px; font-weight: 700; letter-spacing: 0.02em; }
    .header-sub { font-size: 11px; color: #4b5563; margin-top: 2px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; padding: 10px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; }
    .meta-label { font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
    .meta-value { font-size: 12px; font-weight: 700; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f3f4f6; font-size: 10px; text-transform: uppercase; color: #374151; font-weight: 700; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    tfoot td { border-top: 2px solid #111827; border-bottom: none; background: #f9fafb; font-weight: 700; }
    .footer-note { margin-top: 16px; padding-top: 8px; border-top: 1px dashed #d1d5db; font-size: 10px; color: #6b7280; display: flex; justify-content: space-between; }
    .receipt-wrapper { max-width: 360px; margin: 0 auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 150);
}

export default function TransactionsManager() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dailyReport, setDailyReport] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"receipts" | "daily">("receipts");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [externalTurnover, setExternalTurnover] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [experiencesMap, setExperiencesMap] = useState<Record<string, string>>({});

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [dailyPrintTarget, setDailyPrintTarget] = useState<{ mode: "all" } | { mode: "day"; day: any } | null>(null);

  const [refundingId, setRefundingId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const [receiptsRes, experiencesRes, dailyRes] = await Promise.all([
        fetch('/api/admin/receipts'),
        fetch('/api/experiences'),
        fetch('/api/admin/receipts/daily-summary')
      ]);

      if (experiencesRes.ok) {
        const exps = await experiencesRes.json();
        const expsMap: Record<string, string> = {};
        exps.forEach((e: any) => {
          expsMap[e.id] = e.title || e.name || e.id;
        });
        setExperiencesMap(expsMap);
      }

      if (dailyRes.ok) {
        const reportData = await dailyRes.json();
        setDailyReport(reportData);
      }

      if (receiptsRes.ok) {
        const fetchedReceipts = await receiptsRes.json();
        const validAccountingReceipts = fetchedReceipts.filter(
          (r: any) =>
            (r.status === 'CAPTURED' || r.status === 'REFUNDED') &&
            r.type !== 'terminal' &&
            !String(r.paymentRef || '').startsWith('terminal-') &&
            Number(r.amount) !== 0
        );
        const data = validAccountingReceipts.map((r: any) => {
          const createdAtDate = r.createdAt ? new Date(r.createdAt) : new Date();
          const isRefund = r.type === 'refund' || r.amount < 0 || r.status === 'REFUNDED';
          
          return {
            ...r,
            createdAtDate,
            isRefund,
            vippsOrderId: r.paymentRef || r.bookingId || r.id
          };
        });
        
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed fetching transactions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefund = async (tx: any) => {
    const defaultAmount = Math.abs(tx.amount || tx.amountPaid || tx.totalPrice || 0);
    const input = prompt(
      `Hvor mye ønsker du å refundere til ${tx.firstName} ${tx.lastName} via Vipps? (i NOK)\n\nKunden vil automatisk motta en refusjonskvittering / kreditnota på e-post (${tx.email || 'kunden'}).`,
      String(defaultAmount)
    );

    if (!input) return;
    const amountNum = parseFloat(input.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Vennligst oppgi et gyldig refusjonsbeløp.");
      return;
    }

    if (amountNum > defaultAmount) {
      if (!confirm(`Beløpet (${amountNum} NOK) er høyere enn innbetalt beløp (${defaultAmount} NOK). Er du sikker på at du vil fortsette?`)) {
        return;
      }
    }

    setRefundingId(tx.id);
    try {
      const res = await fetch('/api/vipps/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: tx.bookingId || tx.id,
          amount: amountNum
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ ${data.message}`);
        await fetchTransactions();
      } else {
        alert(`❌ Refusjon feilet: ${data.error || 'Ukjent feil fra Vipps'}`);
      }
    } catch (e: any) {
      alert(`❌ Feil ved forespørsel: ${e.message}`);
    } finally {
      setRefundingId(null);
    }
  };

  const handleViewReceipt = async (tx: any) => {
    setSelectedTx(tx);
    setIsReceiptOpen(true);
    setLoadingReceipt(true);
    setSelectedBooking(tx.booking || null);
    
    if (!tx.booking && tx.bookingId) {
      try {
        const res = await fetch('/api/admin/bookings');
        if (res.ok) {
          const allBookings = await res.json();
          const bookingDoc = allBookings.find((b: { id: any; }) => b.id === tx.bookingId);
          if (bookingDoc) {
             setSelectedBooking(bookingDoc);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    setLoadingReceipt(false);
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTransactions = transactions.filter((t) => {
    if (!normalizedSearch) return true;
    const receiptCode = getReceiptDisplayCode(t).toLowerCase();
    return (
      receiptCode.includes(normalizedSearch) ||
      String(t.receiptNumber || "").includes(normalizedSearch) ||
      t.id?.toLowerCase().includes(normalizedSearch) ||
      t.bookingId?.toLowerCase().includes(normalizedSearch) ||
      t.paymentRef?.toLowerCase().includes(normalizedSearch) ||
      t.firstName?.toLowerCase().includes(normalizedSearch) ||
      t.lastName?.toLowerCase().includes(normalizedSearch) ||
      t.companyName?.toLowerCase().includes(normalizedSearch)
    );
  });

  const renderReceipt = () => {
    if (!selectedTx) return null;
    
    const isRefund = selectedTx.type === 'refund' || selectedTx.amount < 0 || selectedTx.status === 'REFUNDED';
    const amountVal = Math.abs(selectedTx.amount || selectedTx.amountPaid || 0);
    // Hver kvittering bruker sin lagrede MVA-snapshot (immutable) fra opprettelsestidspunktet
    const vatRatePercent = Math.max(0, Math.round(Number(selectedTx.vatRate ?? 0)));
    const isVatReceipt = vatRatePercent > 0;
    const vatAmountVal = isVatReceipt
      ? Math.abs(
          selectedTx.vatAmount !== undefined && selectedTx.vatAmount !== null
            ? Number(selectedTx.vatAmount)
            : Number((amountVal - amountVal / (1 + vatRatePercent / 100)).toFixed(2))
        )
      : 0;
    const netAmountVal = isVatReceipt
      ? Math.abs(
          selectedTx.netAmount !== undefined && selectedTx.netAmount !== null
            ? Number(selectedTx.netAmount)
            : Number((amountVal - vatAmountVal).toFixed(2))
        )
      : amountVal;

    const betalingsform = 'Vipps (Nettbutikk)';

    return (
      <div className="bg-white text-black font-mono text-sm max-w-sm mx-auto shadow-md p-8 print:shadow-none print:p-0 print:max-w-none">
         <div className="text-center mb-6 border-b border-dashed border-zinc-400 pb-4">
            <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">Krs VR Arena AS</h1>
            <p>Organisasjonsnummer: 936 318 878{isVatReceipt ? ' MVA' : ''}</p>
            <p>Kristiansand, Norge</p>
            <p className={`mt-2 font-bold uppercase ${isRefund ? 'text-red-600' : ''}`}>
              {isRefund ? 'KREDITNOTA / REFUSJONSKVITTERING' : 'Salgskvittering'}
            </p>
         </div>
         
         <div className="mb-6 space-y-1">
            <div className="flex justify-between">
              <span>Dato:</span>
              <span>{selectedTx.createdAtDate.toLocaleDateString("no-NO")}</span>
            </div>
            <div className="flex justify-between">
              <span>Klokkeslett:</span>
              <span>{selectedTx.createdAtDate.toLocaleTimeString("no-NO")}</span>
            </div>
            <div className="flex justify-between">
              <span>Kvitteringsnr:</span>
              <span className="font-bold">
                {getReceiptDisplayCode(selectedTx)}
                {isRefund ? " (KREDIT)" : ""}
              </span>
            </div>
            {selectedTx.paymentRef && (
              <div className="flex justify-between">
                <span>Vipps Ref:</span>
                <span>{selectedTx.paymentRef}</span>
              </div>
            )}
         </div>
         
         {(selectedBooking || selectedTx.firstName) && (
             <div className="mb-6 border-b border-dashed border-zinc-400 pb-4">
                <p className="font-bold mb-1">KUNDE:</p>
                <p>{selectedBooking?.firstName || selectedTx.firstName} {selectedBooking?.lastName || selectedTx.lastName}</p>
                {(selectedBooking?.email || selectedTx.email) && <p>{selectedBooking?.email || selectedTx.email}</p>}
                {(selectedBooking?.phone || selectedTx.phone) && <p>{selectedBooking?.phone || selectedTx.phone}</p>}
             </div>
         )}
         
         <table className="w-full mb-6">
             <thead>
                <tr className="border-b border-dashed border-zinc-400">
                   <th className="text-left font-normal py-1 w-3/5">Varebeskrivelse</th>
                   <th className="text-center font-normal py-1 w-1/5">Antall</th>
                   <th className="text-right font-normal py-1 w-1/5">Pris</th>
                </tr>
             </thead>
             <tbody>
                <tr className="border-b border-zinc-200">
                   <td className="py-2 pr-2 leading-tight">
                       {loadingReceipt ? (
                         <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Henter...</span>
                       ) : (
                         selectedBooking?.experienceId ? (experiencesMap[selectedBooking.experienceId] || selectedTx.experienceName || `VR Opplevelse`) : (selectedTx.experienceName || "VR Opplevelse")
                       )}
                       {isRefund && <div className="text-xs text-red-600 font-bold mt-0.5">REFUSJON</div>}
                   </td>
                   <td className="text-center py-2">{selectedBooking?.players || 1}</td>
                   <td className="text-right py-2">{isRefund ? `-${amountVal.toFixed(2)}` : amountVal.toFixed(2)}</td>
                </tr>
             </tbody>
         </table>
         
         <div className="mb-6 space-y-1">
             <div className="flex justify-between font-bold text-lg border-t border-dashed border-zinc-400 pt-2">
               <span>{isRefund ? 'REFUNDERT TOTAL (NOK)' : 'TOTAL (NOK)'}</span>
               <span className={isRefund ? 'text-red-600' : ''}>
                 {isRefund ? `-${amountVal.toFixed(2)}` : amountVal.toFixed(2)}
               </span>
             </div>
         </div>

         {isVatReceipt && (
           <div className="mb-8 p-3 bg-zinc-50 border border-zinc-200 rounded text-xs space-y-1">
               <div className="flex justify-between font-bold text-zinc-600 border-b border-zinc-200 pb-1 mb-1">
                 <span>MVA-spesifikasjon</span>
                 <span>MVA %</span>
               </div>
               <div className="flex justify-between text-zinc-600">
                 <span>Grunnlag ({vatRatePercent}%): {isRefund ? `-${netAmountVal.toFixed(2)}` : netAmountVal.toFixed(2)} kr</span>
                 <span>{vatRatePercent}%</span>
               </div>
               <div className="flex justify-between text-zinc-600">
                 <span>MVA-beløp: {isRefund ? `-${vatAmountVal.toFixed(2)}` : vatAmountVal.toFixed(2)} kr</span>
                 <span>Inkl. i total</span>
               </div>
           </div>
         )}

         <div className="border-t border-zinc-400 pt-4 space-y-1 mb-12">
             <div className="flex justify-between">
               <span>Betalingsform:</span>
               <span className="font-bold capitalize">{betalingsform}</span>
             </div>
            <div className="flex justify-between">
               <span>Status:</span>
               <span className="font-bold">
                 {isRefund ? "Refundert via Vipps" : "Betalt / Godkjent"}
               </span>
             </div>
         </div>

         <div className="text-center text-xs text-zinc-500">
            Takk for besøket!<br/>
            Velkommen tilbake til Krs VR Arena.
         </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  const externalTurnoverNum = Math.max(0, Number(String(externalTurnover).replace(",", ".")) || 0);
  const mvaThreshold = 50000;
  const thresholdDay = (dailyReport?.days || []).find(
    (d: any) => d.accumulatedTurnover + externalTurnoverNum >= mvaThreshold
  );
  const thresholdReceipt = thresholdDay
    ? (thresholdDay.receipts || []).find(
        (r: any) => r.runningNetTurnover + externalTurnoverNum >= mvaThreshold
      )
    : null;

  return (
    <div className="space-y-4">
      <div className="bg-[#9C39FF]/10 border border-[#9C39FF]/20 p-4 rounded-xl text-sm text-zinc-300 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-[#9C39FF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[#9C39FF] text-xs font-bold">i</span>
        </div>
        <p>
          Her finner du kun bokføringspliktige <strong>salgskvitteringer</strong> og <strong>kreditnotaer</strong> fra faktiske Vipps-betalinger i nettbutikken. Kjøp betalt fysisk i kasse/kortterminal ved oppmøte bokføres direkte i kassasystemet etter kassasystemloven og skal ikke dobbeltføres her.
        </p>
      </div>

      <VatSettingsControl compact />

      {/* View Mode Tabs & CSV Exports */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex bg-zinc-900/70 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode("receipts")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              viewMode === "receipts"
                ? "bg-[#9C39FF] text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Receipt className="w-4 h-4" />
            Enkeltkvitteringer ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode("daily")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              viewMode === "daily"
                ? "bg-[#9C39FF] text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Dagsoppgjør & MVA-grense ({dailyReport?.days?.length || 0} dager)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDailyPrintTarget({ mode: "all" })}
            disabled={!dailyReport?.days || dailyReport.days.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors"
            title="Vis og skriv ut / lagre samlet dagsoppgjørsoversikt (DO-101..DO-xxx) som PDF"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            Dagsoppgjør (PDF)
          </button>
          <a
            href="/api/admin/receipts/daily-summary?format=csv"
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors"
            title="Last ned dagsoppgjør gruppert per dato (semikolon-separert CSV for norsk Excel)"
          >
            <Download className="w-3.5 h-3.5 text-[#9C39FF]" />
            Last ned Dagsoppgjør (.csv)
          </a>
          <a
            href="/api/admin/receipts/daily-summary?format=csv&scope=receipts"
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors"
            title="Last ned alle enkeltkvitteringer med dato, klokkeslett og løpende total (.csv)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Last ned Enkeltkvitteringer (.csv)
          </a>
        </div>
      </div>

      {viewMode === "daily" ? (
        <div className="space-y-4">
          {/* Summary KPI & MVA 50 000 NOK Helper */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-400">Brutto Vipps-salg ({dailyReport?.summary?.totalPayments || 0} salg)</div>
              <div className="text-xl font-bold text-white mt-1">
                {Number(dailyReport?.summary?.totalGrossSales || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Refusjoner ({dailyReport?.summary?.totalRefunds || 0}): {Number(dailyReport?.summary?.totalRefundsAmount || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-400">Netto Vipps-omsetning (inkl. MVA)</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {Number(dailyReport?.summary?.totalNetTurnover || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                0 % MVA: {Number(dailyReport?.summary?.totalRevenue0Vat || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr · 25 % gr.l.: {Number(dailyReport?.summary?.totalRevenue25VatBasis || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr · MVA: {Number(dailyReport?.summary?.totalOutgoingVat || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <label htmlFor="external-turnover-input" className="block text-xs text-zinc-400">
                Annen omsetning (faktura + kasse, kr)
              </label>
              <input
                id="external-turnover-input"
                type="number"
                min="0"
                step="any"
                value={externalTurnover}
                onChange={(e) => setExternalTurnover(e.target.value)}
                className="mt-1.5 w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-[#9C39FF]"
                placeholder="0"
              />
              <div className="text-[11px] text-zinc-500 mt-1">
                Valgfri hjelpesum for å markere dagen 50 000 kr passeres
              </div>
            </div>

            <div className={`border rounded-xl p-4 ${thresholdDay ? "bg-amber-500/10 border-amber-500/30" : "bg-zinc-900/50 border-zinc-800"}`}>
              <div className="text-xs text-zinc-400">MVA-grense (50 000 kr)</div>
              {thresholdDay ? (
                <>
                  <div className="text-lg font-bold text-amber-300 mt-1">
                    Passert {thresholdDay.date}
                  </div>
                  <div className="text-[11px] text-zinc-300 mt-1">
                    {thresholdReceipt
                      ? `Kvitt. ${thresholdReceipt.receiptNumber} (${thresholdReceipt.settlementCode}) kl. ${thresholdReceipt.osloTime}`
                      : `Akk. samlet: ${(thresholdDay.accumulatedTurnover + externalTurnoverNum).toLocaleString("nb-NO")} kr`}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-zinc-200 mt-1">
                    Ikke passert ennå
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Gjenstår til 50 000 kr: {Math.max(0, mvaThreshold - ((dailyReport?.summary?.totalNetTurnover || 0) + externalTurnoverNum)).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col w-full max-w-full">
            <div className="overflow-x-auto max-h-[70vh] rounded-2xl relative w-full">
              <table className="w-full text-left text-sm whitespace-nowrap min-w-[1380px]">
                <thead className="bg-zinc-900 shadow-[0_1px_0_0_#27272a] text-zinc-400 sticky top-0 z-20">
                  <tr>
                    <th className="px-4 py-3.5 font-medium">Dagsoppgjørsnr.</th>
                    <th className="px-4 py-3.5 font-medium">Dato (Europe/Oslo)</th>
                    <th className="px-4 py-3.5 font-medium">Fra – Til kvitteringsnr.</th>
                    <th className="px-4 py-3.5 font-medium text-right">Antall salg</th>
                    <th className="px-4 py-3.5 font-medium text-right">Brutto inkl. MVA</th>
                    <th className="px-4 py-3.5 font-medium text-right">Omsetning 0 % MVA</th>
                    <th className="px-4 py-3.5 font-medium text-right">Omsetning 25 % MVA (grunnlag)</th>
                    <th className="px-4 py-3.5 font-medium text-right">Utgående MVA</th>
                    <th className="px-4 py-3.5 font-medium text-right">Dagens sum (inkl. MVA)</th>
                    <th className="px-4 py-3.5 font-medium text-right">Akkumulert sum</th>
                    <th className="px-4 py-3.5 font-medium text-right">Detaljer / PDF / CSV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {!dailyReport?.days || dailyReport.days.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-10 text-center text-zinc-500">
                        Ingen godkjente Vipps-kvitteringer funnet.
                      </td>
                    </tr>
                  ) : (
                    dailyReport.days.map((day: any) => {
                      const isExpanded = expandedDay === day.date;
                      const isThresholdRow = thresholdDay?.date === day.date;
                      const combinedAcc = day.accumulatedTurnover + externalTurnoverNum;

                      return (
                        <React.Fragment key={day.date}>
                          <tr
                            onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                            className={`cursor-pointer transition-colors ${
                              isThresholdRow
                                ? "bg-amber-500/10 hover:bg-amber-500/15"
                                : "hover:bg-zinc-800/30"
                            }`}
                          >
                            <td className="px-4 py-3.5 font-mono text-zinc-200">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                                )}
                                <span className="font-bold text-white">{day.settlementCode || `DO-${day.settlementNumber}`}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-zinc-200">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{day.date}</span>
                                {isThresholdRow && (
                                  <span className="text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    MVA 50k passert
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs text-zinc-200">
                              <div>
                                {day.firstReceiptNumber === day.lastReceiptNumber
                                  ? day.firstReceiptNumber
                                  : `${day.firstReceiptNumber} → ${day.lastReceiptNumber}`}
                              </div>
                              <div className="text-[11px] text-zinc-500">
                                Løpenr. #{day.firstSequenceNo === day.lastSequenceNo ? day.firstSequenceNo : `${day.firstSequenceNo}–${day.lastSequenceNo}`}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right text-zinc-200">
                              <span className="font-semibold">{day.receiptCount}</span>
                              {day.refundCount > 0 && (
                                <div className="text-[11px] text-orange-400">
                                  ({day.refundCount} ref.)
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right font-semibold text-white">
                              {Number(day.grossSales).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                              {day.refunds < 0 && (
                                <div className="text-[11px] text-red-400 font-normal">
                                  {Number(day.refunds).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr ref.
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono text-zinc-200">
                              {Number(day.revenue0Vat || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono text-zinc-200">
                              {Number(day.revenue25VatBasis || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono text-amber-300 font-semibold">
                              {Number(day.outgoingVat || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                            </td>
                            <td className={`px-4 py-3.5 text-right font-semibold ${day.netTurnover < 0 ? "text-red-400" : "text-emerald-400"}`}>
                              {Number(day.netTurnover).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="font-bold text-white">
                                {Number(day.accumulatedTurnover).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                              </div>
                              <div className="text-[11px] text-zinc-500">
                                Brutto: {Number(day.accumulatedGrossSales).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                {externalTurnoverNum > 0 && (
                                  <span className="text-amber-300 ml-1">
                                    · Samlet: {combinedAcc.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-md border border-zinc-700 transition-colors"
                                >
                                  {isExpanded ? "Skjul" : `Kvitteringer (${day.receiptCount})`}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDailyPrintTarget({ mode: "day", day })}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-amber-300 text-xs rounded-md border border-zinc-700 transition-colors"
                                  title={`Vis og skriv ut / lagre ${day.settlementCode || day.date} som PDF`}
                                >
                                  <FileText className="w-3 h-3" />
                                  PDF
                                </button>
                                <a
                                  href={`/api/admin/receipts/daily-summary?format=csv&date=${day.date}`}
                                  download
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded-md border border-zinc-700 transition-colors"
                                  title={`Last ned enkeltkvitteringer for ${day.date} som CSV`}
                                >
                                  <Download className="w-3 h-3" />
                                  CSV
                                </a>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-zinc-950/80">
                              <td colSpan={11} className="px-6 py-4">
                                <div className="text-xs font-medium text-zinc-400 mb-2">
                                  Enkeltkvitteringer for {day.settlementCode || `DO-${day.settlementNumber}`} · {day.date} (tidssone Europe/Oslo):
                                </div>
                                <div className="border border-zinc-800 rounded-xl overflow-hidden">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-zinc-900/90 text-zinc-400">
                                      <tr>
                                        <th className="px-3 py-2 font-medium">Klokkeslett</th>
                                        <th className="px-3 py-2 font-medium">Kvitteringsnummer</th>
                                        <th className="px-3 py-2 font-medium">Kunde / Opplevelse</th>
                                        <th className="px-3 py-2 font-medium">Status</th>
                                        <th className="px-3 py-2 font-medium text-right">MVA</th>
                                        <th className="px-3 py-2 font-medium text-right">Grunnlag</th>
                                        <th className="px-3 py-2 font-medium text-right">Utg. MVA</th>
                                        <th className="px-3 py-2 font-medium text-right">Beløp inkl. MVA</th>
                                        <th className="px-3 py-2 font-medium text-right">Akkumulert etter</th>
                                        <th className="px-3 py-2 font-medium text-right">Vis</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/60">
                                      {(day.receipts || []).map((r: any) => {
                                        const isThreshRec = thresholdReceipt?.id === r.id;
                                        const matchedTx = transactions.find((t) => t.id === r.id);
                                        return (
                                          <tr
                                            key={r.id}
                                            className={isThreshRec ? "bg-amber-500/15" : "hover:bg-zinc-900/40"}
                                          >
                                            <td className="px-3 py-2 font-mono text-zinc-200">
                                              {r.osloTime}
                                              {isThreshRec && (
                                                <span className="ml-2 text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300">
                                                  50k her
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-white font-semibold">
                                              {r.receiptNumber}
                                              <span className="text-zinc-500 font-normal ml-1.5">#{r.sequenceNo}</span>
                                            </td>
                                            <td className="px-3 py-2 text-zinc-200">
                                              <span className="font-medium">{r.customerName}</span>
                                              {r.companyName ? ` (${r.companyName})` : ""}
                                              <span className="text-zinc-500"> · {r.experienceName}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                              <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                  r.amount < 0
                                                    ? "bg-blue-500/20 text-blue-300"
                                                    : "bg-emerald-500/20 text-emerald-300"
                                                }`}
                                              >
                                                {r.status}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono text-zinc-300">
                                              {Number(r.vatRatePercent || 0)} %
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono text-zinc-300">
                                              {Number(r.netAmount ?? r.amount).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono text-amber-300">
                                              {Number(r.vatAmount || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                            </td>
                                            <td className={`px-3 py-2 text-right font-mono font-semibold ${r.amount < 0 ? "text-red-400" : "text-emerald-400"}`}>
                                              {Number(r.amount).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono text-zinc-200">
                                              {Number(r.runningNetTurnover).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                                              {externalTurnoverNum > 0 && (
                                                <span className="text-amber-300 ml-1">
                                                  ({(r.runningNetTurnover + externalTurnoverNum).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                              {matchedTx && (
                                                <button
                                                  type="button"
                                                  onClick={() => handleViewReceipt(matchedTx)}
                                                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700"
                                                >
                                                  Åpne
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
                {dailyReport?.days?.length > 0 && (
                  <tfoot className="bg-zinc-900/90 border-t border-zinc-700 text-xs font-semibold text-zinc-200">
                    <tr>
                      <td className="px-4 py-3.5" colSpan={3}>Sum totalt ({dailyReport.summary.totalDays} dager)</td>
                      <td className="px-4 py-3.5 text-right">{dailyReport.summary.totalReceipts}</td>
                      <td className="px-4 py-3.5 text-right">{Number(dailyReport.summary.totalGrossSales || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                      <td className="px-4 py-3.5 text-right font-mono">{Number(dailyReport.summary.totalRevenue0Vat || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                      <td className="px-4 py-3.5 text-right font-mono">{Number(dailyReport.summary.totalRevenue25VatBasis || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                      <td className="px-4 py-3.5 text-right font-mono text-amber-300">{Number(dailyReport.summary.totalOutgoingVat || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                      <td className="px-4 py-3.5 text-right text-emerald-400">{Number(dailyReport.summary.totalNetTurnover || 0).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr</td>
                      <td className="px-4 py-3.5" colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="flex bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Søk etter kvitteringsnr (KV-1001), navn, booking ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col w-full max-w-full">
            <div className="overflow-x-auto max-h-[70vh] rounded-2xl relative w-full">
              <table className="w-full text-left text-sm whitespace-nowrap table-fixed min-w-[1160px]">
                <colgroup>
                  <col className="w-[12%]" />
                  <col className="w-[15%]" />
                  <col className="w-[18%]" />
                  <col className="w-[17%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead className="bg-zinc-900 shadow-[0_1px_0_0_#27272a] text-zinc-400 sticky top-0 z-20">
                  <tr>
                    <th className="px-6 py-4 font-medium">Kvitteringsnr.</th>
                    <th className="px-6 py-4 font-medium">Dato</th>
                    <th className="px-6 py-4 font-medium">Kunde</th>
                    <th className="px-6 py-4 font-medium">Booking / Ref</th>
                    <th className="px-6 py-4 font-medium">Beløp</th>
                    <th className="px-6 py-4 font-medium">Status / Type</th>
                    <th className="px-6 py-4 font-medium text-right">Handlinger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 sm:px-6 py-8 sm:py-12 text-left sm:text-center text-zinc-500 font-medium">
                        Ingen kvitteringer eller transaksjoner funnet.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isRefund = tx.type === 'refund' || tx.amount < 0 || tx.status === 'REFUNDED';
                      const absAmount = Math.abs(tx.amount || 0);
                      const receiptCode = getReceiptDisplayCode(tx);

                      return (
                        <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono font-semibold text-white text-xs">{receiptCode}</div>
                            <div className="text-[10px] font-mono text-zinc-500 mt-0.5">ID: {tx.id.substring(0, 8).toUpperCase()}</div>
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-xs">
                            {tx.createdAtDate.toLocaleString("no-NO", { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              second: '2-digit' 
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-zinc-200">{tx.firstName} {tx.lastName}</div>
                            {tx.email && <div className="text-xs text-zinc-500">{tx.email}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-zinc-300 text-xs">{tx.bookingId || tx.paymentRef || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            {isRefund ? (
                              <div>
                                <div className="font-bold text-red-400 text-sm">-{absAmount.toFixed(2)} NOK</div>
                                <div className="text-[11px] text-zinc-500">
                                  Refusjon (Kreditnota){Number(tx.vatRate || 0) > 0 ? ` · ${tx.vatRate}% MVA (${Math.abs(Number(tx.vatAmount || 0)).toFixed(2)} kr)` : ' · 0% MVA'}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-emerald-400 text-sm">+{absAmount.toFixed(2)} NOK</div>
                                <div className="text-[11px] text-zinc-500">
                                  Innbetalt (Salgskvittering){Number(tx.vatRate || 0) > 0 ? ` · ${tx.vatRate}% MVA (${Number(tx.vatAmount || 0).toFixed(2)} kr)` : ' · 0% MVA'}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isRefund ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-blue-400 font-medium text-xs">refundert</span>
                                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md inline-flex items-center bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm w-fit">
                                  REFUNDERT (VIPPS)
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <span className="text-emerald-400 font-medium text-xs">betalt</span>
                                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md inline-flex items-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm w-fit">
                                  INNBETALT (VIPPS)
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isRefund && tx.booking && (tx.booking.amountPaid > 0 || tx.amount > 0) && tx.status !== 'REFUNDED' && (
                                <button
                                  onClick={() => handleRefund(tx)}
                                  disabled={refundingId === tx.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs rounded-md transition-colors border border-orange-500/30 disabled:opacity-50 font-medium"
                                  title="Refunder via Vipps og opprett kreditnota"
                                >
                                  {refundingId === tx.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : null}
                                  Refunder (Vipps)
                                </button>
                              )}

                              <button
                                onClick={() => handleViewReceipt(tx)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors border font-medium ${
                                  isRefund 
                                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30' 
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                                }`}
                                title={isRefund ? "Åpne Kreditnota / Refusjonskvittering" : "Åpne Salgskvittering"}
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                {isRefund ? "Kreditnota" : "Kvittering"}
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
        </>
      )}

      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-lg bg-zinc-100 p-0 overflow-hidden border-zinc-300 sm:rounded-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Salgskvittering</DialogTitle>
            <DialogDescription>
              Utskriftsvennlig salgskvittering for bokføring.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[85vh] overflow-y-auto w-full receipt-print-container">
            {renderReceipt()}
          </div>
          
          <div className="p-4 bg-zinc-200 border-t border-zinc-300 flex justify-end gap-3 print:hidden">
             <button 
                onClick={() => setIsReceiptOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-300 rounded-lg transition-colors"
             >
               Lukk
             </button>
             <button 
                onClick={() => {
                  const printContents = document.querySelector('.receipt-print-container')?.innerHTML;
                  if (printContents) {
                    printHtmlDocument(
                      `Kvittering ${getReceiptDisplayCode(selectedTx)}`,
                      `<div class="receipt-wrapper">${printContents}</div>`,
                      false
                    );
                  } else {
                    window.print();
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#9C39FF] text-white hover:bg-[#8A2BE2] rounded-lg transition-colors shadow-sm"
             >
               <Printer className="w-4 h-4" /> Skriv ut
             </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(dailyPrintTarget)} onOpenChange={(open) => !open && setDailyPrintTarget(null)}>
        <DialogContent className="max-w-5xl bg-zinc-100 p-0 overflow-hidden border-zinc-300 sm:rounded-xl text-zinc-900">
          <DialogHeader className="sr-only">
            <DialogTitle>Dagsoppgjørsrapport</DialogTitle>
            <DialogDescription>
              Utskriftsvennlig dagsoppgjørsrapport for regnskap og arkivering (PDF).
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[82vh] overflow-y-auto bg-white p-8 daily-settlement-print-container">
            {dailyPrintTarget?.mode === "day" ? (() => {
              const day = dailyPrintTarget.day;
              const code = day.settlementCode || `DO-${day.settlementNumber}`;
              return (
                <div className="space-y-5 text-zinc-900">
                  <div className="header flex justify-between items-start border-b-2 border-zinc-900 pb-4">
                    <div>
                      <h2 className="header-title text-xl font-bold uppercase tracking-wide">
                        Dagsoppgjør {code}
                      </h2>
                      <p className="header-sub text-xs text-zinc-600 mt-0.5">
                        Krs VR Arena AS · Org.nr 936 318 878 · Nettbutikk (Vipps)
                      </p>
                    </div>
                    <div className="text-right font-mono text-xs text-zinc-700">
                      <div>Dato (Europe/Oslo): <strong>{day.date}</strong></div>
                      <div>Tidspunkt utskrift: {new Date().toLocaleString("no-NO")}</div>
                    </div>
                  </div>

                  <div className="meta-grid grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                    <div>
                      <div className="meta-label text-[10px] uppercase text-zinc-500 font-semibold">Dagsoppgjørsnr.</div>
                      <div className="meta-value font-mono font-bold text-sm mt-0.5">{code}</div>
                    </div>
                    <div>
                      <div className="meta-label text-[10px] uppercase text-zinc-500 font-semibold">Kvitteringsserie</div>
                      <div className="meta-value font-mono font-bold text-sm mt-0.5">
                        {day.firstReceiptNumber === day.lastReceiptNumber
                          ? day.firstReceiptNumber
                          : `${day.firstReceiptNumber} – ${day.lastReceiptNumber}`}
                      </div>
                    </div>
                    <div>
                      <div className="meta-label text-[10px] uppercase text-zinc-500 font-semibold">Antall bilag</div>
                      <div className="meta-value font-bold text-sm mt-0.5">
                        {day.receiptCount} ({day.paymentCount} salg / {day.refundCount} ref.)
                      </div>
                    </div>
                    <div>
                      <div className="meta-label text-[10px] uppercase text-zinc-500 font-semibold">Dagens sum / Akkumulert</div>
                      <div className="meta-value font-mono font-bold text-sm mt-0.5">
                        {formatNok(day.netTurnover)} kr / {formatNok(day.accumulatedTurnover)} kr
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs border border-zinc-200 rounded-lg p-3 bg-white">
                    <div>
                      <span className="text-zinc-500">Omsetning 0 % MVA:</span>{" "}
                      <strong className="font-mono">{formatNok(day.revenue0Vat)} kr</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Omsetning 25 % MVA (gr.l.):</span>{" "}
                      <strong className="font-mono">{formatNok(day.revenue25VatBasis)} kr</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Utgående MVA:</span>{" "}
                      <strong className="font-mono">{formatNok(day.outgoingVat)} kr</strong>
                    </div>
                  </div>

                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-300 bg-zinc-100 text-zinc-700">
                        <th className="py-2 px-2 text-left">Kvitteringsnr.</th>
                        <th className="py-2 px-2 text-left">Klokkeslett</th>
                        <th className="py-2 px-2 text-left">Kunde / Beskrivelse</th>
                        <th className="py-2 px-2 text-left">Status</th>
                        <th className="py-2 px-2 text-right">MVA %</th>
                        <th className="py-2 px-2 text-right">Grunnlag</th>
                        <th className="py-2 px-2 text-right">MVA</th>
                        <th className="py-2 px-2 text-right">Beløp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {(day.receipts || []).map((r: any) => (
                        <tr key={r.id}>
                          <td className="py-2 px-2 font-mono font-semibold">{r.receiptNumber}</td>
                          <td className="py-2 px-2 font-mono">{r.osloTime}</td>
                          <td className="py-2 px-2">
                            {r.customerName}
                            {r.experienceName ? ` · ${r.experienceName}` : ""}
                          </td>
                          <td className="py-2 px-2">{r.status}</td>
                          <td className="py-2 px-2 text-right font-mono">{Number(r.vatRatePercent || 0)} %</td>
                          <td className="py-2 px-2 text-right font-mono">{formatNok(r.netAmount ?? r.amount)} kr</td>
                          <td className="py-2 px-2 text-right font-mono">{formatNok(r.vatAmount || 0)} kr</td>
                          <td className="py-2 px-2 text-right font-mono font-semibold">{formatNok(r.amount)} kr</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-zinc-900 bg-zinc-50 font-bold">
                        <td className="py-2 px-2" colSpan={5}>Sum {code} ({day.date})</td>
                        <td className="py-2 px-2 text-right font-mono">
                          {formatNok(Number(day.revenue0Vat || 0) + Number(day.revenue25VatBasis || 0))} kr
                        </td>
                        <td className="py-2 px-2 text-right font-mono">{formatNok(day.outgoingVat)} kr</td>
                        <td className="py-2 px-2 text-right font-mono">{formatNok(day.netTurnover)} kr</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="footer-note text-[10px] text-zinc-500 border-t border-dashed border-zinc-300 pt-3 flex justify-between">
                    <span>Ubrutt nummerserie · Kun godkjente Vipps-bilag i nettbutikk</span>
                    <span>Akkumulert Vipps-omsetning t.o.m. {day.date}: {formatNok(day.accumulatedTurnover)} kr</span>
                  </div>
                </div>
              );
            })() : dailyPrintTarget?.mode === "all" && dailyReport ? (
              <div className="space-y-4 text-zinc-900">
                <div className="header flex justify-between items-start border-b-2 border-zinc-900 pb-4">
                  <div>
                    <h2 className="header-title text-xl font-bold uppercase tracking-wide">
                      Samlet Dagsoppgjørsrapport
                    </h2>
                    <p className="header-sub text-xs text-zinc-600 mt-0.5">
                      Krs VR Arena AS · Org.nr 936 318 878 · Nettbutikk (Vipps)
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs text-zinc-700">
                    <div>Antall dager: <strong>{dailyReport.summary?.totalDays || 0}</strong></div>
                    <div>Tidspunkt utskrift: {new Date().toLocaleString("no-NO")}</div>
                  </div>
                </div>

                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-300 bg-zinc-100 text-zinc-700">
                      <th className="py-2 px-2 text-left">Dagsoppgjørsnr.</th>
                      <th className="py-2 px-2 text-left">Dato</th>
                      <th className="py-2 px-2 text-left">Fra kvitteringsnr.</th>
                      <th className="py-2 px-2 text-left">Til kvitteringsnr.</th>
                      <th className="py-2 px-2 text-right">Antall salg</th>
                      <th className="py-2 px-2 text-right">Omsetning 0 %</th>
                      <th className="py-2 px-2 text-right">Omsetning 25 % gr.l.</th>
                      <th className="py-2 px-2 text-right">Utgående MVA</th>
                      <th className="py-2 px-2 text-right">Dagens sum</th>
                      <th className="py-2 px-2 text-right">Akkumulert sum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {(dailyReport.days || []).map((day: any) => (
                      <tr key={day.date}>
                        <td className="py-1.5 px-2 font-mono font-bold">{day.settlementCode || `DO-${day.settlementNumber}`}</td>
                        <td className="py-1.5 px-2 font-mono">{day.date}</td>
                        <td className="py-1.5 px-2 font-mono">{day.firstReceiptNumber}</td>
                        <td className="py-1.5 px-2 font-mono">{day.lastReceiptNumber}</td>
                        <td className="py-1.5 px-2 text-right">{day.receiptCount}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{formatNok(day.revenue0Vat)} kr</td>
                        <td className="py-1.5 px-2 text-right font-mono">{formatNok(day.revenue25VatBasis)} kr</td>
                        <td className="py-1.5 px-2 text-right font-mono">{formatNok(day.outgoingVat)} kr</td>
                        <td className="py-1.5 px-2 text-right font-mono font-semibold">{formatNok(day.netTurnover)} kr</td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold">{formatNok(day.accumulatedTurnover)} kr</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-900 bg-zinc-50 font-bold">
                      <td className="py-2 px-2" colSpan={4}>Sum totalt ({dailyReport.summary?.totalDays || 0} dager)</td>
                      <td className="py-2 px-2 text-right">{dailyReport.summary?.totalReceipts || 0}</td>
                      <td className="py-2 px-2 text-right font-mono">{formatNok(dailyReport.summary?.totalRevenue0Vat)} kr</td>
                      <td className="py-2 px-2 text-right font-mono">{formatNok(dailyReport.summary?.totalRevenue25VatBasis)} kr</td>
                      <td className="py-2 px-2 text-right font-mono">{formatNok(dailyReport.summary?.totalOutgoingVat)} kr</td>
                      <td className="py-2 px-2 text-right font-mono">{formatNok(dailyReport.summary?.totalNetTurnover)} kr</td>
                      <td className="py-2 px-2 text-right font-mono">{formatNok(dailyReport.summary?.totalNetTurnover)} kr</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="footer-note text-[10px] text-zinc-500 border-t border-dashed border-zinc-300 pt-3 flex justify-between">
                  <span>Ubrutte serier for kvitteringer (KV-xxxx) og dagsoppgjør (DO-xxx) · Europe/Oslo</span>
                  <span>Krs VR Arena AS · Org.nr 936 318 878</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="p-4 bg-zinc-200 border-t border-zinc-300 flex justify-end gap-3 print:hidden">
            <button
              type="button"
              onClick={() => setDailyPrintTarget(null)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-300 rounded-lg transition-colors"
            >
              Lukk
            </button>
            <button
              type="button"
              onClick={() => {
                const printContents = document.querySelector(".daily-settlement-print-container")?.innerHTML;
                if (!printContents) return;
                const title =
                  dailyPrintTarget?.mode === "day"
                    ? `Dagsoppgjor_${dailyPrintTarget.day.settlementCode || dailyPrintTarget.day.date}_${dailyPrintTarget.day.date}`
                    : "Dagsoppgjor_Samlet_Oversikt";
                printHtmlDocument(title, printContents, dailyPrintTarget?.mode === "all");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#9C39FF] text-white hover:bg-[#8A2BE2] rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Skriv ut / Lagre PDF
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

