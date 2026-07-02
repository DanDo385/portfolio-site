import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { Reveal } from '@/components/Reveal';
import { getAgentManifest } from '@/lib/agent';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Agent Mode | Daniel Magro',
  description:
    'A human-readable explanation of the machine-readable Agent Mode endpoints on magro.dev.',
  alternates: { canonical: '/agent/' },
};

export default function AgentPage() {
  const manifest = getAgentManifest();
  const prettyManifest = JSON.stringify(manifest, null, 2);

  return (
    <>
      <Nav />
      <main className="agent-page">
        <div className="container">
          <Reveal>
            <header className="agent-hero">
              <p className="agent-kicker">Agent Mode</p>
              <h1>Human pages for humans. Structured context for agents.</h1>
              <p>
                Agent Mode exposes canonical, low-noise context so AI systems do not have to infer
                meaning from decorative HTML. This is the smallest useful slice: a page, a JSON
                manifest, and an LLM router.
              </p>
              <div className="agent-actions">
                <a href="/agent.json" className="agent-action">
                  agent.json
                </a>
                <a href="/llms.txt" className="agent-action">
                  llms.txt
                </a>
                <Link href="/writing/agent-mode-and-the-inference-tax" className="agent-action muted">
                  Read the essay
                </Link>
              </div>
            </header>
          </Reveal>

          <Reveal delay={70}>
            <section className="agent-grid" aria-label="Agent Mode endpoints">
              <article className="agent-card">
                <span className="agent-card-label">01</span>
                <h2>/agent/</h2>
                <p>
                  Human-readable explanation of the contract: what this domain is, what agents
                  should read first, and what the proof artifact demonstrates.
                </p>
              </article>
              <article className="agent-card">
                <span className="agent-card-label">02</span>
                <h2>/agent.json</h2>
                <p>
                  Structured context: owner, positioning, canonical topics, projects, writing, and
                  action-oriented links in one stable JSON surface.
                </p>
              </article>
              <article className="agent-card">
                <span className="agent-card-label">03</span>
                <h2>/llms.txt</h2>
                <p>
                  A compact router for language models. It tells agents what matters before they
                  fall into layout noise, carousels, and ornamental copy.
                </p>
              </article>
            </section>
          </Reveal>

          <Reveal delay={120}>
            <section className="agent-section">
              <div className="section-label">Canonical Context</div>
              <div className="agent-context">
                <div>
                  <h2>What this site wants agents to know</h2>
                  <p>{SITE.description}</p>
                  <ul>
                    {manifest.canonicalTopics.slice(0, 6).map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </div>
                <div className="agent-principles">
                  <h3>Use guidelines</h3>
                  <ul>
                    {manifest.agentMode.principles.map((principle) => (
                      <li key={principle}>{principle}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={160}>
            <section className="agent-section">
              <div className="section-label">Manifest Preview</div>
              <pre className="agent-code">
                <code>{prettyManifest}</code>
              </pre>
            </section>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
