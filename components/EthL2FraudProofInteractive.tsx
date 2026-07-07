'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type HealthState = 'idle' | 'loading' | 'online' | 'offline';

interface HealthAttempt {
  path: string;
  ok: boolean;
  status: number | null;
  statusText: string | null;
  bodySnippet: string | null;
  error: string | null;
}

interface HealthResponse {
  ok: boolean;
  apiBaseUrl: string;
  configuredBy: string;
  endpoint: string | null;
  status: number | null;
  statusText: string | null;
  bodySnippet: string | null;
  checkedAt: string;
  attempts: HealthAttempt[];
  message: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api-staging-eth-l2.magro.dev';

const STAGES = [
  {
    label: 'State Assertion',
    metric: 'Root posted',
    detail:
      'The rollup operator asserts a new L2 state root on L1. The system is not economically final until the challenge window clears.',
    signal: 'Finality is conditional',
  },
  {
    label: 'Challenge Window',
    metric: 'Dispute open',
    detail:
      'A challenger can contest the assertion and force the game into an evidence path. Bonds make false claims expensive.',
    signal: 'Capital at risk',
  },
  {
    label: 'Bisection Round',
    metric: 'Trace narrowed',
    detail:
      'The dispute narrows the execution trace until both actors identify the exact step where their state transitions diverge.',
    signal: 'Compute becomes evidence',
  },
  {
    label: 'Proof Check',
    metric: 'One-step proof',
    detail:
      'The final transition is verified against EVM semantics. The losing side is penalized and settlement can advance.',
    signal: 'Verification beats trust',
  },
];

const PROOF_POINTS = [
  'Models the optimistic rollup challenge path as settlement infrastructure, not a black box.',
  'Separates local browser explanation from the MBP-hosted Go staging service.',
  'Uses a same-origin Next.js proxy so the public page does not depend on browser CORS behavior.',
  'Fails closed: if the tunnel is down, the page still explains the system and reports the outage.',
];

function statusClass(state: HealthState): string {
  if (state === 'online') return 'l2-status l2-status-online';
  if (state === 'offline') return 'l2-status l2-status-offline';
  if (state === 'loading') return 'l2-status l2-status-loading';
  return 'l2-status';
}

function statusLabel(state: HealthState): string {
  if (state === 'online') return 'Staging online';
  if (state === 'offline') return 'Backend offline';
  if (state === 'loading') return 'Checking tunnel';
  return 'Not checked';
}

function formatTime(value?: string): string {
  if (!value) return 'Not checked yet';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value));
}

export function EthL2FraudProofInteractive() {
  const [selectedStage, setSelectedStage] = useState(0);
  const [healthState, setHealthState] = useState<HealthState>('idle');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const activeStage = STAGES[selectedStage];

  const checkHealth = useCallback(async () => {
    setHealthState('loading');
    setClientError(null);

    try {
      const response = await fetch('/api/demos/eth-l2/health', {
        cache: 'no-store',
        headers: { accept: 'application/json' },
      });
      const payload = (await response.json()) as HealthResponse;
      setHealth(payload);
      setHealthState(payload.ok ? 'online' : 'offline');
    } catch (error) {
      setHealth(null);
      setHealthState('offline');
      setClientError(error instanceof Error ? error.message : 'Unable to check backend status.');
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  const latestAttempt = useMemo(() => health?.attempts.find((attempt) => attempt.status) ?? health?.attempts[0], [health]);
  const backendMessage = clientError || health?.message || 'Click the status check to query the staging backend.';

  return (
    <section className="l2-detail" aria-labelledby="l2-detail-title">
      <div className="l2-hero">
        <div>
          <p className="l2-kicker">Interactive Technical Demo</p>
          <h2 id="l2-detail-title">Fraud-proof settlement, made inspectable.</h2>
          <p>
            Optimistic rollups are settlement infrastructure. They trade immediate execution
            for a challenge window, bonded actors, and verifiable dispute resolution. This
            page walks through that path and checks the staging Go backend running behind a
            Cloudflare Tunnel.
          </p>
        </div>
        <div className="l2-runtime">
          <div className="l2-runtime-row">
            <span>Browser</span>
            <strong>Local deterministic walkthrough</strong>
          </div>
          <div className="l2-runtime-row">
            <span>Backend</span>
            <strong>MBP Go service via Cloudflare Tunnel</strong>
          </div>
          <div className="l2-runtime-row">
            <span>Origin</span>
            <strong>{health?.apiBaseUrl || API_BASE}</strong>
          </div>
        </div>
      </div>

      <div className="l2-grid">
        <div className="l2-panel">
          <div className="l2-panel-head">
            <div>
              <p className="l2-label">Challenge Path</p>
              <h3>{activeStage.label}</h3>
            </div>
            <span className="l2-metric">{activeStage.metric}</span>
          </div>

          <div className="l2-stepper" role="tablist" aria-label="Fraud proof stages">
            {STAGES.map((stage, index) => (
              <button
                key={stage.label}
                type="button"
                role="tab"
                aria-selected={selectedStage === index}
                className={`l2-step${selectedStage === index ? ' active' : ''}`}
                onClick={() => setSelectedStage(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {stage.label}
              </button>
            ))}
          </div>

          <div className="l2-stage">
            <p>{activeStage.detail}</p>
            <div className="l2-stage-signal">{activeStage.signal}</div>
          </div>
        </div>

        <div className="l2-panel">
          <div className="l2-panel-head">
            <div>
              <p className="l2-label">Backend Status</p>
              <h3>Staging tunnel</h3>
            </div>
            <span className={statusClass(healthState)}>{statusLabel(healthState)}</span>
          </div>

          <p className="l2-status-copy">{backendMessage}</p>

          <div className="l2-status-table">
            <div>
              <span>Checked</span>
              <strong>{formatTime(health?.checkedAt)}</strong>
            </div>
            <div>
              <span>Endpoint</span>
              <strong>{health?.endpoint || latestAttempt?.path || 'Health contract pending'}</strong>
            </div>
            <div>
              <span>HTTP</span>
              <strong>
                {latestAttempt?.status
                  ? `${latestAttempt.status}${latestAttempt.statusText ? ` ${latestAttempt.statusText}` : ''}`
                  : 'No response'}
              </strong>
            </div>
          </div>

          {latestAttempt?.bodySnippet && (
            <pre className="l2-response">{latestAttempt.bodySnippet}</pre>
          )}

          <button
            type="button"
            className="btn btn-primary l2-check"
            onClick={checkHealth}
            disabled={healthState === 'loading'}
          >
            {healthState === 'loading' ? 'Checking...' : 'Check backend'}
          </button>
        </div>
      </div>

      <div className="l2-proof">
        <p className="l2-label">What this proves technically</p>
        <ul>
          {PROOF_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="l2-contract">
        <p className="l2-label">Backend contract</p>
        <p>
          The current portfolio integration only assumes a health/status endpoint. Once the Go
          service exposes a scenario endpoint, this panel can call it through the same proxy
          path without exposing private LAN addresses or requiring users to run local software.
        </p>
      </div>
    </section>
  );
}
