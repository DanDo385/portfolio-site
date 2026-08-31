import type { Project, ProjectCluster } from './types';
import { projectCluster } from './content';

export type ListedProjectCluster = Exclude<ProjectCluster, 'custody' | 'agentic'>;

export const PROJECT_CLUSTERS: Array<{
  id: ListedProjectCluster;
  label: string;
  note: string;
  collapsed?: boolean;
  featured?: boolean;
}> = [
  {
    id: 'market-structure',
    label: 'Protocol Labs',
    note: 'Hosted apps with their own backends. You can run the swap, the dispute, or the inclusion path instead of only reading about it.',
    featured: true,
  },
  {
    id: 'trading-research',
    label: 'Trading Lab',
    note: 'Funding, basis, carry, and market-structure notes for digital-asset markets.',
    featured: true,
  },
  {
    id: 'interactive-ai',
    label: 'Interactive AI Projects',
    note: 'In-browser agent runtime, observability, and Agent Mode surfaces. Research and documentation tooling, not a trading bot.',
    featured: true,
  },
  {
    id: 'walkthroughs',
    label: 'Interactive Walkthroughs',
    note: 'Guided labs that unpack a market mechanism. Teaching tools, not hosted chains.',
  },
  {
    id: 'infra',
    label: 'Digital-Asset Infrastructure',
    note: 'Signing, policy, and treasury controls that show how digital assets actually move.',
  },
  {
    id: 'labs',
    label: 'Other Technical Labs',
    note: 'Technically useful work that does not lead the systems or markets story.',
    collapsed: true,
  },
];

export const CLUSTER_PRIORITY: Partial<Record<ListedProjectCluster, string[]>> = {
  'market-structure': ['eth-amm-sim', 'eth-l2', 'eth-tx-lifecycle'],
  'trading-research': ['funding-rate-basis-benchmark'],
  'interactive-ai': ['portfolio-agent-mode', 'hermes-xray', 'agent-runtime'],
  walkthroughs: ['ai-physical-infra-debt'],
  infra: [
    'op-ephemeral-evm-signer',
    'airgap-tx-signer',
    'solana-treasury-vault',
    'treasury-policy-engine',
  ],
  labs: ['solidity-copilot', 'eth-rpc-monitor'],
};

export const IN_PROGRESS_PRIORITY = [
  'funding-rate-basis-benchmark',
  'treasury-policy-engine',
  'op-ephemeral-evm-signer',
  'airgap-tx-signer',
  'solana-treasury-vault',
  'solidity-copilot',
  'eth-rpc-monitor',
] as const;

export const CLUSTER_LABELS: Record<ListedProjectCluster, string> = Object.fromEntries(
  PROJECT_CLUSTERS.map((cluster) => [cluster.id, cluster.label])
) as Record<ListedProjectCluster, string>;

export function sortByClusterPriority<T extends { slug: string; date: string }>(
  items: T[],
  clusterId: ListedProjectCluster
): T[] {
  const priority = CLUSTER_PRIORITY[clusterId] ?? [];
  return [...items].sort((a, b) => {
    const ai = priority.indexOf(a.slug);
    const bi = priority.indexOf(b.slug);
    const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (aRank !== bRank) return aRank - bRank;
    const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (byDate !== 0) return byDate;
    return a.slug.localeCompare(b.slug);
  });
}

function sortInProgress<T extends { slug: string; date: string }>(items: T[]): T[] {
  const priority = [...IN_PROGRESS_PRIORITY];
  return [...items].sort((a, b) => {
    const ai = priority.indexOf(a.slug as (typeof IN_PROGRESS_PRIORITY)[number]);
    const bi = priority.indexOf(b.slug as (typeof IN_PROGRESS_PRIORITY)[number]);
    const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (aRank !== bRank) return aRank - bRank;
    const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (byDate !== 0) return byDate;
    return a.slug.localeCompare(b.slug);
  });
}

/** Complete projects only for thematic clusters. */
export function projectsForCluster(
  projects: Project[],
  clusterId: ListedProjectCluster
): Project[] {
  return sortByClusterPriority(
    projects.filter(
      (project) => project.status !== 'in-progress' && projectCluster(project) === clusterId
    ),
    clusterId
  );
}

export function projectsInProgress(projects: Project[]): Project[] {
  return sortInProgress(projects.filter((project) => project.status === 'in-progress'));
}
