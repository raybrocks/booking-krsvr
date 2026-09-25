"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Mail, 
  Monitor, 
  Smartphone, 
  Copy, 
  Check, 
  Loader2, 
  Plus, 
  Trash2, 
  Download, 
  Users, 
  Sparkles, 
  Gamepad2, 
  Tag, 
  ExternalLink, 
  Save, 
  FolderOpen, 
  Code2, 
  Eye,
  RefreshCw,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

interface FeaturedExp {
  name: string;
  type?: string;
  shortDescription?: string;
  picture?: string;
  buttonText?: string;
  buttonUrl?: string;
}

interface NewsletterFormState {
  subject: string;
  preheader: string;
  headline: string;
  teaser: string;
  bodyParagraphs: string[];
  includeExperience: boolean;
  featuredExperience: FeaturedExp;
  includeDiscount: boolean;
  discountCode: string;
  includeCta: boolean;
  ctaButtonText: string;
  ctaButtonUrl: string;
}

interface SavedDraft {
  id: string;
  name: string;
  updatedAt: string;
  data: NewsletterFormState;
}

const PRESET_TEMPLATES: { id: string; label: string; description: string; data: NewsletterFormState }[] = [
  {
    id: "autumn-promo",
    label: "Høsttilbud & Rabattkode",
    description: "Kampanjebasert nyhetsbrev med 15% rabattkode og oppfordring til å booke.",
    data: {
      subject: "Nyheter fra KRS VR Arena: Oppgraderte opplevelser og høsttilbud",
      preheader: "Vi utvider kapasiteten og gir deg 15% rabatt på din neste spilløkt.",
      headline: "Velkommen til en ny sesong hos KRS VR Arena",
      teaser: "Høsten er her, og vi har klargjort arenaen for actionfylte opplevelser, bursdager og teambuilding.",
      bodyParagraphs: [
        "Vi i KRS VR Arena jobber kontinuerlig med å tilby de beste VR- og Mixed Reality-opplevelsene i Kristiansand.",
        "Nå har vi oppgradert lokalene i Industrigata 12 med enda bedre plass for grupper, skreddersydde arrangementer og toppmoderne trådløst utstyr.",
        "Som abonnent får du eksklusiv tilgang til vår høstkampanje. Bruk rabattkoden under når du bestiller på nett for å få 15% avslag på hele bestillingen."
      ],
      includeExperience: true,
      featuredExperience: {
        name: "Mixed Reality Shooter (Spatial Ops)",
        type: "Mixed Reality",
        shortDescription: "Løp fritt rundt i arenaen med trådløse headset der det fysiske rommet smelter sammen med spillet. Perfekt for vennegjenger og kollegaer!",
        picture: "https://krsvr.no/krsvrarena_logo_sort.png",
        buttonText: "Les mer og bestill",
        buttonUrl: "https://krsvr.no/booking",
      },
      includeDiscount: true,
      discountCode: "VRHOST15",
      includeCta: true,
      ctaButtonText: "Se ledige tider og bestill",
      ctaButtonUrl: "https://krsvr.no/booking",
    }
  },
  {
    id: "new-experience",
    label: "Nyhet / Nytt spill lansert",
    description: "Fokuserer på en ny eller oppgradert VR-opplevelse på arenaen.",
    data: {
      subject: "Ny opplevelse lansert hos KRS VR Arena!",
      preheader: "Nå kan du oppleve vårt nyeste spill med full bevegelsesfrihet.",
      headline: "En helt ny opplevelse venter på deg",
      teaser: "Vi har utvidet spillkatalogen med en rykende fersk opplevelse for alle som elsker spenning og samarbeid.",
      bodyParagraphs: [
        "Vi er stolte over å kunne introdusere vårt nyeste tilskudd i arenaen. Her utfordres både reflekser, samspill og taktisk tenkning.",
        "Opplevelsen passer for både nybegynnere og erfarne spillere, og våre dyktige instruktører er med dere hele veien fra brief til ferdig spilløkt.",
        "Klar til å samle gjengen og teste ut nyheten før alle andre?"
      ],
      includeExperience: true,
      featuredExperience: {
        name: "Zombie Shooter Kristiansand",
        type: "Action / Zombie",
        shortDescription: "Kjemp sammen som et lag for å overleve zombie-bølger i en nervepirrende opplevelse med ekte samarbeid.",
        picture: "https://krsvr.no/krsvrarena_logo_sort.png",
        buttonText: "Prøv spillet nå",
        buttonUrl: "https://krsvr.no/booking",
      },
      includeDiscount: false,
      discountCode: "",
      includeCta: true,
      ctaButtonText: "Sikre plass i dag",
      ctaButtonUrl: "https://krsvr.no/booking",
    }
  },
  {
    id: "teambuilding-event",
    label: "Teambuilding & Firmaevent",
    description: "Retter seg mot bedrifter, avdelinger og grupper som planlegger sosiale samlinger.",
    data: {
      subject: "Planlegger dere teambuilding eller julebord i Kristiansand?",
      preheader: "Skap samhold, latter og vennskapelig konkurranse hos KRS VR Arena.",
      headline: "Samle kollegaene til en uforstyrret felles opplevelse",
      teaser: "Trenger dere en aktivitet der alle kan delta, uansett forkunnskaper? Vi tilrettelegger for hele avdelingen.",
      bodyParagraphs: [
        "Hos KRS VR Arena tilbyr vi skreddersydde opplegg for bedrifter. Dere kan velge mellom samarbeid i VR Escape Room eller actionfylt lagkonkurranse i Mixed Reality.",
        "Vi har fleksibel kapasitet, enkel parkering i Industrigata 12, og mulighet for mingling før og etter spilløkten.",
        "Kontakt oss gjerne for skreddersydd tilbud eller bestill direkte i vår bookingportal med faktura eller kort."
      ],
      includeExperience: true,
      featuredExperience: {
        name: "VR Escape Room Kristiansand",
        type: "Escape Room",
        shortDescription: "Løs mysterier og koder sammen i fantastiske virtuelle verdener der kommunikasjon og samarbeid er nøkkelen til suksess.",
        picture: "https://krsvr.no/krsvrarena_logo_sort.png",
        buttonText: "Les om bedriftsarrangement",
        buttonUrl: "https://krsvr.no/arrangementer/firmaevent",
      },
      includeDiscount: false,
      discountCode: "",
      includeCta: true,
      ctaButtonText: "Les mer om firmaevent",
      ctaButtonUrl: "https://krsvr.no/arrangementer/firmaevent",
    }
  },
  {
    id: "family-holiday",
    label: "Skoleferie & Familiehelg",
    description: "Retter seg mot familier, bursdager og unge spillere i ferier og helger.",
    data: {
      subject: "Moro for hele familien i helgen hos KRS VR Arena",
      preheader: "Vi har familievennlige opplevelser som fenger både store og små.",
      headline: "Ta med familien på innendørs VR-moro",
      teaser: "Leter du etter en spennende og samlende helgeaktivitet i Kristiansand? Vi har opplevelser tilpasset alle aldre.",
      bodyParagraphs: [
        "Hos KRS VR Arena er sikkerhet og trygghet i fokus. Våre instruktører hjelper alle i gang, tilpasser utstyret og sørger for en trygg og morsom opplevelse.",
        "Vi anbefaler våre familievennlige eventyr og VR Escape Rooms der dere jobber sammen mot et felles mål.",
        "Husk at tidene i helger og ferier fylles raskt opp – sjekk kalenderen og reserver tid i dag."
      ],
      includeExperience: true,
      featuredExperience: {
        name: "Familievennlig VR Eventyr",
        type: "Familie & Arkade",
        shortDescription: "Utforsk fargerike verdener og løs morsomme oppdrag sammen i en trygg og tilrettelagt ramme.",
        picture: "https://krsvr.no/krsvrarena_logo_sort.png",
        buttonText: "Se familieopplevelser",
        buttonUrl: "https://krsvr.no/vr-opplevelser/familie",
      },
      includeDiscount: false,
      discountCode: "",
      includeCta: true,
      ctaButtonText: "Bestill familietid",
      ctaButtonUrl: "https://krsvr.no/booking",
    }
  }
];

