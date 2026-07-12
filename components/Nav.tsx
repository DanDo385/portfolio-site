'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { ThemeToggle } from './ThemeToggle';

const NAV_SECTIONS = [
  { id: 'projects', label: 'Projects' },
  { id: 'my-writing', label: 'My Writing' },
  { id: 'agent-research', label: 'Agent Research' },
  { id: 'about', label: 'About me' },
  { id: 'contact', label: 'Contact' },
];

const AGENT_RETURN_KEY = 'agent-mode-return-to';

function isAgentPath(pathname: string) {
  return pathname === '/agent' || pathname === '/agent/';
}

function currentLocation() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

interface NavProps {
  showRecent?: boolean;
}

export function Nav({ showRecent = false }: NavProps) {
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
  const sections = showRecent
    ? [{ id: 'recent', label: 'Recent', emphasis: true }, ...NAV_SECTIONS.map((s) => ({ ...s, emphasis: false }))]
    : NAV_SECTIONS.map((s) => ({ ...s, emphasis: false }));

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <Link href="/" className="nav-id" onClick={handleNavClick}>
        <span className="indicator" />
        daniel magro
      </Link>

      <ul className={`nav-links${open ? ' mobile-open' : ''}`} id="navMenu">
        {sections.map(({ id, label, emphasis }) => (
          <li key={id}>
            <Link
              href={sectionHref(id)}
              className={`nav-scroll${emphasis ? ' nav-recent' : ''}`}
              onClick={handleNavClick}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="nav-end">
        <div className="nav-control" role="group" aria-label="Agent Mode">
          <span className="nav-control-label">Agent Mode</span>
          <Link
            href={onAgent ? agentReturnTo : '/agent'}
            className={`nav-agent-toggle${onAgent ? ' active' : ''}`}
            aria-label={onAgent ? 'Exit Agent Mode' : 'Enter Agent Mode'}
            aria-pressed={onAgent}
            title={onAgent ? 'Exit Agent Mode' : 'Enter Agent Mode'}
            onClick={handleAgentModeClick}
          >
            <span className="nav-agent-emoji" aria-hidden="true">
              🤖
            </span>
          </Link>
        </div>
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
