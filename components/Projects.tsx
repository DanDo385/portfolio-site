import type { Article, Project, ResearchPaper } from '@/lib/types';
import { projectTier } from '@/lib/content';
import { ProjectCard } from './ProjectCard';
import { Reveal } from './Reveal';

interface ProjectsProps {
  projects: Project[];
  writingBySlug: Record<string, Article>;
  researchBySlug?: Record<string, ResearchPaper>;
}

export function Projects({ projects, writingBySlug, researchBySlug = {} }: ProjectsProps) {
  // `projects` is already sorted by date, newest first, via lib/content.ts#getProjects.
  const primary = projects.filter((project) => projectTier(project) === 'primary');
  const foundations = projects.filter((project) => projectTier(project) === 'foundations');

  return (
    <section id="projects">
      <div className="container">
        <Reveal>
          <div className="section-label">Selected Projects</div>
          <p className="about-intro">
            Systems around live markets, permissionless rails, and early-stage product work.
          </p>
        </Reveal>
        <div className="projects-primary-list">
          {primary.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              writingBySlug={writingBySlug}
              researchBySlug={researchBySlug}
              variant="compact"
            />
          ))}
        </div>
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
                    researchBySlug={researchBySlug}
                    reveal={false}
                    variant="compact"
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
