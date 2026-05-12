import React from "react";
import { ExperiencesView } from "@/components/ExperiencesView";

export default function ExperiencesPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20 relative overflow-hidden">
      {/* Background flourishes */}
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <ExperiencesView />
      </div>
    </main>
  );
}
