import { Bridge } from '@/components/Bridge';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { History } from '@/components/History';
import { Projects } from '@/components/Projects';
import { Recent } from '@/components/Recent';
import { SiteNav } from '@/components/SiteNav';
import { Writing } from '@/components/Writing';
import { getProjects, getPublishedWriting, getRecentItems, hasRecentContent } from '@/lib/content';

export default function HomePage() {
  const projects = getProjects();
  const articles = getPublishedWriting();
  const recentItems = getRecentItems();
  const showRecent = hasRecentContent();
  const writingBySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
  const projectsBySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));

  return (
    <>
      <SiteNav />
      <main>
        <Hero showRecent={showRecent} />
        {showRecent && (
          <>
            <Bridge />
            <Recent items={recentItems} />
          </>
        )}
        <Bridge />
        <Projects projects={projects} writingBySlug={writingBySlug} />
        <Bridge />
        <Writing articles={articles} projectsBySlug={projectsBySlug} />
        <Bridge />
        <History />
        <Bridge />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
