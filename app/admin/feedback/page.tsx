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
    <div className="admin-apple min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="apple-display text-3xl font-semibold text-white mb-8">Tilbakemeldinger</h1>
        
        {/* Stat-kort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="apple-surface rounded-2xl p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">😄</div>
            <div className="text-zinc-400 text-xs font-medium mb-1">Fornøyd</div>
            <div className="apple-display text-3xl text-white font-semibold tabular-nums">{happyCount}</div>
          </div>
          <div className="apple-surface rounded-2xl p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">😐</div>
            <div className="text-zinc-400 text-xs font-medium mb-1">Nøytral</div>
            <div className="apple-display text-3xl text-white font-semibold tabular-nums">{neutralCount}</div>
          </div>
          <div className="apple-surface rounded-2xl p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">😞</div>
            <div className="text-zinc-400 text-xs font-medium mb-1">Misfornøyd</div>
            <div className="apple-display text-3xl text-white font-semibold tabular-nums">{sadCount}</div>
          </div>
        </div>

        {/* Tabell */}
        <div className="apple-surface rounded-2xl overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-zinc-300 min-w-[650px]">
              <thead className="bg-white/[0.03] text-xs uppercase text-zinc-400 border-b border-white/[0.07]">
                <tr>
                  <th className="px-6 py-4 font-medium">Dato</th>
                  <th className="px-6 py-4 font-medium">Rating</th>
                  <th className="px-6 py-4 font-medium">Kommentar</th>
                  <th className="px-6 py-4 font-medium">Telefon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 sm:px-6 py-8 sm:py-12 text-left sm:text-center text-zinc-500 font-medium">
                      Ingen tilbakemeldinger registrert enda.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
