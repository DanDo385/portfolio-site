import Link from 'next/link';
import type { ProjectLinkSection } from '@/lib/utils';

interface ProjectCardLinksProps {
  sections: ProjectLinkSection[];
}

function ProjectLink({
  label,
  href,
  internal,
}: {
  label: string;
  href: string;
  internal: boolean;
}) {
  if (internal) {
    return (
      <Link href={href} className="pcard-link">
        {label} <span>&rarr;</span>
      </Link>
    );
  }

  return (
    <a href={href} className="pcard-link" target="_blank" rel="noopener noreferrer">
      {label} <span>&rarr;</span>
    </a>
  );
}

export function ProjectCardLinks({ sections }: ProjectCardLinksProps) {
  if (sections.length === 0) return null;

  return (
    <div className="pcard-link-sections">
      {sections.map((section) => (
        <div key={section.title} className="pcard-link-group">
          <div className="pcard-link-label">{section.title}</div>
          <div className="pcard-link-row">
            {section.links.map((link) => (
              <ProjectLink
                key={`${section.title}-${link.label}-${link.href}`}
                label={link.label}
                href={link.href}
                internal={link.internal}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
