import AdminAuthWrapper from "@/components/AdminAuthWrapper";
import NewsletterDesigner from "@/components/NewsletterDesigner";
import Link from "next/link";
import { ArrowLeft, Mail, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Nyhetsbrev Designer | KRS VR Arena Admin",
  description: "Design og forhåndsvis nyhetsbrev og broadcasts for Resend.",
};

export default function AdminNewsletterPage() {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-black text-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar with Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Link 
                href="/admin" 
                className="apple-press flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/[0.07] hover:bg-white/[0.12] px-3.5 py-2 rounded-full transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Tilbake til Dashboard
              </Link>
              <Link 
                href="/admin/emails" 
                className="apple-press flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/[0.07] hover:bg-white/[0.12] px-3.5 py-2 rounded-full transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#9C39FF]" /> Alle E-postmaler
              </Link>
            </div>

            <a
              href="https://resend.com/broadcasts"
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.11] px-3.5 py-2 rounded-full transition-colors"
            >
              <span>Gå til Resend Broadcasts</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>

          <NewsletterDesigner />
        </div>
      </div>
    </AdminAuthWrapper>
  );
}
