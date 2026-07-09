export type DemoSlug = 'eth-l2' | 'eth-tx';

export interface DemoConfig {
  slug: DemoSlug;
  projectSlug: string;
  name: string;
  apiBaseEnv: string;
  defaultApiBaseUrl: string;
  healthPaths: string[];
}

export const DEMO_CONFIGS: Record<DemoSlug, DemoConfig> = {
  'eth-l2': {
    slug: 'eth-l2',
    projectSlug: 'eth-l2-fraud-proof',
    name: 'Eth-L2 Fraud Proof Simulation',
    apiBaseEnv: 'NEXT_PUBLIC_API_URL',
    defaultApiBaseUrl: 'https://api-staging-eth-l2.magro.dev',
    healthPaths: ['/health', '/api/health', '/status'],
  },
  'eth-tx': {
    slug: 'eth-tx',
    projectSlug: 'eth-tx-lifecycle',
    name: 'Ethereum Transaction Lifecycle',
    apiBaseEnv: 'NEXT_PUBLIC_ETH_TX_API_URL',
    defaultApiBaseUrl: 'https://api-staging-eth-tx.magro.dev',
    healthPaths: ['/api/health', '/api/health/live', '/api/health/ready'],
  },
};

export function getDemoConfig(slug: string): DemoConfig | null {
  return slug in DEMO_CONFIGS ? DEMO_CONFIGS[slug as DemoSlug] : null;
}

export function getDemoApiBaseUrl(config: DemoConfig): string {
  const configured = process.env[config.apiBaseEnv]?.trim();
  return configured || config.defaultApiBaseUrl;
}

export function joinApiUrl(baseUrl: string, path: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function projectHasStagingBackend(projectSlug: string): boolean {
  return Object.values(DEMO_CONFIGS).some((config) => config.projectSlug === projectSlug);
}
