import AdminAuthWrapper from "@/components/AdminAuthWrapper";
import EmailPreviewClient from "@/components/EmailPreviewClient";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata = {
  title: "E-postmaler | KRS VR Arena Admin",
  description: "Forhåndsvisning og eksport av alle e-postmaler for KRS VR Arena",
};

export default function AdminEmailsPage() {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-black text-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link 
                href="/admin" 
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Tilbake til Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#9C39FF]/10 flex items-center justify-center border border-[#9C39FF]/20">
                  <Mail className="w-4 h-4 text-[#9C39FF]" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Forhåndsvisning av E-postmaler</h1>
              </div>
            </div>
          </div>

          <EmailPreviewClient />
        </div>
      </div>
    </AdminAuthWrapper>
  );
}
