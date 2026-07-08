import { hasRecentContent } from '@/lib/content';
import { Nav } from './Nav';

export function SiteNav() {
  return <Nav showRecent={hasRecentContent()} />;
}
