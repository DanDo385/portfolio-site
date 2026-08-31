import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { SiteNav } from '@/components/SiteNav';
import { SITE } from '@/lib/constants';
import {
  getListedTradingResearch,
  tradingResearchStatusLabel,
} from '@/lib/trading-research';

export const metadata = {
  title: `Trading Lab | ${SITE.name}`,
  description:
    'Independent notes on digital-asset funding, basis, market structure, and agent-assisted trading workflows. Work in progress is labeled as such.',
  alternates: { canonical: '/trading' },
};

export default function TradingLabPage() {
  const entries = getListedTradingResearch();

  return (
    <>
      <SiteNav />
      <main className="trading-lab-page">
        <div className="container">
          <Link href="/#projects" className="article-back">
            &larr; Projects
          </Link>
          <header className="trading-lab-header">
            <div className="section-label">Trading Lab</div>
            <h1>Digital-asset trading notes</h1>
            <p>
              Notes on funding, basis, market structure, and agent-assisted trading workflows.
              Status labels are honest: unfinished work stays unfinished. No fabricated returns.
            </p>
          </header>
          <div className="trading-lab-list">
            {entries.map((entry) => (
              <article key={entry.slug} className="trading-lab-card">
                <div className="trading-lab-meta">
                  <span className="trading-lab-status">
                    {tradingResearchStatusLabel(entry.status, entry.statusLabel)}
                  </span>
                  <time dateTime={entry.date}>{entry.date}</time>
                </div>
                <h2>
                  <Link href={`/trading/${entry.slug}`}>{entry.title}</Link>
                </h2>
                <p>{entry.excerpt}</p>
                {entry.researchQuestion ? (
                  <p className="trading-lab-question">
                    <strong>Question.</strong> {entry.researchQuestion}
                  </p>
                ) : null}
                <Link href={`/trading/${entry.slug}`} className="trading-lab-link">
                  Open note →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
