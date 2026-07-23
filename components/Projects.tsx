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
  // `projects` is already sorted featured-first (in canonical flagship order), then by
  // date, via lib/content.ts#getProjects. Filtering here preserves that order.
  const primary = projects.filter((project) => projectTier(project) === 'primary');
  const foundations = projects.filter((project) => projectTier(project) === 'foundations');
  const featured = primary.filter((project) => project.featured);
  const supporting = primary.filter((project) => !project.featured);

  return (
    <section id="projects">
      <div className="container">
        <Reveal>
          <div className="section-label">Selected Projects</div>
        </Reveal>
        {featured.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            writingBySlug={writingBySlug}
            researchBySlug={researchBySlug}
            variant="featured"
          />
        ))}
        {supporting.length > 0 && (
          <div className="projects-supporting">
            <Reveal>
              <div className="projects-supporting-label">Additional technical work</div>
            </Reveal>
            <div className="projects-supporting-list">
              {supporting.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  writingBySlug={writingBySlug}
                  researchBySlug={researchBySlug}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
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
