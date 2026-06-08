"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit2, CheckCircle2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type DiscountCode = {
  id: string;
  code: string;
  discount: number;
  type: string;
  active: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
};

export default function DiscountCodesManager() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("percentage");
  const [active, setActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/admin/discount-codes");
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      }
    } catch (error) {
      console.error("Failed to fetch discount codes", error);
      toast.error("Kunne ikke laste inn rabattkoder");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setDiscount("");
    setType("percentage");
    setActive(true);
    setExpiresAt("");
    setUsageLimit("");
  };

  const handleOpenEdit = (c: DiscountCode) => {
    setEditingId(c.id);
    setCode(c.code);
    setDiscount(c.discount.toString());
    setType(c.type);
    setActive(c.active);
    setExpiresAt(c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : "");
    setUsageLimit(c.usageLimit ? c.usageLimit.toString() : "");
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!code || !discount) {
      toast.error("Kode og rabatt er påkrevd");
      return;
    }

    try {
      const payload = {
        code,
        discount: parseFloat(discount),
        type,
        active,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      };

      const url = editingId 
        ? `/api/admin/discount-codes/${editingId}` 
        : `/api/admin/discount-codes`;
      
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingId ? "Oppdatert!" : "Opprettet!");
        setIsOpen(false);
        resetForm();
        fetchCodes();
      } else {
        const data = await res.json();
        toast.error(data.error || "Noe gikk galt");
      }
    } catch (error) {
      toast.error("En feil oppstod");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne koden?")) return;
    
    try {
      const res = await fetch(`/api/admin/discount-codes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Slettet");
        fetchCodes();
      } else {
        toast.error("Kunne ikke slette koden");
      }
    } catch (error) {
      toast.error("En feil oppstod");
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/discount-codes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive })
      });
      if (res.ok) {
        fetchCodes();
      }
    } catch (error) {
      toast.error("Kunne ikke endre status");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-6 h-6 text-zinc-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-zinc-200 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-[#9C39FF]" />
          Rabattkoder
        </h2>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors bg-[#9C39FF] hover:bg-[#8A2BE2] text-white">
            <Plus className="w-4 h-4 mr-2" /> Ny kode
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
            <DialogHeader>
              <DialogTitle>{editingId ? "Rediger" : "Opprett ny"} rabattkode</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kode (f.eks. SOMMER25)</Label>
                  <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="bg-zinc-900 border-zinc-800 uppercase" />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center space-x-2 h-10">
                    <input type="checkbox" id="active-mode" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-[#9C39FF]" />
                    <Label htmlFor="active-mode">Aktiv</Label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rabatt Mengde</Label>
                  <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(val) => setType(val as string)}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                      <SelectItem value="percentage">Prosent (%)</SelectItem>
                      <SelectItem value="fixed">Fast beløp (NOK)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bruksgrense (valgfritt)</Label>
                  <Input type="number" placeholder="F.eks. 100" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label>Utløpsdato (valgfritt)</Label>
                  <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleSave} className="bg-[#9C39FF] hover:bg-[#8A2BE2] text-white">
                  Lagre kode
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {codes.length === 0 ? (
          <div className="text-center p-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-zinc-500">
            Ingen rabattkoder opprettet enda.
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Kode</th>
                  <th className="px-6 py-4 font-medium">Rabatt</th>
                  <th className="px-6 py-4 font-medium">Brukt / Maks</th>
                  <th className="px-6 py-4 font-medium">Utløper</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {codes.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{c.code}</td>
                    <td className="px-6 py-4">
                      <span className="bg-[#9C39FF]/20 text-[#9C39FF] px-2 py-1 rounded text-xs font-semibold">
                        {c.type === 'percentage' ? `${c.discount}%` : `${c.discount} NOK`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {c.usageCount} {c.usageLimit ? `/ ${c.usageLimit}` : ' / ∞'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('no-NO') : 'Aldri'}
                    </td>
                    <td className="px-6 py-4">
                       <button onClick={() => toggleActive(c.id, c.active)} className={`px-2 py-1 rounded text-xs font-medium ${c.active ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                          {c.active ? "Aktiv" : "Deaktivert"}
                       </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenEdit(c)} className="text-zinc-500 hover:text-white mx-2"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
