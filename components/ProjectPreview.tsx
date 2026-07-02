import type { Project } from '@/lib/types';
import { validScreenshots } from '@/lib/utils';
import { AgentJsonPreview } from './AgentJsonPreview';
import { ScreenshotCarousel } from './ScreenshotCarousel';

interface ProjectPreviewProps {
  project: Project;
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  const screenshots = validScreenshots(project.screenshots);

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
