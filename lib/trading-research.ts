import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { TradingResearch, TradingResearchStatus } from './types';

const CONTENT = path.join(process.cwd(), 'content');

const STATUS_LABELS: Record<TradingResearchStatus, string> = {
  idea: 'Idea',
  researching: 'Researching',
  backtested: 'Backtested',
  'paper-trading': 'Paper Trading',
  'experimental-live': 'Experimental Live',
  archived: 'Archived',
};

function normalizeContentDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export function tradingResearchStatusLabel(
  status: TradingResearchStatus,
  override?: string | null
): string {
  if (override) return override;
  return STATUS_LABELS[status] ?? status;
}

export function getAllTradingResearch(): TradingResearch[] {
  const dir = path.join(CONTENT, 'trading-research');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  return files
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { data, content } = matter(raw);
      const doc = data as Omit<TradingResearch, 'body'> & { date: unknown };
      return {
        ...(doc as Omit<TradingResearch, 'body'>),
        date: normalizeContentDate(doc.date),
        body: content.trim(),
      } as TradingResearch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getListedTradingResearch(): TradingResearch[] {
  return getAllTradingResearch().filter((entry) => entry.status !== 'archived');
}

export function getTradingResearchBySlug(slug: string): TradingResearch | undefined {
  return getAllTradingResearch().find((entry) => entry.slug === slug);
}
