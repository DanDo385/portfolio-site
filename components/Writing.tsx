import Link from 'next/link';
import type { Article } from '@/lib/types';
import { categoryClass, formatDate } from '@/lib/utils';
import { Reveal } from './Reveal';

interface WritingProps {
  articles: Article[];
}

export function Writing({ articles }: WritingProps) {
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
            articles.map((article, i) => (
              <Reveal key={article.slug} delay={i * 60}>
                <Link href={`/writing/${article.slug}`} className="writing-item">
                  <div className="writing-meta">
                    <span className={`writing-cat ${categoryClass(article.category)}`}>
                      {article.category}
                    </span>
                    <time dateTime={article.date}>{formatDate(article.date)}</time>
                  </div>
                  <h3 className="writing-title">{article.title}</h3>
                  <p className="writing-excerpt">{article.excerpt}</p>
                </Link>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
