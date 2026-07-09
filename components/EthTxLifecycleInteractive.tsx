'use client';

import { useMemo, useState } from 'react';

type StageId =
  | 'wallet'
  | 'mempool'
  | 'received'
  | 'delivered'
  | 'headers'
  | 'finality';

interface MockRow {
  label: string;
  value: string;
}

interface Stage {
  id: StageId;
  shortLabel: string;
  flowLabel: string;
  metric: string;
  eyebrow: string;
  title: string;
  summary: string;
  technicalNote: string;
  signal: string;
  mockRows: MockRow[];
}

const SAMPLE_TX =
  '0x88df016429689c08c8858bbffdbf8ab6927aacbea888979c68d70308a48dde0f';

const STAGES: Stage[] = [
  {
    id: 'wallet',
    shortLabel: 'Wallet send',
    flowLabel: 'Wallet',
    metric: 'Signed + broadcast',
    eyebrow: 'Step 1 · Wallet send',
    title: 'Signing and broadcast',
    summary:
      'Your wallet creates a signed transaction and submits it to Ethereum peers. At this point the transaction is validly formed, but it is not included in a block yet.',
    technicalNote:
      'The private key signs locally. Nodes can reject malformed, underpriced, or nonce-conflicting transactions before they spread very far.',
    signal: 'Valid but not included',
    mockRows: [
      { label: 'Transaction hash', value: SAMPLE_TX },
      { label: 'From', value: '0x742d…4c8e' },
      { label: 'To', value: '0x1a2b…9f3d' },
      { label: 'Value', value: '0.42 ETH' },
      { label: 'Max fee', value: '32.5 gwei' },
      { label: 'Nonce', value: '847' },
      { label: 'Status', value: 'Broadcast to peers' },
    ],
  },
  {
    id: 'mempool',
    shortLabel: 'Mempool',
    flowLabel: 'Mempool',
    metric: 'Pending competition',
    eyebrow: 'Step 2 · Mempool',
    title: 'Pending flow and fee pressure',
    summary:
      'Pending transactions sit in node-level mempools while validators, builders, and users compete for scarce blockspace. Higher fees can improve priority, but ordering is not first-come, first-served.',
    technicalNote:
      'There is no single global Ethereum mempool. Each node sees a slightly different pending set based on peers, timing, filters, and RPC provider behavior.',
    signal: 'Fees influence priority',
    mockRows: [
      { label: 'Pending txs (sample node)', value: '142,803' },
      { label: 'Median gas price', value: '18.2 gwei' },
      { label: 'P90 gas price', value: '41.7 gwei' },
      { label: 'Block gas target', value: '15,000,000' },
      { label: 'Sample tx position', value: 'Not FIFO ranked' },
      { label: 'Mempool visibility', value: 'Node-local view' },
    ],
  },
  {
    id: 'received',
    shortLabel: 'Builders',
    flowLabel: 'Builders',
    metric: 'Block construction',
    eyebrow: 'Step 3 · Builders/searchers',
    title: 'Block construction market',
    summary:
      'Searchers and builders assemble candidate blocks. They optimize transaction ordering, bundle opportunities, and bid for the right to have a payload selected.',
    technicalNote:
      'Builder and searcher activity is economic infrastructure around the protocol. It can improve efficiency, but it also concentrates ordering power in specialized actors.',
    signal: 'Ordering is a market',
    mockRows: [
      { label: 'Slot', value: '9,842,117' },
      { label: 'Builder', value: 'Flashbots' },
      { label: 'Bid value', value: '0.084 ETH' },
      { label: 'Tx count', value: '187' },
      { label: 'Gas used', value: '29,412,093' },
      { label: 'Competing builders', value: '4 observed' },
    ],
  },
  {
    id: 'delivered',
    shortLabel: 'Relays',
    flowLabel: 'Relays',
    metric: 'Payload handoff',
    eyebrow: 'Step 4 · Relays',
    title: 'Payload handoff',
    summary:
      'Relays sit between builders and validators in proposer-builder separation. They forward eligible payloads and expose bidtrace data for delivered blocks.',
    technicalNote:
      'Relay coverage is uneven. Public relay APIs can be sparse or rate-limited, so missing rows do not always mean missing market activity.',
    signal: 'PBS middleware',
    mockRows: [
      { label: 'Relay', value: 'flashbots' },
      { label: 'Block number', value: '21,084,392' },
      { label: 'Proposer fee recipient', value: '0x4838…b0a1' },
      { label: 'Builder payment', value: '0.084 ETH' },
      { label: 'Delivered at', value: 'Slot 9,842,117' },
      { label: 'Payload status', value: 'Accepted by proposer' },
    ],
  },
  {
    id: 'headers',
    shortLabel: 'Proposal',
    flowLabel: 'Proposal',
    metric: 'Slot winner',
    eyebrow: 'Step 5 · Validators/proposers',
    title: 'Block proposal',
    summary:
      'A selected validator proposes one block for the slot. Once the block is published, included transactions move from pending intent to chain history.',
    technicalNote:
      'The proposer can use a local payload or an external builder payload, subject to client policy, relay availability, and protocol constraints.',
    signal: 'On-chain inclusion',
    mockRows: [
      { label: 'Slot', value: '9,842,117' },
      { label: 'Block root', value: '0x9f2a…c41e' },
      { label: 'Proposer index', value: '482,901' },
      { label: 'Execution block', value: '21,084,392' },
      { label: 'Tx included', value: SAMPLE_TX.slice(0, 10) + '…' },
      { label: 'Block status', value: 'Published to network' },
    ],
  },
  {
    id: 'finality',
    shortLabel: 'Finality',
    flowLabel: 'Finality',
    metric: 'Checkpoint lock',
    eyebrow: 'Step 6 · Finality',
    title: 'Economic lock-in',
    summary:
      'Finality checkpoints show when the chain has enough validator agreement that rewriting history becomes economically unrealistic under normal assumptions.',
    technicalNote:
      'Finality is not the same as first inclusion. A transaction can appear in a block quickly, then become increasingly secure as justified and finalized checkpoints advance.',
    signal: 'Security deepens over time',
    mockRows: [
      { label: 'Justified epoch', value: '307,628' },
      { label: 'Finalized epoch', value: '307,627' },
      { label: 'Epochs since inclusion', value: '2' },
      { label: 'Reorg risk (normal conditions)', value: 'Negligible' },
      { label: 'Checkpoint state', value: 'Finalized' },
      { label: 'User-facing outcome', value: 'Settlement confidence' },
    ],
  },
];

