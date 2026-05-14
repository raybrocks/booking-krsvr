import React from "react";
import { ExperiencesView } from "@/components/ExperiencesView";

export default async function ExperiencesPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const initialTypeSlug = resolvedParams.slug?.[0] || null;
  const initialExpSlug = resolvedParams.slug?.[1] || null;

  return (
    <main className="min-h-screen bg-black pt-16 pb-20 relative overflow-visible">
      {/* Background flourishes */}
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <ExperiencesView initialTypeSlug={initialTypeSlug} initialExpSlug={initialExpSlug} />
      </div>
    </main>
  );
}
