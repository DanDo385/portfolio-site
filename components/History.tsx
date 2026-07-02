import { TIMELINE } from '@/lib/content';
import { Reveal } from './Reveal';

const FIRMS = [
  { name: 'Merrill Lynch', logo: '/merrill.png' },
  { name: 'Jefferies', logo: '/jefferies.png' },
  { name: 'Nomura', logo: '/nomura.png' },
  { name: 'PointState', logo: '/pointstate.png' },
  { name: 'Prudential', logo: '/pgim.png' },
];

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
              portfolio management: rates, macro, and cross-asset. Merrill Lynch, Jefferies, Nomura,
              PointState Capital, and Prudential (PGIM).
            </p>
            <div className="firm-logos" aria-label="Employers">
              {FIRMS.map((firm) => (
                <span key={firm.name} className="firm-logo">
                  <img src={firm.logo} alt={firm.name} loading="lazy" />
                </span>
              ))}
            </div>
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
