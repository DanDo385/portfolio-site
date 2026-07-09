import { DemoBackendStatus } from '@/components/DemoBackendStatus';
import { ExternalDemoFrame } from '@/components/ExternalDemoFrame';

const DEMO_SRC = 'https://eth-l2.vercel.app';
const DEMO_PATH = '/demos/eth-l2-fraud-proof';
const GITHUB_URL = 'https://github.com/DanDo385/eth-l2';
const API_ORIGIN = 'https://api-staging-eth-l2.magro.dev';

export function EthL2FraudProofInteractive() {
  return (
    <section id="interactive" className="amd-detail project-interactive" aria-labelledby="l2-detail-title">
      <p className="section-label">Interactive Demo</p>

      <div className="amd-hero">
        <div>
          <p className="amd-kicker">Live simulator</p>
          <h2 id="l2-detail-title">Fraud-proof settlement, made inspectable.</h2>
          <p>
            Optimistic rollup disputes as settlement infrastructure: assertions, challenge
            windows, bisection, and one-step proofs. The UI runs on Vercel; the Go/Anvil
            staging stack runs on the MBP behind a Cloudflare Tunnel and fails closed when
            offline.
          </p>
        </div>
        <div className="amd-runtime">
          <div className="amd-runtime-row">
            <span>Frontend</span>
            <strong>Vercel · eth-l2.vercel.app</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Backend</span>
            <strong>MBP Go service via Cloudflare Tunnel</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Fullscreen</span>
            <strong>
              <a href={DEMO_PATH}>/demos/eth-l2-fraud-proof</a>
            </strong>
          </div>
        </div>
      </div>

      <DemoBackendStatus demoSlug="eth-l2" defaultOrigin={API_ORIGIN} />

      <ExternalDemoFrame
        src={DEMO_SRC}
        title="L2 fraud proof settlement simulator"
        loading="lazy"
        variant="embed"
      />

      <noscript>
        <p className="amd-noscript">
          The embedded simulator needs JavaScript inside the iframe. The project summary,
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
