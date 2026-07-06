import type { Project } from '@/lib/types';
import { isValidUrl, validScreenshots } from '@/lib/utils';
import { AgentJsonPreview } from './AgentJsonPreview';
import { ScreenshotCarousel } from './ScreenshotCarousel';

interface ProjectPreviewProps {
  project: Project;
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  const screenshots = validScreenshots(project.screenshots);

  if (isValidUrl(project.previewGif)) {
    return (
      <div className="preview-gif">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.previewGif!}
          alt={`${project.title} demo`}
          loading="lazy"
          className="preview-gif-img"
        />
      </div>
    );
  }

  if (isValidUrl(project.previewVideo)) {
    return (
      <div className="preview-video">
        <video
          src={project.previewVideo!}
          autoPlay
          loop
          muted
          playsInline
          controls
          className="preview-video-el"
          poster={screenshots[0]}
          aria-label={`${project.title} demo`}
        />
      </div>
    );
  }

  if (screenshots.length > 0) {
    return <ScreenshotCarousel title={project.title} screenshots={screenshots} />;
  }

  if (project.previewType === 'agent-json') {
    return <AgentJsonPreview />;
  }

  return (
    <div className="media-placeholder" role="img" aria-label={`Preview pending for ${project.title}`}>
      Preview pending
    </div>
  );
}
