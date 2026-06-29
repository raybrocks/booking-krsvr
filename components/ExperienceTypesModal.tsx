import React, { useState } from "react";
import { X, Plus, Trash2, Save, Edit, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

export default function ExperienceTypesModal({ 
  experienceTypes, 
  onClose, 
  onRefresh 
}: { 
  experienceTypes: any[], 
  onClose: () => void, 
  onRefresh: () => void 
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/experience-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ny Spilltype" })
      });
      if (!res.ok) throw new Error("Failed");
      onRefresh();
      toast.success("Spilltype lagt til!");
    } catch (error) {
      toast.error("Kunne ikke legge til spilltype");
    }
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/experience-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, slug: editSlug })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setEditingId(null);
      onRefresh();
      toast.success("Lagret!");
    } catch (error: any) {
      toast.error(error.message || "Feil ved lagring");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne typen?")) return;
    try {
      const res = await fetch(`/api/experience-types/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onRefresh();
      toast.success("Slettet!");
    } catch (error: any) {
      toast.error(error.message || "Feil ved sletting");
    }
  };

  const moveType = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === experienceTypes.length - 1) return;

    const newTypes = [...experienceTypes];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newTypes[index];
    newTypes[index] = newTypes[swapIndex];
    newTypes[swapIndex] = temp;

    const updates = newTypes.map((t, i) => ({ id: t.id, order: i }));

    // Optimistic UI update could go here, but we'll just wait for API for simplicity in modal
    try {
      const res = await fetch("/api/experience-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Failed");
      onRefresh();
    } catch (error) {
      toast.error("Kunne ikke oppdatere rekkefølge");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-medium">Administrer Spilltyper</h2>
            <p className="text-sm text-zinc-400">Typer brukes til å gruppere spill og generere URL-er for SEO.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {experienceTypes.length === 0 && (
            <p className="text-zinc-500 text-center py-8">Ingen spilltyper funnet.</p>
          )}
          
          {experienceTypes.map((type, index) => (
            <div key={type.id} className="flex items-center gap-3 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
              <div className="flex flex-col gap-1 pr-2 border-r border-zinc-800">
                <button onClick={() => moveType(index, 'up')} disabled={index === 0} className="text-zinc-500 hover:text-white disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                <button onClick={() => moveType(index, 'down')} disabled={index === experienceTypes.length - 1} className="text-zinc-500 hover:text-white disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-4">
                {editingId === type.id ? (
                  <>
                    <input 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Visningsnavn"
                      className="bg-zinc-950 border border-[#9C39FF]/50 rounded px-3 py-1.5 text-sm w-full focus:outline-none"
                    />
                    <input 
                      value={editSlug}
                      onChange={e => setEditSlug(e.target.value)}
                      placeholder="URL-slug (f.eks. escape-room)"
                      className="bg-zinc-950 border border-[#9C39FF]/50 rounded px-3 py-1.5 text-sm w-full text-zinc-400 focus:outline-none"
                    />
                  </>
                ) : (
                  <>
                    <div className="font-medium">{type.name}</div>
                    <div className="text-zinc-500 text-sm flex items-center">/vr-opplevelser/{type.slug}</div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingId === type.id ? (
                  <button onClick={() => handleSave(type.id)} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg"><Save className="w-4 h-4" /></button>
                ) : (
                  <button onClick={() => {
                    setEditingId(type.id);
                    setEditName(type.name);
                    setEditSlug(type.slug);
                  }} className="p-2 text-zinc-400 hover:bg-zinc-800 rounded-lg hover:text-white"><Edit className="w-4 h-4" /></button>
                )}
                <button onClick={() => handleDelete(type.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 rounded-b-2xl">
          <button 
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 bg-[#9C39FF] text-white py-3 rounded-xl hover:bg-[#8b32e6] transition-colors font-medium"
          >
            <Plus className="w-5 h-5" /> Legg til ny spilltype
          </button>
        </div>
      </div>
    </div>
  );
}
