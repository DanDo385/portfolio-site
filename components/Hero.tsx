import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero" id="top" tabIndex={-1}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <p className="hero-eyebrow">
          13 years on institutional desks. Now building and publishing technical work.
        </p>
        <h1>Programmable Finance, Market Structure, and AI</h1>
        <p className="hero-identity">
          The desk years covered institutional fixed income sales, proprietary trading, macro
          execution, and portfolio management. The building years cover automation, APIs, Ethereum
          infrastructure, market simulations, and agent systems.
        </p>
        <p className="hero-identity">
          Everything here is checkable: repos you can read, demos you can run, and write-ups that
          show the reasoning.
        </p>
        <p className="hero-positioning">
          Open to roles across trading, execution, liquidity, risk, portfolio strategy, financial
          infrastructure, and digital assets, especially work that sits between markets, clients,
          and technical systems.
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
