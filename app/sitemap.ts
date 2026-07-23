import type { MetadataRoute } from 'next';
import {
  getListedProjects,
  getPublishedResearch,
  getPublishedWriting,
} from '@/lib/content';
import { SITE } from '@/lib/constants';

function canonicalUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: canonicalUrl('/agent'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...getListedProjects().map((project) => ({
      url: new URL(`/projects/${project.slug}`, SITE.url).toString(),
      lastModified: project.date,
      changeFrequency: 'monthly' as const,
      priority: project.featured ? 0.9 : 0.7,
    })),
    ...getPublishedWriting().map((article) => ({
      url: new URL(`/writing/${article.slug}`, SITE.url).toString(),
      lastModified: article.date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...getPublishedResearch().map((paper) => ({
      url: new URL(`/agent-research/${paper.slug}`, SITE.url).toString(),
      lastModified: paper.date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
