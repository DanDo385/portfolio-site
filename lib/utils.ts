import type { Project } from './types';

export const RECENT_WINDOW_DAYS = 7;
const CONTENT_TIMEZONE = 'America/New_York';

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function todayInTimezone(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CONTENT_TIMEZONE }).format(new Date());
}

function calendarDaysBetween(isoDate: string, todayIso: string): number {
  const item = new Date(`${isoDate}T12:00:00`);
  const today = new Date(`${todayIso}T12:00:00`);
  return Math.floor((today.getTime() - item.getTime()) / 86_400_000);
}

export function isWithinRecentDays(isoDate: string, days = RECENT_WINDOW_DAYS): boolean {
  const elapsed = calendarDaysBetween(isoDate, todayInTimezone());
  return elapsed >= 0 && elapsed < days;
}

export function projectAnchorId(slug: string): string {
  return `project-${slug}`;
}

export function projectPath(slug: string): string {
  return `/projects/${slug}`;
}


const TAG_CLASS: Record<string, string> = {
  AI: 'tag-ai',
  Agents: 'tag-ai',
  'LLM Systems': 'tag-llm',
  Interactive: 'tag-interactive',
  Infrastructure: 'tag-infra',
  Solidity: 'tag-solidity',
  EVM: 'tag-evm',
  L2: 'tag-l2',
  DeFi: 'tag-defi',
  Go: 'tag-go',
  TypeScript: 'tag-ts',
  Simulation: 'tag-simulation',
};

export function tagClass(tag: string): string {
  return TAG_CLASS[tag] ?? 'tag-infra';
}

export function categoryClass(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('ai') || c.includes('finance')) return 'c-infra';
  if (c.includes('system')) return 'c-sys';
  return 'c-fin';
}

export function validScreenshots(screenshots?: string[]): string[] {
  if (!screenshots) return [];
  return screenshots.filter((s) => s && !s.includes('TODO(dan)'));
}

export function hasProjectPreview(project: Project): boolean {
  return validScreenshots(project.screenshots).length > 0 || project.previewType === 'agent-json';
}

export function getProjectMediaLinks(project: Project): Array<{ label: string; href: string }> {
  const links: Array<{ label: string; href: string }> = [];
  if (isValidUrl(project.demoUrl)) links.push({ label: 'Live demo', href: project.demoUrl! });
  if (isValidUrl(project.loomUrl)) links.push({ label: 'Loom', href: project.loomUrl! });
  if (isValidUrl(project.youtubeUrl)) links.push({ label: 'YouTube', href: project.youtubeUrl! });
  if (isValidUrl(project.zoomUrl)) links.push({ label: 'Zoom', href: project.zoomUrl! });
  return links;
}

export function loomEmbedUrl(url?: string | null): string | null {
  if (!url || url.includes('TODO(dan)')) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('loom.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      return id ? `https://www.loom.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return url;
}

export function isValidUrl(url?: string | null): boolean {
  return Boolean(url && !String(url).includes('TODO(dan)'));
}
