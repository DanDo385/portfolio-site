import Link from 'next/link';
import type { RecentItem } from '@/lib/types';
import { categoryClass, formatDate } from '@/lib/utils';
import { Reveal } from './Reveal';

interface RecentProps {
  items: RecentItem[];
}

export function Recent({ items }: RecentProps) {
  if (items.length === 0) return null;

  return (
    <section id="recent">
      <div className="container">
        <Reveal>
          <div className="section-label">Recent</div>
        </Reveal>
        <div className="recent-list">
          {items.map((item, i) => (
            <Reveal key={`${item.type}-${item.slug}`} delay={i * 60}>
              <Link href={item.href} className="recent-item">
                <div className="recent-meta">
                  <span className={`recent-type recent-type-${item.type}`}>
                    {item.type === 'project' ? 'Project' : 'Essay'}
                  </span>
                  {item.category && (
                    <span className={`writing-cat ${categoryClass(item.category)}`}>
                      {item.category}
                    </span>
                  )}
                  <time dateTime={item.date}>{formatDate(item.date)}</time>
                </div>
                <h3 className="recent-title">{item.title}</h3>
                <p className="recent-summary">{item.summary}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
