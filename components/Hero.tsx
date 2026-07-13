import Link from 'next/link';

interface HeroProps {
  showRecent?: boolean;
}

export function Hero({ showRecent = false }: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-content">
        <h1>
          Operating at the center of <em>AI, finance, and markets</em>
        </h1>
        <p className="hero-identity">
          Former institutional rates and macro trader and portfolio manager. Now focused on
          the market structure questions AI is forcing into the open: how the AI
          infrastructure buildout gets financed, and how AI can modernize the rails finance
          runs on.
        </p>
        <p className="hero-positioning">
          Available for solutions architecture, capital markets, market strategy, and
          technical BD with teams financing AI infrastructure, building AI-native financial
          workflows, or modernizing institutional rails with programmable assets,
          stablecoins, RWA infrastructure, and better data systems.
        </p>
        {showRecent && (
          <div className="hero-cta">
            <Link href="#recent" className="btn btn-primary">
              Recent
            </Link>
          </div>
        )}
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <div className="bar" />
        Scroll
      </div>
    </section>
  );
}
