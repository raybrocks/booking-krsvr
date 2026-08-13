import { MetadataRoute } from 'next';

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
