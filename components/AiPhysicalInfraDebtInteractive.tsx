const DEMO_SRC = '/project-assets/ai-physical-infra-debt/demo/index.html?embed=1';
const GITHUB_URL = 'https://github.com/DanDo385/ai-physical-infra-debt-analysis';
const EXTERNAL_URL = 'https://ai-physical-infra-debt-analysis.vercel.app';
const LLMS_URL = '/project-assets/ai-physical-infra-debt/demo/llms.txt';
const JSON_URL = '/project-assets/ai-physical-infra-debt/demo/agent.json';
const RESEARCH_URL = '/agent-research/ai-infrastructure-financing';
const ESSAY_URL = '/writing/ai-infrastructure-buildout-bubble';

export function AiPhysicalInfraDebtInteractive() {
  return (
    <section
      id="interactive"
      className="amd-detail project-interactive"
      aria-labelledby="ai-infra-debt-title"
    >
      <p className="section-label">Interactive Demo</p>

      <div className="amd-hero">
        <div>
          <p className="amd-kicker">Credit research report</p>
          <h2 id="ai-infra-debt-title">AI infrastructure financing, with provenance</h2>
          <p>
            Explore GPU-backed term loans, data-center securitization, an interactive recovery
            model, and crisis comparisons. Standalone mode keeps Agent Mode exports and Display
            light/dark controls; the portfolio embed hides that chrome.
          </p>
        </div>
        <div className="amd-runtime">
          <div className="amd-runtime-row">
            <span>Runtime</span>
            <strong>Static HTML and JavaScript</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Observe</span>
            <strong>Market map, financing ladder, recovery model</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Exports</span>
            <strong>
              <a href={LLMS_URL} target="_blank" rel="noopener noreferrer">
                llms.txt
              </a>
              {' · '}
              <a href={JSON_URL} target="_blank" rel="noopener noreferrer">
                agent.json
              </a>
            </strong>
          </div>
          <div className="amd-runtime-row">
            <span>Companions</span>
            <strong>
              <a href={RESEARCH_URL}>Research</a>
              {' · '}
              <a href={ESSAY_URL}>Essay</a>
            </strong>
          </div>
        </div>
      </div>

      <div className="amd-frame-wrap">
        <iframe
          title="AI Infrastructure Financing interactive report"
          src={DEMO_SRC}
          className="amd-frame"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <noscript>
        <p className="amd-noscript">
          The embedded report needs JavaScript inside the iframe. The research paper, essay, and
          GitHub source remain available without it.
        </p>
      </noscript>

      <div className="amd-links">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="amd-link">
          View source on GitHub <span>&rarr;</span>
        </a>
        <a href="/demos/ai-physical-infra-debt" className="amd-link">
          Open demo fullscreen <span>&rarr;</span>
        </a>
        <a href={EXTERNAL_URL} target="_blank" rel="noopener noreferrer" className="amd-link">
          Open on Vercel <span>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
