import Link from 'next/link';
import { CURRENTLY_RESEARCHING } from '@/lib/site-focus';
import { Reveal } from './Reveal';

export function CurrentlyResearching() {
  return (
    <section id="currently-researching" className="currently-researching">
      <div className="container">
        <Reveal>
          <div className="section-label">Currently researching</div>
          <p className="about-intro">
            Independent research in progress. No fabricated performance figures.
          </p>
        </Reveal>
        <div className="researching-grid">
          {CURRENTLY_RESEARCHING.map((item) => (
            <Reveal key={item.title}>
              <Link href={item.href} className="researching-card">
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
