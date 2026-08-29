"use client";

import React, { useState } from 'react';
import { submitFeedback } from '@/app/feedback/actions';
import { Loader2 } from 'lucide-react';

export default function FeedbackForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [rating, setRating] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  
  const [comments, setComments] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingSelect = (selectedRating: 'happy' | 'neutral' | 'sad') => {
    setRating(selectedRating);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('comments', comments);
    formData.append('phone', phone);
    
    // Opt: extract source from URL if needed
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('source');
      if (source) formData.append('source', source);
    }

    try {
      const result = await submitFeedback(formData);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Kunne ikke sende tilbakemelding.');
      }
    } catch (err) {
      setError('Det oppstod en uventet feil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🙌</div>
        <h2 className="text-2xl font-bold text-white mb-2">Takk for tilbakemeldingen!</h2>
        <p className="text-zinc-400">Vi setter stor pris på at du deler din mening med oss.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 md:p-10 text-center">
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl md:text-3xl font-medium text-white mb-8">Hvordan var opplevelsen din?</h2>
          <div className="flex justify-center gap-6 md:gap-10">
            <button 
              onClick={() => handleRatingSelect('sad')}
              className="text-6xl md:text-8xl hover:scale-110 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-700 rounded-full"
            >
              😞
            </button>
            <button 
              onClick={() => handleRatingSelect('neutral')}
              className="text-6xl md:text-8xl hover:scale-110 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-700 rounded-full"
            >
              😐
            </button>
            <button 
              onClick={() => handleRatingSelect('happy')}
              className="text-6xl md:text-8xl hover:scale-110 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-700 rounded-full"
            >
              😄
            </button>
          </div>
        </div>
      )}

      {step === 2 && rating === 'happy' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
          <h2 className="text-2xl font-medium text-white mb-4">Så fantastisk å høre!</h2>
          <p className="text-zinc-300 mb-6 leading-relaxed">
            Ønsker du å være med i trekningen av gratis semesterpass - verdi opp til 5000kr? 
            Da kan du være med å gi oss terningkast på Google. Vi trekker hvert semester en heldig vinner som blir kontaktet. Har du allerede betalt for semesteret kan du få det refundert.
          </p>
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center w-full sm:w-auto bg-[#9C39FF] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#8A2BE2] transition-colors"
          >
            Gi oss en vurdering på Google
          </a>
        </div>
      )}

      {step === 2 && (rating === 'neutral' || rating === 'sad') && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
          <h2 className="text-2xl font-medium text-white mb-2">Vi vil gjerne høre hva vi kan gjøre bedre.</h2>
          <p className="text-zinc-400 mb-6">Din tilbakemelding hjelper oss å forbedre opplevelsen for alle.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-zinc-300 mb-1">
                Kommentar
              </label>
              <textarea 
                id="comments" 
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#9C39FF]"
                placeholder="Fortell oss hva vi kan forbedre..."
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-1">
                Telefonnummer (valgfritt)
              </label>
              <input 
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#9C39FF]"
                placeholder="La stå tomt om du ønsker å være anonym"
              />
            </div>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center items-center bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send tilbakemelding'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
