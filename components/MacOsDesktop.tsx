'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './MacOsDesktop.module.css';

type WindowKey =
  | 'finder'
  | 'terminal'
  | 'safari'
  | 'resume'
  | 'contact'
  | 'photos'
  | 'text'
  | 'image';

interface WinState {
  open: boolean;
  minimized: boolean;
  z: number;
  x: number;
  y: number;
  data?: { title?: string; body?: string; icon?: string } | null;
}

const BASE_POS: Record<WindowKey, { x: number; y: number }> = {
  finder: { x: 40, y: 60 },
  terminal: { x: 120, y: 110 },
  safari: { x: 200, y: 70 },
  resume: { x: 90, y: 90 },
  contact: { x: 260, y: 130 },
  photos: { x: 150, y: 100 },
  text: { x: 180, y: 120 },
  image: { x: 210, y: 110 },
};

const WIN_META: Record<WindowKey, { title: string; dockIcon: string; dockLabel: string }> = {
  finder: { title: 'Finder', dockIcon: '📁', dockLabel: 'Finder' },
  terminal: { title: 'Terminal', dockIcon: '💻', dockLabel: 'Terminal' },
  safari: { title: 'Safari', dockIcon: '🧭', dockLabel: 'Safari' },
  resume: { title: 'Resume.pdf', dockIcon: '📄', dockLabel: 'Resume' },
  contact: { title: 'Contact', dockIcon: '📇', dockLabel: 'Contact' },
  photos: { title: 'Photos', dockIcon: '🖼️', dockLabel: 'Photos' },
  text: { title: 'Notes.txt', dockIcon: '📝', dockLabel: 'Text' },
  image: { title: 'Preview.png', dockIcon: '🎨', dockLabel: 'Image' },
};

const DOCK_ORDER: WindowKey[] = [
  'finder',
  'safari',
  'terminal',
  'resume',
  'contact',
  'photos',
  'text',
  'image',
];

interface FinderFile {
  name: string;
  kind: 'folder' | 'pdf' | 'txt' | 'png' | 'link';
  icon: string;
  href?: string;
}

const FINDER_DIRS: Record<string, { label: string; icon: string; files: FinderFile[] }> = {
  work: {
    label: 'Work',
    icon: '💼',
    files: [
      { name: 'Agent Runtime', kind: 'link', icon: '🤖', href: '/projects/agent-runtime' },
      { name: 'Eth L2 Proofs', kind: 'link', icon: '⛓️', href: '/projects/eth-l2' },
      { name: 'Space-time Lab', kind: 'link', icon: '🚀', href: '/projects/space-time' },
      { name: 'notes.txt', kind: 'txt', icon: '📝' },
      { name: 'architecture.png', kind: 'png', icon: '🖼️' },
    ],
  },
  about: {
    label: 'About',
    icon: '👤',
    files: [
      { name: 'bio.txt', kind: 'txt', icon: '📝' },
      { name: 'stack.txt', kind: 'txt', icon: '📝' },
      { name: 'headshot.png', kind: 'png', icon: '🖼️' },
    ],
  },
  writing: {
    label: 'Writing',
    icon: '✍️',
    files: [
      {
        name: 'Agent Mode essay',
        kind: 'link',
        icon: '🔗',
        href: '/writing/agent-mode-and-the-inference-tax',
      },
      { name: 'All writing', kind: 'link', icon: '📚', href: '/#my-writing' },
    ],
  },
  resume: {
    label: 'Resume',
    icon: '📄',
    files: [{ name: 'Daniel_Magro_Resume.pdf', kind: 'pdf', icon: '📄' }],
  },
};

const TERMINAL_TEXT = `daniel@magro.dev % show techstack
go · solidity · typescript · ethereum
apis · agent systems · hermes workflows
exit 0 · 4 domains · 12ms`;

const SAFARI_POSTS = [
  {
    title: 'Agent Mode and the inference tax',
    note: 'Why structured agent surfaces matter.',
    href: '/writing/agent-mode-and-the-inference-tax',
  },
  {
    title: 'AI infrastructure financing',
    note: 'Longer-form research paper.',
    href: '/agent-research/ai-infrastructure-financing',
  },
  {
    title: 'The 2050 economy',
    note: 'Research on long-horizon systems.',
    href: '/agent-research/the-2050-economy',
  },
];

