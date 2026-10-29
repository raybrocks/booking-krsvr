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
    default: 'KRS VR Arena | Kristiansands mest sosiale VR-opplevelser',
    template: '%s | KRS VR Arena'
  },
  description: 'Kristiansands mest sosiale VR-opplevelser i vår 300 kvm arkade. VR Escape Rooms, Action Strategi og felles opplevelser for teambuilding, utdrikningslag, bursdager og vennegjengen.',
  keywords: [
    'VR Kristiansand',
    'Mixed Reality Kristiansand',
    'Tactical Arena Kristiansand',
    'Tactical Arena',
    'Action Strategi',
    'Mixed Reality Shooter',
    'Escape Room Kristiansand',
    'VR Escape Room Kristiansand',
    'Zombie Shooter Kristiansand',
    'Arcade Kristiansand',
    'VR Arcade Kristiansand',
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
    title: 'KRS VR Arena | Kristiansands mest sosiale VR-opplevelser',
    description: 'Opplev latter, samarbeid og felles opplevelser i vår 300 kvm arkade på Lund i Kristiansand. To spillsaler og lounge for utdrikningslag, teambuilding, bursdag, venner og familie.',
    url: 'https://www.krsvr.no',
    siteName: 'KRS VR Arena',
    locale: 'nb_NO',
    type: 'website',
    images: [
      {
        url: 'https://www.krsvr.no/images/vr-teambuilding-firmaevent-kristiansand.jpg',
        width: 1600,
        height: 1200,
        alt: 'KRS VR Arena Kristiansand',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KRS VR Arena | Kristiansands mest sosiale VR-opplevelser',
    description: 'Opplev latter, samarbeid og felles opplevelser i vår 300 kvm arkade på Lund i Kristiansand.',
    images: ['https://www.krsvr.no/images/vr-teambuilding-firmaevent-kristiansand.jpg'],
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
    "description": "Opplevelsessenter i Kristiansand med trådløse VR Escape Rooms, Action Strategi og felles opplevelser for vennegjengen, studenter, teambuilding, utdrikningslag og familiepakker.",
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
      "latitude": 58.152302,
      "longitude": 8.025888
    },
    "hasMap": "https://maps.app.goo.gl/eiVo2wuEaJhXJXENA?g_st=ic",
    "areaServed": [
      { "@type": "City", "name": "Kristiansand" },
      { "@type": "AdministrativeArea", "name": "Agder" }
    ],
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.krsvr.no/booking",
        "inLanguage": "nb-NO",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "Reservation",
        "name": "VR Opplevelse Booking"
      }
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "VR og sosiale opplevelser",
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
            "name": "Tactical Arena & Action Strategi",
            "description": "Trådløs action, lagtaktikk og fri bevegelse i 143 kvm arena for vennegjenger og kollegaer."
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
    "memberOf": {
      "@type": "Organization",
      "name": "Visit Sørlandet",
      "url": "https://www.visitsorlandet.com"
    },
    "subjectOf": [
      {
        "@type": "NewsArticle",
        "headline": "Åpnet VR-arena i Kristiansand: – Nytt konsept på Sørlandet (Deler lokale med dansestudio: Nå fyller de storsalen med virtuell moro)",
        "description": "På Lund har byens nyeste virtuelle lekeplass åpnet dørene for både store og små.",
        "abstract": "Reportasje i KRS – Avisen Kristiansand om KRS VR Arena på Lund i Kristiansand, drevet av daglig leder Jan Lewi Skeie og game master Marius Fjermedal. Konseptet er det første av sitt slag på Sørlandet og spesialiserer seg på sosiale VR-opplevelser, virtuelle Escape Rooms og actionspill der man beveger seg fritt på over 140 kvadratmeter med kapasitet fra 2 til 64 spillere. Artikkelen følger blant annet 17 ansatte fra Verkstedet Spiseri på teambuilding fordelt på tre rullerende lag med visning på storskjerm, og omtaler tilbudet for bedrifter (som Ingeniørvesenet), familier, studenter, turister, utdrikningslag og barnebursdager.",
        "keywords": "VR-briller, Lund, Kristiansand, KRS VR Arena, Teambuilding, Virtuelle Escape Rooms, Utdrikningslag, Barnebursdag, Næringsliv",
        "url": "https://www.krs.no/apnet-vr-arena-i-kristiansand-nytt-konsept-pa-sorlandet/s/80-157-40800",
        "datePublished": "2026-10-19T21:49:30+02:00",
        "author": {
          "@type": "Person",
          "name": "Jasmine Marie Agas Ramos"
        },
        "publisher": {
          "@type": "Organization",
          "name": "KRS - Avisen Kristiansand",
          "url": "https://www.krs.no"
        }
      },
      {
        "@type": "Article",
        "headline": "Mini-intervju med KRS VR Arena | Visit Sørlandet",
        "description": "Visit Sørlandet presenterer KRS VR Arena – Sørlandets eneste trådløse free-roam VR-arena på Lund i Kristiansand med teambuilding, firmaevent og unike helårsopplevelser.",
        "abstract": "Mini-intervju publisert av Visit Sørlandet med KRS VR Arena som ny partner. Omtaler arenaen på Lund i Kristiansand med 143 kvm spillflate for opptil 10 samtidige spillere i frittgående VR og opptil 64 personer i sosialt turneringsformat med partylounge og storskjerm for teambuilding, firmaevent, bursdag og utdrikningslag.",
        "url": "https://www.visitsorlandet.com/bransje/visit-sorlandet-utvikling/nyheter/mini-intervjuer-med-vare-partnere/mini-intervju-med-krs-vr-arena/",
        "datePublished": "2026-10-29",
        "publisher": {
          "@type": "Organization",
          "name": "Visit Sørlandet",
          "url": "https://www.visitsorlandet.com"
        }
      }
    ],
    "sameAs": [
      "https://www.visitsorlandet.com/bransje/visit-sorlandet-utvikling/nyheter/mini-intervjuer-med-vare-partnere/mini-intervju-med-krs-vr-arena/",
      "https://www.visitsorlandet.com/listing/krs-vr-arena-%E2%80%93-vr-escape-room-%26-mixed-reality-arkade/867197306/",
      "https://en.visitsorlandet.com/listing/krs-vr-arena-%e2%80%93-vr-escape-room-%26-mixed-reality-arkade/867197306/",
      "https://no.tripadvisor.com/Attraction_Review-g190492-d34257006-Reviews-Krs_VR_Arena-Kristiansand_Vest_Agder_Southern_Norway.html",
      "https://www.krs.no/apnet-vr-arena-i-kristiansand-nytt-konsept-pa-sorlandet/s/80-157-40800",
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
