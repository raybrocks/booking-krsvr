"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DevFooter() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 flex justify-center z-[100]">
      <div className="flex items-center gap-4 text-sm font-medium">
        <span className="text-zinc-400 hidden md:inline-block">Dev Toggle:</span>
        <Link 
          href="/" 
          className={`px-4 py-1.5 rounded-full transition-colors ${!isAdmin ? "bg-[#9C39FF] text-white shadow-[0_0_10px_rgba(156,57,255,0.3)]" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
        >
          Frontend
        </Link>
        <Link 
          href="/admin" 
          className={`px-4 py-1.5 rounded-full transition-colors ${isAdmin ? "bg-[#9C39FF] text-white shadow-[0_0_10px_rgba(156,57,255,0.3)]" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
        >
          Backend
        </Link>
      </div>
    </div>
  );
}
