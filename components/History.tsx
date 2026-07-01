import { TIMELINE } from '@/lib/content';
import { Reveal } from './Reveal';

const FIRMS = ['Merrill Lynch', 'Nomura', 'PointState', 'Prudential'];

export function History() {
  return (
    <section id="history">
      <div className="container">
        <Reveal>
          <div className="section-label">Professional History</div>
        </Reveal>
        <Reveal delay={80}>
          <div className="history-block">
            <p className="history-summary">
              <strong>13 years</strong> across institutional fixed income sales, trading, and
              portfolio management: rates, macro, and cross-asset. Merrill Lynch, Nomura,
              PointState Capital, and Prudential (PGIM).
            </p>
            <div className="firm-logos" aria-label="Employers">
              {FIRMS.map((firm) => (
                <span key={firm} className="firm-logo">
                  {firm}
                </span>
              ))}
            </div>
            <p className="firm-todo">
              TODO(dan): supply logo assets, or use text wordmarks if licensing is a concern.
            </p>
            <details className="history-details">
              <summary>Full history</summary>
              <div className="timeline">
                {TIMELINE.map((item) => (
                  <div key={item.era} className="tl-item">
                    <div className="tl-era">{item.era}</div>
                    <div className="tl-role">{item.role}</div>
                    <div className="tl-org">{item.org}</div>
                    <div className="tl-note">{item.note}</div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
