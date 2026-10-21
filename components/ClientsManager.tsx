"use client";

import React, { useState, useEffect } from "react";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Image as ImageIcon, 
  Upload, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  CheckCircle2,
  Building2,
  SlidersHorizontal,
  Info
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ClientRecord {
  id: string;
  companyName: string;
  mainImage?: string | null;
  logoImage?: string | null;
  websiteUrl?: string | null;
  showInLogoSlider: boolean;
  showInTestimonials: boolean;
  isActive: boolean;
  order: number;
  createdAt?: string;
}

export default function ClientsManager() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClientRecord> | null>(null);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingLogoImage, setUploadingLogoImage] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "slider" | "testimonials">("all");

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      data.sort((a: ClientRecord, b: ClientRecord) => (a.order ?? 999) - (b.order ?? 999));
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Kunne ikke hente bedriftskunder");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = (client: ClientRecord) => {
    setEditingId(client.id);
    setEditForm({
      ...client,
      showInLogoSlider: client.showInLogoSlider ?? true,
      showInTestimonials: client.showInTestimonials ?? true,
      isActive: client.isActive ?? true,
    });
  };

  const handleAddNew = () => {
    setEditingId("new");
    setEditForm({
      companyName: "",
      mainImage: "",
      logoImage: "",
      websiteUrl: "",
      showInLogoSlider: true,
      showInTestimonials: true,
      isActive: true,
      order: clients.length > 0 ? Math.max(...clients.map(c => c.order ?? 0)) + 1 : 1
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isLogo) setUploadingLogoImage(true);
    else setUploadingMainImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pathPrefix", isLogo ? "clients" : "testimonials");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Opplasting feilet");
      const data = await res.json();

      if (isLogo) {
        setEditForm((prev) => ({ ...prev, logoImage: data.url }));
        toast.success("Logo ble lastet opp");
      } else {
        setEditForm((prev) => ({ ...prev, mainImage: data.url }));
        toast.success("Teambilde ble lastet opp");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Feil under opplasting av bilde");
    } finally {
      if (isLogo) setUploadingLogoImage(false);
      else setUploadingMainImage(false);
    }
  };

  const handleSave = async () => {
    if (!editForm || !editForm.companyName?.trim()) {
      toast.error("Bedriftsnavn er påkrevd");
      return;
    }

    try {
      if (editingId === "new") {
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });
        if (!res.ok) throw new Error("Kunne ikke opprette");
        toast.success("Bedrift opprettet");
      } else {
        const res = await fetch(`/api/testimonials/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });
        if (!res.ok) throw new Error("Kunne ikke oppdatere");
        toast.success("Bedrift oppdatert");
      }

      setEditingId(null);
      setEditForm(null);
      fetchClients();
    } catch (error: any) {
      console.error("Error saving client:", error);
      toast.error(error.message || "Lagring feilet");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Er du sikker på at du vil slette «${name}»?`)) return;

    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Sletting feilet");
      toast.success("Bedrift slettet");
      fetchClients();
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast.error(error.message || "Kunne ikke slette");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === clients.length - 1) return;

    const newClients = [...clients];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    const tempOrder = newClients[index].order;
    newClients[index].order = newClients[targetIndex].order;
    newClients[targetIndex].order = tempOrder;

    [newClients[index], newClients[targetIndex]] = [newClients[targetIndex], newClients[index]];
    setClients(newClients);

    try {
      const updates = newClients.map((c, idx) => ({ id: c.id, order: idx + 1 }));
      const res = await fetch("/api/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Kunne ikke oppdatere rekkefølge");
    } catch (error) {
      console.error("Error reordering clients:", error);
      toast.error("Kunne ikke lagre ny rekkefølge");
      fetchClients();
    }
  };

  const filteredClients = clients.filter((c) => {
    if (filterMode === "slider") return c.showInLogoSlider && c.logoImage;
    if (filterMode === "testimonials") return c.showInTestimonials && c.mainImage;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-[#9C39FF]" />
            <h2 className="text-xl font-medium text-white">Bedriftskunder, Logoer & Omtaler</h2>
          </div>
          <p className="text-sm text-zinc-400 font-light max-w-2xl">
            Styr bedrifter som vises i den horisontale logo-stripen på teambuilding-siden, og teambilder som vises i forside-karusellen.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-[#9C39FF] hover:bg-[#8A30E0] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-[#9C39FF]/20"
        >
          <Plus className="w-4 h-4" /> Legg til bedrift
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setFilterMode("all")}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            filterMode === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Alle bedrifter ({clients.length})
        </button>
        <button
          onClick={() => setFilterMode("slider")}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            filterMode === "slider" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          I Logo-slider ({clients.filter(c => c.showInLogoSlider && c.logoImage).length})
        </button>
        <button
          onClick={() => setFilterMode("testimonials")}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            filterMode === "testimonials" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          I Forsidekarusell ({clients.filter(c => c.showInTestimonials && c.mainImage).length})
        </button>
      </div>

      {/* Edit / New Modal */}
      {editingId && editForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h3 className="text-xl font-medium text-white">
                {editingId === "new" ? "Legg til ny bedrift" : "Rediger bedrift"}
              </h3>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm(null);
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Bedriftsnavn <span className="text-[#9C39FF]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="f.eks. Kristiansand Kommune eller Verkstedet Spiseri"
                  value={editForm.companyName || ""}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Nettside (valgfritt)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editForm.websiteUrl || ""}
                  onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
                />
              </div>

              {/* SECTION: Company Logo (Recommended Specs) */}
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#9C39FF]" />
                    <span className="text-sm font-medium text-white">Bedriftslogo (Logo-slider & kort)</span>
                  </div>
                  {editForm.logoImage && (
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, logoImage: "" })}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Fjern logo
                    </button>
                  )}
                </div>

                {/* Recommended Input Guidelines Alert */}
                <div className="flex items-start gap-2 bg-[#9C39FF]/10 border border-[#9C39FF]/20 rounded-xl p-3 text-xs text-zinc-300">
                  <Info className="w-4 h-4 text-[#9C39FF] flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-white">Anbefalt logo-format:</p>
                    <p className="text-zinc-400">
                      <strong>SVG (vektor)</strong> eller transparent <strong>PNG / WebP</strong> i liggende format (f.eks. ca. <strong>300×80 px</strong> til <strong>400×120 px</strong>). Maks 2 MB.
                    </p>
                    <p className="text-zinc-400">
                      Hvit/lys eller transparent logo gir best kontrast mot mørk bakgrunn i logo-stripen.
                    </p>
                  </div>
                </div>

                {editForm.logoImage ? (
                  <div className="relative h-20 w-full bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center p-3 overflow-hidden">
                    <Image
                      src={editForm.logoImage}
                      alt={editForm.companyName || "Logo"}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 rounded-xl cursor-pointer text-xs text-zinc-300 transition-colors">
                      {uploadingLogoImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#9C39FF]" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#9C39FF]" />
                      )}
                      <span>Last opp logo (SVG, PNG, WebP)</span>
                      <input
                        type="file"
                        accept="image/svg+xml,image/png,image/webp,image/jpeg"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                        disabled={uploadingLogoImage}
                      />
                    </label>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Eller lim inn direkte bilde-URL..."
                  value={editForm.logoImage || ""}
                  onChange={(e) => setEditForm({ ...editForm, logoImage: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#9C39FF]"
                />
              </div>

              {/* SECTION: Team Photo / Action Photo (Recommended Specs) */}
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#9C39FF]" />
                    <span className="text-sm font-medium text-white">Teambilde / Stemningsfoto (Forsidekarusell)</span>
                  </div>
                  {editForm.mainImage && (
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, mainImage: "" })}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Fjern bilde
                    </button>
                  )}
                </div>

                {/* Recommended Input Guidelines Alert */}
                <div className="flex items-start gap-2 bg-[#9C39FF]/10 border border-[#9C39FF]/20 rounded-xl p-3 text-xs text-zinc-300">
                  <Info className="w-4 h-4 text-[#9C39FF] flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-white">Anbefalt teambilde-format:</p>
                    <p className="text-zinc-400">
                      Liggende <strong>16:9</strong> eller <strong>16:10</strong> bilde (min. <strong>1200×675 px</strong>, gjerne 1600×900 px). <strong>JPG</strong> eller <strong>WebP</strong>. Maks 5 MB.
                    </p>
                    <p className="text-zinc-400">
                      Velg et levende bilde der gjestene/kollegene smiler eller feirer. Unngå høykantbilder (portrait).
                    </p>
                  </div>
                </div>

                {editForm.mainImage ? (
                  <div className="relative aspect-[16/9] w-full bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
                    <Image
                      src={editForm.mainImage}
                      alt={editForm.companyName || "Teambilde"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 rounded-xl cursor-pointer text-xs text-zinc-300 transition-colors">
                      {uploadingMainImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#9C39FF]" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#9C39FF]" />
                      )}
                      <span>Last opp teambilde (JPG, WebP)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                        disabled={uploadingMainImage}
                      />
                    </label>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Eller lim inn direkte bilde-URL..."
                  value={editForm.mainImage || ""}
                  onChange={(e) => setEditForm({ ...editForm, mainImage: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#9C39FF]"
                />
              </div>

              {/* Visningsvalg & Brytere */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={editForm.showInLogoSlider ?? true}
                    onChange={(e) => setEditForm({ ...editForm, showInLogoSlider: e.target.checked })}
                    className="accent-[#9C39FF] w-4 h-4 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-white block">Logo-slider</span>
                    <span className="text-zinc-400">På teambuilding</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={editForm.showInTestimonials ?? true}
                    onChange={(e) => setEditForm({ ...editForm, showInTestimonials: e.target.checked })}
                    className="accent-[#9C39FF] w-4 h-4 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-white block">Forsidekarusell</span>
                    <span className="text-zinc-400">Kundeomtale</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={editForm.isActive ?? true}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="accent-[#9C39FF] w-4 h-4 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-white block">Aktiv status</span>
                    <span className="text-zinc-400">Synlig på nett</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setEditForm(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-[#9C39FF] hover:bg-[#8A30E0] text-white shadow-lg shadow-[#9C39FF]/20"
              >
                <Save className="w-4 h-4" /> Lagre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clients List Table / Cards */}
      {filteredClients.length === 0 ? (
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-500">
          Ingen bedrifter funnet med gjeldende filter.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                client.isActive 
                  ? "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700" 
                  : "bg-zinc-950/40 border-zinc-900 opacity-60"
              }`}
            >
              {/* Left: Reorder buttons + Thumbnails */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveOrder(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 transition-colors"
                    title="Flytt opp"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(index, "down")}
                    disabled={index === filteredClients.length - 1}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 transition-colors"
                    title="Flytt ned"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Logo Thumbnail */}
                <div className="relative w-16 h-12 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                  {client.logoImage ? (
                    <Image
                      src={client.logoImage}
                      alt={client.companyName}
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-medium">Ingen logo</span>
                  )}
                </div>

                {/* Team Photo Thumbnail */}
                <div className="relative w-16 h-12 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {client.mainImage ? (
                    <Image
                      src={client.mainImage}
                      alt={client.companyName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-medium">Kun logo</span>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-medium text-white">{client.companyName}</h4>
                    {client.websiteUrl && (
                      <a
                        href={client.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {client.showInLogoSlider && client.logoImage && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Logo-slider
                      </span>
                    )}
                    {client.showInTestimonials && client.mainImage && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Forsidekarusell
                      </span>
                    )}
                    {!client.isActive && (
                      <span className="text-[11px] font-medium text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                        Inaktiv
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-xl transition-colors"
                  title="Rediger bedrift"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id, client.companyName)}
                  className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                  title="Slett bedrift"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
