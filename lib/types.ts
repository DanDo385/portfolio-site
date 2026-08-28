export type ProjectStatus = 'complete' | 'in-progress';
export type ArticleStatus = 'draft' | 'published';
export type ProjectPreviewType = 'agent-json';
/** Visual weight on the homepage. Foundations sit under primary flagships. */
export type ProjectTier = 'primary' | 'foundations';
/** Homepage cluster for markets/trading positioning. Defaults to labs when omitted. */
export type ProjectCluster =
  | 'trading-research'
  | 'market-structure'
  | 'agentic'
  | 'infra'
  | 'labs'
  /** @deprecated Migrated to infra. Kept for older cards during transition. */
  | 'custody';

/** Trading Lab research publication status. Never invent results. */
export type TradingResearchStatus =
  | 'idea'
  | 'researching'
  | 'backtested'
  | 'paper-trading'
  | 'experimental-live'
  | 'archived';

export interface TradingResearch {
  title: string;
  slug: string;
  date: string;
  status: TradingResearchStatus;
  statusLabel?: string | null;
  category: string;
  excerpt: string;
  researchQuestion?: string | null;
  hypothesis?: string | null;
  market?: string | null;
  methodology?: string | null;
  relatedProject?: string | null;
  githubUrl?: string | null;
  notebookUrl?: string | null;
  body: string;
}
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
  /** Optional card label when status is in-progress (e.g. Waiting on hardware). */
  statusLabel?: string | null;
  featured?: boolean;
  /**
   * Optional 1-based homepage rank. When set, the project is placed at that
   * slot; projects without sortOrder fill the remaining slots by date.
   */
  sortOrder?: number;
  /** Defaults to primary when omitted. */
  tier?: ProjectTier;
  /** Homepage cluster. Defaults to labs when omitted. */
  cluster?: ProjectCluster;
  tags: string[];
  summary: string;
  technicalDescription?: string;
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
  /** Slug of a published Agent Research paper to cross-link on the project card. */
  relatedResearch?: string | null;
  /** Related project slugs for hub / narrative pages. */
  relatedProjects?: string[];
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
  /** When set to builder, appears under the Experience builder timeline. */
  track?: 'institutional' | 'builder';
}
