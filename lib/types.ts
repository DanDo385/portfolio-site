export type ProjectStatus = 'complete' | 'in-progress';
export type ArticleStatus = 'draft' | 'published';

export interface Project {
  title: string;
  slug: string;
  date: string;
  status: ProjectStatus;
  featured?: boolean;
  tags: string[];
  summary: string;
  techBadges: string[];
  githubUrl?: string | null;
  demoUrl?: string | null;
  loomUrl?: string | null;
  screenshots?: string[];
  relatedWriting?: string | null;
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

export interface TimelineItem {
  era: string;
  role: string;
  org: string;
  note: string;
}
