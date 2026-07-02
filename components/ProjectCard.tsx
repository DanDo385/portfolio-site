import Link from 'next/link';
import type { Article, Project } from '@/lib/types';
import { isValidUrl, loomEmbedUrl, projectAnchorId, projectPath, tagClass, validScreenshots } from '@/lib/utils';
import { Reveal } from './Reveal';
import { ScreenshotCarousel } from './ScreenshotCarousel';

interface ProjectCardProps {
  project: Project;
  writingBySlug: Record<string, Article>;
  reveal?: boolean;
}

export function ProjectCard({ project, writingBySlug, reveal = true }: ProjectCardProps) {
  const screenshots = validScreenshots(project.screenshots);
  const loomEmbed = loomEmbedUrl(project.loomUrl);
  const related =
    project.relatedWriting && writingBySlug[project.relatedWriting]?.status === 'published'
      ? writingBySlug[project.relatedWriting]
      : null;

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
          <div className="pcard-links">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                className="pcard-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub <span>&rarr;</span>
              </a>
            )}
            {isValidUrl(project.demoUrl) && (
              <a
                href={project.demoUrl!}
                className="pcard-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Live demo <span>&rarr;</span>
              </a>
            )}
          </div>
          {related && (
            <p className="pcard-related">
              Essay:{' '}
              <Link href={`/writing/${related.slug}`}>{related.title}</Link>
            </p>
          )}
        </div>
        <div className="pcard-media">
          <ScreenshotCarousel title={project.title} screenshots={screenshots} />
          {isValidUrl(project.demoUrl) && (
            <div className="demo-embed">
              <iframe
                src={project.demoUrl!}
                loading="lazy"
                title={`${project.title} live demo`}
              />
            </div>
          )}
          {loomEmbed && (
            <div className="loom-embed">
              <iframe src={loomEmbed} loading="lazy" allowFullScreen title="Project demo video" />
            </div>
          )}
        </div>
      </div>
    </article>
  );

  return reveal ? <Reveal>{card}</Reveal> : card;
}
