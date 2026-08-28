import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Article, Project, ResearchPaper, TimelineItem } from './types';

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
 * Listed projects sort by date, newest first, unless `sortOrder` pins a slot.
 * Ranked projects occupy their 1-based slots; everyone else fills gaps by date.
 * Foundations vs primary is a separate tier filter, not a sort key.
 */
function compareProjectsByDate(a: Project, b: Project): number {
  const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
  if (byDate !== 0) return byDate;
  return a.slug.localeCompare(b.slug);
}

function orderProjects(projects: Project[]): Project[] {
  const ranked = projects.filter((project) => typeof project.sortOrder === 'number');
  const unranked = projects
    .filter((project) => typeof project.sortOrder !== 'number')
    .sort(compareProjectsByDate);

  if (ranked.length === 0) return unranked;

  const bySlot = new Map<number, Project>();
  const overflowRanked: Project[] = [];
  for (const project of ranked.sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || compareProjectsByDate(a, b)
  )) {
    const slot = project.sortOrder as number;
    if (bySlot.has(slot)) {
      overflowRanked.push(project);
    } else {
      bySlot.set(slot, project);
    }
  }

  const result: Project[] = [];
  let unrankedIndex = 0;
  const maxSlot = Math.max(
    projects.length,
    ...ranked.map((project) => project.sortOrder as number)
  );

  for (let slot = 1; slot <= maxSlot; slot += 1) {
    const pinned = bySlot.get(slot);
    if (pinned) {
      result.push(pinned);
      bySlot.delete(slot);
    } else if (unrankedIndex < unranked.length) {
      result.push(unranked[unrankedIndex]);
      unrankedIndex += 1;
    }
  }

  for (const [, project] of [...bySlot.entries()].sort((a, b) => a[0] - b[0])) {
    result.push(project);
  }
  result.push(...overflowRanked);
  while (unrankedIndex < unranked.length) {
    result.push(unranked[unrankedIndex]);
    unrankedIndex += 1;
  }

  return result;
}

export function getProjects(): Project[] {
  const dir = path.join(CONTENT, 'projects');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const generatedResources = getGeneratedProjectResources();
  const projects = files.map((f) => {
    const project = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Project;
    return { ...project, ...(generatedResources[project.slug] ?? {}) };
  });
  return orderProjects(projects);
}

export function getListedProjects(): Project[] {
  return getProjects().filter((project) => project.listed !== false);
}

export function projectTier(project: Project): 'primary' | 'foundations' {
  return project.tier === 'foundations' ? 'foundations' : 'primary';
}

export function projectCluster(
  project: Project
): 'trading-research' | 'market-structure' | 'agentic' | 'infra' | 'labs' {
  const cluster = project.cluster ?? 'labs';
  if (cluster === 'custody') return 'infra';
  return cluster;
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

export const TIMELINE: TimelineItem[] = [
  {
    era: 'Aug 2025 – Present',
    role: 'Independent Research & Engineering',
    org: 'Independent',
    track: 'builder',
    note: 'Independent research and systems work across crypto market structure, DeFi, agent systems, and full-stack product work. Client e-commerce and product launches continue alongside open-source tooling, with focus on liquidity, AMMs, execution, funding/basis, and agent-assisted research workflows.',
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
