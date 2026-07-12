import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleReader } from '@/components/ArticleReader';
import { Footer } from '@/components/Footer';
import { SiteNav } from '@/components/SiteNav';
import { getResearchBySlug, getResearchSlugs } from '@/lib/content';

export function generateStaticParams() {
  return getResearchSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = getResearchBySlug(slug);
  if (!paper) return { title: 'Not Found' };
  return {
    title: `${paper.title} | Daniel Magro`,
    description: paper.excerpt,
  };
}

export default async function ResearchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = getResearchBySlug(slug);
  if (!paper) notFound();

  return (
    <>
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
