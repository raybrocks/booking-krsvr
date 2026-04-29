import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";
import Header from "@/components/Header";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Krs VR Arena Booking',
  description: 'High-end VR experiences',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VR Admin',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("dark font-sans", inter.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-[#9C39FF]/30 flex flex-col pb-16" suppressHydrationWarning>
        <I18nProvider>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <footer className="w-full py-6 text-center text-xs text-zinc-500 border-t border-zinc-800/50 mt-auto">
            <div className="container mx-auto px-4 leading-relaxed flex flex-wrap justify-center items-center gap-2">
              <span>Krs VR Arena AS</span>
              <span className="hidden sm:inline">|</span>
              <span>Org.nr 936318878</span>
              <span className="hidden sm:inline">|</span>
              <span>Industrigata 12, 4632 Kristiansand</span>
              <span className="hidden sm:inline">|</span>
              <span>post@krsvr.no</span>
              <span className="hidden sm:inline">|</span>
              <span>+47 40828302</span>
            </div>
          </footer>
          <Toaster 
            theme="dark" 
            position="top-center" 
            toastOptions={{
              classNames: {
                toast: 'bg-[#9C39FF] text-white border-[#8b32e6] shadow-[0_0_20px_rgba(156,57,255,0.3)]',
                error: 'bg-[#9C39FF] text-white border-[#8b32e6]',
                success: 'bg-[#9C39FF] text-white border-[#8b32e6]',
                warning: 'bg-[#9C39FF] text-white border-[#8b32e6]',
                info: 'bg-[#9C39FF] text-white border-[#8b32e6]',
              }
            }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
