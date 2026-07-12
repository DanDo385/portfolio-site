import Link from 'next/link';

interface HeroProps {
  showRecent?: boolean;
}

export function Hero({ showRecent = false }: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <h1>
          Building at the edge of <em>open source, security, and markets</em>
        </h1>
        <p className="hero-identity">
          Former institutional rates and macro trader and portfolio manager. Now writing and
          shipping EVM infrastructure, agent-readable systems, and security-minded protocol work
          in public — with a learning arc from storage and AMM mechanics to fraud-proof simulation.
        </p>
        <p className="hero-positioning">
          Looking for open source contribution, smart contract security, and systems engineering
          roles where markets literacy is a force multiplier. Still fluent in capital-markets
          translation when teams need that bridge.
        </p>
        {showRecent && (
          <div className="hero-cta">
            <Link href="#recent" className="btn btn-primary">
              Recent
            </Link>
          </div>
        )}
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <div className="bar" />
        Scroll
      </div>
    </section>
  );
}
