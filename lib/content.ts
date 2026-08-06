import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { isWithinRecentDays, projectPath } from './utils';
import type { Article, Project, RecentItem, ResearchPaper, TimelineItem } from './types';

const CONTENT = path.join(process.cwd(), 'content');
const GENERATED_PROJECT_RESOURCES = path.join(
  CONTENT,
  'generated',
  'project-resources.json'
);

function getGeneratedProjectResources(): Record<string, Partial<Project>> {
  if (!fs.existsSync(GENERATED_PROJECT_RESOURCES)) return {};
  return JSON.parse(fs.readFileSync(GENERATED_PROJECT_RESOURCES, 'utf8')) as Record<
    string,
    Partial<Project>
  >;
}

function loadMarkdownDocuments<T extends { date: string; slug: string }>(
  folder: string
): Array<T & { body: string }> {
  const dir = path.join(CONTENT, folder);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const { data, content } = matter(raw);
    const doc = data as Omit<T, 'body'> & { date: unknown };
    return {
      ...(doc as Omit<T, 'body'>),
      date: normalizeContentDate(doc.date),
      body: content.trim(),
    } as T & { body: string };
  });
}

/**
 * Listed projects sort by date, newest first.
 * Foundations vs primary is a separate tier filter, not a sort key.
 */
function compareProjects(a: Project, b: Project): number {
  const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
  if (byDate !== 0) return byDate;
  return a.slug.localeCompare(b.slug);
}

export function getProjects(): Project[] {
  const dir = path.join(CONTENT, 'projects');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const generatedResources = getGeneratedProjectResources();
  const projects = files.map((f) => {
    const project = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Project;
    return { ...project, ...(generatedResources[project.slug] ?? {}) };
  });
  return projects.sort(compareProjects);
}

export function getListedProjects(): Project[] {
  return getProjects().filter((project) => project.listed !== false);
}

export function projectTier(project: Project): 'primary' | 'foundations' {
  return project.tier === 'foundations' ? 'foundations' : 'primary';
}

export function getPrimaryProjects(): Project[] {
  return getListedProjects().filter((project) => projectTier(project) === 'primary');
}

export function getFoundationsProjects(): Project[] {
  return getListedProjects().filter((project) => projectTier(project) === 'foundations');
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

function normalizeContentDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export function getAllWriting(): Article[] {
  return loadMarkdownDocuments<Article>('writing');
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

export function getAllResearch(): ResearchPaper[] {
  return loadMarkdownDocuments<ResearchPaper>('agent-research');
}

export function getPublishedResearch(): ResearchPaper[] {
  return getAllResearch()
    .filter((paper) => paper.status === 'published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getResearchBySlug(slug: string): ResearchPaper | undefined {
  const paper = getAllResearch().find((item) => item.slug === slug);
  if (!paper || paper.status !== 'published') return undefined;
  return paper;
}

export function getResearchSlugs(): string[] {
  return getPublishedResearch().map((paper) => paper.slug);
}

export function getProjectSlugs(): string[] {
  return getProjects().map((p) => p.slug);
}

export function getRecentItems(): RecentItem[] {
  const projects: RecentItem[] = getListedProjects()
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

  const research: RecentItem[] = getPublishedResearch()
    .filter((paper) => isWithinRecentDays(paper.date))
    .map((paper) => ({
      type: 'research',
      title: paper.title,
      slug: paper.slug,
      date: paper.date,
      summary: paper.excerpt,
      href: `/agent-research/${paper.slug}`,
      category: paper.category,
    }));

  return [...projects, ...writing, ...research].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function hasRecentContent(): boolean {
  return getRecentItems().length > 0;
}

export const TIMELINE: TimelineItem[] = [
  {
    era: 'Aug 2025 – Present',
    role: 'Freelance Full-Stack Development & Product Ventures',
    org: 'Independent',
    track: 'builder',
    note: 'Build and maintain e-commerce websites and custom software for clients; develop Hermes-based agentic workflows and open-source tooling; and prototype software-enabled business concepts progressing toward launch. Active crypto trading and protocol research inform the software design, with focus on liquidity, AMMs, execution, DeFi mechanics, market infrastructure, and risk.',
  },
  {
    era: 'Mar 2024 – Jul 2025',
    role: 'Product and Web3 Platform Contributor',
    org: 'RAMM.ai',
    track: 'builder',
    note: 'Developed EVM marketplace contracts, the product frontend, and the public website for an early-stage Web3 startup; translated on-chain mechanics into product requirements and presented the platform to retailers, partners, and users.',
  },
  {
    era: 'Aug 2022 – Feb 2024',
    role: 'Medical Leave, Recovery & Technical Retraining',
    org: 'Remote',
    track: 'builder',
    note: 'Medical leave after a severe injury requiring hospitalization and reconstructive surgeries, with an extended recovery that included travel and family caregiving. Used the period for intensive computer science, Solidity, blockchain, and AI study through Harvard CS50, Boot.dev, Cyfrin Updraft, independent protocol research, and active crypto and DeFi trading.',
  },
  {
    era: 'May 2019 – Jul 2022',
    role: 'Independent E-Commerce Operator',
    org: 'Self-Employed',
    track: 'builder',
    note: 'Designed Python-based monitoring and execution workflows across retail platforms; analyzed secondary-market liquidity, pricing, and operational risk. Scaled a part-time operation into a full-time business with three consecutive years of six-figure profitability through automated execution in a constrained opportunity set.',
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
