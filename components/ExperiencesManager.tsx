"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit, Save, X, Image as ImageIcon, Upload, ArrowUp, ArrowDown, Copy, Settings, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import TestimonialsManager from "./TestimonialsManager";
import ExperienceTypesModal from "./ExperienceTypesModal";
import { COMMON_LANGUAGES, getLanguageInfo } from "@/lib/languages";

const SUITABLE_FOR_OPTIONS = [
  "Barn fra 8 år",
  "Barn fra 8 år sammen med voksne",
  "Ungdom",
  "Ungdom sammen med voksne",
  "Voksne"
];

const FILTER_CATEGORY_OPTIONS = [
  "Familie",
  "Rask Action",
  "Escape Room"
];

export default function ExperiencesManager() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Experience Types State
  const [experienceTypes, setExperienceTypes] = useState<any[]>([]);
  const [showTypesModal, setShowTypesModal] = useState(false);
  
  // Global Pricing State
  const [globalPricing, setGlobalPricing] = useState<Record<string, number>>({
    "2": 460,
    "3": 395,
    "4": 395,
    "5": 385,
    "6": 385,
    "7": 385,
    "8": 375
  });
  const [savingPricing, setSavingPricing] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const fetchExperiences = async () => {
    try {
      const res = await fetch("/api/experiences");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setExperiences(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperienceTypes = async () => {
    try {
      const res = await fetch("/api/experience-types");
      if (!res.ok) throw new Error("Failed to fetch types");
      const data = await res.json();
      setExperienceTypes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.pricing && data.pricing.pricing) {
          setGlobalPricing(data.pricing.pricing);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExperiences();
    fetchPricing();
    fetchExperienceTypes();
  }, []);

  const [customLang, setCustomLang] = useState("");

  const handleEdit = (exp: any) => {
    setEditingId(exp.id);
    const existingImages = Array.isArray(exp.images) && exp.images.length > 0
      ? exp.images
      : exp.picture ? [exp.picture] : [];
    const defaultCats = Array.isArray(exp.filterCategories) && exp.filterCategories.length > 0
      ? exp.filterCategories
      : [
          ...(exp.type && FILTER_CATEGORY_OPTIONS.includes(exp.type) ? [exp.type] : []),
          ...(exp.familyFriendly && exp.type !== "Familie" ? ["Familie"] : [])
        ];
    setEditForm({
      ...exp,
      images: existingImages,
      picture: existingImages[0] || exp.picture || "",
      languages: Array.isArray(exp.languages) ? exp.languages : [],
      suitableFor: Array.isArray(exp.suitableFor) ? exp.suitableFor : [],
      filterCategories: defaultCats
    });
    setCustomLang("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddNew = () => {
    setEditingId("new");
    setEditForm({
      id: "new",
      name: "New Experience",
      subName: "",
      shortDescription: "",
      type: "Escape Room",
      age: "12+",
      difficulty: "Medium",
      maxPlayers: 6,
      arenaSize: "",
      isActive: true,
      isNew: false,
      familyFriendly: false,
      teambuilding: false,
      party: false,
      jumpScare: false,
      action: false,
      highscore: false,
      fantasy: false,
      mystic: false,
      codeSolving: false,
      cinematic: false,
      picture: "",
      images: [],
      videoUrl: "",
      awards: [],
      languages: ["English"],
      suitableFor: [],
      filterCategories: ["Escape Room"]
    });
    setCustomLang("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFilterCategory = (cat: string) => {
    if (!editForm) return;
    const current: string[] = Array.isArray(editForm.filterCategories) ? [...editForm.filterCategories] : [];
    const exists = current.includes(cat);
    const nextList = exists
      ? current.filter((item) => item !== cat)
      : FILTER_CATEGORY_OPTIONS.filter((opt) => current.includes(opt) || opt === cat);
    setEditForm({
      ...editForm,
      filterCategories: nextList,
      familyFriendly: nextList.includes("Familie")
    });
  };

  const toggleSuitableFor = (option: string) => {
    if (!editForm) return;
    const current: string[] = Array.isArray(editForm.suitableFor) ? [...editForm.suitableFor] : [];
    const exists = current.includes(option);
    const nextList = exists
      ? current.filter((item) => item !== option)
      : SUITABLE_FOR_OPTIONS.filter((opt) => current.includes(opt) || opt === option);
    const isFamilyFriendly = nextList.some((opt) => opt.startsWith("Barn") || opt.startsWith("Ungdom"));
    setEditForm({ ...editForm, suitableFor: nextList, familyFriendly: isFamilyFriendly });
  };

  const toggleLanguage = (langName: string) => {
    if (!editForm) return;
    const current: string[] = Array.isArray(editForm.languages) ? [...editForm.languages] : [];
    const exists = current.some(l => l.toLowerCase() === langName.toLowerCase());
    const updated = exists 
      ? current.filter(l => l.toLowerCase() !== langName.toLowerCase())
      : [...current, langName];
    setEditForm({ ...editForm, languages: updated });
  };

  const addCustomLanguage = () => {
    const val = customLang.trim();
    if (!val) return;
    const current: string[] = Array.isArray(editForm.languages) ? [...editForm.languages] : [];
    if (!current.some(l => l.toLowerCase() === val.toLowerCase())) {
      setEditForm({ ...editForm, languages: [...current, val] });
    }
    setCustomLang("");
  };

  const clearLanguages = () => {
    setEditForm({ ...editForm, languages: [] });
  };

  const handleAwardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Could reuse uploadingImage or a new state
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pathPrefix", "awards");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const currentAwards = Array.isArray(editForm.awards) ? [...editForm.awards] : [];
      setEditForm({ ...editForm, awards: [...currentAwards, data.url] });
      toast.success("Award image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Award upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeAward = (indexToRemove: number) => {
    if (!Array.isArray(editForm.awards)) return;
    const newAwards = editForm.awards.filter((_: any, index: number) => index !== indexToRemove);
    setEditForm({ ...editForm, awards: newAwards });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("pathPrefix", "experiences");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        uploadedUrls.push(data.url);
      }

      const currentImages = Array.isArray(editForm.images)
        ? [...editForm.images]
        : editForm.picture ? [editForm.picture] : [];
      const updatedImages = [...currentImages, ...uploadedUrls];

      setEditForm({
        ...editForm,
        images: updatedImages,
        picture: updatedImages[0] || ""
      });
      toast.success(uploadedUrls.length > 1 ? `${uploadedUrls.length} bilder lastet opp` : "Bilde lastet opp");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    const currentImages = Array.isArray(editForm.images) ? [...editForm.images] : [];
    const updatedImages = currentImages.filter((_: string, index: number) => index !== indexToRemove);
    setEditForm({
      ...editForm,
      images: updatedImages,
      picture: updatedImages[0] || ""
    });
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const currentImages = Array.isArray(editForm.images) ? [...editForm.images] : [];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;
    const updatedImages = [...currentImages];
    [updatedImages[index], updatedImages[targetIndex]] = [updatedImages[targetIndex], updatedImages[index]];
    setEditForm({
      ...editForm,
      images: updatedImages,
      picture: updatedImages[0] || ""
    });
  };

  const handleSave = async () => {
    try {
      const normalizedImages = Array.isArray(editForm.images) ? editForm.images : (editForm.picture ? [editForm.picture] : []);
      const payload = {
        ...editForm,
        images: normalizedImages,
        picture: normalizedImages[0] || ""
      };
      if (editingId === "new") {
        const res = await fetch("/api/experiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to create");
      } else {
        const res = await fetch(`/api/experiences/${editForm.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to update");
      }
      toast.success("Experience saved successfully");
      setEditingId(null);
      fetchExperiences();
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("Failed to save experience");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this experience?")) {
      try {
        const res = await fetch(`/api/experiences/${id}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error("Failed to delete");
        toast.success("Experience deleted");
        fetchExperiences();
      } catch (error) {
        console.error("Error deleting experience:", error);
        toast.error("Failed to delete experience");
      }
    }
  };

  const handleDuplicate = async (exp: any) => {
    try {
      const { id, ...dataToDuplicate } = exp;
      const copy = {
        ...dataToDuplicate,
        name: `${exp.name} (Copy)`,
        isActive: false, // Make it inactive by default
      };
      const res = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy)
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      toast.success("Experience duplicated as draft");
      fetchExperiences();
    } catch (error) {
      console.error("Error duplicating experience:", error);
      toast.error("Failed to duplicate experience");
    }
  };

  const moveExperience = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === experiences.length - 1) return;

    const newExperiences = [...experiences];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newExperiences[index];
    newExperiences[index] = newExperiences[swapIndex];
    newExperiences[swapIndex] = temp;

    const updates = newExperiences.map((exp, i) => ({ id: exp.id, order: i }));
    setExperiences(newExperiences);

    try {
      const res = await fetch("/api/experiences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Failed to update order");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order.");
    }
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing: { pricing: globalPricing } })
      });
      if (!res.ok) throw new Error("Failed to save pricing");
      toast.success("Global pricing updated successfully");
    } catch (error) {
      console.error("Error saving pricing:", error);
      toast.error("Failed to update pricing");
    } finally {
      setSavingPricing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light">Global Pricing Rules</h2>
          <p className="text-zinc-400 text-sm">Set the per-person price based on group size. This applies to all experiences.</p>
        </div>
        <button 
          onClick={() => setShowPricing(!showPricing)}
          className="bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors"
        >
          {showPricing ? 'Skjul prisstruktur' : 'Endre prisstruktur'}
        </button>
      </div>

      {showPricing && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[2, 3, 4, 5, 6, 7, 8].map(size => (
              <div key={size} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-400">
                  {size}{size === 8 ? '+' : ''} persons (kr/pers)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={globalPricing[size.toString()] || ''}
                    onChange={(e) => {
                      const newPricing = {...globalPricing};
                      newPricing[size.toString()] = Number(e.target.value);
                      setGlobalPricing(newPricing);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-10 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                  <span className="absolute right-3 top-2.5 text-zinc-500 text-sm">kr</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => {
                handleSavePricing();
                setShowPricing(false);
              }}
              disabled={savingPricing}
              className="flex items-center gap-2 bg-zinc-800 text-white px-6 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {savingPricing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lagre og lukk
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-12">
        <div>
          <h2 className="text-2xl font-light">VR Experiences</h2>
          <p className="text-zinc-400 text-sm">Manage the games and experiences available for booking.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowTypesModal(true)}
            className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors"
          >
            <Settings className="w-4 h-4" /> Spilltyper
          </button>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-[#9C39FF] text-white px-4 py-2 rounded-xl hover:bg-[#8b32e6] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
      </div>

      {editingId && (
        <div className="bg-zinc-900 border border-[#9C39FF]/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(156,57,255,0.1)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium">{editForm.id.startsWith('exp_') ? 'Add New Experience' : 'Edit Experience'}</h3>
            <button onClick={() => setEditingId(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex flex-col gap-8">
            {/* GRUNNLEGGENDE INFO */}
            <div>
              <h4 className="text-lg font-medium mb-4 text-white border-b border-zinc-800 pb-2">Grunnleggende info</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Navn</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Undertittel (valgfri)</label>
                  <input
                    type="text"
                    value={editForm.subName || ""}
                    onChange={(e) => setEditForm({...editForm, subName: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                    placeholder="e.g. Mixed Reality Edition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
                  <select 
                    value={editForm.typeId || ""}
                    onChange={(e) => {
                      const typeObj = experienceTypes.find(t => t.id === e.target.value);
                      setEditForm({...editForm, typeId: e.target.value, type: typeObj?.name || ""});
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  >
                    <option value="">Velg type...</option>
                    {experienceTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Beskrivelse</label>
                  <textarea 
                    value={editForm.shortDescription}
                    onChange={(e) => setEditForm({...editForm, shortDescription: e.target.value})}
                    placeholder="Beskriv opplevelsen... (linjeskift fungerer i visningen på forsiden)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF] min-h-[120px]"
                  />
                </div>
              </div>
            </div>

            {/* SPESIFIKASJONER */}
            <div>
              <h4 className="text-lg font-medium mb-4 text-white border-b border-zinc-800 pb-2">Spesifikasjoner</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Aldersgrense</label>
                  <input 
                    type="text" 
                    value={editForm.age}
                    onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Maks spillere</label>
                  <input 
                    type="number" 
                    value={editForm.maxPlayers}
                    onChange={(e) => setEditForm({...editForm, maxPlayers: Number(e.target.value)})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Vanskelighetsgrad / Aktivitet</label>
                  <input 
                    type="text" 
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Arena Size (valgfri)</label>
                  <input 
                    type="text"
                    value={editForm.arenaSize || ""}
                    onChange={(e) => setEditForm({...editForm, arenaSize: e.target.value})}
                    placeholder="e.g. 140 kvm"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>
            </div>

            {/* TAGS OG SYNLIGHET */}
            <div>
              <h4 className="text-lg font-medium mb-4 text-white border-b border-zinc-800 pb-2">Filtrering & Synlighet</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Filter-kategorier</label>
                  <p className="text-[11px] text-zinc-500 mb-3">Kan ligge i flere filtre samtidig</p>
                  <div className="flex flex-col gap-2">
                    {FILTER_CATEGORY_OPTIONS.map((cat) => (
                      <label key={cat} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Array.isArray(editForm.filterCategories) && editForm.filterCategories.includes(cat)}
                          onChange={() => toggleFilterCategory(cat)}
                          className="w-4 h-4 accent-[#9C39FF]"
                        />
                        <span className="ml-2 text-sm text-zinc-300">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Passer for</label>
                  <div className="flex flex-col gap-2">
                    {SUITABLE_FOR_OPTIONS.map((option) => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Array.isArray(editForm.suitableFor) && editForm.suitableFor.includes(option)}
                          onChange={() => toggleSuitableFor(option)}
                          className="w-4 h-4 accent-[#9C39FF]"
                        />
                        <span className="ml-2 text-sm text-zinc-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Stemning</label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.cinematic || false}
                        onChange={(e) => setEditForm({...editForm, cinematic: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Cinematic</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.action || false}
                        onChange={(e) => setEditForm({...editForm, action: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Action</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.jumpScare || false}
                        onChange={(e) => setEditForm({...editForm, jumpScare: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Jump Scare</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.highscore || false}
                        onChange={(e) => setEditForm({...editForm, highscore: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Highscore</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.fantasy || false}
                        onChange={(e) => setEditForm({...editForm, fantasy: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Fantasy</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.mystic || false}
                        onChange={(e) => setEditForm({...editForm, mystic: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Mystikk</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.codeSolving || false}
                        onChange={(e) => setEditForm({...editForm, codeSolving: e.target.checked})}
                        className="w-4 h-4 accent-[#9C39FF]"
                      />
                      <span className="ml-2 text-sm text-zinc-300">Kodeløsning</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Status</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center cursor-pointer bg-zinc-900 border border-zinc-800 p-3 rounded-xl hover:border-zinc-700 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                        className="w-5 h-5 accent-[#9C39FF]"
                      />
                      <div className="ml-3 flex flex-col">
                        <span className="text-sm font-medium text-white">Aktiv (Synlig)</span>
                        <span className="text-xs text-zinc-500">Vis på forsiden</span>
                      </div>
                    </label>
                    <label className="flex items-center cursor-pointer bg-zinc-900 border border-zinc-800 p-3 rounded-xl hover:border-zinc-700 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={editForm.isNew || false}
                        onChange={(e) => setEditForm({...editForm, isNew: e.target.checked})}
                        className="w-5 h-5 accent-[#9C39FF]"
                      />
                      <div className="ml-3 flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">NYHET-badge</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#19EB5B] text-black px-1.5 py-0.5 rounded">Nyhet</span>
                        </div>
                        <span className="text-xs text-zinc-500">Marker som nyhet på nettsiden</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SPRÅK (LANGUAGES) */}
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#9C39FF]" />
                  <h4 className="text-lg font-medium text-white">Språk (Languages)</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400">
                    {editForm.languages?.length || 0} valgt
                  </span>
                  {(editForm.languages?.length || 0) > 0 && (
                    <button
                      type="button"
                      onClick={clearLanguages}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Tøm alle
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {COMMON_LANGUAGES.map((lang) => {
                    const isSelected = (editForm.languages || []).some(
                      (l: string) => l.toLowerCase() === lang.id.toLowerCase() || l.toLowerCase() === lang.labelNo.toLowerCase()
                    );
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => toggleLanguage(lang.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-[#9C39FF]/25 border border-[#9C39FF] text-white shadow-sm"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom languages added */}
                {(editForm.languages || []).filter(
                  (l: string) => !COMMON_LANGUAGES.some(c => c.id.toLowerCase() === l.toLowerCase() || c.labelNo.toLowerCase() === l.toLowerCase())
                ).length > 0 && (
                  <div className="mb-3 pt-2 border-t border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Egendefinerte:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(editForm.languages || [])
                        .filter((l: string) => !COMMON_LANGUAGES.some(c => c.id.toLowerCase() === l.toLowerCase() || c.labelNo.toLowerCase() === l.toLowerCase()))
                        .map((customL: string) => (
                          <button
                            key={customL}
                            type="button"
                            onClick={() => toggleLanguage(customL)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#9C39FF]/25 border border-[#9C39FF] text-white"
                          >
                            <span>🌐 {customL}</span>
                            <X className="w-3 h-3 ml-1 text-zinc-400 hover:text-white" />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-zinc-800/80 max-w-sm">
                  <input
                    type="text"
                    value={customLang}
                    onChange={(e) => setCustomLang(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomLanguage();
                      }
                    }}
                    placeholder="Annet språk..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                  <button
                    type="button"
                    onClick={addCustomLanguage}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Legg til
                  </button>
                </div>
              </div>
            </div>

            {/* MEDIA */}
            <div>
              <h4 className="text-lg font-medium mb-4 text-white border-b border-zinc-800 pb-2">Media & Ekstra</h4>
              <div className="flex flex-col gap-6">
                {/* BILDEGALLERI */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="block text-xs font-medium text-zinc-400">
                      Bildegalleri ({Array.isArray(editForm.images) ? editForm.images.length : 0} bilder) — Første bilde brukes som hovedbilde
                    </label>
                    <label className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-xl cursor-pointer transition-colors border border-zinc-700 text-xs font-medium">
                      {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploadingImage ? "Laster opp..." : "Last opp bilde(r)"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {Array.isArray(editForm.images) && editForm.images.length > 0 ? (
                    <div className="flex flex-wrap gap-3 mb-2">
                      {editForm.images.map((imgUrl: string, index: number) => (
                        <div 
                          key={`${imgUrl}-${index}`} 
                          className={`relative w-40 aspect-video rounded-xl overflow-hidden border transition-all group ${
                            index === 0 
                              ? "border-[#9C39FF] ring-1 ring-[#9C39FF]/50 shadow-[0_0_15px_rgba(156,57,255,0.2)]" 
                              : "border-zinc-800"
                          }`}
                        >
                          <Image src={imgUrl} alt={`Bilde ${index + 1}`} fill className="object-cover" />
                          
                          {/* Badge */}
                          <span className={`absolute top-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow ${
                            index === 0 ? "bg-[#9C39FF] text-white" : "bg-black/70 text-zinc-300"
                          }`}>
                            {index === 0 ? "Hovedbilde" : `#${index + 1}`}
                          </span>

                          {/* Remove button */}
                          <button 
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 p-1 rounded-full text-white transition-colors"
                            title="Slett bilde"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          {/* Reorder controls */}
                          {editForm.images.length > 1 && (
                            <div className="absolute bottom-1.5 inset-x-1.5 flex justify-between items-center pointer-events-none">
                              <button
                                type="button"
                                onClick={() => moveImage(index, 'left')}
                                disabled={index === 0}
                                className="pointer-events-auto bg-black/75 hover:bg-black text-white p-1 rounded-md disabled:opacity-20 transition-opacity"
                                title="Flytt frem"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage(index, 'right')}
                                disabled={index === editForm.images.length - 1}
                                className="pointer-events-auto bg-black/75 hover:bg-black text-white p-1 rounded-md disabled:opacity-20 transition-opacity"
                                title="Flytt bak"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full py-8 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 flex flex-col items-center justify-center text-zinc-500 mb-2">
                      <ImageIcon className="w-7 h-7 mb-1.5 opacity-40" />
                      <span className="text-xs">Ingen bilder lastet opp enda</span>
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-500">
                    Anbefalt: 1920x1080px (16:9 bredformat, min. 1280x720). Maks 3MB per bilde. Bruk pilene på bildene for å endre rekkefølge.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Trailer / Video URL (YouTube/Vimeo)</label>
                  <input 
                    type="url" 
                    value={editForm.videoUrl || ""}
                    onChange={(e) => setEditForm({...editForm, videoUrl: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Awards & Recognitions</label>
                  <div className="flex flex-wrap gap-3">
                    {Array.isArray(editForm.awards) && editForm.awards.map((awardUrl: string, index: number) => (
                      <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={awardUrl} alt={`Award ${index + 1}`} className="max-w-full max-h-full object-contain" />
                        <button 
                          onClick={() => removeAward(index)}
                          className="absolute top-1 right-1 bg-red-500/80 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                          title="Fjern award"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="w-20 h-20 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-400 transition-colors relative cursor-pointer">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[9px] text-center px-1">Last opp</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleAwardUpload}
                        disabled={uploadingImage}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button 
              onClick={() => setEditingId(null)}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#9C39FF] text-white px-6 py-2 rounded-xl hover:bg-[#8b32e6] transition-colors"
            >
              <Save className="w-4 h-4" /> Save Experience
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences.map((exp, index) => (
          <div key={exp.id} className={`bg-zinc-900/50 border ${exp.isActive ? 'border-zinc-800' : 'border-red-900/50 opacity-70'} rounded-2xl overflow-hidden flex flex-col`}>
            {(exp.images?.[0] || exp.picture) ? (
              <div className="relative w-full h-40 bg-zinc-950 border-b border-zinc-800">
                <Image src={exp.images?.[0] || exp.picture} alt={exp.name} fill className="object-cover" />
                {exp.isNew && (
                  <span className="absolute top-2 left-2 bg-[#19EB5B] text-black text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md">
                    Nyhet
                  </span>
                )}
                {Array.isArray(exp.images) && exp.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/10">
                    {exp.images.length} bilder
                  </span>
                )}
              </div>
            ) : (
              <div className="w-full h-40 bg-zinc-950 border-b border-zinc-800 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-zinc-800" />
              </div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col items-start gap-1.5">
                  <h3 className="text-lg font-medium text-white leading-tight">{exp.name}</h3>
                  <span className="text-[10px] font-medium tracking-wider uppercase bg-[#9C39FF] text-white px-2 py-0.5 rounded">{exp.type}</span>
                </div>
                {!exp.isActive && <span className="text-[10px] uppercase tracking-wider bg-red-500/20 text-red-400 px-2 py-1 rounded">Inactive</span>}
              </div>
              
              <p className="text-sm text-zinc-400 line-clamp-2 mb-4 flex-1">{exp.shortDescription}</p>
              
              <div className="flex flex-wrap gap-2 text-xs text-zinc-400 mt-4 mb-3">
                <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">Fra 2-{exp.maxPlayers} personer</span>
                {exp.age && <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{exp.age}</span>}
                {exp.difficulty && <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{exp.difficulty}</span>}
                {exp.arenaSize && <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{exp.arenaSize}</span>}
                {Array.isArray(exp.suitableFor) && exp.suitableFor.map((item: string) => (
                  <span key={item} className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{item}</span>
                ))}
                {exp.cinematic && (
                   <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">Cinematic</span>
                )}
                {exp.action && (
                   <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">Action</span>
                )}
                {exp.jumpScare && (
                   <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">Jump Scare</span>
                )}
                {exp.highscore && (
                   <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">Highscore</span>
                )}
                {exp.fantasy && (
                   <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">Fantasy</span>
                )}
                {exp.mystic && (
                   <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">Mystikk</span>
                )}
                {exp.codeSolving && (
                   <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">Kodeløsning</span>
                )}
                {exp.languages && exp.languages.length > 0 && (
                  <span className="bg-purple-950/40 text-purple-300 px-2 py-1 rounded border border-purple-800/50 flex items-center gap-1" title={exp.languages.join(', ')}>
                    🌐 {exp.languages.map((l: string) => getLanguageInfo(l).flag).join(' ')} ({exp.languages.length})
                  </span>
                )}
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-zinc-800/50">
                <div className="flex flex-col gap-1 pr-2 border-r border-zinc-800">
                  <button 
                    onClick={() => moveExperience(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => moveExperience(index, 'down')}
                    disabled={index === experiences.length - 1}
                    className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                <button 
                  onClick={() => handleEdit(exp)}
                  className="flex-1 flex justify-center items-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => handleDuplicate(exp)}
                  title="Duplicate"
                  className="flex justify-center items-center p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(exp.id)}
                  title="Delete"
                  className="flex justify-center items-center p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <TestimonialsManager />

      {showTypesModal && (
        <ExperienceTypesModal 
          experienceTypes={experienceTypes}
          onClose={() => setShowTypesModal(false)}
          onRefresh={fetchExperienceTypes}
        />
      )}
    </div>
  );
}
