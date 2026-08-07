import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero" id="top" tabIndex={-1}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <h1>Programmable Finance, Market Structure, and AI</h1>
        <p className="hero-identity">
          Thirteen years in institutional fixed income sales, trading, and portfolio management, with
          rates as the core specialty. After leaving institutional market-based roles, I built and
          operated an independent e-commerce business, then took a break due to some medical issues
          while retraining in computer science, Solidity, blockchain, and AI. Since then I have been
          doing freelance web development, actively trading crypto, and continuing that technical
          work.
        </p>
        <p className="hero-identity">
          The Writing section shows how I reason through complex technical problems. The Projects
          section is a mix of artifacts from educational tools, simulations, market analysis
          tooling, DeFi protocols, and agentic systems.
        </p>
        <p className="hero-positioning">
          Best fit: markets and liquidity roles within digital-assets, trading and financial
          infrastructure teams that want fluency in both rates and blockchain mechanics, and
          product, business development, or institutional sales at the intersection of markets and
          AI.
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
