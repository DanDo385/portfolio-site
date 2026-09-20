import Link from 'next/link';
import type { Article, Project, ResearchPaper } from '@/lib/types';
import { FEATURED_WORK } from '@/lib/featured-work';
import { PROJECT_CLUSTERS, projectsForCluster, projectsInProgress } from '@/lib/project-clusters';
import { getProjectLinkSections, projectAnchorId, projectPath } from '@/lib/utils';

interface ProjectsProps {
  projects: Project[];
  writingBySlug: Record<string, Article>;
  researchBySlug?: Record<string, ResearchPaper>;
}

function ProjectRow({ project }: { project: Project }) {
  return <Link href={projectPath(project.slug)} className="work-row" id={projectAnchorId(project.slug)}>
    <span><strong>{project.title}</strong><small>{project.summary}</small></span>
    <span className="work-row-status">{project.status === 'in-progress' ? (project.statusLabel || 'In progress') : 'View project'} <span aria-hidden="true">↗</span></span>
  </Link>;
}

export function Projects({ projects }: ProjectsProps) {
  const selected = FEATURED_WORK.flatMap((work) => {
    const project = projects.find((p) => p.slug === work.slug && p.status !== 'in-progress');
    return project ? [{ work, project }] : [];
  });
  const selectedSlugs = new Set(selected.map(({ project }) => project.slug));
  const remaining = projects.filter((p) => !selectedSlugs.has(p.slug));
  const inProgress = projectsInProgress(projects);

  return <section id="projects" className="selected-work-section"><div className="container">
    <div className="section-heading"><div><p className="eyebrow">01 / Selected work</p><h2>Built to be explored.</h2></div><p>Working software, interactive labs, and research at the intersection of AI and finance.</p></div>
    <div className="selected-work-grid">
      {selected.map(({ work, project }, index) => {
        const preview = project.screenshots?.[0] || project.previewGif;
        const demo = getProjectLinkSections(project).find((section) => section.title === 'Interact')?.links[0];
        return <article className="work-card" key={project.slug} id={projectAnchorId(project.slug)}>
          <Link href={projectPath(project.slug)} className="work-preview" aria-label={`Read about ${project.title}`}>
            <div className="work-preview-bar"><span>{String(index + 1).padStart(2, '0')} / {work.discipline}</span><span aria-hidden="true">↗</span></div>
            {preview ? <img src={preview} alt={`${project.title} interface`} loading="lazy" width="1200" height="750" /> : <div className="work-preview-fallback"><span>{project.title}</span></div>}
          </Link>
          <div className="work-card-body"><p className="work-format">{work.format}</p><h3><Link href={projectPath(project.slug)}>{work.title}</Link></h3><p>{work.summary}</p><p className="work-evidence">{work.evidence}</p><div className="work-card-links">
            <Link href={projectPath(project.slug)}>View project <span aria-hidden="true">↗</span></Link>
            {demo && <a href={demo.href} target={!demo.internal ? '_blank' : undefined} rel={!demo.internal ? 'noopener noreferrer' : undefined}>Explore demo</a>}
            {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">Source</a>}
          </div></div>
        </article>;
      })}
    </div>
    <details className="work-archive"><summary><span>More projects & technical labs</span><span>{remaining.filter((p) => p.status !== 'in-progress').length} projects</span></summary><div>
      {PROJECT_CLUSTERS.map((cluster) => {
        const items = projectsForCluster(remaining, cluster.id);
        return items.length ? <div className="work-archive-group" key={cluster.id}><h3>{cluster.label}</h3>{items.map((project) => <ProjectRow project={project} key={project.slug} />)}</div> : null;
      })}
    </div></details>
    {inProgress.length > 0 && <details className="work-archive"><summary><span>In progress</span><span>{inProgress.length} explorations</span></summary><div>{inProgress.map((project) => <ProjectRow project={project} key={project.slug} />)}</div></details>}
  </div></section>;
}
