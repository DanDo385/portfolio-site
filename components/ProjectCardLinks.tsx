import Link from 'next/link';
import type { ProjectLinkSection } from '@/lib/utils';

interface ProjectCardLinksProps {
  sections: ProjectLinkSection[];
}

function ProjectLink({
  label,
  href,
  internal,
  emphasis = false,
}: {
  label: string;
  href: string;
  internal: boolean;
  emphasis?: boolean;
}) {
  const className = emphasis ? 'btn btn-primary pcard-interact-btn' : 'pcard-link';

  if (internal) {
    return (
      <Link href={href} className={className}>
        {label} {!emphasis && <span>&rarr;</span>}
      </Link>
    );
  }

  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {label} {!emphasis && <span>&rarr;</span>}
    </a>
  );
}

export function ProjectCardLinks({ sections }: ProjectCardLinksProps) {
  if (sections.length === 0) return null;

  return (
    <div className="pcard-link-sections">
      {sections.map((section) => (
        <div
          key={section.title}
          className={`pcard-link-group${section.emphasis ? ' pcard-link-group-emphasis' : ''}`}
        >
          <div className="pcard-link-label">{section.title}</div>
          {section.note && <p className="pcard-link-note">{section.note}</p>}
          <div className="pcard-link-row">
            {section.links.map((link) => (
              <ProjectLink
                key={`${section.title}-${link.label}-${link.href}`}
                label={link.label}
                href={link.href}
                internal={link.internal}
                emphasis={section.emphasis}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
