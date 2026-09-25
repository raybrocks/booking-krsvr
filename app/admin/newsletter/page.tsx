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
            <div className="flex items-center gap-3">
              <Link 
                href="/admin" 
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Tilbake til Dashboard
              </Link>
              <Link 
                href="/admin/emails" 
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4 text-purple-400" /> Alle E-postmaler
              </Link>
            </div>

            <a
              href="https://resend.com/broadcasts"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 px-3.5 py-2 rounded-xl transition-colors"
            >
              <span>Gå til Resend Broadcasts</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            </a>
          </div>

          <NewsletterDesigner />
        </div>
      </div>
    </AdminAuthWrapper>
  );
}
