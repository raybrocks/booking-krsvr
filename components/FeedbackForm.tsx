"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { submitFeedback } from '@/app/feedback/actions';
import { Loader2, Check, ExternalLink, Sparkles, Copy, ArrowLeft } from 'lucide-react';

const GOOGLE_REVIEW_URL = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || 'https://search.google.com/local/writereview?placeid=ChIJOVTL6bcDOEYR8N3bbtLT474';
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/JdnDJvuqd3rX9cDb8';

const ACTIVITY_TAGS = [
  { id: 'vr-escape-room', label: 'VR Escape Room', text: 'VR Escape Room' },
  { id: 'spatial-ops', label: 'Spatial Ops (Mixed Reality)', text: 'Spatial Ops (Mixed Reality Shooter)' },
  { id: 'vr-arcade', label: 'VR Arkade & Spill', text: 'VR Arkade' },
];

const OCCASION_TAGS = [
  { id: 'teambuilding', label: 'Teambuilding / Kolleger', text: 'teambuilding med kolleger' },
  { id: 'utdrikningslag', label: 'Utdrikningslag', text: 'utdrikningslag' },
  { id: 'vennegjeng', label: 'Vennegjeng / Studenter', text: 'vennegjengen' },
  { id: 'familie', label: 'Familieopplevelse', text: 'familien' },
  { id: 'regnvaer', label: 'Regnværsdag i Kristiansand', text: 'en regnværsdag i Kristiansand' },
];

const ISSUE_TAGS = [
  'VR-utstyr / teknisk',
  'Spill / opplevelse',
  'Instruktør / veiledning',
  'Oppmøte / venting',
  'Annet',
];

