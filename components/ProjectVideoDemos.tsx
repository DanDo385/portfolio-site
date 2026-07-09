import type { Project } from '@/lib/types';
import { getProjectVideoDemos } from '@/lib/utils';

interface ProjectVideoDemosProps {
  project: Project;
}

export function ProjectVideoDemos({ project }: ProjectVideoDemosProps) {
  const demos = getProjectVideoDemos(project);
  if (demos.length === 0) return null;

  return (
    <section className="project-video-demos" aria-labelledby="project-video-demos-title">
      <p className="section-label" id="project-video-demos-title">
        Video demos
      </p>
      <div className="project-video-grid">
        {demos.map((demo) => (
          <article key={demo.id} id={demo.id} className="project-video-item">
            <h3 className="project-video-label">{demo.label}</h3>
            <div className="project-video-embed">
              {demo.kind === 'youtube' ? (
                <iframe
                  src={demo.src}
                  title={`${project.title} ${demo.label}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <video
                  src={demo.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="project-video-mp4"
                  aria-label={`${project.title} ${demo.label}`}
                />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
