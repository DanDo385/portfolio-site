import type { Project, ProjectCluster } from './types';
import { projectCluster } from './content';

export type ListedProjectCluster = Exclude<ProjectCluster, 'custody'>;

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
    label: 'Trading Research',
    note: 'Funding, basis, carry, and systematic research frameworks for digital-asset markets.',
    featured: true,
  },
  {
    id: 'walkthroughs',
    label: 'Interactive Walkthroughs',
    note: 'Guided, in-browser labs that unpack a mechanism. Static pages and teaching tools, not hosted chains or live agents.',
  },
  {
    id: 'agentic',
    label: 'Agent Surfaces',
    note: 'Structured context so AI systems can read this site. Orchestration and documentation, not a trading bot.',
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
  walkthroughs: ['agent-runtime', 'hermes-xray', 'ai-physical-infra-debt', 'space-time'],
  agentic: ['portfolio-agent-mode'],
  infra: [
    'op-ephemeral-evm-signer',
    'airgap-tx-signer',
    'solana-treasury-vault',
    'treasury-policy-engine',
  ],
  labs: ['solidity-copilot', 'eth-rpc-monitor'],
};

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

export function projectsForCluster(
  projects: Project[],
  clusterId: ListedProjectCluster
): Project[] {
  return sortByClusterPriority(
    projects.filter((project) => projectCluster(project) === clusterId),
    clusterId
  );
}
