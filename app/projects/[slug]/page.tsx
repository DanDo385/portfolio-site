import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { AgentMachineInteractive } from '@/components/AgentMachineInteractive';
import { EthL2FraudProofInteractive } from '@/components/EthL2FraudProofInteractive';
import { EthTxLifecycleInteractive } from '@/components/EthTxLifecycleInteractive';
import { ProjectCard } from '@/components/ProjectCard';
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
          <Reveal>
            <ProjectVideoDemos project={project} />
          </Reveal>
          {project.slug === 'eth-l2-fraud-proof' && (
            <Reveal>
              <EthL2FraudProofInteractive />
            </Reveal>
          )}
          {project.slug === 'agent-machine-deep-dive' && (
            <Reveal>
              <AgentMachineInteractive />
            </Reveal>
          )}
          {project.slug === 'eth-tx-lifecycle' && (
            <Reveal>
              <EthTxLifecycleInteractive />
            </Reveal>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
