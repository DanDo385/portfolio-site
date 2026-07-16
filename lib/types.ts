export type ProjectStatus = 'complete' | 'in-progress';
export type ArticleStatus = 'draft' | 'published';
export type ProjectPreviewType = 'agent-json';
/** Visual weight on the homepage. Foundations sit under primary flagships. */
export type ProjectTier = 'primary' | 'foundations';
/** Card rendering weight: featured (flagship) gets the full card, compact is denser. */
export type ProjectCardVariant = 'featured' | 'compact';
export type ProjectResourceFamily = 'gif' | 'screenshots' | 'demo' | 'llms' | 'media';

export interface ProjectResourceSource {
  /** Git ref fetched during predev/prebuild. Defaults to main. */
  ref?: string;
  /** Fail the build when the source repo does not publish canonical resources. */
  required?: boolean;
  /** Canonical families that must all exist when required is true. */
  families?: ProjectResourceFamily[];
}

export interface ProjectCaseStudy {
  problem: string;
  ownership: string[];
  architecture: string[];
  decisions: string[];
  verification: string[];
  limitations: string[];
  productionDifferences: string[];
  lessons?: string[];
}

export interface Project {
  title: string;
  slug: string;
  date: string;
  status: ProjectStatus;
  featured?: boolean;
  /** Defaults to primary when omitted. */
  tier?: ProjectTier;
  tags: string[];
  summary: string;
  techBadges: string[];
  githubUrl?: string | null;
  resourceSource?: ProjectResourceSource;
  demoUrl?: string | null;
  /** Optional standalone Vercel (or other) URL for Interact → Open in New Tab. */
  externalDemoUrl?: string | null;
  loomUrl?: string | null;
  youtubeUrl?: string | null;
  zoomUrl?: string | null;
  previewGif?: string | null;
  previewVideo?: string | null;
  shortClipUrl?: string | null;
  recordingUrl?: string | null;
  screenshots?: string[];
  previewType?: ProjectPreviewType | null;
  relatedWriting?: string | null;
  listed?: boolean;
  caseStudy?: ProjectCaseStudy;
}

export interface Article {
  title: string;
  slug: string;
  date: string;
  status: ArticleStatus;
  category: string;
  excerpt: string;
  coverImage?: string | null;
  loomUrl?: string | null;
  relatedProject?: string | null;
  body: string;
}

export interface ResearchPaper {
  title: string;
  slug: string;
  date: string;
  status: ArticleStatus;
  category: string;
  excerpt: string;
  subtitle?: string | null;
  body: string;
}

export interface TimelineItem {
  era: string;
  role: string;
  org: string;
  note: string;
}

export type RecentItemType = 'project' | 'writing' | 'research';

export interface RecentItem {
  type: RecentItemType;
  title: string;
  slug: string;
  date: string;
  summary: string;
  href: string;
  category?: string;
}
