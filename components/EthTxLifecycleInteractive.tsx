import { DemoBackendStatus } from '@/components/DemoBackendStatus';
import { ExternalDemoFrame } from '@/components/ExternalDemoFrame';

const DEMO_SRC = 'https://eth-tx-lifecycle.vercel.app';
const DEMO_PATH = '/demos/eth-tx-lifecycle';
const GITHUB_URL = 'https://github.com/DanDo385/eth-tx-lifecycle';
const API_ORIGIN = 'https://api-staging-eth-tx.magro.dev';

export function EthTxLifecycleInteractive() {
  return (
    <section id="interactive" className="amd-detail project-interactive" aria-labelledby="etx-detail-title">
      <p className="section-label">Interactive Demo</p>

      <div className="amd-hero">
        <div>
          <p className="amd-kicker">Live visualizer</p>
          <h2 id="etx-detail-title">What happens after you click send.</h2>
          <p>
            Full-stack walkthrough of the path from wallet broadcast through mempool,
            builders, relays, proposal, and finality. The UI runs on Vercel; live data
            comes from a Go backend on the MBP via Cloudflare Tunnel.
          </p>
        </div>
        <div className="amd-runtime">
          <div className="amd-runtime-row">
            <span>Frontend</span>
            <strong>Vercel · eth-tx-lifecycle.vercel.app</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Backend</span>
            <strong>MBP Go service via Cloudflare Tunnel</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Fullscreen</span>
            <strong>
              <a href={DEMO_PATH}>/demos/eth-tx-lifecycle</a>
            </strong>
          </div>
        </div>
      </div>

      <DemoBackendStatus demoSlug="eth-tx" defaultOrigin={API_ORIGIN} />

      <ExternalDemoFrame
        src={DEMO_SRC}
        title="Ethereum transaction lifecycle visualizer"
        loading="lazy"
        variant="embed"
      />

      <noscript>
        <p className="amd-noscript">
          The embedded visualizer needs JavaScript inside the iframe. The project summary,
          preview media, and GitHub link above remain available without it.
        </p>
      </noscript>

      <div className="amd-links">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="amd-link">
          View source on GitHub <span>&rarr;</span>
        </a>
        <a href={DEMO_PATH} className="amd-link">
          Open demo fullscreen <span>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
