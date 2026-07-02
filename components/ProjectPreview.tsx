import type { Project } from '@/lib/types';
import { isValidUrl, loomEmbedUrl, shouldEmbedDemo, validScreenshots } from '@/lib/utils';
import { AgentJsonPreview } from './AgentJsonPreview';
import { ScreenshotCarousel } from './ScreenshotCarousel';

interface ProjectPreviewProps {
  project: Project;
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  const screenshots = validScreenshots(project.screenshots);
  const loomEmbed = loomEmbedUrl(project.loomUrl);

  if (screenshots.length > 0) {
    return <ScreenshotCarousel title={project.title} screenshots={screenshots} />;
  }

  if (loomEmbed) {
    return (
      <div className="loom-embed">
        <iframe src={loomEmbed} loading="lazy" allowFullScreen title="Project demo video" />
      </div>
    );
  }

  if (project.previewType === 'agent-json') {
    return <AgentJsonPreview />;
  }

  if (shouldEmbedDemo(project.demoUrl, project.previewType)) {
    return (
      <div className="demo-embed">
        <iframe src={project.demoUrl!} loading="lazy" title={`${project.title} live demo`} />
      </div>
    );
  }

  return (
    <div className="media-placeholder" role="img" aria-label={`Preview pending for ${project.title}`}>
      Preview pending
    </div>
  );
}
