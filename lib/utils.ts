import type { Project, ProjectCardVariant } from './types';

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function projectAnchorId(slug: string): string {
  return `project-${slug}`;
}

/** All homepage project cards use the compact layout. Newest projects sort first by date. */
export function projectCardVariant(_project: Project): ProjectCardVariant {
  return 'compact';
}

export function projectPath(slug: string): string {
  return `/projects/${slug}`;
}


const TAG_CLASS: Record<string, string> = {
  AI: 'tag-ai',
  Agents: 'tag-agents',
  'LLM Systems': 'tag-llm-systems',
  Observability: 'tag-observability',
  Interactive: 'tag-interactive',
  Walkthrough: 'tag-walkthrough',
  Hosted: 'tag-hosted',
  Infrastructure: 'tag-infrastructure',
  Solidity: 'tag-solidity',
  EVM: 'tag-evm',
  L2: 'tag-l2',
  'Fraud Proofs': 'tag-fraud-proofs',
  DeFi: 'tag-defi',
  MEV: 'tag-mev',
  Go: 'tag-go',
  TypeScript: 'tag-typescript',
  'Next.js': 'tag-next-js',
  'JSON-RPC': 'tag-json-rpc',
  CLI: 'tag-cli',
  Simulation: 'tag-simulation',
  'llms.txt': 'tag-llms-txt',
  Ethereum: 'tag-ethereum',
  Hardware: 'tag-hardware',
  Security: 'tag-security',
  C: 'tag-c',
  Embedded: 'tag-embedded',
  Evaluation: 'tag-evaluation',
  Rust: 'tag-rust',
  Solana: 'tag-solana',
  Anchor: 'tag-anchor',
  Credit: 'tag-credit',
  'Treasury Controls': 'tag-treasury-controls',
  Sepolia: 'tag-sepolia',
  '1Password': 'tag-1password',
  Rates: 'tag-rates',
  Funding: 'tag-funding',
  Basis: 'tag-basis',
  Crypto: 'tag-crypto',
  'Market Structure': 'tag-market-structure',
  Custody: 'tag-custody',
  Policy: 'tag-policy',
  Quorum: 'tag-quorum',
  Treasury: 'tag-treasury',
};

/** Stable CSS class for a project tag label. Same label always maps to the same class. */
export function tagClass(tag: string): string {
  if (TAG_CLASS[tag]) return TAG_CLASS[tag];
  const slug = tag
    .trim()
    .toLowerCase()
    .replace(/\.txt\b/g, '-txt')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `tag-${slug}` : 'tag-default';
}

export function categoryClass(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('agent') || c.includes('system')) return 'c-sys';
  if (c.includes('ai') || c.includes('finance')) return 'c-infra';
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
  newTab?: boolean;
}

export interface ProjectLinkSection {
  title: string;
  links: ProjectMediaLink[];
  note?: string;
}

function projectMediaLink(label: string, url?: string | null): ProjectMediaLink | null {
  if (!isValidUrl(url)) return null;
  const href = url!;
  return { label, href, internal: href.startsWith('/') };
}

/** Projects with a dedicated fullscreen demo route at /demos/<slug> on magro.dev. */
const FULLSCREEN_DEMO_SLUGS = new Set([
  'agent-runtime',
  'hermes-xray',
  'ai-physical-infra-debt',
]);

/** Projects that mount an interactive / launch panel on /projects/<slug>. */
const PROJECT_PAGE_INTERACTIVE_SLUGS = new Set([
  'agent-runtime',
  'hermes-xray',
  'ai-physical-infra-debt',
  'eth-tx-lifecycle',
  'eth-l2',
]);

export function projectDemoPath(slug: string): string {
  return `/demos/${slug}`;
}

export function projectHasFullscreenDemo(slug: string): boolean {
  return FULLSCREEN_DEMO_SLUGS.has(slug);
}

export function projectHasPageInteractive(slug: string): boolean {
  return PROJECT_PAGE_INTERACTIVE_SLUGS.has(slug);
}

/**
 * Interact only for real interactive targets:
 * - in-site fullscreen demos (`FULLSCREEN_DEMO_SLUGS` → `/demos/<slug>`)
 * - explicit `demoUrl` (internal path or external Vercel URL)
 * Never fall back to the bare project page — CLI/video-only cards (e.g. eth-rpc-monitor)
 * must not get an Interact section.
 */
