const DEMO_SRC = '/project-assets/agent-machine-deep-dive/demo/index.html';
const GITHUB_URL = 'https://github.com/DanDo385/agent-machine-deep-dive';
const LLMS_URL = '/project-assets/agent-machine-deep-dive/demo/llms.txt';
const JSON_URL = '/project-assets/agent-machine-deep-dive/demo/agent-runtime-map.json';

export function AgentMachineInteractive() {
  return (
    <section id="interactive" className="amd-detail project-interactive" aria-labelledby="amd-detail-title">
      <p className="section-label">Interactive Demo</p>

      <div className="amd-hero">
        <div>
          <p className="amd-kicker">Live walkthrough</p>
          <h2 id="amd-detail-title">The five-part agent machine loop, side by side.</h2>
          <p>
            Scroll through platform input, session hydration, the agent loop, tool dispatch,
            and persistence with Hermes Agent and OpenClaw source-shaped examples. The demo
            runs entirely in the browser with no backend.
          </p>
        </div>
        <div className="amd-runtime">
          <div className="amd-runtime-row">
            <span>Runtime</span>
            <strong>Static HTML, CSS, and client-side theme toggle</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Compare</span>
            <strong>Hermes Agent (Python) vs OpenClaw (TypeScript)</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Exports</span>
            <strong>
              <a href={LLMS_URL} target="_blank" rel="noopener noreferrer">
                llms.txt
              </a>
              {' · '}
              <a href={JSON_URL} target="_blank" rel="noopener noreferrer">
                agent-runtime-map.json
              </a>
            </strong>
          </div>
        </div>
      </div>

      <div className="amd-frame-wrap">
        <iframe
          title="Agent machine deep dive interactive walkthrough"
          src={DEMO_SRC}
          className="amd-frame"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <noscript>
        <p className="amd-noscript">
          The embedded walkthrough needs JavaScript inside the iframe. The project summary,
          preview media, and GitHub link above remain available without it.
        </p>
      </noscript>

      <div className="amd-links">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="amd-link">
          View source on GitHub <span>&rarr;</span>
        </a>
        <a href={DEMO_SRC} target="_blank" rel="noopener noreferrer" className="amd-link">
          Open demo fullscreen <span>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
