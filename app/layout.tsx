import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.krsvr.no'),
  title: {
    default: 'KRS VR Arena | VR Escape Room, Arcade & Teambuilding i Kristiansand',
    template: '%s | KRS VR Arena'
  },
  description: 'Opplev eksklusive VR Escape Rooms, skytespill og eventyr i Kristiansand med full bevegelsesfrihet. Den perfekte aktiviteten for teambuilding, utdrikningslag, bursdager og vennegjengen.',
  keywords: [
    'VR Kristiansand',
    'Mixed Reality Kristiansand',
    'Escape Room Kristiansand',
    'VR Escape Room Kristiansand',
    'Zombie Shooter Kristiansand',
    'Spatial Ops Kristiansand',
    'Arcade Kristiansand',
    'Teambuilding Kristiansand',
    'Utdrikningslag Kristiansand',
    'Bursdag Kristiansand',
    'Firmaevent Kristiansand',
    'Virtual Reality'
  ],
  authors: [{ name: 'KRS VR Arena' }],
  creator: 'KRS VR Arena',
  publisher: 'KRS VR Arena',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'KRS VR Arena | VR Escape Room & Arcade i Kristiansand',
    description: 'Opplev eksklusive VR Escape Rooms, Mixed Reality, og actionfylte skytespill i Kristiansand. Full bevegelsesfrihet (roam free) på store spillområder for utdrikningslag, teambuilding, bursdag og vennegjenger.',
    url: 'https://www.krsvr.no',
    siteName: 'KRS VR Arena',
    locale: 'nb_NO',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KRS VR Arena',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "KRS VR Arena",
    "image": "https://www.krsvr.no/icon.svg",
    "url": "https://www.krsvr.no",
    "telephone": "+4740828302",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Industrigata 12",
      "addressLocality": "Kristiansand",
      "postalCode": "4632",
      "addressCountry": "NO"
    },
    "sameAs": [
      "https://www.instagram.com/krs.vr.arena",
      "https://www.tiktok.com/@krs.vr.arena",
      "https://www.facebook.com/krs.vr.arena",
      "https://www.youtube.com/@KrsVRArena"
    ]
  };

  return (
    <html lang="no" className={cn("dark font-sans", inter.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-[#9C39FF]/30 flex flex-col" suppressHydrationWarning>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
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
          <ScrollToTop />
          <Analytics />
      </body>
    </html>
  );
}
