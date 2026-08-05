const DEMO_SRC = '/project-assets/space-time/demo/index.html?embed=1';
const GITHUB_URL = 'https://github.com/DanDo385/space-time';
const LLMS_URL = '/project-assets/space-time/demo/llms.txt';

export function SpaceTimeInteractive() {
  return (
    <section
      id="interactive"
      className="amd-detail project-interactive"
      aria-labelledby="space-time-title"
    >
      <p className="section-label">Interactive Demo</p>

      <div className="amd-hero">
        <div>
          <p className="amd-kicker">Special-relativity lab</p>
          <h2 id="space-time-title">Change speed. Watch the age gap open.</h2>
          <p>
            Explore a spacetime diagram of the twin paradox: Earth and ship worldlines, Lorentz
            factor, proper time, and reunion age difference update as you move cruise speed and trip
            length.
          </p>
        </div>
        <div className="amd-runtime">
          <div className="amd-runtime-row">
            <span>Runtime</span>
            <strong>Static HTML, CSS, and JavaScript</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Model</span>
            <strong>Constant-speed flat spacetime round trip</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Brief</span>
            <strong>
              <a href={LLMS_URL} target="_blank" rel="noopener noreferrer">
                llms.txt
              </a>
            </strong>
          </div>
        </div>
      </div>

      <div className="amd-frame-wrap">
        <iframe
          title="Space-time Twin Lab interactive walkthrough"
          src={DEMO_SRC}
          className="amd-frame"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <noscript>
        <p className="amd-noscript">
          The embedded lab needs JavaScript inside the iframe. The project summary and GitHub source
          remain available without it.
        </p>
      </noscript>

      <div className="amd-links">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="amd-link">
          View source on GitHub <span>&rarr;</span>
        </a>
        <a href="/demos/space-time" className="amd-link">
          Open demo fullscreen <span>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
