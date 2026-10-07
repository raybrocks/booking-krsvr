import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ConditionalHeader, ConditionalFooter } from "@/components/LayoutVisibilityWrapper";
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
    "@type": ["EntertainmentBusiness", "LocalBusiness"],
    "name": "KRS VR Arena",
    "description": "Opplevelsessenter i Kristiansand med trådløse VR Escape Rooms, Mixed Reality og actionfylte spill for vennegjengen, studenter, teambuilding, utdrikningslag og familiepakker.",
    "image": "https://krsvr.no/krsvrarena_logo_sort.png",
    "url": "https://www.krsvr.no",
    "telephone": "+4740828302",
    "priceRange": "NOK 375 - 460",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Industrigata 12",
      "addressLocality": "Kristiansand",
      "postalCode": "4632",
      "addressCountry": "NO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 58.1567,
      "longitude": 8.0211
    },
    "hasMap": "https://maps.app.goo.gl/eiVo2wuEaJhXJXENA?g_st=ic",
    "areaServed": [
      { "@type": "City", "name": "Kristiansand" },
      { "@type": "AdministrativeArea", "name": "Agder" }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "VR og Mixed Reality Opplevelser",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "VR Escape Room i Kristiansand",
            "description": "Gåteløsing og samarbeid i virtuelle rom for 2–6 spillere."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "VR Shooter & Mixed Reality Arena",
            "description": "Trådløs action og fri bevegelse i 140 kvm arena for vennegjenger og kollegaer."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Teambuilding & Firmaevent i Kristiansand",
            "description": "Sosialt og engasjerende opplegg for bedrifter med gamemaster og partylounge."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Utdrikningslag i VR",
            "description": "Morsomme konkurranser og action for utdrikningslag i Kristiansand."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "VR Familiepakker",
            "description": "Tilpassede 90-minutters opplevelser for familier med barn (8–12 år) og ungdom (12+)."
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "22"
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
          <ConditionalHeader />
          <div className="flex-1">
            {children}
          </div>
          <ConditionalFooter />
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