export default function NewsletterDesigner() {
  const [form, setForm] = useState<NewsletterFormState>(PRESET_TEMPLATES[0].data);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [activeRightTab, setActiveRightTab] = useState<"preview" | "html">("preview");
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);

  // Available experiences from DB
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);

  // Subscriber count
  const [subscribersCount, setSubscribersCount] = useState<number | null>(null);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  // Saved drafts
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [draftName, setDraftName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Fetch experiences
  useEffect(() => {
    async function loadExperiences() {
      try {
        const res = await fetch("/api/experiences?active_only=true");
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((e: any) => e.type !== "Vipps test");
          setExperiences(filtered);
        }
      } catch (e) {
        console.error("Failed to load experiences:", e);
      } finally {
        setLoadingExperiences(false);
      }
    }
    loadExperiences();
  }, []);

  // Fetch subscribers count
  useEffect(() => {
    async function loadSubscribers() {
      try {
        const res = await fetch("/api/admin/newsletter/subscribers");
        if (res.ok) {
          const data = await res.json();
          setSubscribersCount(data.totalCount || 0);
        }
      } catch (e) {
        console.error("Failed to load subscriber count:", e);
      }
    }
    loadSubscribers();
  }, []);

  // Fetch drafts
  const loadDrafts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/newsletter/drafts");
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.drafts || []);
      }
    } catch (e) {
      console.error("Failed to load drafts:", e);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  // Server-side compile of current form state to HTML
  const compilePreview = useCallback(async (formData: NewsletterFormState) => {
    setIsRendering(true);
    try {
      const res = await fetch("/api/admin/newsletter/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: formData.headline,
          preheader: formData.preheader,
          teaser: formData.teaser,
          bodyParagraphs: formData.bodyParagraphs,
          featuredExperience: formData.includeExperience ? formData.featuredExperience : null,
          discountCode: formData.includeDiscount ? formData.discountCode : undefined,
          ctaButtonText: formData.includeCta ? formData.ctaButtonText : undefined,
          ctaButtonUrl: formData.includeCta ? formData.ctaButtonUrl : undefined,
          adminEmail: "post@krsvr.no",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRenderedHtml(data.html || "");
      }
    } catch (err) {
      console.error("Error generating newsletter HTML:", err);
    } finally {
      setIsRendering(false);
    }
  }, []);

  // Debounce compiling so typing remains snappy
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      compilePreview(form);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [form, compilePreview]);

  // Handlers for paragraphs
  const handleParagraphChange = (index: number, value: string) => {
    setForm(prev => {
      const copy = [...prev.bodyParagraphs];
      copy[index] = value;
      return { ...prev, bodyParagraphs: copy };
    });
  };

  const handleAddParagraph = () => {
    setForm(prev => ({
      ...prev,
      bodyParagraphs: [...prev.bodyParagraphs, "Nytt avsnitt med informasjon..."]
    }));
  };

  const handleRemoveParagraph = (index: number) => {
    setForm(prev => ({
      ...prev,
      bodyParagraphs: prev.bodyParagraphs.filter((_, i) => i !== index)
    }));
  };

  // Select an existing experience from catalog
  const handleSelectExperience = (expId: string) => {
    const exp = experiences.find(e => e.id === expId);
    if (!exp) return;

    const typeSlug = exp.experienceType?.slug || slugify(exp.type || "");
    const expSlug = slugify(exp.name || "");
    const targetUrl = `https://krsvr.no/vr-opplevelser/${typeSlug}/${expSlug}`;

    setForm(prev => ({
      ...prev,
      includeExperience: true,
      featuredExperience: {
        name: exp.name,
        type: exp.type || "VR Opplevelse",
        shortDescription: exp.shortDescription || "",
        picture: exp.picture || "https://krsvr.no/krsvrarena_logo_sort.png",
        buttonText: `Les mer om ${exp.name}`,
        buttonUrl: targetUrl,
      }
    }));
    toast.success(`Hentet opplevelsen «${exp.name}» inn i nyhetsbrevet`);
  };

  // Copy HTML
  const handleCopyHtml = async () => {
    if (!renderedHtml) return;
    try {
      await navigator.clipboard.writeText(renderedHtml);
      setCopiedHtml(true);
      toast.success("HTML kopiert til utklippstavlen!", {
        description: "Klar til å limes inn i Resend Broadcasts.",
      });
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      toast.error("Kunne ikke kopiere HTML");
    }
  };

  // Copy Subject
  const handleCopySubject = async () => {
    if (!form.subject) return;
    try {
      await navigator.clipboard.writeText(form.subject);
      setCopiedSubject(true);
      toast.success("Emnefelt kopiert!");
      setTimeout(() => setCopiedSubject(false), 2000);
    } catch {
      toast.error("Kunne ikke kopiere emnefelt");
    }
  };

  // Download subscribers CSV
  const handleDownloadCsv = () => {
    setDownloadingCsv(true);
    try {
      window.location.href = "/api/admin/newsletter/subscribers?format=csv";
      toast.success("Laster ned CSV med abonnenter");
    } catch (e) {
      toast.error("Feil ved nedlasting av CSV");
    } finally {
      setTimeout(() => setDownloadingCsv(false), 1500);
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    const name = draftName.trim() || `Utkast ${new Date().toLocaleDateString("no")}`;
    const newDraft: SavedDraft = {
      id: "draft-" + Date.now(),
      name,
      updatedAt: new Date().toISOString(),
      data: form,
    };

    const updated = [newDraft, ...drafts.filter(d => d.name !== name)];
    try {
      const res = await fetch("/api/admin/newsletter/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drafts: updated }),
      });
      if (res.ok) {
        setDrafts(updated);
        setShowSaveModal(false);
        setDraftName("");
        toast.success(`Utkast «${name}» er lagret!`);
      }
    } catch {
      toast.error("Kunne ikke lagre utkast");
    }
  };

  // Load draft
  const handleApplyDraft = (draft: SavedDraft) => {
    setForm(draft.data);
    setShowLoadModal(false);
    toast.success(`Lastet utkast «${draft.name}»`);
  };

  // Delete draft
  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = drafts.filter(d => d.id !== id);
    try {
      await fetch("/api/admin/newsletter/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drafts: updated }),
      });
      setDrafts(updated);
      toast.success("Utkast slettet");
    } catch {
      toast.error("Kunne ikke slette utkast");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Presets Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Broadcast &amp; Nyhetsbrev Studio</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight">
              Design Nyhetsbrev for Resend
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-2xl">
              Tilpass overskrift, tekst og tilbud, velg opplevelser fra katalogen og forhåndsvis e-posten i sanntid. 
              Kopier den ferdig optimaliserte HTML-koden rett inn i Resend Broadcasts.
            </p>
          </div>

          {/* Quick Actions / Subscriber count */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {subscribersCount !== null && (
              <button
                type="button"
                onClick={handleDownloadCsv}
                disabled={downloadingCsv}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-all shadow-sm cursor-pointer"
                title="Last ned CSV med alle kunder som har godtatt nyhetsbrev ved booking"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong>{subscribersCount}</strong> opt-in abonnenter
                </span>
                <Download className="w-3 h-3 text-zinc-500 ml-1" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#9C39FF]" />
              <span>Lagre utkast</span>
            </button>

            {drafts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowLoadModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Mine utkast ({drafts.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Hurtigmaler (Velg et utgangspunkt):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_TEMPLATES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setForm(preset.data);
                  toast.success(`Mal satt til «${preset.label}»`);
                }}
                className="text-left p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-[#9C39FF]/50 transition-all hover:bg-zinc-900/60 cursor-pointer group"
              >
                <div className="text-xs font-semibold text-white group-hover:text-[#9C39FF] transition-colors flex items-center justify-between">
                  <span>{preset.label}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9C39FF]" />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Inputs (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Metadata Card: Subject & Preheader */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Mail className="w-4 h-4 text-[#9C39FF]" /> E-postdetaljer (Innboks)
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium flex items-center justify-between">
                <span>Emnefelt (Subject)</span>
                <span className="text-[11px] text-zinc-500">{form.subject.length} tegn</span>
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="F.eks: Nyheter og høsttilbud fra KRS VR Arena"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-[#9C39FF] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium flex items-center justify-between">
                <span>Preheader (Forhåndsvisningstekst)</span>
                <span className="text-[11px] text-zinc-500">{form.preheader.length} tegn</span>
              </label>
              <input
                type="text"
                value={form.preheader}
                onChange={(e) => setForm({ ...form, preheader: e.target.value })}
                placeholder="Vises ved siden av emnefeltet i innboksen..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-[#9C39FF] transition-colors"
              />
            </div>
          </div>

          {/* Main Content Card: Headline, Teaser, Paragraphs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Eye className="w-4 h-4 text-purple-400" /> Hovedtekst
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Hovedoverskrift (H1)</label>
              <input
                type="text"
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="Overskrift i e-posten..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-[#9C39FF] transition-colors font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Ingress / Teaser</label>
              <textarea
                value={form.teaser}
                onChange={(e) => setForm({ ...form, teaser: e.target.value })}
                rows={2}
                placeholder="Kort introduksjon..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-[#9C39FF] transition-colors resize-y"
              />
            </div>

            {/* Paragraphs list */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-400 font-medium">Brødtekst / Avsnitt ({form.bodyParagraphs.length})</label>
                <button
                  type="button"
                  onClick={handleAddParagraph}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Legg til avsnitt
                </button>
              </div>

              {form.bodyParagraphs.map((para, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="text-[11px] text-zinc-600 font-mono mt-2 shrink-0">{idx + 1}.</span>
                  <textarea
                    value={para}
                    onChange={(e) => handleParagraphChange(idx, e.target.value)}
                    rows={3}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#9C39FF] transition-colors resize-y leading-relaxed"
                  />
                  {form.bodyParagraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParagraph(idx)}
                      className="text-zinc-600 hover:text-red-400 p-1.5 mt-1 transition-colors rounded-lg hover:bg-zinc-950 cursor-pointer"
                      title="Slett avsnitt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Featured Experience Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-emerald-400" /> Fremhev Opplevelse fra Arenaen
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includeExperience}
                  onChange={(e) => setForm({ ...form, includeExperience: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9C39FF]"></div>
              </label>
            </div>

            {form.includeExperience && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Hent fra aktive opplevelser</label>
                  <select
                    disabled={loadingExperiences}
                    onChange={(e) => handleSelectExperience(e.target.value)}
                    defaultValue=""
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-[#9C39FF] transition-colors cursor-pointer"
                  >
                    <option value="" disabled>Velg et spill fra listen...</option>
                    {experiences.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.name} ({exp.type || "VR"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Tittel</label>
                    <input
                      type="text"
                      value={form.featuredExperience.name}
                      onChange={(e) => setForm({
                        ...form,
                        featuredExperience: { ...form.featuredExperience, name: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Kategori / Kicker</label>
                    <input
                      type="text"
                      value={form.featuredExperience.type || ""}
                      onChange={(e) => setForm({
                        ...form,
                        featuredExperience: { ...form.featuredExperience, type: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Kort beskrivelse</label>
                  <textarea
                    value={form.featuredExperience.shortDescription || ""}
                    onChange={(e) => setForm({
                      ...form,
                      featuredExperience: { ...form.featuredExperience, shortDescription: e.target.value }
                    })}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#9C39FF] resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Bilde-URL</label>
                  <input
                    type="text"
                    value={form.featuredExperience.picture || ""}
                    onChange={(e) => setForm({
                      ...form,
                      featuredExperience: { ...form.featuredExperience, picture: e.target.value }
                    })}
                    placeholder="https://..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Knappetekst</label>
                    <input
                      type="text"
                      value={form.featuredExperience.buttonText || ""}
                      onChange={(e) => setForm({
                        ...form,
                        featuredExperience: { ...form.featuredExperience, buttonText: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Mållenke</label>
                    <input
                      type="text"
                      value={form.featuredExperience.buttonUrl || ""}
                      onChange={(e) => setForm({
                        ...form,
                        featuredExperience: { ...form.featuredExperience, buttonUrl: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#9C39FF]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Discount / Promo Box Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" /> Rabattkode-boks
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includeDiscount}
                  onChange={(e) => setForm({ ...form, includeDiscount: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9C39FF]"></div>
              </label>
            </div>

            {form.includeDiscount && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-xs text-zinc-400 font-medium">Rabattkode som fremheves</label>
                <input
                  type="text"
                  value={form.discountCode}
                  onChange={(e) => setForm({ ...form, discountCode: e.target.value.toUpperCase() })}
                  placeholder="F.eks: VRHOST15"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono text-base tracking-wider focus:outline-none focus:border-[#9C39FF]"
                />
              </div>
            )}
          </div>

          {/* Call to Action Button Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-400" /> Hovedknapp (Call to Action)
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includeCta}
                  onChange={(e) => setForm({ ...form, includeCta: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9C39FF]"></div>
              </label>
            </div>

            {form.includeCta && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Knappetekst</label>
                  <input
                    type="text"
                    value={form.ctaButtonText}
                    onChange={(e) => setForm({ ...form, ctaButtonText: e.target.value })}
                    placeholder="Bestill tid på nett"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Mållenke</label>
                  <input
                    type="text"
                    value={form.ctaButtonUrl}
                    onChange={(e) => setForm({ ...form, ctaButtonUrl: e.target.value })}
                    placeholder="https://krsvr.no/booking"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-[#9C39FF]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview & Export Studio (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
            {/* Top Toolbar: Viewport & Copy Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveRightTab("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeRightTab === "preview" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Forhåndsvisning</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab("html")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeRightTab === "html" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>HTML-kode</span>
                </button>
              </div>

              {/* Viewport switch & Quick Copy */}
              <div className="flex items-center gap-2">
                {activeRightTab === "preview" && (
                  <div className="bg-zinc-950 border border-zinc-800 p-1 rounded-xl flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewport("desktop")}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        viewport === "desktop" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
                      }`}
                      title="Desktop (600px)"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewport("mobile")}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        viewport === "mobile" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
                      }`}
                      title="Mobil (375px)"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mobil</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCopySubject}
                  className="px-3 py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  title="Kopier emnefeltet"
                >
                  {copiedSubject ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Emne</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="px-4 py-2 bg-[#9C39FF] hover:bg-[#8A2BE2] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-[#9C39FF]/20 cursor-pointer"
                  title="Kopier hele den ferdige HTML-koden klar for Resend"
                >
                  {copiedHtml ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white" />
                      <span>Kopier HTML for Resend</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Helper notice */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-950/70 border border-zinc-800/80 px-3.5 py-2 rounded-xl">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Lim inn i Resend: <strong>Broadcasts &rarr; Create Broadcast &rarr; Paste HTML</strong></span>
              </span>
              {isRendering && (
                <span className="flex items-center gap-1.5 text-purple-400 shrink-0">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Kompilerer...</span>
                </span>
              )}
            </div>

            {/* Content Area: Iframe Live Preview OR HTML Pre */}
            {activeRightTab === "preview" ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 flex justify-center items-start min-h-[750px] overflow-hidden">
                <div
                  className={`bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border border-zinc-200 ${
                    viewport === "mobile" ? "w-[375px] h-[750px]" : "w-full max-w-[600px] h-[750px]"
                  }`}
                >
                  {renderedHtml ? (
                    <iframe
                      srcDoc={renderedHtml}
                      className="w-full h-full border-none bg-white"
                      title="Newsletter Live Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#9C39FF]" />
                      <span className="text-xs">Laster forhåndsvisning...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 h-[750px] overflow-y-auto">
                <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed select-all">
                  {renderedHtml || "Genererer HTML-kode..."}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Draft Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Lagre utkast</h3>
            <p className="text-xs text-zinc-400">
              Gi utkastet et gjenkjennelig navn slik at du kan hente det opp igjen senere.
            </p>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="F.eks: Høstkampanje 2026 - Uke 40"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#9C39FF]"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-5 py-2 bg-[#9C39FF] hover:bg-[#8A2BE2] text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-[#9C39FF]/20"
              >
                Lagre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Draft Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-white">Dine lagrede utkast</h3>
              <button
                type="button"
                onClick={() => setShowLoadModal(false)}
                className="text-zinc-500 hover:text-white text-xs"
              >
                Lukk
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleApplyDraft(d)}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-[#9C39FF]/50 transition-all cursor-pointer group"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-[#9C39FF] transition-colors">
                      {d.name}
                    </h4>
                    <span className="text-[11px] text-zinc-500">
                      Sist oppdatert {new Date(d.updatedAt).toLocaleDateString("no")} kl. {new Date(d.updatedAt).toLocaleTimeString("no", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteDraft(d.id, e)}
                      className="text-zinc-600 hover:text-red-400 p-1.5 transition-colors rounded-lg hover:bg-zinc-950 cursor-pointer"
                      title="Slett utkast"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-purple-400 font-medium group-hover:underline">
                      Åpne &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
