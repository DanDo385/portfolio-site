import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Footer } from '@/components/Footer';
import { SiteNav } from '@/components/SiteNav';
import { Reveal } from '@/components/Reveal';
import { getArticleBySlug, getArticleSlugs, getProjectBySlug } from '@/lib/content';
import { categoryClass, formatDate, loomEmbedUrl, projectPath } from '@/lib/utils';

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Not Found' };
  return {
    title: `${article.title} | Daniel Magro`,
    description: article.excerpt,
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

  return (
    <>
      <SiteNav />
      <main className="article-page">
        <div className="container">
          <Link href="/#writing" className="article-back">
            &larr; Writing
          </Link>
          <Reveal>
            <header className="article-header">
              <div className="writing-meta">
                <span className={`writing-cat ${categoryClass(article.category)}`}>
                  {article.category}
                </span>
                <time dateTime={article.date}>{formatDate(article.date)}</time>
              </div>
              <h1>{article.title}</h1>
              <p className="article-excerpt">{article.excerpt}</p>
            </header>
          </Reveal>
          {loomEmbed && (
            <Reveal delay={60}>
              <div className="loom-embed article-loom">
                <iframe src={loomEmbed} loading="lazy" allowFullScreen title="Article video" />
              </div>
            </Reveal>
          )}
          <Reveal delay={100}>
            <div className="article-body prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
            </div>
          </Reveal>
          {relatedProject && (
            <p className="article-related">
              Related project:{' '}
              <Link href={projectPath(relatedProject.slug)}>{relatedProject.title}</Link>
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
