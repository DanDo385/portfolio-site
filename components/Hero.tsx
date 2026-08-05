import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero" id="top" tabIndex={-1}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <p className="hero-eyebrow">
          Markets, financial infrastructure, and technical systems
        </p>
        <h1>Programmable Finance, Market Structure, and AI</h1>
        <p className="hero-identity">
          Background in institutional fixed income sales, proprietary trading, macro execution, and
          portfolio management. I still trade crypto and other assets, and most of my technical work
          sits in permissionless markets and infrastructure.
        </p>
        <p className="hero-identity">
          Startup experience shaped how I work: ship usable systems, stay close to the product, and
          keep the feedback loop short. The repos and writeups are solid artifacts that showcase how
          I think about markets, infrastructure, and complex technical concepts.
        </p>
        <p className="hero-positioning">
          Best fit: markets and liquidity roles at digital-asset firms, trading and financial
          infrastructure teams that want fluency in both rates and EVM mechanics, and research or
          product seats at the intersection of markets and AI.
        </p>
        <div className="hero-cta">
          <Link href="#about" className="btn btn-primary">
            View experience
          </Link>
          <Link href="#projects" className="btn">
            Selected work
          </Link>
          <Link href="#resume" className="btn">
            Resume
          </Link>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <div className="bar" />
        Scroll
      </div>
    </section>
  );
}
