import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleReader } from '@/components/ArticleReader';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { SiteNav } from '@/components/SiteNav';
import { SITE } from '@/lib/constants';
import { getArticleBySlug, getArticleSlugs, getProjectBySlug } from '@/lib/content';
import { loomEmbedUrl } from '@/lib/utils';

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Not Found' };
  const title = `${article.title} | Daniel Magro`;
  const canonicalPath = `/writing/${article.slug}`;
  return {
    title,
    description: article.excerpt,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'article',
      url: canonicalPath,
      title,
      description: article.excerpt,
      publishedTime: article.date,
      authors: ['Daniel Magro'],
    },
    twitter: {
      card: 'summary',
      title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const relatedProject = article.relatedProject
    ? getProjectBySlug(article.relatedProject)
    : undefined;
  const loomEmbed = loomEmbedUrl(article.loomUrl);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    url: `${SITE.url}/writing/${article.slug}`,
    datePublished: article.date,
    author: { '@type': 'Person', name: 'Daniel Magro', url: SITE.url },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <SiteNav />
      <main className="article-page">
        <div className="container">
          <Link href="/#my-writing" className="article-back">
            &larr; My Writing
          </Link>
          <ArticleReader
            title={article.title}
            excerpt={article.excerpt}
            category={article.category}
            date={article.date}
            slug={article.slug}
            body={article.body}
            canonicalPath={`/writing/${article.slug}/`}
            loomEmbed={loomEmbed}
            relatedProject={
              relatedProject
                ? { title: relatedProject.title, slug: relatedProject.slug }
                : undefined
            }
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
