import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <h1>Daniel Magro</h1>
        <p className="hero-identity">
          Former institutional rates and macro trader and portfolio manager. Now building AI
          and financial systems.
        </p>
        <p className="hero-positioning">
          Working at the intersection of AI, finance, and market structure. The projects
          and writing below are the output.
        </p>
        <div className="hero-cta">
          <Link href="#projects" className="btn btn-primary">
            Work
          </Link>
          <Link href="#writing" className="btn">
            Writing
          </Link>
          <Link href="#resume" className="btn">
            Resume
          </Link>
          <Link href="#contact" className="btn">
            Contact
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
