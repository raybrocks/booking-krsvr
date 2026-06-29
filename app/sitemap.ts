import { MetadataRoute } from 'next';
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const revalidate = 3600; // revalidate every hour
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.krsvr.no";
  
  // Static routes
  const routes: MetadataRoute.Sitemap = [
    '',
    '/vr-opplevelser',
    '/arrangementer/private-fester',
    '/arrangementer/firmaevent',
    '/priser',
    '/faq',
    '/kontakt',
    '/booking',
    '/personvern',
    '/vilkar',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
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

    const typeUrls: MetadataRoute.Sitemap = Array.from(typeMap.keys()).map((typeSlug) => ({
      url: `${baseUrl}/vr-opplevelser/${typeSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const detailUrls: MetadataRoute.Sitemap = experiences.map(exp => ({
      url: `${baseUrl}/vr-opplevelser/${exp.experienceType?.slug || slugify(exp.type || "")}/${slugify(exp.name || "")}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
    
    experiencesUrls = [...typeUrls, ...detailUrls];
  } catch (error) {
    console.error("Error fetching experiences for sitemap:", error);
  }

  return [...routes, ...experiencesUrls];
}