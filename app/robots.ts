import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    host: SITE.url,
    sitemap: `${SITE.url}/sitemap.xml`,
    rules: {
      userAgent: '*',
      allow: '/',
    },
  };
}
