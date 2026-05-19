import React from "react";
import { ExperiencesView } from "@/components/ExperiencesView";
import { Metadata } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const initialTypeSlug = resolvedParams.slug?.[0];
  const initialExpSlug = resolvedParams.slug?.[1];

  let title = "VR Opplevelser | VRSenteret";
  let description = "Utforsk våre fantastiske VR-opplevelser, fra Escape Rooms til skytespill og eventyr for hele familien.";

  if (initialTypeSlug) {
    try {
      const querySnapshot = await getDocs(collection(db, "experiences"));
      const exps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      if (initialExpSlug) {
        const matchedExp = exps.find(e => slugify(e.type) === initialTypeSlug && slugify(e.name) === initialExpSlug);
        if (matchedExp) {
          title = `${matchedExp.name} | ${matchedExp.type} | VRSenteret`;
          description = matchedExp.description || description;
        }
      } else {
        const matchedType = exps.find(e => slugify(e.type) === initialTypeSlug);
        if (matchedType) {
          title = `${matchedType.type} | VR Opplevelser | VRSenteret`;
        }
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
      url: `https://www.krsvr.no/opplevelser${initialTypeSlug ? `/${initialTypeSlug}` : ''}${initialExpSlug ? `/${initialExpSlug}` : ''}`,
      type: "website",
    },
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
    const querySnapshot = await getDocs(collection(db, "experiences"));
    experiences = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    experiences = experiences.filter(e => e.isActive);
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
    matchedExp = experiences.find(e => slugify(e.type) === initialTypeSlug && slugify(e.name) === initialExpSlug);
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
      "name": matchedExp.name,
      "description": matchedExp.shortDescription || "",
      "brand": providerInfo,
      "category": matchedExp.type,
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock"
      }
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
          "url": `https://www.krsvr.no/opplevelser/${slugify(exp.type)}/${slugify(exp.name)}`,
          "brand": providerInfo
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
        <ExperiencesView initialTypeSlug={initialTypeSlug} initialExpSlug={initialExpSlug} />
      </div>
    </main>
  );
}

