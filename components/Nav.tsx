'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const NAV_SECTIONS = [
  { id: 'projects', label: 'Projects' },
  { id: 'writing', label: 'Writing' },
  { id: 'about', label: 'About me' },
  { id: 'contact', label: 'Contact' },
];

interface NavProps {
  showRecent?: boolean;
}

export function Nav({ showRecent = false }: NavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const onHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = () => setOpen(false);
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
        <Link href="/agent" className="nav-agent-link" onClick={handleNavClick}>
          Agent Mode
        </Link>
        <ThemeToggle />
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
