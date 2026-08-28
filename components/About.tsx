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
  'Systematic crypto and DeFi research',
  'Market structure and execution tooling',
  'Agent orchestration and observability',
  'Blockchain infrastructure and signing controls',
  'Full-stack product systems',
];

export function About() {
  return (
    <section id="about">
      <div className="container">
        <Reveal>
          <div className="section-label">Experience</div>
          <p className="about-intro">
            Roughly 13 years in institutional financial markets, then deep work in software
            systems, blockchain infrastructure, and AI agents. Those paths have converged on
            systematic digital-asset research, market structure, execution, DeFi, and
            agent-assisted trading systems.
          </p>
        </Reveal>
        <Reveal delay={60}>
          <div className="about-block">
            <div className="about-track">
              <h3 className="about-track-title">Institutional markets</h3>
              <p className="history-summary">
                <strong>13 years</strong> in institutional rates sales, trading execution, and
                portfolio management. Liquidity, risk, collateral, and market structure ran through
                the work at Merrill Lynch, Jefferies, Nomura, PointState Capital, and Prudential
                (PGIM).
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
              <h3 className="about-track-title">Technical building</h3>
              <p className="about-track-summary">
                Since 2024: full-stack, AI, and Web3 systems work, including Hermes tooling, EVM
                marketplace contracts at RAMM.ai, and open-source agent infrastructure. Earlier
                independent e-commerce operations used Python automation; medical leave included
                intensive CS, Solidity, blockchain, and AI retraining. Active crypto trading and
                protocol research feed the software design. Freelance product work continues, but
                the north star is markets plus systems plus agents.
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
