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
  'Active trading and digital assets',
  'Permissionless systems',
  'Startup product experience',
  'Market structure and execution',
];

export function About() {
  return (
    <section id="about">
      <div className="container">
        <Reveal>
          <div className="section-label">Experience</div>
        </Reveal>
        <Reveal delay={60}>
          <div className="about-block">
            <p className="about-intro">
              The institutional markets career came first. I still trade crypto and other assets,
              and I work on product and systems in permissionless environments with a startup bent.
            </p>

            <div className="about-track">
              <h3 className="about-track-title">Institutional markets</h3>
              <p className="history-summary">
                <strong>13 years</strong> across fixed income sales, proprietary trading, macro
                execution, and portfolio management. The common thread was liquidity, risk,
                collateral, and market structure, at Merrill Lynch, Jefferies, Nomura, PointState
                Capital, and Prudential (PGIM).
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
                  {TIMELINE.filter((item) => item.track !== 'builder').map((item) => (
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
              <h3 className="about-track-title">Building &amp; operating</h3>
              <p className="about-track-summary">
                Outside the desk years I have operated independently and inside early-stage product
                work, including Web3. I still trade crypto and other assets, and I build around
                permissionless rails: settlement, market structure, infrastructure, and agent
                systems. The repos and writeups are solid artifacts that showcase how I think and
                explain complex technical concepts.
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
                  {TIMELINE.filter((item) => item.track === 'builder').map((item) => (
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
