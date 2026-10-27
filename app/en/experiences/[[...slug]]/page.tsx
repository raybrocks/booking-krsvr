import React from "react";
import { ExperiencesView } from "@/components/ExperiencesView";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getLanguageInfo } from "@/lib/languages";
import { localizeExperience } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function normalizeTypeSlug(slug: string | undefined | null): string | null {
  if (!slug) return null;
  if (slug === "family" || slug === "familie" || slug === "familiepakke") return "familie";
  if (slug === "action-strategy" || slug === "action-strategi") return "action-strategi";
  return slug;
}

function toEnglishTypeSlug(slug: string | undefined | null): string | null {
  if (!slug) return null;
  if (slug === "family" || slug === "familie" || slug === "familiepakke") return "family";
  if (slug === "action-strategy" || slug === "action-strategi") return "action-strategy";
  return slug;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const initialTypeSlug = resolvedParams.slug?.[0];
  const initialExpSlug = resolvedParams.slug?.[1];

  let title = "VR Experiences & Escape Rooms in Kristiansand | KRS VR Arena";
  let description =
    "Explore wireless free-roam VR Escape Rooms, Action Strategy (Tactical Arena), Zombie Shooter, and Family Packages at KRS VR Arena in Kristiansand, Southern Norway.";

  // Virtual filter alias: /en/experiences/family (without experience slug) activates the Family filter
  if ((initialTypeSlug === "family" || initialTypeSlug === "familie") && !initialExpSlug) {
    const familyUrl = "https://www.krsvr.no/en/experiences/family";
    const familyImg = "https://www.krsvr.no/images/vr-familiepakke-8-12-aar.jpg";
    return {
      title: "Family-Friendly VR Experiences in Kristiansand | KRS VR Arena",
      description:
        "Discover family-friendly wireless VR packages for children (ages 8–12) and youth (12+) at KRS VR Arena in Kristiansand. Safe indoor family activity just 5 minutes from the ferry port.",
      alternates: {
        canonical: familyUrl,
        languages: {
          "nb-NO": "https://www.krsvr.no/vr-opplevelser/familie",
          en: familyUrl,
          "x-default": familyUrl,
        },
      },
      openGraph: {
        title: "Family-Friendly VR Experiences in Kristiansand | KRS VR Arena",
        description:
          "Discover family-friendly wireless VR packages for children (ages 8–12) and youth (12+) at KRS VR Arena in Kristiansand.",
        url: familyUrl,
        locale: "en_US",
        type: "website",
        images: [
          {
            url: familyImg,
            width: 1200,
            height: 675,
            alt: "Family-friendly VR experiences at KRS VR Arena in Kristiansand",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Family-Friendly VR Experiences in Kristiansand | KRS VR Arena",
        description:
          "Discover family-friendly wireless VR packages for children (ages 8–12) and youth (12+) at KRS VR Arena in Kristiansand.",
        images: [familyImg],
      },
    };
  }

  if (initialTypeSlug && (initialTypeSlug.includes("vipps-test") || initialTypeSlug.includes("vipps test"))) {
    return {
      title: "Test",
      description: "",
      robots: { index: false, follow: false },
    };
  }

  let isVippsTest = false;
  let ogImage: { url: string; width?: number; height?: number; alt?: string } = {
    url: "https://www.krsvr.no/images/vr-teambuilding-firmaevent-kristiansand.jpg",
    width: 1600,
    height: 1200,
    alt: "KRS VR Arena Kristiansand",
  };
  const dbTypeSlug = normalizeTypeSlug(initialTypeSlug);

  if (initialTypeSlug) {
    try {
      const exps = await prisma.experience.findMany({
        where: { isActive: true },
        include: { experienceType: true },
      });

      if (initialExpSlug) {
        const matchedRaw = exps.find((e) => {
          const tSlug = e.experienceType?.slug || slugify(e.type || "");
          const typeMatches = tSlug === dbTypeSlug || tSlug === initialTypeSlug;
          const expMatches =
            slugify(e.name || "") === initialExpSlug ||
            (e.nameEn && slugify(e.nameEn) === initialExpSlug);
          return typeMatches && expMatches;
        });

        if (!matchedRaw) {
          return {
            title: "Page Not Found | KRS VR Arena",
            robots: { index: false, follow: false },
          };
        }

        const matchedExp = localizeExperience(matchedRaw, "en");
        if (matchedExp.name === "Tactical Arena") {
          title = "Tactical Arena – Mixed Reality & Action Strategy in Kristiansand";
        } else {
          title = `${matchedExp.name} | VR Experience in Kristiansand`;
        }
        description = matchedExp.shortDescription
          ? `${matchedExp.shortDescription} Play ${matchedExp.name} at KRS VR Arena in Kristiansand.`
          : description;

        const expImage =
          (Array.isArray(matchedRaw.images) && matchedRaw.images.length > 0
            ? matchedRaw.images[0]
            : null) || matchedRaw.picture;
        if (expImage) {
          ogImage = {
            url: expImage,
            width: 1200,
            height: 630,
            alt: `${matchedExp.name} at KRS VR Arena in Kristiansand`,
          };
        }

        if (
          matchedRaw.type?.toLowerCase().includes("vipps-test") ||
          matchedRaw.type?.toLowerCase().includes("vipps test")
        ) {
          isVippsTest = true;
        }
      } else {
        const matchedType = exps.find(
          (e) =>
            (e.experienceType?.slug || slugify(e.type || "")) === dbTypeSlug ||
            (e.experienceType?.slug || slugify(e.type || "")) === initialTypeSlug
        );
        if (!matchedType) {
          return {
            title: "Page Not Found | KRS VR Arena",
            robots: { index: false, follow: false },
          };
        }
        const typeName = matchedType.type || "VR Experiences";
        if (typeName.toLowerCase().includes("action")) {
          title = "Action & Strategy VR Games in Kristiansand | KRS VR Arena";
          description =
            "Experience wireless free-roam VR shooters and tactical strategy games at KRS VR Arena in Kristiansand. Great for groups of friends, bachelor parties, and corporate team building.";
        } else if (typeName.toLowerCase().includes("escape")) {
          title = "VR Escape Rooms in Kristiansand | KRS VR Arena";
          description =
            "Solve immersive puzzles together inside large virtual worlds. Explore our wireless VR Escape Rooms in Kristiansand for 2–10 players.";
        } else {
          title = `${typeName} in Kristiansand | KRS VR Arena`;
        }

        const firstExpOfType = exps.find(
          (e) =>
            ((e.experienceType?.slug || slugify(e.type || "")) === dbTypeSlug ||
              (e.experienceType?.slug || slugify(e.type || "")) === initialTypeSlug) &&
            (e.picture || (Array.isArray(e.images) && e.images.length > 0))
        );
        const typeImage = firstExpOfType?.images?.[0] || firstExpOfType?.picture;
        if (typeImage) {
          ogImage = {
            url: typeImage,
            width: 1200,
            height: 630,
            alt: `${typeName} at KRS VR Arena in Kristiansand`,
          };
        }
      }
    } catch (error) {
      console.error("Error fetching English metadata:", error);
    }
  }

  const enTypeSlug = toEnglishTypeSlug(initialTypeSlug);
  const pageUrl = `https://www.krsvr.no/en/experiences${enTypeSlug ? `/${enTypeSlug}` : ""}${initialExpSlug ? `/${initialExpSlug}` : ""}`;
  const noUrl = `https://www.krsvr.no/vr-opplevelser${dbTypeSlug ? `/${dbTypeSlug}` : ""}${initialExpSlug ? `/${initialExpSlug}` : ""}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        "nb-NO": noUrl,
        en: pageUrl,
        "x-default": pageUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      locale: "en_US",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
    ...(isVippsTest && { robots: { index: false, follow: false } }),
  };
}

export default async function EnglishExperiencesPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const initialTypeSlug = resolvedParams.slug?.[0] || null;
  const initialExpSlug = resolvedParams.slug?.[1] || null;
  const dbTypeSlug = normalizeTypeSlug(initialTypeSlug);

  let experiences: any[] = [];
  try {
    experiences = await prisma.experience.findMany({
      where: { isActive: true },
      include: { experienceType: true },
    });
    experiences.sort((a, b) => {
      const orderA = typeof a.order === "number" ? a.order : 999;
      const orderB = typeof b.order === "number" ? b.order : 999;
      return orderA - orderB;
    });
  } catch (error) {
    console.error("Error fetching experiences for English page:", error);
  }

  let matchedRaw: any = null;
  if (initialTypeSlug && initialExpSlug) {
    matchedRaw = experiences.find((e) => {
      const tSlug = e.experienceType?.slug || slugify(e.type || "");
      const typeMatches = tSlug === dbTypeSlug || tSlug === initialTypeSlug;
      const expMatches =
        slugify(e.name || "") === initialExpSlug ||
        (e.nameEn && slugify(e.nameEn) === initialExpSlug);
      return typeMatches && expMatches;
    });
    if (!matchedRaw) {
      notFound();
    }
  } else if (
    initialTypeSlug &&
    initialTypeSlug !== "family" &&
    initialTypeSlug !== "familie"
  ) {
    const matchedType = experiences.some((e) => {
      const tSlug = e.experienceType?.slug || slugify(e.type || "");
      return tSlug === dbTypeSlug || tSlug === initialTypeSlug;
    });
    if (!matchedType) {
      notFound();
    }
  }

  const providerInfo = {
    "@type": "EntertainmentBusiness",
    name: "KRS VR Arena",
    telephone: "+4740828302",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Industrigata 12",
      postalCode: "4632",
      addressLocality: "Kristiansand",
      addressCountry: "NO",
    },
    hasMap: "https://maps.app.goo.gl/JdnDJvuqd3rX9cDb8",
  };

  let jsonLd: any = null;

  if (matchedRaw) {
    const matchedExp = localizeExperience(matchedRaw, "en");
    const allLangs: string[] = Array.isArray(matchedExp.languages) ? matchedExp.languages : [];
    const isoLangs = allLangs.map((l: string) => getLanguageInfo(l).iso).filter((iso: string) => iso && iso !== "und");
    const langSummary = allLangs.length > 0 ? ` Available languages: ${allLangs.join(", ")}.` : "";
    const suitableList: string[] = Array.isArray(matchedExp.suitableFor) ? matchedExp.suitableFor : [];
    const suitableSummary = suitableList.length > 0 ? ` Suitable for: ${suitableList.join(", ")}.` : "";

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${matchedExp.name} - VR Experience in Kristiansand`,
      description: `${matchedExp.shortDescription || ""} Played at KRS VR Arena in Kristiansand, Norway.${suitableSummary}${langSummary}`,
      brand: providerInfo,
      category: matchedExp.type,
      ...(isoLangs.length > 0 && { inLanguage: isoLangs, availableLanguage: allLangs }),
      ...(suitableList.length > 0 && {
        audience: {
          "@type": "PeopleAudience",
          audienceType: suitableList.join(", "),
        },
      }),
      offers: {
        "@type": "AggregateOffer",
        availability: "https://schema.org/InStock",
        priceCurrency: "NOK",
        lowPrice: 375,
        highPrice: 460,
        offerCount: 1,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: 5.0,
        reviewCount: 25,
      },
    };
  } else if (experiences.length > 0) {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "VR Experiences at KRS VR Arena Kristiansand",
      description:
        "Wireless free-roam VR Escape Rooms, Action Strategy (Tactical Arena), Zombie Shooter, and Family VR Packages in Kristiansand, Norway.",
      itemListElement: experiences.map((rawExp, index) => {
        const exp = localizeExperience(rawExp, "en");
        const allLangs: string[] = Array.isArray(exp.languages) ? exp.languages : [];
        const isoLangs = allLangs.map((l: string) => getLanguageInfo(l).iso).filter((iso: string) => iso && iso !== "und");
        const suitableList: string[] = Array.isArray(exp.suitableFor) ? exp.suitableFor : [];
        const rawTypeSlug = rawExp.experienceType?.slug || slugify(rawExp.type || "");
        const enTypeSlug = toEnglishTypeSlug(rawTypeSlug) || rawTypeSlug;

        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: exp.name,
            description: exp.shortDescription || "",
            url: `https://www.krsvr.no/en/experiences/${enTypeSlug}/${slugify(rawExp.name || "")}`,
            brand: providerInfo,
            ...(isoLangs.length > 0 && { inLanguage: isoLangs, availableLanguage: allLangs }),
            ...(suitableList.length > 0 && {
              audience: {
                "@type": "PeopleAudience",
                audienceType: suitableList.join(", "),
              },
            }),
            offers: {
              "@type": "AggregateOffer",
              availability: "https://schema.org/InStock",
              priceCurrency: "NOK",
              lowPrice: 375,
              highPrice: 460,
              offerCount: 1,
            },
          },
        };
      }),
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
      <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9C39FF]/10 via-black to-black -z-10" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <ExperiencesView
          initialExperiences={experiences}
          initialTypeSlug={
            initialTypeSlug === "family" || initialTypeSlug === "familie"
              ? "family"
              : dbTypeSlug
          }
          initialExpSlug={
            matchedRaw ? slugify(matchedRaw.name || "") : initialExpSlug
          }
          locale="en"
        />
      </div>
    </main>
  );
}
