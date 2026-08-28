import type { Article, Project, ProjectCluster, ResearchPaper } from '@/lib/types';
import { projectCluster } from '@/lib/content';
import { ProjectCard } from './ProjectCard';
import { Reveal } from './Reveal';

interface ProjectsProps {
  projects: Project[];
  writingBySlug: Record<string, Article>;
  researchBySlug?: Record<string, ResearchPaper>;
}

const CLUSTERS: Array<{
  id: ProjectCluster;
  label: string;
  note: string;
  collapsed?: boolean;
}> = [
  {
    id: 'trading-research',
    label: 'Trading Research',
    note: 'Funding, basis, carry, and systematic research frameworks for digital-asset markets.',
  },
  {
    id: 'market-structure',
    label: 'Market Structure & Execution',
    note: 'Liquidity, AMM economics, transaction mechanics, MEV-aware infrastructure, and credit risk through a markets lens.',
  },
  {
    id: 'agentic',
    label: 'Agentic Trading Systems',
    note: 'Agent orchestration and observability as a research layer. Deterministic systems retain control of risk and execution.',
  },
  {
    id: 'infra',
    label: 'Digital-Asset Infrastructure',
    note: 'Signing, policy, and treasury controls that show how digital assets actually move. Support for the trading story, not the primary hiring pitch.',
  },
  {
    id: 'labs',
    label: 'Other Engineering Labs',
    note: 'Technically useful work that does not lead the markets thesis.',
    collapsed: true,
  },
];

const CLUSTER_PRIORITY: Partial<Record<ProjectCluster, string[]>> = {
  'trading-research': ['funding-rate-basis-benchmark'],
  'market-structure': [
    'eth-amm-sim',
    'eth-tx-lifecycle',
    'ai-physical-infra-debt',
    'eth-rpc-monitor',
    'eth-l2',
  ],
  agentic: ['hermes-xray', 'agent-runtime', 'portfolio-agent-mode'],
  infra: [
    'op-ephemeral-evm-signer',
    'airgap-tx-signer',
    'solana-treasury-vault',
    'treasury-policy-engine',
  ],
  labs: ['solidity-copilot', 'space-time'],
};

function projectsForCluster(projects: Project[], clusterId: ProjectCluster): Project[] {
  const priority = CLUSTER_PRIORITY[clusterId] ?? [];
  return projects
    .filter((project) => projectCluster(project) === clusterId)
    .sort((a, b) => {
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

export function Projects({ projects, writingBySlug, researchBySlug = {} }: ProjectsProps) {
  return (
    <section id="projects">
      <div className="container">
        <Reveal>
          <div className="section-label">Selected Projects</div>
          <p className="about-intro">
            Trading research first, then market structure, agent systems, and the infrastructure
            that moves digital assets. Evidence over job-title claims.
          </p>
        </Reveal>
        {CLUSTERS.map((cluster) => {
          const clusterProjects = projectsForCluster(projects, cluster.id);
          if (clusterProjects.length === 0) return null;

          const list = (
            <div className="projects-cluster-list">
              {clusterProjects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  writingBySlug={writingBySlug}
                  researchBySlug={researchBySlug}
                  reveal={!cluster.collapsed}
                  variant={cluster.id === 'trading-research' ? 'featured' : 'compact'}
                />
              ))}
            </div>
          );

          if (cluster.collapsed) {
            return (
              <Reveal key={cluster.id} delay={40}>
                <details className="projects-cluster projects-cluster-collapsed">
                  <summary>
                    <span className="projects-cluster-label">{cluster.label}</span>
                    <span className="projects-cluster-note">{cluster.note}</span>
                  </summary>
                  {list}
                </details>
              </Reveal>
            );
          }

          return (
            <div key={cluster.id} className="projects-cluster">
              <Reveal>
                <div className="projects-cluster-label">{cluster.label}</div>
                <p className="projects-cluster-note">{cluster.note}</p>
              </Reveal>
              {list}
            </div>
          );
        })}
      </div>
    </section>
  );
}
