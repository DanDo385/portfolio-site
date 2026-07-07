import type { Article, Project } from '@/lib/types';
import { ProjectCard } from './ProjectCard';
import { Reveal } from './Reveal';

interface ProjectsProps {
  projects: Project[];
  writingBySlug: Record<string, Article>;
}

export function Projects({ projects, writingBySlug }: ProjectsProps) {
  return (
    <section id="projects">
      <div className="container">
        <Reveal>
          <div className="section-label">Projects</div>
        </Reveal>
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            writingBySlug={writingBySlug}
          />
        ))}
      </div>
    </section>
  );
}
