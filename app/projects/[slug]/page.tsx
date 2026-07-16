import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { AgentRuntimeInteractive } from '@/components/AgentRuntimeInteractive';
import { HermesXrayInteractive } from '@/components/HermesXrayInteractive';
import { EthL2Interactive } from '@/components/EthL2Interactive';
import { EthTxLifecycleInteractive } from '@/components/EthTxLifecycleInteractive';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectCaseStudy } from '@/components/ProjectCaseStudy';
import { ProjectVideoDemos } from '@/components/ProjectVideoDemos';
import { SiteNav } from '@/components/SiteNav';
import { Reveal } from '@/components/Reveal';
import {
  getProjectBySlug,
  getProjectSlugs,
  getPublishedWriting,
} from '@/lib/content';

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: 'Not Found' };
  return {
    title: `${project.title} | Daniel Magro`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const articles = getPublishedWriting();
  const writingBySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));

  return (
    <>
      <SiteNav />
      <main className="article-page">
        <div className="container">
          <Link href="/#projects" className="article-back">
            &larr; Projects
          </Link>
          <Reveal>
            <ProjectCard project={project} writingBySlug={writingBySlug} reveal={false} />
          </Reveal>
          {project.caseStudy && (
            <Reveal>
              <ProjectCaseStudy project={project} />
            </Reveal>
          )}
          {project.slug === 'eth-l2' && (
            <Reveal>
              <EthL2Interactive />
            </Reveal>
          )}
          {project.slug === 'agent-runtime' && (
            <Reveal>
              <AgentRuntimeInteractive />
            </Reveal>
          )}
          {project.slug === 'hermes-xray' && (
            <Reveal>
              <HermesXrayInteractive />
            </Reveal>
          )}
          {project.slug === 'eth-tx-lifecycle' && (
            <Reveal>
              <EthTxLifecycleInteractive />
            </Reveal>
          )}
          <Reveal>
            <ProjectVideoDemos project={project} />
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
