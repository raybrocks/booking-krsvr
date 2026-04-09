import type {Metadata} from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";
import Header from "@/components/Header";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Krs VR Arena Booking',
  description: 'High-end VR experiences',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("dark font-sans", inter.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-[#9C39FF]/30 flex flex-col" suppressHydrationWarning>
        <I18nProvider>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Toaster theme="dark" position="top-center" />
        </I18nProvider>
      </body>
    </html>
  );
}
