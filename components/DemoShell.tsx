import type { ReactNode } from 'react';
import Link from 'next/link';

interface DemoShellProps {
  title: string;
  projectHref: string;
  children: ReactNode;
  wide?: boolean;
}

export function DemoShell({ title, projectHref, children, wide = false }: DemoShellProps) {
  return (
    <div className={`demo-shell${wide ? ' demo-shell-wide' : ''}`}>
      <header className="demo-shell-bar">
        <div className="demo-shell-bar-inner">
          <Link href="/#projects" className="demo-shell-back">
            &larr; Projects
          </Link>
          <p className="demo-shell-title">{title}</p>
          <Link href={projectHref} className="demo-shell-meta">
            Project page
          </Link>
        </div>
      </header>
      <main className="demo-shell-main">{children}</main>
    </div>
  );
}
