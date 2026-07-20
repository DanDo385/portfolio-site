import Link from 'next/link';
import type { Article, Project, ProjectCardVariant, ResearchPaper } from '@/lib/types';
import {
  getProjectLinkSections,
  projectAnchorId,
  projectCardVariant,
  projectPath,
  tagClass,
} from '@/lib/utils';
import { ProjectCardLinks } from './ProjectCardLinks';
import { ProjectPreview } from './ProjectPreview';
import { Reveal } from './Reveal';

interface ProjectCardProps {
  project: Project;
  writingBySlug: Record<string, Article>;
  researchBySlug?: Record<string, ResearchPaper>;
  reveal?: boolean;
  variant?: ProjectCardVariant;
}

export function ProjectCard({
  project,
  writingBySlug,
  researchBySlug = {},
  reveal = true,
  variant,
}: ProjectCardProps) {
  const resolvedVariant = variant ?? projectCardVariant(project);
  const related =
    project.relatedWriting && writingBySlug[project.relatedWriting]?.status === 'published'
      ? writingBySlug[project.relatedWriting]
      : null;
  const relatedResearch =
    project.relatedResearch && researchBySlug[project.relatedResearch]?.status === 'published'
      ? researchBySlug[project.relatedResearch]
      : null;
  const linkSections = getProjectLinkSections(project);

  const card = (
    <article
      className={`pcard${resolvedVariant === 'compact' ? ' pcard-compact' : ''}`}
      id={projectAnchorId(project.slug)}
    >
      <div className="pcard-layout">
        <div className="pcard-main">
          <div className="pcard-head">
            <div>
              {resolvedVariant === 'featured' && (
                <p className="pcard-kicker">Flagship project</p>
              )}
              <h3 className="pcard-name">
                <Link href={projectPath(project.slug)} className="pcard-name-link">
                  {project.title}
                </Link>
              </h3>
              {project.status === 'in-progress' && (
                <span className="pcard-status">In progress</span>
              )}
            </div>
            <div className="pcard-tags">
              {project.tags.map((tag) => (
                <span key={tag} className={`tag ${tagClass(tag)}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="pcard-summary">{project.summary}</p>
          <ProjectCardLinks sections={linkSections} />
          {related && (
            <p className="pcard-related">
              Essay:{' '}
              <Link href={`/writing/${related.slug}`}>{related.title}</Link>
            </p>
          )}
          {relatedResearch && (
            <p className="pcard-related">
              Research:{' '}
              <Link href={`/agent-research/${relatedResearch.slug}`}>
                {relatedResearch.title}
              </Link>
            </p>
          )}
        </div>
        <div className="pcard-media">
          <ProjectPreview project={project} />
        </div>
      </div>
    </article>
  );

  return reveal ? <Reveal>{card}</Reveal> : card;
}
