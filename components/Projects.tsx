import type { Article, Project } from '@/lib/types';
import { projectTier } from '@/lib/content';
import { ProjectCard } from './ProjectCard';
import { Reveal } from './Reveal';

interface ProjectsProps {
  projects: Project[];
  writingBySlug: Record<string, Article>;
}

export function Projects({ projects, writingBySlug }: ProjectsProps) {
  const primary = projects.filter((project) => projectTier(project) === 'primary');
  const foundations = projects.filter((project) => projectTier(project) === 'foundations');

  return (
    <section id="projects">
      <div className="container">
        <Reveal>
          <div className="section-label">Projects</div>
        </Reveal>
        {primary.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            writingBySlug={writingBySlug}
          />
        ))}
        {foundations.length > 0 && (
          <Reveal delay={40}>
            <details className="projects-foundations">
              <summary>
                <span className="projects-foundations-label">Foundations</span>
                <span className="projects-foundations-note">
                  Earlier EVM and DeFi mechanics work that led into the labs above
                </span>
              </summary>
              <div className="projects-foundations-list">
                {foundations.map((project) => (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    writingBySlug={writingBySlug}
                    reveal={false}
                  />
                ))}
              </div>
            </details>
          </Reveal>
        )}
      </div>
    </section>
  );
}