export function projectInteractHref(project: Project): string | null {
  if (projectHasFullscreenDemo(project.slug)) {
    return projectDemoPath(project.slug);
  }

  if (!isValidUrl(project.demoUrl)) return null;
  const base = project.demoUrl!;
  if (projectHasPageInteractive(project.slug) && base === projectPath(project.slug)) {
    return `${base}#interactive`;
  }
  return base;
}

export function getProjectLinkSections(project: Project): ProjectLinkSection[] {
  const sections: ProjectLinkSection[] = [];

  const interactHref = projectInteractHref(project);
  const externalNewTab = isValidUrl(project.externalDemoUrl) ? project.externalDemoUrl! : null;

  if (interactHref?.startsWith('/')) {
    const newTabHref = externalNewTab ?? interactHref;
    sections.push({
      title: 'Interact',
      links: [
        { label: 'Go to Page', href: interactHref, internal: true },
        {
          label: 'Open in New Tab',
          href: newTabHref,
          internal: newTabHref.startsWith('/'),
          newTab: true,
        },
      ],
    });
  } else if (isValidUrl(interactHref)) {
    sections.push({
      title: 'Interact',
      links: [{ label: 'Open in New Tab', href: interactHref!, internal: false }],
    });
  }

  const sourceLinks = [projectMediaLink('GitHub', project.githubUrl)].filter(
    (link): link is ProjectMediaLink => link !== null
  );
  if (sourceLinks.length > 0) {
    sections.push({ title: 'Source', links: sourceLinks });
  }

  const demoLinks: ProjectMediaLink[] = [];

  for (const videoDemo of getProjectVideoDemos(project)) {
    demoLinks.push({
      label: videoDemo.label,
      href: `${projectPath(project.slug)}#${videoDemo.id}`,
      internal: true,
    });
  }

  for (const extra of [
    projectMediaLink('Loom', project.loomUrl),
    projectMediaLink('Zoom', project.zoomUrl),
  ]) {
    if (extra) demoLinks.push(extra);
  }

  if (demoLinks.length > 0) {
    sections.push({
      title: 'Demos',
      links: demoLinks,
      note: 'Short and full walkthroughs play inline on the project page.',
    });
  }

  return sections;
}

/** @deprecated Use getProjectLinkSections for structured project cards. */
export function getProjectMediaLinks(project: Project): ProjectMediaLink[] {
  return getProjectLinkSections(project).flatMap((section) => section.links);
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

export function youtubeVideoId(url?: string | null): string | null {
  if (!isValidUrl(url)) return null;
  try {
    const u = new URL(url!);
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      const fromQuery = u.searchParams.get('v');
      if (fromQuery) return fromQuery;
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      if (parts[0] === 'shorts' && parts[1]) return parts[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeEmbedUrl(url?: string | null): string | null {
  const id = youtubeVideoId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
}

export type ProjectVideoDemoKind = 'youtube' | 'mp4';

export interface ProjectVideoDemo {
  id: string;
  label: string;
  kind: ProjectVideoDemoKind;
  src: string;
  watchUrl?: string | null;
}

export function getProjectVideoDemos(project: Project): ProjectVideoDemo[] {
  const demos: ProjectVideoDemo[] = [];
  const shortHref = project.shortClipUrl ?? project.previewVideo;
  const shortYoutube = youtubeEmbedUrl(shortHref);

  if (shortYoutube && shortHref) {
    demos.push({
      id: 'demo-short',
      label: 'Short demo',
      kind: 'youtube',
      src: shortYoutube,
      watchUrl: shortHref,
    });
  } else if (isValidUrl(shortHref) && shortHref!.startsWith('/')) {
    demos.push({
      id: 'demo-short',
      label: 'Short demo',
      kind: 'mp4',
      src: shortHref!,
    });
  }

  const fullHref =
    project.recordingUrl ??
    (project.youtubeUrl && project.youtubeUrl !== shortHref ? project.youtubeUrl : null);
  const fullYoutube = youtubeEmbedUrl(fullHref);

  if (fullYoutube && fullHref) {
    demos.push({
      id: 'demo-full',
      label: 'Full demo',
      kind: 'youtube',
      src: fullYoutube,
      watchUrl: fullHref,
    });
  } else if (isValidUrl(fullHref) && fullHref!.startsWith('/')) {
    demos.push({
      id: 'demo-full',
      label: 'Full demo',
      kind: 'mp4',
      src: fullHref!,
    });
  }

  return demos;
}

export function isValidUrl(url?: string | null): boolean {
  return Boolean(url && !String(url).includes('TODO(dan)'));
}
