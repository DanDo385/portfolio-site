import { Bridge } from '@/components/Bridge';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { History } from '@/components/History';
import { Nav } from '@/components/Nav';
import { Projects } from '@/components/Projects';
import { Writing } from '@/components/Writing';
import { getProjects, getPublishedWriting } from '@/lib/content';

export default function HomePage() {
  const projects = getProjects();
  const articles = getPublishedWriting();
  const writingBySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Bridge />
        <Projects projects={projects} writingBySlug={writingBySlug} />
        <Bridge />
        <Writing articles={articles} />
        <Bridge />
        <History />
        <Bridge />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
