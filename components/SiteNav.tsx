import { Nav, type NavAppearance } from './Nav';

export function SiteNav({ appearance = 'site' }: { appearance?: NavAppearance }) {
  return <Nav appearance={appearance} />;
}
