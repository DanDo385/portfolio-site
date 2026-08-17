import Link from 'next/link';
import { getProjectBySlug } from '@/lib/content';
import { projectPath } from '@/lib/utils';

interface ProjectRelatedProjectsProps {
  slugs: string[];
}

export function ProjectRelatedProjects({ slugs }: ProjectRelatedProjectsProps) {
  const related = slugs
    .map((slug) => getProjectBySlug(slug))
    .filter((project): project is NonNullable<typeof project> => Boolean(project));

  if (related.length === 0) return null;

  return (
    <section className="amd-detail related-projects" aria-labelledby="related-projects-title">
      <p className="section-label" id="related-projects-title">
        Linked demos
      </p>
      <ul className="related-projects-list">
        {related.map((project) => (
          <li key={project.slug}>
            <Link href={projectPath(project.slug)} className="related-projects-link">
              {project.title}
            </Link>
            <p className="related-projects-summary">{project.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
