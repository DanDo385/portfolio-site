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
  'Full-stack, AI agents, and Web3',
  'Hermes workflows and open-source tooling',
  'EVM contracts and product frontends',
  'Active crypto trading and DeFi research',
  'E-commerce automation and execution',
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
              <h3 className="about-track-title">Building &amp; operating</h3>
              <p className="about-track-summary">
                Freelance Web2 developer specializing in e-commerce, open-source contributor, and
                product launches in development. Full-stack, AI, and Web3 work since 2024 includes
                freelance ventures, Hermes tooling, and EVM marketplace contracts at RAMM.ai. Earlier
                independent e-commerce operations used Python automation; medical leave included
                intensive CS, Solidity, blockchain, and AI retraining. Active crypto trading and
                protocol research feed the software design. Writing shows how I reason through
                technical problems; Projects cover custody controls, agentic operations, and
                market-structure tooling.
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
