import type { Article, Project, ResearchPaper } from '@/lib/types';
import { PROJECT_CLUSTERS, projectsForCluster } from '@/lib/project-clusters';
import { ProjectCard } from './ProjectCard';
import { Reveal } from './Reveal';

interface ProjectsProps {
  projects: Project[];
  writingBySlug: Record<string, Article>;
  researchBySlug?: Record<string, ResearchPaper>;
}

export function Projects({ projects, writingBySlug, researchBySlug = {} }: ProjectsProps) {
  return (
    <section id="projects">
      <div className="container">
        <Reveal>
          <div className="section-label">Selected Projects</div>
          <p className="about-intro">
            Hosted protocol labs first: AMM simulation, rollup disputes, and transaction
            lifecycle. Then trading research, guided walkthroughs, and the infrastructure that
            moves digital assets.
          </p>
        </Reveal>
        {PROJECT_CLUSTERS.map((cluster) => {
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
                  variant={cluster.featured ? 'featured' : 'compact'}
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
