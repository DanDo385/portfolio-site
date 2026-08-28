import Link from 'next/link';
import {
  CURRENT_FOCUS,
  INTERESTED_IN,
  TRAJECTORY,
} from '@/lib/site-focus';

export function Hero() {
  return (
    <section className="hero" id="top" tabIndex={-1}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <p className="hero-name">Daniel Magro</p>
        <h1>Building systematic and agentic trading systems for digital-asset markets</h1>
        <p className="hero-trajectory" aria-label="Career trajectory">
          {TRAJECTORY}
        </p>
        <p className="hero-identity">
          Thirteen years in institutional rates trading, execution, and portfolio management.
          Now applying software engineering, quantitative research, blockchain infrastructure, and
          AI agents to crypto, DeFi, market structure, and systematic trading.
        </p>
        <div className="hero-focus-block">
          <div className="hero-focus-label">Current focus</div>
          <ul className="hero-focus-list">
            {CURRENT_FOCUS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="hero-focus-block">
          <div className="hero-focus-label">Interested in</div>
          <ul className="hero-focus-list">
            {INTERESTED_IN.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="hero-cta">
          <Link href="/trading" className="btn btn-primary">
            Trading Lab
          </Link>
          <Link href="#projects" className="btn btn-primary">
            View Projects
          </Link>
          <a
            href="https://github.com/DanDo385"
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <Link href="#resume" className="btn btn-primary">
            Resume
          </Link>
          <Link href="#contact" className="btn btn-primary">
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