export default function FeedbackForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [rating, setRating] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingSelect = (selectedRating: 'happy' | 'neutral' | 'sad') => {
    setRating(selectedRating);
    setStep(2);
  };

  const toggleTag = (label: string) => {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  // Hjelpefunksjon for å foreslå en naturlig formulert setning basert på valgte stikkord
  const insertSuggestedText = () => {
    const chosenActivities = ACTIVITY_TAGS.filter((t) => selectedTags.includes(t.label)).map((t) => t.text);
    const chosenOccasions = OCCASION_TAGS.filter((t) => selectedTags.includes(t.label)).map((t) => t.text);

    let suggestion = '';
    if (chosenActivities.length > 0 && chosenOccasions.length > 0) {
      suggestion = `Vi besøkte KRS VR Arena i Kristiansand og testet ${chosenActivities.join(' og ')} på ${chosenOccasions.join(' og ')}. Kjempegøy opplegg og topp veiledning av instruktøren!`;
    } else if (chosenActivities.length > 0) {
      suggestion = `Vi testet ${chosenActivities.join(' og ')} hos KRS VR Arena i Kristiansand. Utrolig kul innendørsaktivitet og god service!`;
    } else if (chosenOccasions.length > 0) {
      suggestion = `Super opplevelse på ${chosenOccasions.join(' og ')} hos KRS VR Arena i Kristiansand. Anbefales varmt til andre som ser etter noe gøy å gjøre!`;
    } else {
      suggestion = `Kjempefin opplevelse hos KRS VR Arena i Kristiansand! Topp veiledning og morsomme aktiviteter.`;
    }

    setComments(suggestion);
  };

  const handleGoogleReviewFlow = async () => {
    setIsSubmitting(true);
    setError(null);

    const textToCopy = comments.trim();

    // Kopier til utklippstavlen dersom brukeren har skrevet eller generert tekst
    if (textToCopy && typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopiedToClipboard(true);
      } catch (err) {
        console.warn('Kunne ikke kopiere til utklippstavlen:', err);
      }
    }

    // Lagre tilbakemeldingen internt slik at de registreres i semesterpass-trekningen
    const formData = new FormData();
    formData.append('rating', rating || 'happy');

    const tagSummary = selectedTags.length > 0 ? `[Stikkord: ${selectedTags.join(', ')}]` : '';
    const fullComments = [tagSummary, textToCopy].filter(Boolean).join('\n\n');

    formData.append('comments', fullComments);
    formData.append('phone', phone);
    formData.append('source', 'google_review_flow');

    try {
      await submitFeedback(formData);
    } catch (err) {
      console.warn('Kunne ikke lagre tilbakemelding internt:', err);
    }

    // Åpne Google Anmeldelse i ny fane
    if (typeof window !== 'undefined') {
      window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer');
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleInternalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('rating', rating);

    const issuesSummary = selectedIssues.length > 0 ? `[Område: ${selectedIssues.join(', ')}]` : '';
    const tagsSummary = selectedTags.length > 0 ? `[Stikkord: ${selectedTags.join(', ')}]` : '';
    const prefix = rating === 'happy' ? tagsSummary : issuesSummary;

    const fullComments = [prefix, comments.trim()].filter(Boolean).join('\n\n');

    formData.append('comments', fullComments);
    formData.append('phone', phone);
    formData.append('source', 'internal_feedback_form');

    try {
      const result = await submitFeedback(formData);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Kunne ikke sende tilbakemelding.');
      }
    } catch {
      setError('Det oppstod en uventet feil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 md:p-12 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-light text-white mb-3">Tusen takk for tilbakemeldingen!</h2>
        <p className="text-zinc-400 mb-6 leading-relaxed">
          {rating === 'happy' && phone
            ? 'Du er nå registrert i trekningen av gratis semesterpass. Vi setter stor pris på at du deler opplevelsen med oss og andre gjester.'
            : 'Vi setter stor pris på at du tok deg tid til å dele dine tanker med oss.'}
        </p>

        {copiedToClipboard && (
          <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-4 mb-6 text-left text-sm text-purple-200">
            <p className="font-medium text-white mb-1 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Teksten din er kopiert til utklippstavlen
            </p>
            <p className="text-zinc-300">
              Vinduet for Google-anmeldelsen åpner i en ny fane. Der kan du enkelt lime inn teksten din (Ctrl+V eller Cmd+V) og sette stjerner.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex justify-center items-center px-6 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            Tilbake til forsiden
          </Link>
          {rating === 'happy' && (
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-lg bg-[#9C39FF] text-white hover:bg-[#8A2BE2] text-sm font-medium transition-colors"
            >
              Åpne Google Anmeldelse <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-10 text-center">
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-8">Hvordan var opplevelsen din?</h2>
          <div className="flex justify-center gap-6 md:gap-10">
            <button 
              type="button"
              onClick={() => handleRatingSelect('sad')}
              className="text-6xl md:text-8xl hover:scale-110 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-700 rounded-full"
              title="Misfornøyd"
              aria-label="Misfornøyd"
            >
              😞
            </button>
            <button 
              type="button"
              onClick={() => handleRatingSelect('neutral')}
              className="text-6xl md:text-8xl hover:scale-110 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-700 rounded-full"
              title="Helt ok"
              aria-label="Helt ok"
            >
              😐
            </button>
            <button 
              type="button"
              onClick={() => handleRatingSelect('happy')}
              className="text-6xl md:text-8xl hover:scale-110 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-700 rounded-full"
              title="Kjempefornøyd"
              aria-label="Kjempefornøyd"
            >
              😄
            </button>
          </div>
        </div>
      )}

      {step === 2 && rating === 'happy' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Endre vurdering
          </button>

          <h2 className="text-2xl font-medium text-white mb-2">Så hyggelig å høre at dere trivdes!</h2>
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
            Ønsker du å være med i trekningen av gratis semesterpass (verdi inntil 5 000 kr)?
            Del gjerne noen ord om opplevelsen din på Google. Vi trekker en heldig vinner hvert semester.
          </p>

          {/* Stikkord / Hurtigvalg */}
          <div className="mb-6 space-y-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Hva testet dere? (Velg gjerne stikkord)
              </span>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.label);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.label)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-[#9C39FF]/20 border-[#9C39FF] text-purple-200 font-medium'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Hva var anledningen?
              </span>
              <div className="flex flex-wrap gap-2">
                {OCCASION_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.label);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.label)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-[#9C39FF]/20 border-[#9C39FF] text-purple-200 font-medium'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedTags.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={insertSuggestedText}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Bruk valgte stikkord som forslag i tekstfeltet
                </button>
              </div>
            )}
          </div>

          {/* Tips til omtalen */}
          <div className="mb-4 bg-purple-950/20 border border-purple-900/30 rounded-lg p-3 text-xs text-zinc-300 leading-relaxed">
            <span className="font-semibold text-purple-300">💡 Tips til anmeldelsen:</span> Nevn gjerne hva slags arrangement dere hadde, hvilke opplevelser dere prøvde, og hvordan instruktøren tok imot dere. Det hjelper andre å finne frem til gode aktiviteter i Kristiansand!
          </div>

          {/* Tekstfelt */}
          <div className="space-y-4">
            <div>
              <label htmlFor="happy-comments" className="block text-sm font-medium text-zinc-300 mb-1">
                Din tilbakemelding
              </label>
              <textarea
                id="happy-comments"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#9C39FF] text-sm"
                placeholder="F.eks.: Vi var en vennegjeng som spilte Spatial Ops og VR Escape Room. Kjempegøy opplegg og topp veiledning i Kristiansand..."
              />
            </div>

            <div>
              <label htmlFor="happy-phone" className="block text-sm font-medium text-zinc-300 mb-1">
                Telefonnummer (valgfritt – for å delta i semesterpass-trekningen)
              </label>
              <input
                type="tel"
                id="happy-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#9C39FF] text-sm"
                placeholder="Ditt telefonnummer"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Handlinger */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleGoogleReviewFlow}
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 bg-[#9C39FF] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#8A2BE2] transition-colors disabled:opacity-50 text-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Kopier tekst & åpne Google Anmeldelse
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleInternalSubmit}
                disabled={isSubmitting}
                className="w-full text-center text-xs text-zinc-400 hover:text-zinc-200 py-1 transition-colors"
              >
                Eller send kun inn til KRS VR Arena uten Google
              </button>
            </div>

            {/* TripAdvisor alternativ */}
            <div className="pt-2 text-center">
              <p className="text-xs text-zinc-500">
                Har du ikke Google-konto? Du kan også finne oss på{' '}
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  Google Maps
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (rating === 'neutral' || rating === 'sad') && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Endre vurdering
          </button>

          <h2 className="text-2xl font-medium text-white mb-2">Takk for at du gir oss beskjed.</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Vi ønsker alltid å levere trygge og gode opplevelser. Fortell oss gjerne hva som hendte, så vi kan forbedre oss.
          </p>

          <form onSubmit={handleInternalSubmit} className="space-y-4">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Hva gjaldt det? (Valgfritt)
              </span>
              <div className="flex flex-wrap gap-2">
                {ISSUE_TAGS.map((issue) => {
                  const isSelected = selectedIssues.includes(issue);
                  return (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => toggleIssue(issue)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-600 text-white font-medium'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {issue}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="negative-comments" className="block text-sm font-medium text-zinc-300 mb-1">
                Kommentar
              </label>
              <textarea 
                id="negative-comments" 
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#9C39FF] text-sm"
                placeholder="Fortell oss hva som hendte og hva vi kan gjøre bedre..."
              />
            </div>
            
            <div>
              <label htmlFor="negative-phone" className="block text-sm font-medium text-zinc-300 mb-1">
                Telefonnummer (om du ønsker at vi tar kontakt for å rydde opp)
              </label>
              <input 
                type="tel"
                id="negative-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#9C39FF] text-sm"
                placeholder="La stå tomt om du ønsker å være anonym"
              />
            </div>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center items-center bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 text-sm"
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
