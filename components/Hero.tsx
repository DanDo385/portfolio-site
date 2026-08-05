import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero" id="top" tabIndex={-1}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <p className="hero-eyebrow">
          Background in institutional finance &amp; technology
        </p>
        <h1>Programmable Finance, Market Structure, and AI</h1>
        <p className="hero-identity">
          Thirteen years in institutional financial sales, trading, and portfolio management, with
          rates as the core specialty. After leaving institutional market-based roles, I took a
          break due to some medical issues and then began working in the e-commerce space, doing
          freelance web development, actively trading crypto, and building my technical skills in
          blockchain and AI.
        </p>
        <p className="hero-identity">
          The Writing section shows how I reason through complex technical problems. The Projects
          section is a mix of artifacts from educational tools, simulations, market analysis
          tooling, DeFi protocols, and agentic systems.
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
