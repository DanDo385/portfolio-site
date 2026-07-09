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
            Full-stack walkthrough from wallet broadcast through mempool, builders, relays,
            proposal, and finality. The UI is hosted at{' '}
            <a href={DEMO_SRC} target="_blank" rel="noopener noreferrer">
              eth-tx-lifecycle.vercel.app
            </a>
            ; live mempool, relay, and tracker data come from the MacBook Go backend through
            Cloudflare Tunnel. If the tunnel is offline, the UI still loads in degraded mode.
          </p>
        </div>
        <div className="amd-runtime">
          <div className="amd-runtime-row">
            <span>Live app</span>
            <strong>
              <a href={DEMO_SRC} target="_blank" rel="noopener noreferrer">
                eth-tx-lifecycle.vercel.app
              </a>
            </strong>
          </div>
          <div className="amd-runtime-row">
            <span>Backend</span>
            <strong>MBP via api-staging-eth-tx.magro.dev</strong>
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
        title="Ethereum transaction lifecycle visualizer on eth-tx-lifecycle.vercel.app"
        loading="lazy"
        variant="embed"
      />

      <noscript>
        <p className="amd-noscript">
          The embedded visualizer needs JavaScript inside the iframe. Open{' '}
          <a href={DEMO_SRC} target="_blank" rel="noopener noreferrer">
            eth-tx-lifecycle.vercel.app
          </a>{' '}
          directly, or use the project summary and GitHub link above.
        </p>
      </noscript>

      <div className="amd-links">
        <a href={DEMO_SRC} target="_blank" rel="noopener noreferrer" className="amd-link">
          Open eth-tx-lifecycle.vercel.app <span>&rarr;</span>
        </a>
        <a href={DEMO_PATH} className="amd-link">
          Open demo fullscreen <span>&rarr;</span>
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="amd-link">
          View source on GitHub <span>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
