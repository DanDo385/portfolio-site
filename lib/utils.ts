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
  Agents: 'tag-agents',
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
  return TAG_CLASS[tag] ?? 'tag-default';
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

export interface ProjectMediaLink {
  label: string;
  href: string;
  internal: boolean;
}

export function getProjectMediaLinks(project: Project): ProjectMediaLink[] {
  const links: ProjectMediaLink[] = [];
  const push = (label: string, url?: string | null) => {
    if (!isValidUrl(url)) return;
    const href = url!;
    links.push({ label, href, internal: href.startsWith('/') });
  };
  push('Live demo', project.demoUrl);
  push('Loom', project.loomUrl);
  push('YouTube', project.youtubeUrl);
  push('Zoom', project.zoomUrl);
  push('Short clip', project.shortClipUrl);
  push('MP4', project.previewVideo);
  push('Long clip', project.recordingUrl);
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
