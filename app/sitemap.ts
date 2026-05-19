import { MetadataRoute } from 'next';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
    const querySnapshot = await getDocs(collection(db, "experiences"));
    const experiences = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    
    // Add types (categories)
    const types = Array.from(new Set(experiences.map(e => e.type).filter(Boolean)));
    const typeUrls: MetadataRoute.Sitemap = types.map((type: unknown) => ({
      url: `${baseUrl}/opplevelser/${slugify(type as string)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const detailUrls: MetadataRoute.Sitemap = experiences.filter(e => e.isActive).map(exp => ({
      url: `${baseUrl}/opplevelser/${slugify(exp.type)}/${slugify(exp.name)}`,
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
