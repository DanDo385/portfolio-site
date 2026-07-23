import Link from 'next/link';
import { RESUME_PDF } from '@/lib/constants';

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <p className="hero-eyebrow">
          Institutional markets experience. Applied technical capability.
        </p>
        <h1>Markets judgment for increasingly technical financial systems</h1>
        <p className="hero-identity">
          I bring 13 years across institutional fixed income sales, proprietary trading, macro
          execution, and portfolio management, now paired with public work in automation, APIs,
          Ethereum infrastructure, market simulations, and agent systems.
        </p>
        <p className="hero-identity">
          I build in public, test ideas through working artifacts, and carry problems from analysis
          through delivery.
        </p>
        <p className="hero-positioning">
          Open to market-facing and hybrid roles across trading, execution, liquidity, risk,
          portfolio strategy, financial infrastructure, digital assets, and roles that connect
          markets, clients, and technical systems.
        </p>
        <div className="hero-cta">
          <Link href="#about" className="btn btn-primary">
            View experience
          </Link>
          <Link href="#projects" className="btn">
            Selected work
          </Link>
          <a href={RESUME_PDF} className="btn" download>
            Download resume
          </a>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <div className="bar" />
        Scroll
      </div>
    </section>
  );
}
