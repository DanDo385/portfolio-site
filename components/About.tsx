import { TIMELINE } from '@/lib/content';
import { Reveal } from './Reveal';

const FIRMS = [
  { name: 'Merrill Lynch', logo: '/merrill.png' },
  { name: 'Jefferies', logo: '/jefferies.png' },
  { name: 'Nomura', logo: '/nomura.png' },
  { name: 'PointState', logo: '/pointstate.png' },
  { name: 'Prudential', logo: '/pgim.png' },
];

const BUILDER_THEMES = [
  'E-commerce automation',
  'Python',
  'APIs',
  'Permissionless systems',
  'Sentiment & signals',
  'Strategy design',
  'Developer networks',
  'Market microstructure',
  'Creative execution',
  'Cross-border arbitrage',
];

export function About() {
  return (
    <section id="about">
      <div className="container">
        <Reveal>
          <div className="section-label">About Me</div>
        </Reveal>
        <Reveal delay={60}>
          <div className="about-block">
            <p className="about-intro">
              I spent thirteen years in institutional fixed income before stepping off the desk to
              build. Since then I have been on a deliberate learning run: Python automation, smart
              contracts, APIs, e-commerce systems, and the permissionless stacks where finance and
              software meet.
            </p>
            <p className="about-intro">
              This site is where I assemble that work in public: essays, projects, and experiments.
              The longer goal is a real platform where readers explore articles and run interactive
              programs to learn AI, finance, and market technology hands-on.
            </p>

            <div className="about-track">
              <h3 className="about-track-title">Institutional markets</h3>
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
                <summary>Full institutional history</summary>
                <div className="timeline">
                  {TIMELINE.filter((item) => item.era !== '2019 – 2022' && item.era !== '2024 – 2025').map((item) => (
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

            <div className="about-track">
              <h3 className="about-track-title">Builder & operator track</h3>
              <p className="about-track-summary">
                Between institutional roles and full-time building, I ran independent e-commerce
                operations, automated supply-constrained markets with Python, studied permissionless
                systems with elite developer communities, and worked problems at the intersection of
                strategy, sentiment, APIs, tax-aware cross-border execution, and creative market
                structure.
              </p>
              <div className="about-themes" aria-label="Builder themes">
                {BUILDER_THEMES.map((theme) => (
                  <span key={theme} className="about-theme">
                    {theme}
                  </span>
                ))}
              </div>
              <details className="history-details">
                <summary>Builder timeline</summary>
                <div className="timeline">
                  {TIMELINE.filter((item) => item.era === '2019 – 2022' || item.era === '2024 – 2025').map((item) => (
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
          </div>
        </Reveal>
      </div>
    </section>
  );
}
