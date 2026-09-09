import { notFound, redirect } from 'next/navigation';
import { getAllTradingResearch, getTradingResearchBySlug } from '@/lib/trading-research';

export function generateStaticParams() {
  return getAllTradingResearch().map((entry) => ({ slug: entry.slug }));
}

/** Trading Lab entries stay in the repo but are not public until the lab ships. */
export default async function TradingResearchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getTradingResearchBySlug(slug)) notFound();
  redirect('/#projects');
}