const PROOF_POINTS = [
  'Walks through the full path from wallet send to economic finality in six inspectable stages.',
  'Runs entirely in the browser with illustrative sample data, no backend or local server required.',
  'Explains mempool competition, PBS relays, and checkpoint finality without assuming specialist context.',
  'The full-stack repo adds live JSON-RPC, Beacon REST, and relay aggregation for real network data.',
];

export function EthTxLifecycleInteractive() {
  const [selectedStage, setSelectedStage] = useState(0);
  const activeStage = STAGES[selectedStage];

  const flowSummary = useMemo(
    () => STAGES.map((stage) => stage.flowLabel).join(' → '),
    [],
  );

  return (
    <section id="interactive" className="etx-detail project-interactive" aria-labelledby="etx-detail-title">
      <div className="etx-hero">
        <div>
          <p className="etx-kicker">Interactive Technical Demo</p>
          <h2 id="etx-detail-title">What happens after you click send.</h2>
          <p>
            Ethereum transactions do not land in a block instantly. They pass through
            signing, mempools, builder markets, relay handoffs, validator proposal,
            and finality checkpoints. Click through each stage to see what changes at
            every layer.
          </p>
        </div>
        <div className="etx-runtime">
          <div className="etx-runtime-row">
            <span>Runtime</span>
            <strong>Browser-only walkthrough</strong>
          </div>
          <div className="etx-runtime-row">
            <span>Data</span>
            <strong>Illustrative sample fields</strong>
          </div>
          <div className="etx-runtime-row">
            <span>Full build</span>
            <strong>
              <a
                href="https://github.com/DanDo385/eth-tx-lifecycle"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/DanDo385/eth-tx-lifecycle
              </a>
            </strong>
          </div>
        </div>
      </div>

      <div className="etx-flow" aria-label="Transaction lifecycle flow">
        <p className="etx-label">Lifecycle flow</p>
        <p className="etx-flow-summary">{flowSummary}</p>
        <div className="etx-flow-grid" role="tablist" aria-label="Lifecycle stages">
          {STAGES.map((stage, index) => (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={selectedStage === index}
              className={`etx-flow-step${selectedStage === index ? ' active' : ''}`}
              onClick={() => setSelectedStage(index)}
            >
              <span className="etx-flow-num">{String(index + 1).padStart(2, '0')}</span>
              <span className="etx-flow-name">{stage.flowLabel}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="etx-grid">
        <div className="etx-panel">
          <div className="etx-panel-head">
            <div>
              <p className="etx-label">{activeStage.eyebrow}</p>
              <h3>{activeStage.title}</h3>
            </div>
            <span className="etx-metric">{activeStage.metric}</span>
          </div>

          <div className="etx-stepper" role="tablist" aria-label="Stage selector">
            {STAGES.map((stage, index) => (
              <button
                key={stage.id}
                type="button"
                role="tab"
                aria-selected={selectedStage === index}
                className={`etx-step${selectedStage === index ? ' active' : ''}`}
                onClick={() => setSelectedStage(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {stage.shortLabel}
              </button>
            ))}
          </div>

          <div className="etx-stage">
            <p>{activeStage.summary}</p>
            <div className="etx-stage-signal">{activeStage.signal}</div>
          </div>

          <div className="etx-note">
            <p className="etx-label">Technical note</p>
            <p>{activeStage.technicalNote}</p>
          </div>
        </div>

        <div className="etx-panel">
          <div className="etx-panel-head">
            <div>
              <p className="etx-label">Sample data</p>
              <h3>{activeStage.shortLabel} snapshot</h3>
            </div>
            <span className="etx-metric etx-metric-static">Static demo</span>
          </div>

          <p className="etx-data-copy">
            Representative fields for this stage. The full visualizer fetches live
            mempool, relay, and beacon data through its Go backend.
          </p>

          <div className="etx-data-table">
            {activeStage.mockRows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>

          <div className="etx-nav">
            <button
              type="button"
              className="btn btn-secondary etx-nav-btn"
              onClick={() => setSelectedStage((current) => Math.max(0, current - 1))}
              disabled={selectedStage === 0}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-primary etx-nav-btn"
              onClick={() =>
                setSelectedStage((current) => Math.min(STAGES.length - 1, current + 1))
              }
              disabled={selectedStage === STAGES.length - 1}
            >
              {selectedStage === STAGES.length - 1 ? 'Complete' : 'Next stage'}
            </button>
          </div>
        </div>
      </div>

      <div className="etx-proof">
        <p className="etx-label">What this demonstrates</p>
        <ul>
          {PROOF_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
