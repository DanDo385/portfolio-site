'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { ThemeToggle } from './ThemeToggle';

const NAV_SECTIONS = [
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'Experience' },
  { id: 'my-writing', label: 'Writing' },
  { id: 'agent-research', label: 'Research' },
  { id: 'contact', label: 'Contact' },
];

const AGENT_RETURN_KEY = 'agent-mode-return-to';

function isAgentPath(pathname: string) {
  return pathname === '/agent' || pathname === '/agent/';
}

function currentLocation() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [agentReturnTo, setAgentReturnTo] = useState('/');
  const onHome = pathname === '/';
  const onAgent = isAgentPath(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!onAgent) return;
    try {
      const stored = sessionStorage.getItem(AGENT_RETURN_KEY);
      if (stored && !isAgentPath(stored.split(/[?#]/)[0] || '/')) {
        setAgentReturnTo(stored);
      }
    } catch {
      // sessionStorage may be unavailable
    }
  }, [onAgent]);

  const handleNavClick = () => setOpen(false);

  const handleAgentModeClick = (e: MouseEvent<HTMLAnchorElement>) => {
    handleNavClick();
    if (onAgent) return;

    e.preventDefault();
    try {
      sessionStorage.setItem(AGENT_RETURN_KEY, currentLocation());
    } catch {
      // sessionStorage may be unavailable
    }
    router.push('/agent');
  };

  const sectionHref = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <Link href="/" className="nav-id" onClick={handleNavClick}>
        <span className="indicator" />
        daniel magro
      </Link>

      <ul className={`nav-links${open ? ' mobile-open' : ''}`} id="navMenu">
        {NAV_SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <Link href={sectionHref(id)} className="nav-scroll" onClick={handleNavClick}>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="nav-end">
        <Link
          href={onAgent ? agentReturnTo : '/agent'}
          className={`nav-agent-link${onAgent ? ' active' : ''}`}
          aria-label={onAgent ? 'Exit Agent Mode' : 'View the agent-readable version of this site'}
          aria-pressed={onAgent}
          onClick={handleAgentModeClick}
        >
          Agent view
        </Link>
        <div className="nav-control" role="group" aria-label="Display">
          <span className="nav-control-label">Display</span>
          <ThemeToggle />
        </div>
        <button
          type="button"
          className={`nav-hamburger${open ? ' open' : ''}`}
          id="hamburgerBtn"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
