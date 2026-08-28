import { Reveal } from './Reveal';

const PILLARS = [
  {
    title: 'Markets',
    body: 'Institutional trading, execution, liquidity, portfolio management, and risk.',
  },
  {
    title: 'Engineering',
    body: 'Python, TypeScript, Go, blockchain systems, APIs, data, and infrastructure.',
  },
  {
    title: 'Agents',
    body: 'LLM tooling, orchestration, research automation, observability, and multi-agent systems.',
  },
] as const;

const CONVERGENCE = [
  'Research',
  'Signals',
  'Execution',
  'Risk',
  'Market structure',
  'Automation',
] as const;

export function WhyCombination() {
  return (
    <section id="why-combination" className="why-combination">
      <div className="container">
        <Reveal>
          <div className="section-label">Why this combination</div>
          <p className="about-intro">
            These are not unrelated career chapters. They converge on systematic digital-asset
            trading.
          </p>
        </Reveal>
        <div className="why-pillars">
          {PILLARS.map((pillar) => (
            <Reveal key={pillar.title}>
              <div className="why-pillar">
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={40}>
          <div className="why-merge">
            <h3>Systematic digital-asset trading</h3>
            <ul>
              {CONVERGENCE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
