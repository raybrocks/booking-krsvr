import { MetadataRoute } from 'next';
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.krsvr.no";
  
  // Static routes
  const routes: MetadataRoute.Sitemap = [
    '',
    '/opplevelser',
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
      where: { isActive: true }
    });
    
    // Filter out vipps-test from sitemap
    experiences = experiences.filter(e => {
        const typeStr = (e.type || "").toLowerCase();
        return !typeStr.includes("vipps-test") && !typeStr.includes("vipps test");
    });
    
    // Add types (categories)
    const types = Array.from(new Set(experiences.map(e => e.type).filter(Boolean)));
    const typeUrls: MetadataRoute.Sitemap = types.map((type: unknown) => ({
      url: `${baseUrl}/opplevelser/${slugify(type as string)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const detailUrls: MetadataRoute.Sitemap = experiences.map(exp => ({
      url: `${baseUrl}/opplevelser/${slugify(exp.type || "")}/${slugify(exp.name || "")}`,
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