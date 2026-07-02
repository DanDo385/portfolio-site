import Link from 'next/link';
import type { Article, Project } from '@/lib/types';
import { categoryClass, formatDate, projectPath } from '@/lib/utils';
import { Reveal } from './Reveal';

interface WritingProps {
  articles: Article[];
  projectsBySlug: Record<string, Project>;
}

export function Writing({ articles, projectsBySlug }: WritingProps) {
  return (
    <section id="writing">
      <div className="container">
        <Reveal>
          <div className="section-label">Writing</div>
        </Reveal>
        <div className="writing-list">
          {articles.length === 0 ? (
            <Reveal>
              <p className="writing-empty">Published articles will appear here.</p>
            </Reveal>
          ) : (
            articles.map((article, i) => {
              const relatedProject = article.relatedProject
                ? projectsBySlug[article.relatedProject]
                : null;

              return (
                <Reveal key={article.slug} delay={i * 60}>
                  <article className="writing-item">
                    <Link href={`/writing/${article.slug}`} className="writing-item-main">
                      <div className="writing-meta">
                        <span className={`writing-cat ${categoryClass(article.category)}`}>
                          {article.category}
                        </span>
                        <time dateTime={article.date}>{formatDate(article.date)}</time>
                      </div>
                      <h3 className="writing-title">{article.title}</h3>
                      <p className="writing-excerpt">{article.excerpt}</p>
                    </Link>
                    {relatedProject && (
                      <p className="writing-related">
                        Project:{' '}
                        <Link href={projectPath(relatedProject.slug)}>{relatedProject.title}</Link>
                      </p>
                    )}
                  </article>
                </Reveal>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
