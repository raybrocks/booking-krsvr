"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Receipt, Search, ExternalLink, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function TransactionsManager() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const bookingData = doc.data();
        let status = bookingData.status;
        if (status === 'confirmed' || status === 'completed') {
           status = 'AUTHORIZED'; // Or captured, just map to visual equivalents used in Receipts view
        }
        
        return {
          id: doc.id,
          bookingId: doc.id,
          vippsOrderId: doc.id,
          amount: (bookingData.amountPaid || bookingData.totalPrice || 0) * 100, // convert back to ore for receipt calculations
          status: status,
          ...bookingData,
          // Format timestamp if it exists
          createdAtDate: bookingData.createdAt?.toDate() || new Date()
        };
      });
      
      // Filter out non-completed/non-vipps if we only want vipps receipts here
      // But actually, showing all confirmed bookings as receipts is better!
      const validReceipts = data.filter(b => b.status === 'AUTHORIZED');
      
      setTransactions(validReceipts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleViewReceipt = async (tx: any) => {
    setSelectedTx(tx);
    setIsReceiptOpen(true);
    setLoadingReceipt(true);
    setSelectedBooking(null);
    
    if (tx.bookingId) {
      try {
        const bookingDoc = await getDoc(doc(db, "bookings", tx.bookingId));
        if (bookingDoc.exists()) {
          setSelectedBooking(bookingDoc.data());
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
    t.vippsOrderId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderReceipt = () => {
    if (!selectedTx) return null;
    
    const totalInclVat = selectedTx.amount / 100;
    // 25% MVA is standard. You can make this dynamic if needed.
    const vatRate = 0.25; 
    const totalExVat = totalInclVat / (1 + vatRate);
    const vatAmount = totalInclVat - totalExVat;

    return (
      <div className="bg-white text-black font-mono text-sm max-w-sm mx-auto shadow-md p-8 print:shadow-none print:p-0 print:max-w-none">
         <div className="text-center mb-6 border-b border-dashed border-zinc-400 pb-4">
            <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">Krs VR Arena AS</h1>
            <p>Organisasjonsnummer: 936318878 MVA</p>
            <p>Kristiansand, Norge</p>
            <p className="mt-2 font-bold uppercase">Salgskvittering</p>
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
            <div className="flex justify-between">
              <span>Ref V-OrderID:</span>
              <span>{selectedTx.vippsOrderId}</span>
            </div>
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
                         selectedBooking?.experienceId ? `VR Opplevelse (${selectedBooking.experienceId})` : "VR Opplevelse"
                       )}
                   </td>
                   <td className="text-center py-2">{selectedBooking?.players || 1}</td>
                   <td className="text-right py-2">{totalInclVat.toFixed(2)}</td>
                </tr>
             </tbody>
         </table>
         
         <div className="mb-6 space-y-1">
             <div className="flex justify-between font-bold text-lg border-t border-dashed border-zinc-400 pt-2">
               <span>TOTAL (NOK)</span>
               <span>{totalInclVat.toFixed(2)}</span>
             </div>
         </div>

         <div className="mb-8 p-3 bg-zinc-50 border border-zinc-200 rounded text-xs space-y-1">
             <div className="flex justify-between font-bold text-zinc-600 border-b border-zinc-200 pb-1 mb-1">
               <span>MVA-spesifikasjon</span>
               <span>MVA %</span>
             </div>
             <div className="flex justify-between text-zinc-600">
               <span>Netto u/MVA: {totalExVat.toFixed(2)}</span>
               <span>25%</span>
             </div>
             <div className="flex justify-between text-zinc-600">
               <span>MVA beløp: {vatAmount.toFixed(2)}</span>
               <span></span>
             </div>
         </div>

         <div className="border-t border-zinc-400 pt-4 space-y-1 mb-12">
            <div className="flex justify-between">
               <span>Betalingsform:</span>
               <span className="font-bold">Vipps</span>
             </div>
            <div className="flex justify-between">
               <span>Status:</span>
               <span>{selectedTx.status === "AUTHORIZED" || selectedTx.status === "epayment.payment.reserved" || selectedTx.status === "transaction.state.changed" ? "Godkjent" : selectedTx.status}</span>
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
      {/* Search */}
      <div className="flex bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ID, Booking ID, or Vipps Order ID..."
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

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
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
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-zinc-400">
                    {tx.createdAtDate.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-zinc-300 text-xs">{tx.bookingId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-zinc-300 text-xs">{tx.vippsOrderId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-200">{(tx.amount / 100).toFixed(2)} NOK</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                      (tx.status === 'AUTHORIZED' || tx.status === 'epayment.payment.reserved' || tx.status === 'transaction.state.changed') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewReceipt(tx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-md transition-colors border border-zinc-700"
                    >
                      <Receipt className="w-3.5 h-3.5" /> Receipt
                    </button>
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

