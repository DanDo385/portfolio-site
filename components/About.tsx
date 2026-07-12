import { TIMELINE } from '@/lib/content';
import { Reveal } from './Reveal';

const FIRMS = [
  { name: 'Merrill Lynch', logo: '/company-logos/merrill.png' },
  { name: 'Jefferies', logo: '/company-logos/jefferies.png' },
  { name: 'Nomura', logo: '/company-logos/nomura.png' },
  { name: 'PointState', logo: '/company-logos/pointstate.png' },
  { name: 'Prudential', logo: '/company-logos/pgim.png' },
];

const BUILDER_THEMES = [
  'E-commerce automation',
  'Python',
  'APIs',
  'Permissionless protocols',
  'Sentiment & signals',
  'Strategy',
  'Builder networks',
  'Market structure',
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
              contracts, APIs, EVM internals, and the permissionless stacks where finance and
              software meet. The current thrust is open source contribution and smart contract
              security — content before container.
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
              <h3 className="about-track-title">Building & operating</h3>
              <p className="about-track-summary">
                Alongside institutional work, I ran independent e-commerce operations and built Python
                systems for supply-constrained markets with real execution pressure. I studied
                permissionless protocols with developer communities and worked problems where
                strategy, sentiment, APIs, and tax-aware cross-border logistics all connect back to
                the same discipline from the desk: read the structure, then move with intent.
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
