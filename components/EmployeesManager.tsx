"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Mail, User, Shield, Check, Trash2, UserPlus, Info } from "lucide-react";

export default function EmployeesManager() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // eslint-disable-next-line
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role: 'admin' }) // Everyone is admin based on feedback
      });
      if (res.ok) {
        setName("");
        setEmail("");
        await fetchEmployees();
      } else {
        const err = await res.json();
        alert(err.error || "Kunne ikke opprette ansatt");
      }
    } catch (e) {
      console.error(e);
      alert("En feil oppstod");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, empEmail: string) => {
    if (empEmail === "post@krsvr.no") {
       alert("Du kan ikke slette hovedkontoen.");
       return;
    }
    if (!confirm("Er du sikker på at du vil slette denne ansatte?")) return;
    try {
      const res = await fetch(`/api/admin/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchEmployees();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-start gap-3 text-sm">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1">Invitasjon av nye ansatte</p>
          <p>
            Når du legger til en e-post her, vil personen få tilgang til backend. Husk at webmaster også må opprette brukeren manuelt i Supabase Auth. Sørg for at webmaster bruker nøyaktig samme e-postadresse som du legger inn her.
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Legg til Ansatt</h2>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm text-zinc-400">Navn</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
                placeholder="F.eks. Kari Nordmann"
              />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm text-zinc-400">E-post</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
                placeholder="kari@example.com"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-2.5 bg-[#9C39FF] text-white text-sm font-medium rounded-lg hover:bg-[#8A2BE2] transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span className="flex items-center gap-2"><UserPlus className="w-4 h-4"/> Legg til</span>}
          </button>
        </form>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-900 shadow-[0_1px_0_0_#27272a] text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Navn</th>
              <th className="px-6 py-4 font-medium">E-post</th>
              <th className="px-6 py-4 font-medium">Rolle</th>
              <th className="px-6 py-4 font-medium">Sist innlogget</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Handling</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  Ingen ansatte funnet.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-zinc-200 font-medium">
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {emp.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                      <Shield className="w-3.5 h-3.5" />
                      Admin
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-400 text-xs">
                      {emp.lastLogin ? new Date(emp.lastLogin).toLocaleString('no-NO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Aldri"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {emp.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                        <Check className="w-3 h-3" /> Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-xs">
                        Inaktiv
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(emp.id, emp.email)}
                      className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                      title="Slett ansatt"
                      disabled={emp.email === "post@krsvr.no"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
