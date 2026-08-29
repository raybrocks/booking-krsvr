"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Receipt, Search, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function TransactionsManager() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [experiencesMap, setExperiencesMap] = useState<Record<string, string>>({});

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const [refundingId, setRefundingId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const [bookingsRes, experiencesRes] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/experiences')
      ]);

      if (experiencesRes.ok) {
        const exps = await experiencesRes.json();
        const expsMap: Record<string, string> = {};
        exps.forEach((e: any) => {
          expsMap[e.id] = e.title || e.name || e.id;
        });
        setExperiencesMap(expsMap);
      }

      if (bookingsRes.ok) {
        const fetchedBookings = await bookingsRes.json();
        const data = fetchedBookings.map((bookingData: any) => {
          const createdAtDate = bookingData.createdAt ? new Date(bookingData.createdAt) : new Date();
          
          return {
            ...bookingData,
            id: bookingData.id,
            bookingId: bookingData.id,
            vippsOrderId: bookingData.paymentRef || bookingData.id,
            amount: bookingData.amountPaid ? bookingData.amountPaid * 100 : (bookingData.totalPrice || 0) * 100,
            originalStatus: bookingData.status,
            createdAtDate
          };
        });
        
        const validReceipts = data.filter((b: any) => {
          if (b.originalStatus === 'error') {
             return false;
          }
          // Keep if paid
          if (b.amountPaid > 0) return true;
          // Keep if Vipps booking or refunded
          if (['reservation', 'full', 'vipps'].includes(b.paymentType) || b.vippsStatus === 'REFUNDED') {
             return true;
          }
          return false;
        });
        
        setTransactions(validReceipts);
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
    const defaultAmount = tx.amountPaid || tx.totalPrice || 0;
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
    setSelectedBooking(null);
    
    if (tx.bookingId) {
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

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.vippsOrderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderReceipt = () => {
    if (!selectedTx) return null;
    
    const isRefund = selectedTx.vippsStatus === 'REFUNDED' || selectedTx.type === 'refund';
    const totalInclVat = selectedTx.amountPaid || (isRefund ? (selectedTx.totalPrice || 0) : 0);
    const vatRate = 0.25; 
    const totalExVat = totalInclVat / (1 + vatRate);
    const vatAmount = totalInclVat - totalExVat;

    const betalingsform = (selectedTx.paymentType === 'vipps' || selectedTx.paymentType === 'reservation' || selectedTx.paymentType === 'full') 
      ? 'Vipps' 
      : (selectedTx.paymentType === 'manual' || selectedTx.paymentType === 'system' ? 'Manuell / Oppmøte' : (selectedTx.paymentType || 'Ukjent'));

    return (
      <div className="bg-white text-black font-mono text-sm max-w-sm mx-auto shadow-md p-8 print:shadow-none print:p-0 print:max-w-none">
         <div className="text-center mb-6 border-b border-dashed border-zinc-400 pb-4">
            <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">Krs VR Arena AS</h1>
            <p>Organisasjonsnummer: 936318878 MVA</p>
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
              <span>{selectedTx.id.substring(0, 8).toUpperCase()}</span>
            </div>
            {selectedTx.vippsOrderId && (
              <div className="flex justify-between">
                <span>Vipps Ref:</span>
                <span>{selectedTx.vippsOrderId}</span>
              </div>
            )}
         </div>
         
         {selectedBooking && (
             <div className="mb-6 border-b border-dashed border-zinc-400 pb-4">
                <p className="font-bold mb-1">KUNDE:</p>
                <p>{selectedBooking.firstName} {selectedBooking.lastName}</p>
                <p>{selectedBooking.email}</p>
                <p>{selectedBooking.phone}</p>
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
                         selectedBooking?.experienceId ? (experiencesMap[selectedBooking.experienceId] || `VR Opplevelse (${selectedBooking.experienceId})`) : "VR Opplevelse"
                       )}
                       {isRefund && <div className="text-xs text-red-600 font-bold mt-0.5">REFUNDERT</div>}
                   </td>
                   <td className="text-center py-2">{selectedBooking?.players || 1}</td>
                   <td className="text-right py-2">{isRefund ? `-${totalInclVat.toFixed(2)}` : totalInclVat.toFixed(2)}</td>
                </tr>
             </tbody>
         </table>
         
         <div className="mb-6 space-y-1">
             <div className="flex justify-between font-bold text-lg border-t border-dashed border-zinc-400 pt-2">
               <span>{isRefund ? 'REFUNDERT TOTAL (NOK)' : 'TOTAL (NOK)'}</span>
               <span className={isRefund ? 'text-red-600' : ''}>
                 {isRefund ? `-${totalInclVat.toFixed(2)}` : totalInclVat.toFixed(2)}
               </span>
             </div>
         </div>

         <div className="mb-8 p-3 bg-zinc-50 border border-zinc-200 rounded text-xs space-y-1">
             <div className="flex justify-between font-bold text-zinc-600 border-b border-zinc-200 pb-1 mb-1">
               <span>MVA-spesifikasjon</span>
               <span>MVA %</span>
             </div>
             <div className="flex justify-between text-zinc-600">
               <span>Netto u/MVA: {isRefund ? `-${totalExVat.toFixed(2)}` : totalExVat.toFixed(2)}</span>
               <span>25%</span>
             </div>
             <div className="flex justify-between text-zinc-600">
               <span>MVA beløp: {isRefund ? `-${vatAmount.toFixed(2)}` : vatAmount.toFixed(2)}</span>
               <span></span>
             </div>
         </div>

         <div className="border-t border-zinc-400 pt-4 space-y-1 mb-12">
             <div className="flex justify-between">
               <span>Betalingsform:</span>
               <span className="font-bold capitalize">{betalingsform}</span>
             </div>
            <div className="flex justify-between">
               <span>Status:</span>
               <span className="font-bold">
                 {isRefund ? "Refundert via Vipps" : (selectedTx.amountPaid > 0 ? "Betalt / Godkjent" : selectedTx.status)}
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

  return (
    <div className="space-y-4">
      <div className="bg-[#9C39FF]/10 border border-[#9C39FF]/20 p-4 rounded-xl text-sm text-zinc-300 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-[#9C39FF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[#9C39FF] text-xs font-bold">i</span>
        </div>
        <p>
          Her finner du kun kvitteringer fra utførte betalinger i booking-modulen på nett (betalte reservasjonsgebyrer eller forhåndsbetalinger). Resterende kvitteringer ligger i kassesystemet.
        </p>
      </div>

      {/* Search */}
      <div className="flex bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ID, Name, Booking ID, or Vipps Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
          />
        </div>
        <button
           onClick={async () => {
             try {
                // Find pending transactions from the state
                const pending = transactions.filter(t => t.status === 'epayment.payment.reserved' || t.status === 'AUTHORIZED');
                if (pending.length === 0) {
                    alert("No pending transactions found.");
                    return;
                }
                
                const payload = pending.map(t => ({ bookingId: t.bookingId, amount: t.amount }));
                
                const res = await fetch("/api/vipps/capture", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactions: payload })
                });
                const data = await res.json();
                if (data.captured?.length > 0) {
                   alert("Captured: " + data.captured.join(", "));
                } else if (data.message) {
                   alert(data.message);
                } else if (data.error) {
                   alert("Error: " + data.error);
                }
             } catch (e: any) {
               alert("Capture failed: " + e.message);
             }
           }}
           className="px-4 py-2 bg-[#9C39FF] text-white text-sm font-medium rounded-lg hover:bg-[#8A2BE2] transition-colors whitespace-nowrap"
        >
          Capture Pending
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col">
        <div className="overflow-auto max-h-[70vh] rounded-2xl relative">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900 shadow-[0_1px_0_0_#27272a] text-zinc-400 sticky top-0 z-20">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Booking/System Ref</th>
                <th className="px-6 py-4 font-medium">Vipps Order ID</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status / State</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-zinc-400">
                    {tx.createdAtDate.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {tx.firstName} {tx.lastName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-zinc-300 text-xs">{tx.bookingId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-zinc-300 text-xs">
                      {tx.paymentRef || (['vipps', 'reservation', 'full'].includes(tx.paymentType) ? tx.bookingId : 'N/A')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                       <div className="text-zinc-200 font-medium">Totalt: {tx.totalPrice || tx.amountPaid || 0} NOK</div>
                       {tx.amountPaid > 0 ? (
                         <div className="text-zinc-400 text-[11px]">Innbetalt (Vipps): <span className="text-zinc-200">{tx.amountPaid.toFixed(2)} NOK</span></div>
                       ) : (
                         <div className="text-zinc-500 text-[11px] italic">Innbetalt: 0 NOK</div>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const totalPrice = tx.totalPrice || 0;
                      const amountPaid = tx.amountPaid || 0;
                      const remaining = Math.max(0, totalPrice - amountPaid);
                      const status = (tx.vippsStatus || '').toUpperCase();
                      const isRefunded = status === 'REFUNDED' || tx.type === 'refund';
                      const isFullyPaid = (tx.paymentType === 'full' || amountPaid >= totalPrice) && totalPrice > 0;
                      const isFree = totalPrice === 0;

                      if (isRefunded) {
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="text-blue-400 font-medium text-xs">refundert</span>
                            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md inline-flex items-center bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm w-fit">
                              REFUNDERT (VIPPS)
                            </span>
                          </div>
                        );
                      }
                      if (isFree) {
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="text-zinc-400 font-medium text-xs">gratis</span>
                            <span className="text-[11px] font-medium uppercase px-2.5 py-0.5 rounded-md inline-flex items-center bg-zinc-800 text-zinc-400 border border-zinc-700/50 shadow-sm w-fit">
                              0 KR
                            </span>
                          </div>
                        );
                      }
                      if (isFullyPaid) {
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="text-emerald-400 font-medium text-xs">betalt</span>
                            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md inline-flex items-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm w-fit">
                              FULLT OPPGJORT
                            </span>
                          </div>
                        );
                      }
                      if (amountPaid > 0 && remaining > 0) {
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="text-amber-400 font-medium text-xs">delbetalt</span>
                            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md inline-flex items-center bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm w-fit">
                              GJENSTÅR: {remaining} NOK
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="text-red-400 font-medium text-xs">ubetalt</span>
                          <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md inline-flex items-center bg-red-500/15 text-red-300 border border-red-500/40 shadow-sm w-fit">
                            GJENSTÅR: {remaining} NOK
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Refunder-knapp for Vipps transaksjoner som har betalt beløp */}
                      {['vipps', 'reservation', 'full'].includes(tx.paymentType) && tx.amountPaid > 0 && tx.vippsStatus !== 'REFUNDED' && (
                        <button
                          onClick={() => handleRefund(tx)}
                          disabled={refundingId === tx.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs rounded-md transition-colors border border-orange-500/30 disabled:opacity-50 font-medium"
                          title="Refunder transaksjon via Vipps ePayment og send refusjonskvittering på e-post"
                        >
                          {refundingId === tx.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : null}
                          Refunder (Vipps)
                        </button>
                      )}

                      {tx.amountPaid > 0 || tx.vippsStatus === 'REFUNDED' ? (
                        <button
                          onClick={() => handleViewReceipt(tx)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-md transition-colors border border-zinc-700 font-medium"
                        >
                          <Receipt className="w-3.5 h-3.5" /> Kvittering
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-500 italic px-2">Venter...</span>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

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
                  // A simple print logic that targets the receipt content
                  const printContents = document.querySelector('.receipt-print-container')?.innerHTML;
                  if (printContents) {
                    const originalContents = document.body.innerHTML;
                    document.body.innerHTML = `<div class="bg-white text-black p-4">${printContents}</div>`;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload(); // Quick reset after print hack
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
    </div>
  );
}

