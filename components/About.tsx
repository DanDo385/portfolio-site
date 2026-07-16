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
  'Market structure',
  'Financial infrastructure',
  'Agent systems',
  'APIs and automation',
  'Technical strategy',
];

export function About() {
  return (
    <section id="about">
      <div className="container">
        <Reveal>
          <div className="section-label">Experience &amp; Differentiators</div>
        </Reveal>
        <Reveal delay={60}>
          <div className="about-block">
            <p className="about-intro">
              I spent thirteen years in institutional fixed income across sales, proprietary
              trading, macro execution, and portfolio management. Since leaving the desk, I have
              built open-source simulations, monitoring tools, smart contracts, and agent-facing
              systems that make complex infrastructure easier to inspect and explain.
            </p>
            <p className="about-intro">
              My advantage is not simply knowing finance or writing code. It is understanding how
              technical architecture, liquidity, incentives, collateral, execution, and
              operational risk interact inside a real market.
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
