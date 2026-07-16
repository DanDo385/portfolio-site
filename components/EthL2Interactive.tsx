import { DemoBackendStatus } from '@/components/DemoBackendStatus';

const DEMO_SRC = 'https://eth-l2.vercel.app';
const GITHUB_URL = 'https://github.com/DanDo385/eth-l2';
const API_ORIGIN = 'https://api-staging-eth-l2.magro.dev';
const LLMS_URL = '/project-assets/eth-l2/llms.txt';

export function EthL2Interactive() {
  return (
    <section id="interactive" className="amd-detail project-interactive" aria-labelledby="l2-detail-title">
      <p className="section-label">Interactive Demo</p>

      <div className="amd-hero">
        <div>
          <p className="amd-kicker">Live lab</p>
          <h2 id="l2-detail-title">Rollup Mechanics Lab</h2>
          <p>
            One app, one backend, two focused labs:{' '}
            <a href={`${DEMO_SRC}/op`} target="_blank" rel="noopener noreferrer">
              /op
            </a>{' '}
            for optimistic fraud proofs and{' '}
            <a href={`${DEMO_SRC}/zk`} target="_blank" rel="noopener noreferrer">
              /zk
            </a>{' '}
            for a simplified, mock validity-verification path standing in for a succinct ZK
            proof. The live UI runs on its own Vercel app at{' '}
            <a href={DEMO_SRC} target="_blank" rel="noopener noreferrer">
              eth-l2.vercel.app
            </a>
            ; simulation uses a staging Go backend through Cloudflare Tunnel.
          </p>
        </div>
        <div className="amd-runtime">
          <div className="amd-runtime-row">
            <span>Live app</span>
            <strong>
              <a href={DEMO_SRC} target="_blank" rel="noopener noreferrer">
                eth-l2.vercel.app
              </a>
            </strong>
          </div>
          <div className="amd-runtime-row">
            <span>Backend</span>
            <strong>api-staging-eth-l2.magro.dev</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Interact</span>
            <strong>Opens the Vercel app (not an in-site /demos route)</strong>
          </div>
          <div className="amd-runtime-row">
            <span>Agent brief</span>
            <strong>
              <a href={LLMS_URL} target="_blank" rel="noopener noreferrer">
                llms.txt
              </a>
            </strong>
          </div>
        </div>
      </div>

      <DemoBackendStatus demoSlug="eth-l2" defaultOrigin={API_ORIGIN} />

      <div className="amd-links">
        <a href={DEMO_SRC} target="_blank" rel="noopener noreferrer" className="amd-link">
          Open eth-l2.vercel.app <span>&rarr;</span>
        </a>
        <a href={`${DEMO_SRC}/op`} target="_blank" rel="noopener noreferrer" className="amd-link">
          Optimistic lab (/op) <span>&rarr;</span>
        </a>
        <a href={`${DEMO_SRC}/zk`} target="_blank" rel="noopener noreferrer" className="amd-link">
          Mock ZK validity lab (/zk) <span>&rarr;</span>
        </a>
        <a href={LLMS_URL} target="_blank" rel="noopener noreferrer" className="amd-link">
          Project llms.txt <span>&rarr;</span>
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="amd-link">
          View source on GitHub <span>&rarr;</span>
        </a>
      </div>
    </section>
  );
}
