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
    id: 'custody',
    label: 'Institutional custody & controls',
    note: 'Signing policy, approval workflows, and treasury controls for digital-asset operations.',
  },
  {
    id: 'market-structure',
    label: 'Market structure & rates',
    note: 'Funding, basis, credit, and on-chain market mechanics through a rates lens.',
  },
  {
    id: 'agentic',
    label: 'Agentic operations',
    note: 'Agent observability and runtime tooling for operational workflows.',
  },
  {
    id: 'labs',
    label: 'Other / labs',
    note: 'Teaching labs, site infrastructure, and earlier EVM tooling.',
    collapsed: true,
  },
];

const CLUSTER_PRIORITY: Partial<Record<ProjectCluster, string[]>> = {
  custody: ['treasury-policy-engine'],
  'market-structure': ['funding-rate-basis-benchmark'],
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
            Custody controls, market-structure tooling, and agentic operations for institutional
            digital-asset adoption.
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
                  variant="compact"
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
