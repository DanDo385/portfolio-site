import { MacOsDesktop } from './MacOsDesktop';

export function MacOsDesktopInteractive() {
  return (
    <section id="interactive" className="amd-detail project-interactive" aria-labelledby="macos-desktop-title">
      <p className="section-label">Interactive Demo</p>

      <div className="amd-hero">
        <div>
          <p className="amd-kicker">Desktop shell</p>
          <h2 id="macos-desktop-title">Open the portfolio like an operating system.</h2>
          <p>
            The same projects, writing, stack, and contact paths as draggable windows.
            Finder browses curated locations, Terminal prints the stack, Safari links
            the essays, all above a magnifying dock. No backend, no new dependencies.
          </p>
        </div>
        <div className="amd-runtime">
          <div className="amd-runtime-row">
            <span>Runtime</span>
            <strong>Native React client component</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Windows</span>
            <strong>Finder · Terminal · Safari · Resume · Contact · Photos</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Adapted from</span>
            <strong>GSAP plus Zustand desktop spec, ported dependency-free</strong>
          </div>
        </div>
      </div>

      <MacOsDesktop embedded />

      <noscript>
        <p className="amd-noscript">
          The desktop demo needs JavaScript. The project summary and fullscreen link
          remain available without it.
        </p>
      </noscript>

      <div className="amd-links">
        <a href="/demos/macos-desktop" className="amd-link">
          Open demo fullscreen <span>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
