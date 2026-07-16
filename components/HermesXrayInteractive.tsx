const DEMO_SRC = '/project-assets/hermes-xray/demo/index.html?embed=1';
const GITHUB_URL = 'https://github.com/DanDo385/hermes-xray';
const LLMS_URL = '/project-assets/hermes-xray/demo/llms.txt';
const JSON_URL = '/project-assets/hermes-xray/demo/hermes-xray.json';

export function HermesXrayInteractive() {
  return (
    <section id="interactive" className="amd-detail project-interactive" aria-labelledby="hermes-xray-title">
      <p className="section-label">Interactive Demo</p>

      <div className="amd-hero">
        <div>
          <p className="amd-kicker">Standalone observability lab</p>
          <h2 id="hermes-xray-title">Send a prompt. Inspect the Hermes runtime path.</h2>
          <p>
            Explore prompt intake, context hydration, loop policy, tool dispatch, token estimates,
            event evidence, verification, and persistence. This independent HTML/CSS/JavaScript
            project was inspired by Agent Runtime without replacing it or sharing its portfolio slug.
          </p>
        </div>
        <div className="amd-runtime">
          <div className="amd-runtime-row">
            <span>Runtime</span>
            <strong>Static HTML, CSS, and JavaScript</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Observe</span>
            <strong>Prompt stack, loop stages, tools, token estimates</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Exports</span>
            <strong>
              <a href={LLMS_URL} target="_blank" rel="noopener noreferrer">
                llms.txt
              </a>
              {' · '}
              <a href={JSON_URL} target="_blank" rel="noopener noreferrer">
                hermes-xray.json
              </a>
            </strong>
          </div>
        </div>
      </div>

      <div className="amd-frame-wrap">
        <iframe
          title="hermes-xray interactive walkthrough"
          src={DEMO_SRC}
          className="amd-frame"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <noscript>
        <p className="amd-noscript">
          The embedded walkthrough needs JavaScript inside the iframe. The project summary and
          GitHub source remain available without it.
        </p>
      </noscript>

      <div className="amd-links">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="amd-link">
          View source on GitHub <span>&rarr;</span>
        </a>
        <a href="/demos/hermes-xray" className="amd-link">
          Open demo fullscreen <span>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
