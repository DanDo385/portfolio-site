export interface ReadingPrefs {
  fontId: string;
  foreground: string;
  background: string;
}

export const READING_STORAGE_KEY = 'magro-reading-prefs';

export const READING_FONTS = [
  { id: 'display', label: 'Newsreader', family: 'var(--font-display), Georgia, serif' },
  { id: 'body', label: 'Source Sans 3', family: 'var(--font-body), -apple-system, sans-serif' },
  { id: 'mono', label: 'JetBrains Mono', family: 'var(--font-mono), ui-monospace, monospace' },
  { id: 'georgia', label: 'Georgia', family: 'Georgia, "Times New Roman", serif' },
  { id: 'system', label: 'System', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
] as const;

export const READING_PRESETS: Array<ReadingPrefs & { id: string; label: string }> = [
  { id: 'warm', label: 'Warm paper', fontId: 'georgia', foreground: '#1f1a14', background: '#f4eedc' },
  { id: 'light', label: 'Clean light', fontId: 'body', foreground: '#121212', background: '#ffffff' },
  { id: 'dark', label: 'Dark focus', fontId: 'display', foreground: '#e8ecf4', background: '#0a0e18' },
  { id: 'contrast', label: 'High contrast', fontId: 'body', foreground: '#ffffff', background: '#000000' },
  { id: 'sage', label: 'Sage', fontId: 'display', foreground: '#1a261a', background: '#e8ede3' },
];

export const DEFAULT_READING_PREFS: ReadingPrefs = READING_PRESETS[0];

export function getFontFamily(fontId: string): string {
  return READING_FONTS.find((f) => f.id === fontId)?.family ?? READING_FONTS[0].family;
}

export function loadReadingPrefs(): ReadingPrefs {
  if (typeof window === 'undefined') return DEFAULT_READING_PREFS;
  try {
    const raw = localStorage.getItem(READING_STORAGE_KEY);
    if (!raw) return DEFAULT_READING_PREFS;
    const parsed = JSON.parse(raw) as ReadingPrefs;
    if (parsed.fontId && parsed.foreground && parsed.background) return parsed;
  } catch {
    /* use default */
  }
  return DEFAULT_READING_PREFS;
}

export function saveReadingPrefs(prefs: ReadingPrefs): void {
  localStorage.setItem(READING_STORAGE_KEY, JSON.stringify(prefs));
}

export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^\|.*\|$/gm, ' ')
    .replace(/[-*_]{3,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function readingProseCss(family: string, foreground: string, background: string): string {
  return `
    body { margin: 0; padding: 48px 56px; background: ${background}; color: ${foreground}; font-family: ${family}; font-size: 17px; line-height: 1.85; }
    h1 { font-size: 2rem; line-height: 1.15; margin: 0 0 0.75rem; font-weight: 400; }
    .excerpt { font-size: 1.1rem; opacity: 0.85; margin: 0 0 2rem; line-height: 1.7; }
    h2 { font-size: 1.45rem; margin: 2rem 0 0.75rem; font-weight: 400; }
    p { margin: 0 0 1.1rem; }
    ul, ol { margin: 0 0 1.1rem 1.25rem; }
    li { margin-bottom: 0.35rem; }
    a { color: inherit; text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin: 0 0 1.25rem; font-size: 0.92rem; }
    th, td { border: 1px solid color-mix(in srgb, ${foreground} 20%, transparent); padding: 8px 10px; text-align: left; }
    @media print { body { padding: 24px; } }
  `;
}
