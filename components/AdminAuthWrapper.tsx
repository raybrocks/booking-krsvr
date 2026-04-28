"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Lock, Loader2, LogOut } from "lucide-react";

export default function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError("Feil e-post eller passord.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  // If user is not logged in, show login form
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 text-[#9C39FF]" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Krs VR Arena</h1>
            <p className="text-zinc-400 text-sm">Logg inn for å få tilgang til backend</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">E-post</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-[#9C39FF] transition-colors"
                placeholder="post@krsvr.no"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Passord</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-[#9C39FF] transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-[#9C39FF] hover:bg-[#8A2BE2] text-white font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Logg inn"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Strict check: Is this the authorized admin email?
  if (user.email !== "post@krsvr.no") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 text-center">
        <Lock className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">Ingen tilgang</h2>
        <p className="text-zinc-400">Kontoen din har ikke administratorrettigheter.</p>
        <button 
          onClick={handleLogout}
          className="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          Logg ut
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Small floating logout button for admin */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors shadow-lg"
          title="Logg ut"
        >
          <LogOut className="w-4 h-4" />
          <span>Ut</span>
        </button>
      </div>
      {children}
    </div>
  );
}
