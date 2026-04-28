import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";
import Header from "@/components/Header";
import DevFooter from "@/components/DevFooter";

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
          <DevFooter />
          <Toaster 
            theme="dark" 
            position="top-center" 
            toastOptions={{
              classNames: {
                error: 'bg-red-600 text-white border-red-700',
                success: 'bg-emerald-600 text-white border-emerald-700',
                warning: 'bg-amber-500 text-white border-amber-600',
                info: 'bg-blue-600 text-white border-blue-700',
              }
            }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
