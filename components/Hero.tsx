import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero" id="top" tabIndex={-1}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <p className="hero-eyebrow">
          13 years in institutional rates. Still trading crypto. Building in permissionless systems.
        </p>
        <h1>Programmable Finance, Market Structure, and AI</h1>
        <p className="hero-identity">
          Thirteen years in institutional financial sales, trading, and portfolio management, with
          rates as the core specialty. After that: e-commerce work building Python automation and
          tooling to cut workflow friction and latency, plus active crypto trading and yield farming
          in permissionless markets.
        </p>
        <p className="hero-identity">
          The writeups show how I work through complex problems. The projects are the artifacts:
          visual breakdowns of technical concepts, plus interactive tools built for teaching.
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
