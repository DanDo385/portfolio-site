import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero" id="top" tabIndex={-1}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <h1>Institutional Digital Assets and Market Structure</h1>
        <p className="hero-identity">
          Thirteen years running rates and relative-value books at PGIM, PointState, and Nomura.
          I build the custody, settlement, and agent-driven operational tooling that lets
          institutions use digital assets.
        </p>
        <p className="hero-positioning">
          Target roles: Solutions, Forward Deployed Engineer, Relationships, Sales, and
          Implementation at custody, tokenization, and institutional trading infrastructure firms.
        </p>
        <div className="hero-cta">
          <Link href="#projects" className="btn btn-primary">
            Selected work
          </Link>
          <Link href="#about" className="btn btn-primary">
            View experience
          </Link>
          <Link href="#resume" className="btn btn-primary">
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
