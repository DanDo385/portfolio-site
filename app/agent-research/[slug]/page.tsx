import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleReader } from '@/components/ArticleReader';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { SiteNav } from '@/components/SiteNav';
import { SITE } from '@/lib/constants';
import { getResearchBySlug, getResearchSlugs } from '@/lib/content';

export function generateStaticParams() {
  return getResearchSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = getResearchBySlug(slug);
  if (!paper) return { title: 'Not Found' };
  const title = `${paper.title} | Daniel Magro`;
  const canonicalPath = `/agent-research/${paper.slug}`;
  return {
    title,
    description: paper.excerpt,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'article',
      url: canonicalPath,
      title,
      description: paper.excerpt,
      publishedTime: paper.date,
      authors: ['Daniel Magro'],
    },
    twitter: {
      card: 'summary',
      title,
      description: paper.excerpt,
    },
  };
}

export default async function ResearchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = getResearchBySlug(slug);
  if (!paper) notFound();

  const researchJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: paper.title,
    description: paper.excerpt,
    url: `${SITE.url}/agent-research/${paper.slug}`,
    datePublished: paper.date,
    author: { '@type': 'Person', name: 'Daniel Magro', url: SITE.url },
  };

  return (
    <>
      <JsonLd data={researchJsonLd} />
      <SiteNav />
      <main className="article-page">
        <div className="container">
          <Link href="/#agent-research" className="article-back">
            &larr; Agent Research
          </Link>
          <ArticleReader
            title={paper.title}
            excerpt={paper.excerpt}
            category={paper.category}
            date={paper.date}
            slug={paper.slug}
            body={paper.body}
            canonicalPath={`/agent-research/${paper.slug}/`}
            subtitle={paper.subtitle}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
