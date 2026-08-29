import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from '@/lib/supabase';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function AdminFeedbackPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin');
  }

  // Hent alle data fra feedback_submissions med supabaseAdmin for å bypass RLS
  const { data: submissions, error } = await supabaseAdmin
    .from('feedback_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching feedback:", error);
    return <div className="p-8 text-white">Kunne ikke laste tilbakemeldinger.</div>;
  }

  const happyCount = submissions?.filter(s => s.rating === 'happy').length || 0;
  const neutralCount = submissions?.filter(s => s.rating === 'neutral').length || 0;
  const sadCount = submissions?.filter(s => s.rating === 'sad').length || 0;

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light text-white mb-8">Tilbakemeldinger</h1>
        
        {/* Stat-kort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">😄</div>
            <div className="text-zinc-400 text-sm font-medium mb-1">Happy</div>
            <div className="text-3xl text-white font-bold">{happyCount}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">😐</div>
            <div className="text-zinc-400 text-sm font-medium mb-1">Neutral</div>
            <div className="text-3xl text-white font-bold">{neutralCount}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">😞</div>
            <div className="text-zinc-400 text-sm font-medium mb-1">Sad</div>
            <div className="text-3xl text-white font-bold">{sadCount}</div>
          </div>
        </div>

        {/* Tabell */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-zinc-300 min-w-[650px]">
              <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Dato</th>
                  <th className="px-6 py-4 font-medium">Rating</th>
                  <th className="px-6 py-4 font-medium">Kommentar</th>
                  <th className="px-6 py-4 font-medium">Telefon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {submissions?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      Ingen tilbakemeldinger enda.
                    </td>
                  </tr>
                )}
                {submissions?.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(sub.created_at), 'dd. MMM yyyy HH:mm', { locale: nb })}
                    </td>
                    <td className="px-6 py-4">
                      {sub.rating === 'happy' && <span className="text-xl" title="Happy">😄</span>}
                      {sub.rating === 'neutral' && <span className="text-xl" title="Neutral">😐</span>}
                      {sub.rating === 'sad' && <span className="text-xl" title="Sad">😞</span>}
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="whitespace-pre-wrap">{sub.comments || <span className="text-zinc-600 italic">Ingen kommentar</span>}</div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.phone || <span className="text-zinc-600 italic">Ikke oppgitt</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
