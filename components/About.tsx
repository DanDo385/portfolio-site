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
  'Market structure and execution',
  'Financial and digital infrastructure',
  'Technical problem solving',
  'Public research and delivery',
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
              Markets judgment is the foundation. Technical fluency expands the problems I can
              solve. Public work proves initiative, learning velocity, and delivery.
            </p>

            <div className="about-track">
              <h3 className="about-track-title">Institutional markets</h3>
              <p className="history-summary">
                <strong>13 years</strong> across fixed income sales, proprietary trading, macro
                execution, and portfolio management. Work centered on liquidity, risk, collateral,
                market structure, and decision-making under pressure at Merrill Lynch, Jefferies,
                Nomura, PointState Capital, and Prudential (PGIM).
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
                My technical work is practical and evidence-driven. I use public repositories,
                working demos, tests, simulations, and documented limitations to turn unfamiliar
                systems into inspectable problems. The goal is not to present a second career in
                engineering. It is to demonstrate that I can learn technical systems, reason across
                domain boundaries, and deliver usable work.
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
