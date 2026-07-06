import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { isWithinRecentDays, projectPath } from './utils';
import type { Article, Project, RecentItem, TimelineItem } from './types';

const CONTENT = path.join(process.cwd(), 'content');

export function getProjects(): Project[] {
  const dir = path.join(CONTENT, 'projects');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const projects = files.map((f) =>
    JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Project
  );
  return projects.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

function normalizeContentDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export function getAllWriting(): Article[] {
  const dir = path.join(CONTENT, 'writing');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const { data, content } = matter(raw);
    const article = data as Omit<Article, 'body'>;
    return { ...article, date: normalizeContentDate(article.date), body: content.trim() };
  });
}

export function getPublishedWriting(): Article[] {
  return getAllWriting()
    .filter((a) => a.status === 'published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleBySlug(slug: string): Article | undefined {
  const article = getAllWriting().find((a) => a.slug === slug);
  if (!article || article.status !== 'published') return undefined;
  return article;
}

export function getArticleSlugs(): string[] {
  return getPublishedWriting().map((a) => a.slug);
}

export function getProjectSlugs(): string[] {
  return getProjects().map((p) => p.slug);
}

export function getRecentItems(): RecentItem[] {
  const projects: RecentItem[] = getProjects()
    .filter((project) => isWithinRecentDays(project.date))
    .map((project) => ({
      type: 'project',
      title: project.title,
      slug: project.slug,
      date: project.date,
      summary: project.summary,
      href: projectPath(project.slug),
    }));

  const writing: RecentItem[] = getPublishedWriting()
    .filter((article) => isWithinRecentDays(article.date))
    .map((article) => ({
      type: 'writing',
      title: article.title,
      slug: article.slug,
      date: article.date,
      summary: article.excerpt,
      href: `/writing/${article.slug}`,
      category: article.category,
    }));

  return [...projects, ...writing].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function hasRecentContent(): boolean {
  return getRecentItems().length > 0;
}

export const TIMELINE: TimelineItem[] = [
  {
    era: '2024 – 2025',
    role: 'Product & Platform Contributor',
    org: 'RAMM.ai, New York, NY',
    note: 'Shipped across the stack—smart contracts, frontend, and backend—and translated partner requirements into product, API, and on-chain constraints.',
  },
  {
    era: '2019 – 2022',
    role: 'Independent Operator',
    org: 'Self-Employed',
    note: 'Built Python automation to track supply-constrained retail markets and optimize execution across competitive platforms and payment rails.',
  },
  {
    era: '2017 – 2019',
    role: 'VP, Fixed Income Portfolio Manager',
    org: 'Prudential Financial (PGIM)',
    note: 'Managed global interest-rate and relative-value portfolios across U.S., Canadian, European, and Japanese markets.',
  },
  {
    era: '2015 – 2017',
    role: 'VP, Asian Hours Macro Execution Desk',
    org: 'PointState Capital',
    note: 'Executed cross-asset trades and managed risk from Wellington through Sydney, Tokyo, Hong Kong, and Singapore.',
  },
  {
    era: '2011 – 2015',
    role: 'VP, Proprietary Trading',
    org: 'Nomura Securities',
    note: 'Traded macro and micro strategies in interest rates, FX, equities, and derivatives across U.S., European, and Japanese markets.',
  },
  {
    era: '2006 – 2011',
    role: 'Institutional Fixed Income Sales',
    org: 'Merrill Lynch · Jefferies',
    note: 'Covered institutional clients across interest-rate products.',
  },
];
