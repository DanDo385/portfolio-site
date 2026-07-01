'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'projects', label: 'Work' },
  { id: 'writing', label: 'Writing' },
  { id: 'history', label: 'History' },
  { id: 'contact', label: 'Contact' },
];

export function Nav() {
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

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <Link href="/" className="nav-id" onClick={handleNavClick}>
        <span className="indicator" />
        daniel magro
      </Link>

      <ul className={`nav-links${open ? ' mobile-open' : ''}`} id="navMenu">
        {SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <Link href={sectionHref(id)} className="nav-scroll" onClick={handleNavClick}>
              {label}
            </Link>
          </li>
        ))}
      </ul>

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
    </nav>
  );
}
