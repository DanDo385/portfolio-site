import Link from 'next/link';
import type { Article, Project } from '@/lib/types';
import {
  getProjectLinkSections,
  projectAnchorId,
  projectPath,
  tagClass,
} from '@/lib/utils';
import { ProjectCardLinks } from './ProjectCardLinks';
import { ProjectPreview } from './ProjectPreview';
import { Reveal } from './Reveal';

interface ProjectCardProps {
  project: Project;
  writingBySlug: Record<string, Article>;
  reveal?: boolean;
}

export function ProjectCard({ project, writingBySlug, reveal = true }: ProjectCardProps) {
  const related =
    project.relatedWriting && writingBySlug[project.relatedWriting]?.status === 'published'
      ? writingBySlug[project.relatedWriting]
      : null;
  const linkSections = getProjectLinkSections(project);

  const card = (
    <article className="pcard" id={projectAnchorId(project.slug)}>
      <div className="pcard-layout">
        <div className="pcard-main">
          <div className="pcard-head">
            <div>
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
          <div className="pcard-tech">
            {project.techBadges.map((badge) => (
              <span key={badge} className="tbadge">
                {badge}
              </span>
            ))}
          </div>
          <ProjectCardLinks sections={linkSections} />
          {related && (
            <p className="pcard-related">
              Essay:{' '}
              <Link href={`/writing/${related.slug}`}>{related.title}</Link>
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
