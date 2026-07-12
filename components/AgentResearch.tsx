import Link from 'next/link';
import type { ResearchPaper } from '@/lib/types';
import { categoryClass, formatDate } from '@/lib/utils';
import { Reveal } from './Reveal';

interface AgentResearchProps {
  papers: ResearchPaper[];
}

export function AgentResearch({ papers }: AgentResearchProps) {
  return (
    <section id="agent-research">
      <div className="container">
        <Reveal>
          <div className="section-label">Agent Research</div>
        </Reveal>
        <div className="writing-list">
          {papers.length === 0 ? (
            <Reveal>
              <p className="writing-empty">Published research will appear here.</p>
            </Reveal>
          ) : (
            papers.map((paper, i) => (
              <Reveal key={paper.slug} delay={i * 60}>
                <article className="writing-item">
                  <Link href={`/agent-research/${paper.slug}`} className="writing-item-main">
                    <div className="writing-meta">
                      <span className={`writing-cat ${categoryClass(paper.category)}`}>
                        {paper.category}
                      </span>
                      <time dateTime={paper.date}>{formatDate(paper.date)}</time>
                    </div>
                    <h3 className="writing-title">{paper.title}</h3>
                    {paper.subtitle && <p className="writing-subtitle">{paper.subtitle}</p>}
                    <p className="writing-excerpt">{paper.excerpt}</p>
                  </Link>
                </article>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
