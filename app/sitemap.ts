import { MetadataRoute } from 'next';
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const revalidate = 3600; // revalidate every hour
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.krsvr.no";
  
  // Static routes (Norwegian, English, German, Dutch)
  const routes: MetadataRoute.Sitemap = [
    '',
    '/vr-opplevelser',
    '/vr-opplevelser/familie',
    '/arrangementer',
    '/arrangementer/vr-bursdag',
    '/arrangementer/vr-utdrikningslag',
    '/arrangementer/vr-teambuilding',
    '/arrangementer/vr-on-site',
    '/priser',
    '/faq',
    '/kontakt',
    '/booking',
    '/personvern',
    '/vilkar',
    // English static routes
    '/en',
    '/en/experiences',
    '/en/experiences/family',
    '/en/events',
    '/en/prices',
    '/en/faq',
    '/en/contact',
    '/en/booking',
    '/en/privacy',
    '/en/terms',
    // German & Dutch tourist landing pages
    '/de',
    '/nl',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' || route === '/en' || route === '/de' || route === '/nl' ? 1 : 0.8,
  }));

  // Dynamic experiences
  let experiencesUrls: MetadataRoute.Sitemap = [];
  try {
    let experiences = await prisma.experience.findMany({
      where: { isActive: true },
      include: { experienceType: true }
    });
    
    // Filter out vipps-test from sitemap
    experiences = experiences.filter(e => {
        const typeStr = (e.type || "").toLowerCase();
        return !typeStr.includes("vipps-test") && !typeStr.includes("vipps test");
    });
    
    // Add types (categories)
    // Create a map of slug -> typeName to avoid duplicates and handle both new and legacy types
    const typeMap = new Map<string, string>();
    experiences.forEach(e => {
      const typeStr = e.type || "";
      const typeSlug = e.experienceType?.slug || slugify(typeStr);
      if (typeSlug) {
        typeMap.set(typeSlug, typeStr);
      }
    });

    const typeUrls: MetadataRoute.Sitemap = Array.from(typeMap.keys()).flatMap((typeSlug) => [
      {
        url: `${baseUrl}/vr-opplevelser/${typeSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/en/experiences/${typeSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ]);

    const detailUrls: MetadataRoute.Sitemap = experiences.flatMap(exp => {
      const typeSlug = exp.experienceType?.slug || slugify(exp.type || "");
      const expSlug = slugify(exp.name || "");
      return [
        {
          url: `${baseUrl}/vr-opplevelser/${typeSlug}/${expSlug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        },
        {
          url: `${baseUrl}/en/experiences/${typeSlug}/${expSlug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        },
      ];
    });
    
    experiencesUrls = [...typeUrls, ...detailUrls];
  } catch (error) {
    console.error("Error fetching experiences for sitemap:", error);
  }

  return [...routes, ...experiencesUrls];
}