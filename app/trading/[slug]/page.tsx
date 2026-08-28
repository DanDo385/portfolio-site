import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleReader } from '@/components/ArticleReader';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { SiteNav } from '@/components/SiteNav';
import { SITE } from '@/lib/constants';
import {
  getAllTradingResearch,
  getTradingResearchBySlug,
  tradingResearchStatusLabel,
} from '@/lib/trading-research';

export function generateStaticParams() {
  return getAllTradingResearch().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getTradingResearchBySlug(slug);
  if (!entry) return { title: 'Not Found' };
  const title = `${entry.title} | Trading Lab | Daniel Magro`;
  const canonicalPath = `/trading/${entry.slug}`;
  return {
    title,
    description: entry.excerpt,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'article',
      url: canonicalPath,
      title,
      description: entry.excerpt,
      publishedTime: entry.date,
      authors: ['Daniel Magro'],
    },
    twitter: {
      card: 'summary',
      title,
      description: entry.excerpt,
    },
  };
}

export default async function TradingResearchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getTradingResearchBySlug(slug);
  if (!entry) notFound();

  const status = tradingResearchStatusLabel(entry.status, entry.statusLabel);
  const researchJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.title,
    description: entry.excerpt,
    url: `${SITE.url}/trading/${entry.slug}`,
    datePublished: entry.date,
    author: { '@type': 'Person', name: 'Daniel Magro', url: SITE.url },
  };

  return (
    <>
      <JsonLd data={researchJsonLd} />
      <SiteNav />
      <main className="article-page">
        <div className="container">
          <Link href="/trading" className="article-back">
            &larr; Trading Lab
          </Link>
          <p className="trading-entry-status">{status}</p>
          <ArticleReader
            title={entry.title}
            excerpt={entry.excerpt}
            category={entry.category}
            date={entry.date}
            slug={entry.slug}
            body={entry.body}
            canonicalPath={`/trading/${entry.slug}/`}
          />
          {(entry.relatedProject || entry.githubUrl || entry.notebookUrl) && (
            <div className="trading-entry-links">
              {entry.relatedProject ? (
                <Link href={`/projects/${entry.relatedProject}`}>Related project</Link>
              ) : null}
              {entry.githubUrl ? (
                <a href={entry.githubUrl} target="_blank" rel="noopener noreferrer">
                  Code
                </a>
              ) : null}
              {entry.notebookUrl ? (
                <a href={entry.notebookUrl} target="_blank" rel="noopener noreferrer">
                  Notebook
                </a>
              ) : null}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
