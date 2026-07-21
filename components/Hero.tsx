import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <h1>
          Building at the intersection of{' '}
          <em>market infrastructure, programmable finance, and AI systems</em>
        </h1>
        <p className="hero-identity">
          Former institutional rates and macro trader and portfolio manager building
          inspectable systems for financial infrastructure and AI agents.
        </p>
        <p className="hero-identity">
          I combine thirteen years of experience in liquidity, collateral, execution, and
          risk with hands-on work in Go, Solidity, Ethereum infrastructure, APIs, and agent
          systems.
        </p>
        <p className="hero-positioning">
          Seeking solutions architecture, technical strategy, and technical business
          development roles across digital assets, financial infrastructure, and AI-enabled
          workflows.
        </p>
        <div className="hero-cta">
          <Link href="#projects" className="btn btn-primary">
            View selected work
          </Link>
          <Link href="#resume" className="btn">
            View resume
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
