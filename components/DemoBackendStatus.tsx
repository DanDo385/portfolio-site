'use client';

import { useCallback, useEffect, useState } from 'react';

type HealthState = 'idle' | 'loading' | 'online' | 'offline';

interface HealthResponse {
  ok: boolean;
  apiBaseUrl: string;
  message: string;
  checkedAt: string;
}

interface DemoBackendStatusProps {
  /** Registry slug under /api/demos/<slug>/health */
  demoSlug: string;
  defaultOrigin: string;
}

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

export function DemoBackendStatus({ demoSlug, defaultOrigin }: DemoBackendStatusProps) {
  const [healthState, setHealthState] = useState<HealthState>('idle');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setHealthState('loading');
    setClientError(null);

    try {
      const response = await fetch(`/api/demos/${demoSlug}/health`, {
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
  }, [demoSlug]);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  const message =
    clientError || health?.message || 'Click check to query the staging backend.';

  return (
    <div className="demo-backend-status">
      <div className="demo-backend-status-row">
        <span className={statusClass(healthState)}>{statusLabel(healthState)}</span>
        <button
          type="button"
          className="btn btn-secondary demo-backend-check"
          onClick={checkHealth}
          disabled={healthState === 'loading'}
        >
          {healthState === 'loading' ? 'Checking…' : 'Check backend'}
        </button>
      </div>
      <p className="demo-backend-status-copy">{message}</p>
      <p className="demo-backend-origin">
        Origin: <strong>{health?.apiBaseUrl || defaultOrigin}</strong>
      </p>
    </div>
  );
}
