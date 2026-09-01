"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Monitor, 
  Smartphone, 
  Copy, 
  Check, 
  Loader2, 
  Code2, 
  Eye, 
  FileCode2, 
  Sparkles, 
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { EMAIL_CATEGORIES } from './emails/registry';

interface RenderedEmailTemplate {
  id: string;
  title: string;
  category: 'customer' | 'internal' | 'marketing';
  categoryLabel: string;
  subject: string;
  trigger: string;
  filePath: string;
  mockProps: Record<string, any>;
  html: string;
}

export default function EmailPreviewClient() {
  const [templates, setTemplates] = useState<RenderedEmailTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('booking-confirmation');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'props'>('preview');
  const [loading, setLoading] = useState(true);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch('/api/admin/emails/preview');
        if (!res.ok) {
          throw new Error('Kunne ikke hente e-postmaler');
        }
        const data = await res.json();
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          setSelectedId(data.templates[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching email templates:', err);
        toast.error(err.message || 'Feil ved lasting av e-postmaler');
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  const currentTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  const handleCopyHtml = async () => {
    if (!currentTemplate) return;
    try {
      await navigator.clipboard.writeText(currentTemplate.html);
      setCopiedHtml(true);
      toast.success('HTML kopiert til utklippstavlen!', {
        description: 'Klar til å limes inn i Resend Broadcasts eller e-postklient.',
      });
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (err) {
      toast.error('Kunne ikke kopiere HTML');
    }
  };

  const handleCopySubject = async () => {
    if (!currentTemplate) return;
    try {
      await navigator.clipboard.writeText(currentTemplate.subject);
      setCopiedSubject(true);
      toast.success('Emnefelt kopiert!');
      setTimeout(() => setCopiedSubject(false), 2000);
    } catch (err) {
      toast.error('Kunne ikke kopiere emnefelt');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
        <p className="text-sm">Genererer og server-rendrer e-postmaler...</p>
      </div>
    );
  }

  if (!currentTemplate) {
    return (
      <div className="text-center py-16 text-zinc-400">
        <p>Ingen e-postmaler ble funnet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Controls Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Template Selector with OptGroups */}
          <div className="flex-1 max-w-xl">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#9C39FF]" /> Velg E-postmal
            </label>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 hover:border-[#9C39FF] rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#9C39FF] focus:ring-1 focus:ring-[#9C39FF] transition-all appearance-none cursor-pointer pr-10"
              >
                {EMAIL_CATEGORIES.map((cat) => {
                  const categoryTemplates = templates.filter((t) => t.category === cat.id);
                  if (categoryTemplates.length === 0) return null;

                  return (
                    <optgroup key={cat.id} label={`📁 ${cat.label}`} className="bg-zinc-900 text-zinc-300 font-bold">
                      {categoryTemplates.map((template) => (
                        <option key={template.id} value={template.id} className="bg-zinc-950 text-white font-normal py-1">
                          {template.title}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Device and Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            {/* View Mode Toggle (Preview vs HTML vs Props) */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-[#9C39FF] text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Forhåndsvisning
              </button>
              <button
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'html'
                    ? 'bg-[#9C39FF] text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" /> Ren HTML
              </button>
              <button
                onClick={() => setActiveTab('props')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'props'
                    ? 'bg-[#9C39FF] text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" /> Testdata
              </button>
            </div>

            {/* Desktop vs Mobile Toggle */}
            {activeTab === 'preview' && (
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'desktop'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Desktop visning (640px)"
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'mobile'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Mobil visning (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobil
                </button>
              </div>
            )}

            {/* Copy HTML Button */}
            <button
              onClick={handleCopyHtml}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border border-zinc-700 active:scale-95"
            >
              {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedHtml ? 'Kopiert!' : 'Kopier HTML'}
            </button>
          </div>
        </div>

        {/* Metadata Details Card */}
        <div className="mt-5 pt-5 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Subject Line */}
          <div className="space-y-1 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
            <span className="text-zinc-500 font-medium block">✉️ Emnefelt (Subject):</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-200 font-semibold truncate" title={currentTemplate.subject}>
                {currentTemplate.subject}
              </span>
              <button
                onClick={handleCopySubject}
                className="text-zinc-500 hover:text-[#9C39FF] p-1 rounded transition-colors shrink-0"
                title="Kopier emnefelt"
              >
                {copiedSubject ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Trigger Description */}
          <div className="space-y-1 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
            <span className="text-zinc-500 font-medium block">⚡ Utsendelses-trigger:</span>
            <p className="text-zinc-300 line-clamp-2 leading-relaxed" title={currentTemplate.trigger}>
              {currentTemplate.trigger}
            </p>
          </div>

          {/* File Path & Category */}
          <div className="space-y-1 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
            <span className="text-zinc-500 font-medium block">📁 Kildekode & Kategori:</span>
            <div className="flex items-center gap-2">
              <span className="bg-[#9C39FF]/15 text-[#9C39FF] border border-[#9C39FF]/30 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                {currentTemplate.categoryLabel}
              </span>
              <code className="text-zinc-400 font-mono text-[11px] truncate" title={currentTemplate.filePath}>
                {currentTemplate.filePath}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-8 min-h-[650px] flex justify-center items-start overflow-hidden">
        {activeTab === 'preview' && (
          <div
            className={`transition-all duration-300 w-full flex justify-center ${
              viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[680px]'
            }`}
          >
            <div
              className={`w-full bg-white rounded-2xl shadow-2xl overflow-hidden border ${
                viewMode === 'mobile'
                  ? 'border-zinc-700 ring-8 ring-zinc-900 rounded-[32px] my-4'
                  : 'border-zinc-300'
              }`}
            >
              {/* Mobile device top notch mockup bar */}
              {viewMode === 'mobile' && (
                <div className="bg-zinc-900 text-zinc-400 text-[10px] px-6 py-2 flex items-center justify-between border-b border-zinc-800">
                  <span>09:41</span>
                  <div className="w-16 h-3 bg-zinc-950 rounded-full mx-auto" />
                  <span>5G 100%</span>
                </div>
              )}

              {/* Isolated Iframe rendering the exact Email HTML */}
              <iframe
                ref={iframeRef}
                srcDoc={currentTemplate.html}
                title={currentTemplate.title}
                className="w-full h-[700px] border-0 bg-white"
                sandbox="allow-popups allow-same-origin"
              />
            </div>
          </div>
        )}

        {activeTab === 'html' && (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Ferdig kompilert e-post HTML ({currentTemplate.html.length} tegn)</span>
              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-1 text-[#9C39FF] hover:underline"
              >
                <Copy className="w-3.5 h-3.5" /> Kopier all HTML
              </button>
            </div>
            <pre className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[650px] leading-relaxed select-all">
              {currentTemplate.html}
            </pre>
          </div>
        )}

        {activeTab === 'props' && (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Testdata / Props brukt for å generere denne forhåndsvisningen</span>
            </div>
            <pre className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-[#a855f7] overflow-x-auto max-h-[650px] leading-relaxed">
              {JSON.stringify(currentTemplate.mockProps, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
