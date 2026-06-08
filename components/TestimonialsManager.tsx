"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit, Save, X, Image as ImageIcon, Upload, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingLogoImage, setUploadingLogoImage] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleEdit = (testi: any) => {
    setEditingId(testi.id);
    setEditForm({ ...testi });
  };

  const handleAddNew = () => {
    setEditingId("new");
    setEditForm({
      companyName: "New Company",
      mainImage: "",
      logoImage: ""
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
      formData.append("pathPrefix", "testimonials");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      if (isLogo) {
        setEditForm({ ...editForm, logoImage: data.url });
      } else {
        setEditForm({ ...editForm, mainImage: data.url });
      }
      
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      if (isLogo) setUploadingLogoImage(false);
      else setUploadingMainImage(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId === "new") {
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm)
        });
        if (!res.ok) throw new Error("Failed to create");
      } else {
        const res = await fetch(`/api/testimonials/${editForm.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm)
        });
        if (!res.ok) throw new Error("Failed to update");
      }
      toast.success("Testimonial saved successfully");
      setEditingId(null);
      fetchTestimonials();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast.error("Failed to save testimonial");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      try {
        const res = await fetch(`/api/testimonials/${id}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error("Failed to delete");
        toast.success("Testimonial deleted");
        fetchTestimonials();
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        toast.error("Failed to delete testimonial");
      }
    }
  };

  const moveTestimonial = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === testimonials.length - 1) return;

    const newTestimonials = [...testimonials];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap objects
    const temp = newTestimonials[index];
    newTestimonials[index] = newTestimonials[swapIndex];
    newTestimonials[swapIndex] = temp;

    // Fix the order property sequentially
    const updates = newTestimonials.map((t, i) => ({ id: t.id, order: i }));
    
    // Optic UI update immediately
    setTestimonials(newTestimonials);

    try {
      const res = await fetch("/api/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Batch update failed");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" /></div>;
  }

  return (
    <div className="mt-16 space-y-6">
      <div className="flex justify-between items-center border-t border-zinc-800 pt-10">
        <div>
          <h2 className="text-2xl font-light">Client Testimonials</h2>
          <p className="text-zinc-400 text-sm">Manage the company testimonials shown on the front page.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-[#9C39FF] text-white px-4 py-2 rounded-xl hover:bg-[#8b32e6] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {editingId && (
        <div className="bg-zinc-900 border border-[#9C39FF]/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(156,57,255,0.1)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium">{editForm.id.startsWith('testi_') ? 'Add New Testimonial' : 'Edit Testimonial'}</h3>
            <button onClick={() => setEditingId(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Company Name (Title)</label>
              <input 
                type="text" 
                value={editForm.companyName}
                onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
                placeholder="e.g. Mandal Kommune"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Main Image (16:9)</label>
              <div className="flex items-start gap-4">
                {editForm.mainImage ? (
                  <div className="relative w-48 h-27 aspect-video rounded-xl overflow-hidden border border-zinc-800">
                    <Image src={editForm.mainImage} alt="Main" fill className="object-cover" />
                    <button 
                      onClick={() => setEditForm({...editForm, mainImage: ""})}
                      className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-48 aspect-video rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">No main image</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors border border-zinc-700">
                    {uploadingMainImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingMainImage ? "Uploading..." : "Upload Main Image"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, false)}
                      disabled={uploadingMainImage || uploadingLogoImage}
                    />
                  </label>
                  <p className="text-xs text-zinc-500 mt-2">
                    Recommended size: 16:9 ratio (e.g., 1280x720px). Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Company Logo (Optional)</label>
              <div className="flex items-start gap-4">
                {editForm.logoImage ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-zinc-800 bg-white">
                    <Image src={editForm.logoImage} alt="Logo" fill className="object-contain p-2" />
                    <button 
                      onClick={() => setEditForm({...editForm, logoImage: ""})}
                      className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">No logo</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors border border-zinc-700">
                    {uploadingLogoImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingLogoImage ? "Uploading..." : "Upload Logo"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, true)}
                      disabled={uploadingMainImage || uploadingLogoImage}
                    />
                  </label>
                  <p className="text-xs text-zinc-500 mt-2">
                    Transparent PNG recommended.
                  </p>
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
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testi, index) => (
          <div key={testi.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
            {testi.mainImage ? (
              <div className="relative w-full aspect-video bg-zinc-950 border-b border-zinc-800">
                <Image src={testi.mainImage} alt={testi.companyName} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-full aspect-video bg-zinc-950 border-b border-zinc-800 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-zinc-800" />
              </div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex flex-col items-center gap-3">
                 {testi.logoImage && (
                    <div className="w-16 h-16 rounded overflow-hidden bg-white relative -mt-12 border-2 border-zinc-800">
                       <Image src={testi.logoImage} alt="Logo" fill className="object-contain p-1" />
                    </div>
                 )}
                 <h3 className="text-lg font-medium text-white leading-tight mt-2">{testi.companyName}</h3>
              </div>
              
              <div className="flex gap-2 mt-auto pt-4 border-t border-zinc-800/50">
                <div className="flex flex-col gap-1 pr-2 border-r border-zinc-800">
                  <button 
                    onClick={() => moveTestimonial(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => moveTestimonial(index, 'down')}
                    disabled={index === testimonials.length - 1}
                    className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                <button 
                  onClick={() => handleEdit(testi)}
                  className="flex-1 flex justify-center items-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(testi.id)}
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
    </div>
  );
}
