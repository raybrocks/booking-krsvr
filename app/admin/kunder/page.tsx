import AdminAuthWrapper from "@/components/AdminAuthWrapper";
import ClientsManager from "@/components/ClientsManager";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

export const metadata = {
  title: "Bedriftskunder & Referanser | KRS VR Arena Admin",
  description: "Administrer bedriftslogoer og kundeomtaler for KRS VR Arena",
};

export default function AdminClientsPage() {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-black text-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link 
                href="/admin" 
                className="apple-press flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/[0.07] hover:bg-white/[0.12] px-3.5 py-2 rounded-full transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Tilbake til Dashboard
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#9C39FF]" />
                </div>
                <h1 className="apple-display text-xl font-semibold text-white">Kunder & Referanser</h1>
              </div>
            </div>
          </div>

          <ClientsManager />
        </div>
      </div>
    </AdminAuthWrapper>
  );
}
