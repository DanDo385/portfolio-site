import type { Article, Project, ResearchPaper } from '@/lib/types';
import {
  PROJECT_CLUSTERS,
  projectsForCluster,
  projectsInProgress,
} from '@/lib/project-clusters';
import { ProjectCard } from './ProjectCard';
import { Reveal } from './Reveal';

interface ProjectsProps {
  projects: Project[];
  writingBySlug: Record<string, Article>;
  researchBySlug?: Record<string, ResearchPaper>;
}

function renderProjectList(
  clusterProjects: Project[],
  writingBySlug: Record<string, Article>,
  researchBySlug: Record<string, ResearchPaper>,
  options: { reveal: boolean; featured?: boolean }
) {
  return (
    <div className="projects-cluster-list">
      {clusterProjects.map((project) => (
        <ProjectCard
          key={project.slug}
          project={project}
          writingBySlug={writingBySlug}
          researchBySlug={researchBySlug}
          reveal={options.reveal}
          variant={options.featured ? 'featured' : 'compact'}
        />
      ))}
    </div>
  );
}

export function Projects({ projects, writingBySlug, researchBySlug = {} }: ProjectsProps) {
  const inProgress = projectsInProgress(projects);
  const openClusters = PROJECT_CLUSTERS.filter((cluster) => !cluster.collapsed);
  const collapsedClusters = PROJECT_CLUSTERS.filter((cluster) => cluster.collapsed);

  function renderCluster(
    cluster: (typeof PROJECT_CLUSTERS)[number],
    clusterProjects: Project[]
  ) {
    const list = renderProjectList(clusterProjects, writingBySlug, researchBySlug, {
      reveal: !cluster.collapsed,
      featured: cluster.featured,
    });

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
  }

  return (
    <section id="projects">
      <div className="container">
        <Reveal>
          <div className="section-label">Selected Projects</div>
          <p className="about-intro">
            Hosted protocol labs, interactive AI surfaces, and market walkthroughs. In-progress
            work sits in its own section so status stays clear.
          </p>
        </Reveal>
        {openClusters.map((cluster) => {
          const clusterProjects = projectsForCluster(projects, cluster.id);
          if (clusterProjects.length === 0) return null;
          return renderCluster(cluster, clusterProjects);
        })}

        {inProgress.length > 0 ? (
          <div className="projects-cluster">
            <Reveal>
              <div className="projects-cluster-label">In Progress</div>
              <p className="projects-cluster-note">
                Active builds and research. Status labels stay honest; nothing here is finished
                work presented as complete.
              </p>
            </Reveal>
            {renderProjectList(inProgress, writingBySlug, researchBySlug, { reveal: true })}
          </div>
        ) : null}

        {collapsedClusters.map((cluster) => {
          const clusterProjects = projectsForCluster(projects, cluster.id);
          if (clusterProjects.length === 0) return null;
          return renderCluster(cluster, clusterProjects);
        })}
      </div>
    </section>
  );
}
