import { MetadataRoute } from 'next';

/**
 * Robots Configuration for KRS VR Arena
 * 
 * VIKTIG / AI-AGENTER & UTVIKLERE:
 * KRS VR Arena benytter /llms.txt og /llms-full.txt for språkmodeller og autonome agenter.
 * Hver gang priser, kapasiteter, åpningstider, bar-/matkonsepter eller opplevelsesdetaljer 
 * endres i kildekoden eller databasen, MÅ public/llms.txt og public/llms-full.txt 
 * oppdateres tilsvarende for å holde AI-agenter synkronisert!
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dev/', '/vr-opplevelser/vipps-test'],
    },
    sitemap: 'https://www.krsvr.no/sitemap.xml',
  };
}
