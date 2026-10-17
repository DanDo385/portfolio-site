import Link from 'next/link';
import { RESUME_PDF, SITE } from '@/lib/constants';

export function Hero() {
  return (
    <section className="hero engineering-hero" id="top" tabIndex={-1}>
      <div className="container">
        <div className="hero-topline"><span>Daniel Magro</span><span>AI engineering / Financial systems</span></div>
        <div className="engineering-hero-grid">
          <div>
            <h1>AI engineering.<br /><em>Grounded in markets.</em></h1>
            <p className="hero-identity">{SITE.description}</p>
            <div className="hero-cta">
              <Link href="#projects" className="btn btn-primary">Explore my work <span aria-hidden="true">↗</span></Link>
              <a href={RESUME_PDF} className="hero-text-link" target="_blank" rel="noopener noreferrer">View resume</a>
            </div>
            <p className="hero-opportunities">Open to forward-deployed engineering and AI roles across finance, fintech, and crypto.</p>
          </div>
          <aside className="hero-index" aria-label="Engineering focus">
            <p className="eyebrow">Where I build</p>
            <a href="#projects"><span className="index-number">01</span><span><strong>AI & agent systems</strong><small>Tool use, context, evaluation</small></span><span aria-hidden="true">↗</span></a>
            <a href="#projects"><span className="index-number">02</span><span><strong>Data & infrastructure</strong><small>APIs, observability, resilient services</small></span><span aria-hidden="true">↗</span></a>
            <a href="#about"><span className="index-number">03</span><span><strong>Markets & risk</strong><small>Rates, liquidity, programmable finance</small></span><span aria-hidden="true">↗</span></a>
            <div className="hero-index-foot"><span>Python / TypeScript / Go / Solidity</span><a href="https://github.com/DanDo385" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
          </aside>
        </div>
        <div className="career-strip"><span>13 years in institutional markets</span><div><span>Merrill Lynch</span><span>Jefferies</span><span>Nomura</span><span>PointState</span><span>PGIM</span></div></div>
      </div>
    </section>
  );
}
