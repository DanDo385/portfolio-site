import { Bridge } from '@/components/Bridge';
import { Contact } from '@/components/Contact';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { AgentResearch } from '@/components/AgentResearch';
import { JsonLd } from '@/components/JsonLd';
import { Projects } from '@/components/Projects';
import { SiteNav } from '@/components/SiteNav';
import { Writing } from '@/components/Writing';
import { SITE } from '@/lib/constants';
import { getListedProjects, getPublishedResearch, getPublishedWriting } from '@/lib/content';

const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Daniel Magro',
  url: SITE.url,
  description: SITE.description,
  sameAs: [
    'https://github.com/DanDo385',
    'https://linkedin.com/in/dmagro',
    'https://twitter.com/DanQB13',
  ],
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'magro.dev',
  url: SITE.url,
  description: SITE.description,
  author: { '@type': 'Person', name: 'Daniel Magro', url: SITE.url },
};

export default function HomePage() {
  const projects = getListedProjects();
  const articles = getPublishedWriting();
  const research = getPublishedResearch();
  const writingBySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
  const researchBySlug = Object.fromEntries(research.map((p) => [p.slug, p]));
  const projectsBySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));

  return (
    <>
      <JsonLd data={PERSON_JSON_LD} />
      <JsonLd data={WEBSITE_JSON_LD} />
      <SiteNav />
      <main>
        <Hero />
        <Bridge />
        <About />
        <Bridge />
        <Projects
          projects={projects}
          writingBySlug={writingBySlug}
          researchBySlug={researchBySlug}
        />
        <Bridge />
        <Writing articles={articles} projectsBySlug={projectsBySlug} />
        <Bridge />
        <AgentResearch papers={research} />
        <Bridge />
        <Contact />
      </main>
    </>
  );
}
