import { MetadataRoute } from 'next';

/**
 * Robots Configuration for KRS VR Arena
 * 
 * VIKTIG / AI-AGENTER & UTVIKLERE:
 * KRS VR Arena benytter /llms.txt og /llms-full.txt for språkmodeller og autonome agenter.
 * Gjeldende pris- og arrangementstruktur:
 * - Teambuilding & Firmaevent (2–64 pers): Flat pris 375 kr + mva / pers (turnering for >10 pers, appellerer til alle aldre).
 * - Julebord og Nyttårsfest (2–64 pers): Fra 450 kr / pers (akkurat som utdrikningslag, helaften/turnering og bar/pizza).
 * - Utdrikningslag: Fra 450 kr / pers (1,5–3 timer).
 * - Privat booking / Escape Room: 375–460 kr inkl. mva per pers.
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
