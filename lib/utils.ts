export function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
