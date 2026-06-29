import React from "react";
import { ExperiencesView } from "@/components/ExperiencesView";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const initialTypeSlug = resolvedParams.slug?.[0];
  const initialExpSlug = resolvedParams.slug?.[1];

  let title = "VR Opplevelser | KRS VR Arena Kristiansand";
  let description = "Utforsk våre fantastiske VR-opplevelser og Mixed Reality i Kristiansand, fra VR Escape Rooms til actionfylte skytespill og eventyr for hele familien.";

  let isVippsTest = false;

  if (initialTypeSlug) {
    try {
      const exps = await prisma.experience.findMany({
        where: { isActive: true },
        include: { experienceType: true }
      });

      if (initialExpSlug) {
        const matchedExp = exps.find(e => (e.experienceType?.slug || slugify(e.type || "")) === initialTypeSlug && slugify(e.name || "") === initialExpSlug);
        if (matchedExp) {
          title = `${matchedExp.name} | ${matchedExp.type} i Kristiansand`;
          description = matchedExp.shortDescription ? `${matchedExp.shortDescription} Opplev ${matchedExp.name} hos KRS VR Arena i Kristiansand.` : description;
          if (matchedExp.type?.toLowerCase().includes("vipps-test") || matchedExp.type?.toLowerCase().includes("vipps test")) {
            isVippsTest = true;
          }
        }
      } else {
        const matchedType = exps.find(e => (e.experienceType?.slug || slugify(e.type || "")) === initialTypeSlug);
        if (matchedType) {
          title = `${matchedType.type} i Kristiansand | VR Opplevelser`;
          if (matchedType.type?.toLowerCase().includes("vipps-test") || matchedType.type?.toLowerCase().includes("vipps test")) {
            isVippsTest = true;
          }
        }
      }
      
      if (initialTypeSlug.includes("vipps-test") || initialTypeSlug.includes("vipps-test")) {
          isVippsTest = true;
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.krsvr.no/vr-opplevelser${initialTypeSlug ? `/${initialTypeSlug}` : ''}${initialExpSlug ? `/${initialExpSlug}` : ''}`,
      type: "website",
    },
    ...(isVippsTest && { robots: { index: false, follow: false } }),
  };
}

export default async function ExperiencesPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const initialTypeSlug = resolvedParams.slug?.[0] || null;
  const initialExpSlug = resolvedParams.slug?.[1] || null;

  let experiences: any[] = [];
  try {
    experiences = await prisma.experience.findMany({
      where: { isActive: true },
      include: { experienceType: true }
    });
    experiences.sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 999;
      const orderB = typeof b.order === 'number' ? b.order : 999;
      return orderA - orderB;
    });
  } catch (error) {
    console.error("Error fetching experiences for JSON-LD:", error);
  }

  // Determine if it's a specific experience or a list
  let matchedExp = null;
  if (initialTypeSlug && initialExpSlug) {
    matchedExp = experiences.find(e => (e.experienceType?.slug || slugify(e.type || "")) === initialTypeSlug && slugify(e.name || "") === initialExpSlug);
  }

  let jsonLd: any = null;

  const providerInfo = {
    "@type": "EntertainmentBusiness",
    "name": "KRS VR Arena",
    "telephone": "+4740828302",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Industrigata 12",
      "postalCode": "4632",
      "addressLocality": "Kristiansand",
      "addressCountry": "NO"
    },
    "hasMap": "https://maps.app.goo.gl/eiVo2wuEaJhXJXENA?g_st=ic"
  };

  if (matchedExp) {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `${matchedExp.name} - ${matchedExp.type} i Kristiansand`,
      "description": `${matchedExp.shortDescription || ""} Spilles hos KRS VR Arena i Kristiansand.`,
      "brand": providerInfo,
      "category": matchedExp.type,
      "offers": {
        "@type": "AggregateOffer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "NOK",
        "lowPrice": 375,
        "highPrice": 460,
        "offerCount": 1
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 4.9,
        "reviewCount": 124
      },
      "review": [
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": 5
          },
          "author": {
            "@type": "Person",
            "name": "Fornøyd Kunde"
          }
        }
      ]
    };
  } else if (experiences.length > 0) {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "VR Opplevelser hos KRS VR Arena",
      "description": "Se vårt store utvalg av VR-opplevelser, inkludert Escape Rooms, skytespill og eventyr i Kristiansand.",
      "itemListElement": experiences.map((exp, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": exp.name,
          "description": exp.shortDescription || "",
          "url": `https://www.krsvr.no/vr-opplevelser/${exp.experienceType?.slug || slugify(exp.type || "")}/${slugify(exp.name || "")}`,
          "brand": providerInfo,
          "offers": {
            "@type": "AggregateOffer",
            "availability": "https://schema.org/InStock",
            "priceCurrency": "NOK",
            "lowPrice": 375,
            "highPrice": 460,
            "offerCount": 1
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": 4.9,
            "reviewCount": 124
          },
          "review": [
            {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": 5
              },
              "author": {
                "@type": "Person",
                "name": "Fornøyd Kunde"
              }
            }
          ]
        }
      }))
    };
  }

  return (
    <main className="min-h-screen bg-black pt-16 pb-20 relative overflow-visible">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* Background flourishes */}
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <ExperiencesView initialExperiences={experiences} initialTypeSlug={initialTypeSlug} initialExpSlug={initialExpSlug} />
      </div>
    </main>
  );
}