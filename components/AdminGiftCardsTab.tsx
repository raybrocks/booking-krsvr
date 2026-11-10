"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Gift, Search, Plus, CreditCard, Copy, Check, Mail, Eye,
  AlertCircle, Clock, CheckCircle2, History, X, Loader2
} from 'lucide-react';
import { calculateTotalPriceForPersons } from '@/lib/pricing';

export default function AdminGiftCardsTab() {
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);
  const [redeemCode, setRedeemCode] = useState<string>('');
  const [redeemAmount, setRedeemAmount] = useState<string>('');
  const [redeemNote, setRedeemNote] = useState<string>('');
  const [redeemLoading, setRedeemLoading] = useState<boolean>(false);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createPersons, setCreatePersons] = useState<number>(4);
  const [createCustomAmount, setCreateCustomAmount] = useState<string>('');
  const [createBuyerName, setCreateBuyerName] = useState<string>('');
  const [createBuyerEmail, setCreateBuyerEmail] = useState<string>('');
  const [createBuyerPhone, setCreateBuyerPhone] = useState<string>('');
  const [createRecipientName, setCreateRecipientName] = useState<string>('');
  const [createSenderName, setCreateSenderName] = useState<string>('');
  const [createGreeting, setCreateGreeting] = useState<string>('');
  const [createNote, setCreateNote] = useState<string>('');
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  const [selectedCardForLog, setSelectedCardForLog] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchGiftCards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gift-cards');
      if (!res.ok) throw new Error('Kunne ikke hente gavekort');
      const data = await res.json();
      setGiftCards(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Kunne ikke laste gavekort');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Kopierte ${code} til utklippstavlen`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleResendEmail = async (id: string, code: string) => {
    try {
      const res = await fetch(`/api/admin/gift-cards/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend-email' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kunne ikke sende e-post');
      toast.success(data.message || `Gavekort ${code} sendt på nytt`);
    } catch (err: any) {
      toast.error(err.message || 'Feil ved sending av e-post');
    }
  };

  const handleManualRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return toast.error('Oppgi gavekortkode');
    const amt = parseFloat(redeemAmount);
    if (isNaN(amt) || amt <= 0) return toast.error('Oppgi et gyldig beløp');

    setRedeemLoading(true);
    try {
      const res = await fetch('/api/admin/gift-cards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: redeemCode.trim(),
          amount: amt,
          note: redeemNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kunne ikke innløse gavekort');

      toast.success(data.message || `${amt} kr trukket fra gavekort`);
      setShowRedeemModal(false);
      setRedeemCode('');
      setRedeemAmount('');
      setRedeemNote('');
      fetchGiftCards();
    } catch (err: any) {
      toast.error(err.message || 'Feil ved innløsning');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createBuyerName.trim()) return toast.error('Oppgi navn på mottaker/kjøper');

    setCreateLoading(true);
    try {
      const res = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPersons: createPersons,
          customAmount: createCustomAmount ? parseFloat(createCustomAmount) : undefined,
          buyerName: createBuyerName.trim(),
          buyerEmail: createBuyerEmail.trim() || undefined,
          buyerPhone: createBuyerPhone.trim() || undefined,
          recipientName: createRecipientName.trim() || undefined,
          senderName: createSenderName.trim() || undefined,
          greetingMessage: createGreeting.trim() || undefined,
          note: createNote.trim() || undefined,
          paymentType: 'manual',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kunne ikke opprette gavekort');

      toast.success(`Gavekort ${data.code} ble opprettet!`);
      setShowCreateModal(false);
      setCreateBuyerName('');
      setCreateBuyerEmail('');
      setCreateBuyerPhone('');
      setCreateRecipientName('');
      setCreateSenderName('');
      setCreateGreeting('');
      setCreateNote('');
      setCreateCustomAmount('');
      fetchGiftCards();
    } catch (err: any) {
      toast.error(err.message || 'Feil ved opprettelse');
    } finally {
      setCreateLoading(false);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    let activeCount = 0;
    let outstandingBalance = 0;
    let totalRedeemed = 0;
    let totalPurchased = 0;

    giftCards.forEach((card) => {
      if (card.status === 'active') {
        activeCount++;
        outstandingBalance += card.balance || 0;
      }
      totalPurchased += card.initialAmount || 0;
      (card.redemptions || []).forEach((r: any) => {
        totalRedeemed += r.amount || 0;
      });
    });

    return { activeCount, outstandingBalance, totalRedeemed, totalPurchased };
  }, [giftCards]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return giftCards.filter((card) => {
      if (statusFilter !== 'all' && card.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        card.code?.toLowerCase().includes(q) ||
        card.buyerName?.toLowerCase().includes(q) ||
        card.buyerEmail?.toLowerCase().includes(q) ||
        card.recipientName?.toLowerCase().includes(q)
      );
    });
  }, [giftCards, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Gift className="text-[#a855f7]" size={24} />
            Gavekort
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Oversikt over alle solgte gavekort, gjenstående saldo og innløsning over disk.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setRedeemCode('');
              setRedeemAmount('');
              setRedeemNote('');
              setShowRedeemModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold transition-all border border-zinc-700 flex items-center gap-2 cursor-pointer"
          >
            <CreditCard size={16} className="text-[#c084fc]" />
            Trekk over disk
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-[#9C39FF] hover:bg-[#8A30E0] text-white text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(156,57,255,0.4)] flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            Opprett manuelt
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-xs text-zinc-400 block font-medium">Aktive gavekort</span>
          <span className="text-2xl font-black text-white mt-1 block">{kpis.activeCount} stk</span>
          <span className="text-[11px] text-emerald-400 mt-0.5 block">Klare for booking</span>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-xs text-zinc-400 block font-medium">Utestående saldo</span>
          <span className="text-2xl font-black text-[#c084fc] mt-1 block">{kpis.outstandingBalance.toLocaleString('no-NO')} kr</span>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">Kortsiktig kundeforpliktelse</span>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-xs text-zinc-400 block font-medium">Totalt innløst</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{kpis.totalRedeemed.toLocaleString('no-NO')} kr</span>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">Brukt i opplevelser</span>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-xs text-zinc-400 block font-medium">Totalt salg</span>
          <span className="text-2xl font-black text-white mt-1 block">{kpis.totalPurchased.toLocaleString('no-NO')} kr</span>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">{giftCards.length} utstedte kort</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Søk på kode, kjøper, e-post eller mottaker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#9C39FF]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Alle' },
            { id: 'active', label: 'Aktive' },
            { id: 'exhausted', label: 'Oppbrukt' },
            { id: 'expired', label: 'Utløpt' },
            { id: 'pending_payment', label: 'Venter betaling' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#9C39FF] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gift Cards Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[11px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Kjøper / Mottaker</th>
                <th className="px-4 py-3">Verdi & Personer</th>
                <th className="px-4 py-3">Restbeløp</th>
                <th className="px-4 py-3">Utløpsdato</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2 text-[#9C39FF]" />
                    Laster gavekort...
                  </td>
                </tr>
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    Ingen gavekort matcher søket.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  const isExpired = new Date(card.expiresAt) < new Date();
                  const effectiveStatus = isExpired ? 'expired' : card.status;
                  const expiryStr = new Date(card.expiresAt).toLocaleDateString('no-NO');

                  return (
                    <tr key={card.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Code */}
                      <td className="px-4 py-3.5 font-mono font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[#c084fc]">{card.code}</span>
                          <button
                            onClick={() => handleCopyCode(card.code)}
                            title="Kopier kode"
                            className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                          >
                            {copiedCode === card.code ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>

                      {/* Buyer / Recipient */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">{card.buyerName}</div>
                        <div className="text-xs text-zinc-400">{card.buyerEmail}</div>
                        {card.recipientName && (
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            Til: <span className="text-zinc-300">{card.recipientName}</span>
                          </div>
                        )}
                      </td>

                      {/* Initial Amount & Persons */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-white">{card.initialAmount} kr</div>
                        <div className="text-xs text-zinc-400">{card.targetPersons} personer</div>
                      </td>

                      {/* Remaining Balance */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className={`font-bold ${card.balance > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {card.balance} kr
                        </div>
                        {card.redemptions && card.redemptions.length > 0 && (
                          <div className="text-[11px] text-zinc-400">
                            {card.redemptions.length} trekk
                          </div>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-zinc-300">
                        {expiryStr}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {effectiveStatus === 'active' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Aktiv
                          </span>
                        )}
                        {effectiveStatus === 'exhausted' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400">
                            Oppbrukt
                          </span>
                        )}
                        {effectiveStatus === 'expired' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                            Utløpt
                          </span>
                        )}
                        {effectiveStatus === 'pending_payment' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Venter betaling
                          </span>
                        )}
                        {effectiveStatus === 'cancelled' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-500">
                            Kansellert
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {card.status === 'active' && card.balance > 0 && (
                            <button
                              onClick={() => {
                                setRedeemCode(card.code);
                                setRedeemAmount(card.balance.toString());
                                setRedeemNote('');
                                setShowRedeemModal(true);
                              }}
                              title="Trekk over disk"
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition-colors cursor-pointer"
                            >
                              <CreditCard size={15} />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedCardForLog(card)}
                            title="Se innløsningshistorikk"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                          >
                            <History size={15} />
                          </button>

                          {card.buyerEmail && card.buyerEmail.includes('@') && (
                            <button
                              onClick={() => handleResendEmail(card.id, card.code)}
                              title="Send gavekort på e-post på nytt"
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                            >
                              <Mail size={15} />
                            </button>
                          )}
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

      {/* Modal 1: Trekk over disk */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowRedeemModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <CreditCard size={20} className="text-[#a855f7]" />
              Innløs gavekort over disk
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Trekk et valgfritt beløp manuelt ved drop-in, kiosksalg eller ekstra spilletid.
            </p>

            <form onSubmit={handleManualRedeem} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-medium">Gavekortkode *</label>
                <input
                  type="text"
                  required
                  placeholder="f.eks. KRS-7X29-M4PQ"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono font-bold text-white uppercase focus:outline-none focus:border-[#9C39FF]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-medium">Beløp som skal trekkes (kr) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="f.eks. 460"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-bold text-white focus:outline-none focus:border-[#9C39FF]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-medium">Notat (valgfritt)</label>
                <input
                  type="text"
                  placeholder="f.eks. Drop-in 1 person eller Kiosk"
                  value={redeemNote}
                  onChange={(e) => setRedeemNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={redeemLoading}
                  className="px-5 py-2 rounded-xl bg-[#9C39FF] hover:bg-[#8A30E0] text-xs font-bold text-white shadow-[0_0_15px_rgba(156,57,255,0.4)] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {redeemLoading ? <Loader2 size={14} className="animate-spin" /> : 'Fullfør trekk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Opprett manuelt gavekort */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Plus size={20} className="text-[#a855f7]" />
              Opprett manuelt gavekort
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Til premier, konkurranser, kompensasjoner eller bedriftsfaktura.
            </p>

            <form onSubmit={handleCreateGiftCard} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-medium">Antall personer</label>
                  <select
                    value={createPersons}
                    onChange={(e) => {
                      const p = parseInt(e.target.value, 10);
                      setCreatePersons(p);
                      setCreateCustomAmount(calculateTotalPriceForPersons(p).toString());
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#9C39FF]"
                  >
                    {[2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} personer ({calculateTotalPriceForPersons(num)} kr)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-medium">Beløp i kr (overstyring)</label>
                  <input
                    type="number"
                    placeholder="Auto eller valgfritt"
                    value={createCustomAmount}
                    onChange={(e) => setCreateCustomAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-medium">Mottakers / Kjøpers navn *</label>
                <input
                  type="text"
                  required
                  placeholder="f.eks. Vinner av julekalender"
                  value={createBuyerName}
                  onChange={(e) => setCreateBuyerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#9C39FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-medium">E-post (sendes hit)</label>
                  <input
                    type="email"
                    placeholder="mottaker@eksempel.no"
                    value={createBuyerEmail}
                    onChange={(e) => setCreateBuyerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-medium">Telefon</label>
                  <input
                    type="tel"
                    placeholder="+47 900 00 000"
                    value={createBuyerPhone}
                    onChange={(e) => setCreateBuyerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-medium">Personlig hilsen / kommentar</label>
                <textarea
                  rows={2}
                  placeholder="f.eks. Gratulerer med seieren i konkurransen!"
                  value={createGreeting}
                  onChange={(e) => setCreateGreeting(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#9C39FF] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 rounded-xl bg-[#9C39FF] hover:bg-[#8A30E0] text-xs font-bold text-white shadow-[0_0_15px_rgba(156,57,255,0.4)] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {createLoading ? <Loader2 size={14} className="animate-spin" /> : 'Opprett gavekort'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Transaksjonslogg */}
      {selectedCardForLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCardForLog(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <History size={20} className="text-[#a855f7]" />
              Innløsningslogg: {selectedCardForLog.code}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Opprinnelig: {selectedCardForLog.initialAmount} kr &bull; Nåværende saldo:{' '}
              <strong className="text-emerald-400">{selectedCardForLog.balance} kr</strong>
            </p>

            <div className="space-y-3">
              {!selectedCardForLog.redemptions || selectedCardForLog.redemptions.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-950 rounded-xl">
                  Gavekortet er ikke benyttet ennå. Full saldo er tilgjengelig.
                </div>
              ) : (
                selectedCardForLog.redemptions.map((red: any) => (
                  <div key={red.id} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-red-400">-{red.amount} kr</span>
                      <span className="text-[11px] text-zinc-500">
                        {new Date(red.createdAt).toLocaleString('no-NO')}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-300">
                      Saldo etter: <strong>{red.balanceAfter} kr</strong> &bull; Kanal:{' '}
                      <span className="capitalize">{red.channel.replace('_', ' ')}</span>
                    </div>
                    {red.note && <div className="text-xs text-zinc-400 italic mt-1">&ldquo;{red.note}&rdquo;</div>}
                    {red.booking && (
                      <div className="text-[11px] text-[#c084fc] pt-1">
                        Knyttet til booking: {red.booking.firstName} {red.booking.lastName} ({red.booking.date} kl. {red.booking.time})
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedCardForLog(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
