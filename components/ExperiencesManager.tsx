"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, deleteDoc, setDoc, addDoc } from "firebase/firestore";
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Loader2, Plus, Trash2, Edit, Save, X, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ExperiencesManager() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "experiences"), async (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setExperiences(data);
      setLoading(false);

      // Auto-seed Arizona Sunrise if missing
      const hasArizona = data.some(e => e.name === "Arizona Sunrise");
      if (!hasArizona) {
        const parvous = data.find(e => e.name.toLowerCase().includes("parvus") || e.name.toLowerCase().includes("parvous"));
        if (parvous) {
          try {
            await addDoc(collection(db, "experiences"), {
              name: "Arizona Sunrise",
              shortDescription: "Arizona Sunrise er en intens og skremmende zombie shooter. Overlev bølger av zombier i en post-apokalyptisk verden. Krever raske reflekser og godt samarbeid.",
              type: "Jump Scare",
              age: "18+",
              difficulty: "Hard",
              maxPlayers: parvous.maxPlayers || 8,
              pricing: parvous.pricing,
              isActive: true,
              picture: "",
              subtitles: []
            });
            console.log("Arizona Sunrise auto-seeded");
          } catch (e) {
            console.error("Failed to seed Arizona Sunrise", e);
          }
        }
      }
    }, (error) => {
      console.error("Error fetching experiences:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (exp: any) => {
    setEditingId(exp.id);
    setEditForm({ ...exp });
  };

  const handleAddNew = () => {
    const newId = "exp_" + Date.now();
    setEditingId(newId);
    setEditForm({
      id: newId,
      name: "New Experience",
      shortDescription: "",
      type: "Escape Room",
      age: "12+",
      difficulty: "Medium",
      maxPlayers: 6,
      pricing: { "2": 800, "3": 1100, "4": 1400, "5": 1700, "6": 2000 },
      isActive: true,
      picture: ""
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `experiences/${editForm.id}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setEditForm({ ...editForm, picture: downloadURL });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "experiences", editForm.id), editForm);
      toast.success("Experience saved successfully");
      setEditingId(null);
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("Failed to save experience");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this experience?")) {
      try {
        await deleteDoc(doc(db, "experiences", id));
        toast.success("Experience deleted");
      } catch (error) {
        console.error("Error deleting experience:", error);
        toast.error("Failed to delete experience");
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light">VR Experiences</h2>
          <p className="text-zinc-400 text-sm">Manage the games and experiences available for booking.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-[#9C39FF] text-white px-4 py-2 rounded-xl hover:bg-[#8b32e6] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {editingId && (
        <div className="bg-zinc-900 border border-[#9C39FF]/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(156,57,255,0.1)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium">{editForm.id.startsWith('exp_') ? 'Add New Experience' : 'Edit Experience'}</h3>
            <button onClick={() => setEditingId(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
              <input 
                type="text" 
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Type</label>
              <select 
                value={editForm.type}
                onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
              >
                <option value="Escape Room">Escape Room</option>
                <option value="Zombie shooter">Zombie shooter</option>
                <option value="Adventure">Adventure</option>
                <option value="Jump Scare">Jump Scare</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Short Description</label>
              <textarea 
                value={editForm.shortDescription}
                onChange={(e) => setEditForm({...editForm, shortDescription: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF] min-h-[80px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Experience Image</label>
              <div className="flex items-start gap-4">
                {editForm.picture ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-zinc-800">
                    <Image src={editForm.picture} alt="Experience" fill className="object-cover" />
                    <button 
                      onClick={() => setEditForm({...editForm, picture: ""})}
                      className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors border border-zinc-700">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingImage ? "Uploading..." : "Upload New Image"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                  <p className="text-xs text-zinc-500 mt-2">
                    Recommended size: 800x600px. Max file size: 2MB.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Age Requirement</label>
              <input 
                type="text" 
                value={editForm.age}
                onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Difficulty</label>
              <input 
                type="text" 
                value={editForm.difficulty}
                onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Max Players</label>
              <input 
                type="number" 
                value={editForm.maxPlayers}
                onChange={(e) => setEditForm({...editForm, maxPlayers: Number(e.target.value)})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Active</label>
              <div className="flex items-center h-10">
                <input 
                  type="checkbox" 
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                  className="w-5 h-5 accent-[#9C39FF]"
                />
                <span className="ml-2 text-sm text-zinc-300">Show to customers</span>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Pricing (NOK by Group Size)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[2, 3, 4, 5, 6, 7, 8].map(size => (
                  <div key={size} className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-sm w-16">{size} pax:</span>
                    <input 
                      type="number" 
                      value={editForm.pricing[size.toString()] || ''}
                      onChange={(e) => {
                        const newPricing = {...editForm.pricing};
                        newPricing[size.toString()] = Number(e.target.value);
                        setEditForm({...editForm, pricing: newPricing});
                      }}
                      className="w-full bg-transparent text-white focus:outline-none text-sm"
                      placeholder="Price"
                    />
                  </div>
                ))}
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
        {experiences.map((exp) => (
          <div key={exp.id} className={`bg-zinc-900/50 border ${exp.isActive ? 'border-zinc-800' : 'border-red-900/50 opacity-70'} rounded-2xl overflow-hidden flex flex-col`}>
            {exp.picture ? (
              <div className="relative w-full h-40 bg-zinc-950 border-b border-zinc-800">
                <Image src={exp.picture} alt={exp.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-full h-40 bg-zinc-950 border-b border-zinc-800 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-zinc-800" />
              </div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium text-white">{exp.name}</h3>
                  <span className="text-xs text-[#9C39FF]">{exp.type}</span>
                </div>
                {!exp.isActive && <span className="text-[10px] uppercase tracking-wider bg-red-500/20 text-red-400 px-2 py-1 rounded">Inactive</span>}
              </div>
              
              <p className="text-sm text-zinc-400 line-clamp-2 mb-4 flex-1">{exp.shortDescription}</p>
              
              <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mb-4">
                <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">Max {exp.maxPlayers}</span>
                <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{exp.age}</span>
                <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{exp.difficulty}</span>
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-zinc-800/50">
                <button 
                  onClick={() => handleEdit(exp)}
                  className="flex-1 flex justify-center items-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(exp.id)}
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
