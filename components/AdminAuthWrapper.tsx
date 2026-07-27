"use client";

import React, { useState, useEffect } from "react";
import { Lock, Loader2, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const supabase = createClient();

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          setUser({ ...session.user, employeeProfile: data.user });
        } else {
          setUser({ ...session.user, accessDenied: true });
        }
      } catch (err) {
        setUser({ ...session.user, accessDenied: true });
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Just check auth again when auth state changes (e.g. login/logout)
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");
    setSuccessMsg("");
    
    try {
      if (isSignUp) {
        // Sjekk om ansatt-eposten finnes i databasen først
        const checkRes = await fetch('/api/admin/employees/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        if (checkRes.ok) {
          const { exists } = await checkRes.json();
          if (!exists) {
            setError("Denne e-posten er ikke registrert som ansatt. Eieren må legge deg inn først.");
            setIsLoggingIn(false);
            return;
          }
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccessMsg("Bruker opprettet! Du kan nå logge inn (hvis de ikke har skrudd på e-postbekreftelse).");
          setIsSignUp(false);
          setPassword("");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message === "Invalid login credentials" ? "Feil e-post eller passord." : error.message);
        } else {
          await checkAuth();
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(isSignUp ? "Kunne ikke registrere bruker." : "Feil e-post eller passord.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
            <p className="text-zinc-400 text-sm">
              {isSignUp ? "Registrer ny bruker" : "Logg inn for å få tilgang"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg">
                {successMsg}
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
                placeholder="admin@example.com"
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
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "Registrer deg" : "Logg inn")}
            </button>
            
            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccessMsg(""); }}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {isSignUp ? "Har du allerede en bruker? Logg inn" : "Ny ansatt? Registrer deg her"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Strict check: Is this the authorized admin email?
  if (user.accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 text-center">
        <Lock className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">Ingen tilgang</h2>
        <p className="text-zinc-400">Kontoen din har ikke administratorrettigheter, eller er ikke aktivert.</p>
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