const HERO_TEXT = 'Hello. I build.';

function initialWindows(): Record<WindowKey, WinState> {
  const out = {} as Record<WindowKey, WinState>;
  (Object.keys(BASE_POS) as WindowKey[]).forEach((key) => {
    out[key] = {
      open: key === 'finder',
      minimized: false,
      z: key === 'finder' ? 1001 : 1000,
      x: BASE_POS[key].x,
      y: BASE_POS[key].y,
      data: null,
    };
  });
  return out;
}

export function MacOsDesktop({ embedded = false }: { embedded?: boolean }) {
  const [windows, setWindows] = useState<Record<WindowKey, WinState>>(initialWindows);
  const [nextZ, setNextZ] = useState(1002);
  const [location, setLocation] = useState('work');
  const [clock, setClock] = useState('');
  const [dockScale, setDockScale] = useState<Record<string, number>>({});
  const heroRef = useRef<HTMLHeadingElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ key: WindowKey; dx: number; dy: number } | null>(null);
  const zRef = useRef(1002);
  zRef.current = nextZ;

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleString('en-US', {
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit',
        }),
      );
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  const openWindow = useCallback((key: WindowKey, data?: WinState['data']) => {
    zRef.current += 1;
    const z = zRef.current;
    setNextZ(z);
    setWindows((prev) => ({
      ...prev,
      [key]: { ...prev[key], open: true, minimized: false, z, data: data ?? prev[key].data },
    }));
  }, []);

  const closeWindow = useCallback((key: WindowKey) => {
    setWindows((prev) => ({
      ...prev,
      [key]: { ...prev[key], open: false, minimized: false, z: 1000, data: null },
    }));
  }, []);

  const focusWindow = useCallback((key: WindowKey) => {
    zRef.current += 1;
    const z = zRef.current;
    setNextZ(z);
    setWindows((prev) => ({ ...prev, [key]: { ...prev[key], z } }));
  }, []);

  const minimizeWindow = useCallback((key: WindowKey) => {
    setWindows((prev) => ({ ...prev, [key]: { ...prev[key], minimized: true } }));
  }, []);

  const onTitlePointerDown = useCallback(
    (e: React.PointerEvent, key: WindowKey) => {
      focusWindow(key);
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      dragRef.current = { key, dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [focusWindow],
  );

  const onDesktopPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const host = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - host.left - drag.dx, host.width - 200));
    const y = Math.max(0, Math.min(e.clientY - host.top - drag.dy - 32, host.height - 120));
    setWindows((prev) => ({ ...prev, [drag.key]: { ...prev[drag.key], x, y } }));
  }, []);

  const endDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  const openFinderFile = useCallback(
    (file: FinderFile) => {
      if (file.kind === 'pdf') {
        openWindow('resume');
        return;
      }
      if (file.kind === 'link' && file.href) {
        window.open(file.href, '_blank', 'noopener');
        return;
      }
      if (file.kind === 'txt') {
        openWindow('text', {
          title: file.name,
          body: `${file.name}\n\nInstitutional rates, permissionless rails, and agent systems. This note lives inside the desktop demo, the same content family as the portfolio writeups.`,
          icon: '📝',
        });
        return;
      }
      if (file.kind === 'png') {
        openWindow('image', { title: file.name, icon: '🖼️' });
      }
    },
    [openWindow],
  );

  const onHeroMove = useCallback((e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const spans = el.querySelectorAll('span');
    spans.forEach((span) => {
      const r = span.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist2 = (e.clientX - cx) ** 2 + (e.clientY - cy) ** 2;
      const intensity = Math.exp(-dist2 / 20000);
      const weight = Math.round(320 + (850 - 320) * intensity);
      span.setAttribute('style', `font-weight:${weight}`);
    });
  }, []);

  const resetHero = useCallback(() => {
    heroRef.current
      ?.querySelectorAll('span')
      .forEach((span) => span.setAttribute('style', 'font-weight:400'));
  }, []);

  const onDockMove = useCallback((e: React.MouseEvent) => {
    const el = dockRef.current;
    if (!el) return;
    const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('button'));
    const next: Record<string, number> = {};
    buttons.forEach((btn) => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const dist2 = (e.clientX - cx) ** 2;
      const intensity = Math.exp(-dist2 / 2500);
      next[btn.dataset.key ?? ''] = intensity;
    });
    setDockScale(next);
  }, []);

  const resetDock = useCallback(() => setDockScale({}), []);

  const visible = (Object.keys(windows) as WindowKey[]).filter(
    (k) => windows[k].open && !windows[k].minimized,
  );

  return (
    <div
      className={`${styles.desktop}${embedded ? ` ${styles.embedded}` : ''}`}
      onPointerMove={onDesktopPointerMove}
      onPointerUp={endDrag}
      role="application"
      aria-label="macOS-style desktop portfolio demo"
    >
      <div className={styles.menuBar}>
        <span className={styles.logo} aria-hidden="true">
          🍎
        </span>
        <span className={styles.name}>Daniel Magro</span>
        <nav aria-label="Desktop shortcuts">
          <button type="button" onClick={() => openWindow('finder')}>
            Finder
          </button>
          <button type="button" onClick={() => openWindow('safari')}>
            Writing
          </button>
          <button type="button" onClick={() => openWindow('terminal')}>
            Stack
          </button>
          <button type="button" onClick={() => openWindow('contact')}>
            Contact
          </button>
        </nav>
        <div className={styles.menuRight}>
          <span aria-hidden="true">🔋</span>
          <span aria-hidden="true">📶</span>
          <span>{clock}</span>
        </div>
      </div>

      <div className={styles.hero}>
        <p className={styles.heroKicker}>magro.dev desktop</p>
        <h2
          ref={heroRef}
          className={styles.heroTitle}
          onMouseMove={onHeroMove}
          onMouseLeave={resetHero}
        >
          {HERO_TEXT.split('').map((ch, i) => (
            <span key={i}>{ch === ' ' ? ' ' : ch}</span>
          ))}
        </h2>
        <p className={styles.heroSub}>
          Hover the headline, open Work from the folders, and launch apps from the dock.
        </p>
      </div>

      <div className={styles.folders}>
        {Object.entries(FINDER_DIRS).map(([key, dir]) => (
          <button
            key={key}
            type="button"
            className={styles.folder}
            onClick={() => {
              setLocation(key);
              openWindow('finder');
            }}
          >
            <span className={styles.folderIcon} aria-hidden="true">
              {dir.icon}
            </span>
            {dir.label}
          </button>
        ))}
      </div>

      <div className={styles.windows}>
        {visible.map((key) => {
          const win = windows[key];
          const meta = WIN_META[key];
          return (
            <section
              key={key}
              className={styles.window}
              style={{ left: win.x, top: win.y, zIndex: win.z }}
              onPointerDown={() => focusWindow(key)}
              aria-label={meta.title}
            >
              <header
                className={styles.titleBar}
                onPointerDown={(e) => onTitlePointerDown(e, key)}
              >
                <div className={styles.controls}>
                  <button
                    type="button"
                    aria-label={`Close ${meta.title}`}
                    className={styles.close}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(key);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    aria-label={`Minimize ${meta.title}`}
                    className={styles.min}
                    onClick={(e) => {
                      e.stopPropagation();
                      minimizeWindow(key);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    aria-label={`Focus ${meta.title}`}
                    className={styles.max}
                    onClick={(e) => {
                      e.stopPropagation();
                      focusWindow(key);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                </div>
                <span className={styles.winTitle}>
                  {key === 'text' && win.data?.title ? win.data.title : meta.title}
                </span>
              </header>
              <div className={styles.winBody}>
                {key === 'finder' && (
                  <div className={styles.finderGrid}>
                    <div className={styles.finderSide}>
                      {Object.entries(FINDER_DIRS).map(([dirKey, dir]) => (
                        <button
                          key={dirKey}
                          type="button"
                          data-active={location === dirKey}
                          onClick={() => setLocation(dirKey)}
                        >
                          {dir.icon} {dir.label}
                        </button>
                      ))}
                    </div>
                    <div className={styles.fileGrid}>
                      {FINDER_DIRS[location].files.map((file) => (
                        <button key={file.name} type="button" onClick={() => openFinderFile(file)}>
                          <span className={styles.fileIcon} aria-hidden="true">
                            {file.icon}
                          </span>
                          {file.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {key === 'terminal' && (
                  <p className={styles.terminal}>
                    <span className={styles.prompt}>{TERMINAL_TEXT.split('\n')[0]}</span>
                    {'\n'}
                    {TERMINAL_TEXT.split('\n').slice(1).join('\n')}
                  </p>
                )}
                {key === 'safari' && (
                  <div>
                    <div className={styles.safariBar}>🔍 magro.dev/writing</div>
                    {SAFARI_POSTS.map((post) => (
                      <a
                        key={post.href}
                        className={styles.card}
                        href={post.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <strong>{post.title}</strong>
                        <small>{post.note}</small>
                      </a>
                    ))}
                  </div>
                )}
                {key === 'resume' && (
                  <div>
                    <iframe
                      title="Daniel Magro resume PDF"
                      src="/resume/Daniel_Magro_Resume.pdf"
                      className={styles.pdf}
                    />
                    <p>
                      <a href="/resume/Daniel_Magro_Resume.pdf" download>
                        Download resume (PDF)
                      </a>
                    </p>
                  </div>
                )}
                {key === 'contact' && (
                  <div>
                    <div className={styles.contactRow}>
                      <span className={styles.avatar} aria-hidden="true">
                        DM
                      </span>
                      <div>
                        <strong>Daniel Magro</strong>
                        <br />
                        <a href="mailto:dan@magro.dev">dan@magro.dev</a>
                      </div>
                    </div>
                    <ul className={styles.linkList}>
                      <li>
                        <a
                          href="https://github.com/DanDo385"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://linkedin.com/in/dmagro"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://twitter.com/DanQB13"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          X / Twitter
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
                {key === 'photos' && (
                  <div className={styles.fileGrid}>
                    {['🌅 Dawn deploy', '🏙️ Desk view', '🌌 Night build'].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() =>
                          openWindow('image', { title: `${label}.png`, icon: '🖼️' })
                        }
                      >
                        <span className={styles.fileIcon} aria-hidden="true">
                          🖼️
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                {key === 'text' && (
                  <p className={styles.terminal}>
                    {win.data?.body ?? 'Empty note. Open a .txt file from Finder.'}
                  </p>
                )}
                {key === 'image' && (
                  <div style={{ fontSize: 72, textAlign: 'center', padding: '18px 0' }}>
                    <span role="img" aria-label={win.data?.title ?? 'Preview image'}>
                      {win.data?.icon ?? '🖼️'}
                    </span>
                    <p style={{ fontSize: 12 }}>{win.data?.title ?? 'Preview.png'}</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div ref={dockRef} className={styles.dock} onMouseMove={onDockMove} onMouseLeave={resetDock}>
        {DOCK_ORDER.map((key) => {
          const intensity = dockScale[key] ?? 0;
          const scale = 1 + 0.28 * intensity;
          const y = -14 * intensity;
          return (
            <button
              key={key}
              type="button"
              data-key={key}
              data-label={WIN_META[key].dockLabel}
              data-open={windows[key].open}
              className={styles.dockApp}
              style={{ transform: `translateY(${y}px) scale(${scale})` }}
              onClick={() =>
                windows[key].open && !windows[key].minimized
                  ? minimizeWindow(key)
                  : openWindow(key)
              }
              aria-label={`Toggle ${WIN_META[key].dockLabel}`}
            >
              <span className={styles.dockIcon} aria-hidden="true">
                {WIN_META[key].dockIcon}
              </span>
            </button>
          );
        })}
      </div>

      <p className={styles.hint}>drag windows by the title bar · click dock to open / hide</p>
    </div>
  );
}
