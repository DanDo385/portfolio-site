import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const SRC = path.join(ROOT, 'src');

const RESUME_PDF = 'Daniel%20Magro%20Resume.pdf';
const IPFS_URL =
  'https://gateway.pinata.cloud/ipfs/bafkreie7dy6o3b7xjeakdmrrop4fzgkgisi4xr7lkjxtoyutsivzp5k6tm';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TAG_CLASS = {
  AI: 'tag-ai',
  Agents: 'tag-ai',
  'LLM Systems': 'tag-llm',
  Interactive: 'tag-interactive',
  Infrastructure: 'tag-infra',
  Solidity: 'tag-solidity',
  EVM: 'tag-evm',
  L2: 'tag-l2',
  DeFi: 'tag-defi',
  Go: 'tag-go',
  TypeScript: 'tag-ts',
  Simulation: 'tag-simulation',
};

function tagClass(tag) {
  return TAG_CLASS[tag] || 'tag-infra';
}

function categoryClass(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('ai') || c.includes('finance')) return 'c-infra';
  if (c.includes('system')) return 'c-sys';
  return 'c-fin';
}

function loadProjects() {
  const dir = path.join(CONTENT, 'projects');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const projects = files.map((f) => {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return data;
  });
  projects.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.date) - new Date(a.date);
  });
  return projects;
}

function loadWriting() {
  const dir = path.join(CONTENT, 'writing');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  return files.map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const { data, content } = matter(raw);
    return { ...data, body: content.trim(), filename: f };
  });
}

function validScreenshots(screenshots) {
  if (!Array.isArray(screenshots)) return [];
  return screenshots.filter(
    (s) => s && typeof s === 'string' && !s.includes('TODO(dan)')
  );
}

function loomEmbedUrl(url) {
  if (!url || url.includes('TODO(dan)')) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('loom.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      return `https://www.loom.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return url;
}

function renderCarousel(project, index) {
  const shots = validScreenshots(project.screenshots);
  const id = `carousel-${project.slug}`;
  if (shots.length === 0) {
    return `<div class="media-placeholder" role="img" aria-label="Screenshot placeholder for ${escapeHtml(project.title)}">TODO(dan): screenshots</div>`;
  }
  if (shots.length === 1) {
    return `<div class="carousel carousel-static"><img src="${escapeHtml(shots[0])}" alt="${escapeHtml(project.title)} screenshot" loading="lazy" class="carousel-img"></div>`;
  }
  const slides = shots
    .map(
      (src, i) =>
        `<div class="carousel-slide${i === 0 ? ' active' : ''}" data-index="${i}"><img src="${escapeHtml(src)}" alt="${escapeHtml(project.title)} screenshot ${i + 1}" loading="lazy" class="carousel-img"></div>`
    )
    .join('');
  return `<div class="carousel" id="${id}" data-carousel data-interval="5000" tabindex="0" role="region" aria-label="${escapeHtml(project.title)} screenshots" aria-live="polite">
    <div class="carousel-track">${slides}</div>
    <div class="carousel-dots" role="tablist" aria-label="Screenshot navigation">
      ${shots.map((_, i) => `<button type="button" class="carousel-dot${i === 0 ? ' active' : ''}" role="tab" aria-selected="${i === 0}" aria-label="Screenshot ${i + 1}" data-goto="${i}"></button>`).join('')}
    </div>
  </div>`;
}

function renderLoom(url) {
  const embed = loomEmbedUrl(url);
  if (!embed) return '';
  return `<div class="loom-embed">
    <iframe src="${escapeHtml(embed)}" loading="lazy" allowfullscreen title="Project demo video"></iframe>
  </div>`;
}

function renderDemoEmbed(project) {
  const parts = [];
  if (project.demoUrl && !String(project.demoUrl).includes('TODO(dan)')) {
    parts.push(
      `<div class="demo-embed"><iframe src="${escapeHtml(project.demoUrl)}" loading="lazy" title="${escapeHtml(project.title)} live demo"></iframe></div>`
    );
  }
  if (project.loomUrl) {
    const loom = renderLoom(project.loomUrl);
    if (loom) parts.push(loom);
  }
  return parts.join('');
}

function renderProjectCard(project, writingBySlug, projectBySlug) {
  const tags = (project.tags || [])
    .map((t) => `<span class="tag ${tagClass(t)}">${escapeHtml(t)}</span>`)
    .join('');
  const badges = (project.techBadges || [])
    .map((b) => `<span class="tbadge">${escapeHtml(b)}</span>`)
    .join('');
  const statusBadge =
    project.status === 'in-progress'
      ? '<span class="pcard-status">In progress</span>'
      : '';

  const links = [];
  if (project.githubUrl) {
    links.push(
      `<a href="${escapeHtml(project.githubUrl)}" class="pcard-link" target="_blank" rel="noopener noreferrer">GitHub <span>&rarr;</span></a>`
    );
  }
  if (project.demoUrl && !String(project.demoUrl).includes('TODO(dan)')) {
    links.push(
      `<a href="${escapeHtml(project.demoUrl)}" class="pcard-link" target="_blank" rel="noopener noreferrer">Live demo <span>&rarr;</span></a>`
    );
  }

  let related = '';
  if (project.relatedWriting && writingBySlug[project.relatedWriting]) {
    const w = writingBySlug[project.relatedWriting];
    if (w.status === 'published') {
      related = `<p class="pcard-related">Related: <a href="/writing/${escapeHtml(w.slug)}/">${escapeHtml(w.title)}</a></p>`;
    }
  }

  return `<article class="pcard reveal">
    <div class="pcard-layout">
      <div class="pcard-main">
        <div class="pcard-head">
          <div>
            <h3 class="pcard-name">${escapeHtml(project.title)}</h3>
            ${statusBadge}
          </div>
          <div class="pcard-tags">${tags}</div>
        </div>
        <p class="pcard-summary">${escapeHtml(project.summary)}</p>
        <div class="pcard-tech">${badges}</div>
        <div class="pcard-links">${links.join('')}</div>
        ${related}
      </div>
      <div class="pcard-media">
        ${renderCarousel(project)}
        ${renderDemoEmbed(project)}
      </div>
    </div>
  </article>`;
}

function renderWritingItem(article) {
  return `<a href="/writing/${escapeHtml(article.slug)}/" class="writing-item reveal">
    <div class="writing-meta">
      <span class="writing-cat ${categoryClass(article.category)}">${escapeHtml(article.category)}</span>
      <time datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time>
    </div>
    <h3 class="writing-title">${escapeHtml(article.title)}</h3>
    <p class="writing-excerpt">${escapeHtml(article.excerpt)}</p>
  </a>`;
}

function renderTimeline() {
  const items = [
    {
      era: '2024 – 2025',
      role: 'Product &amp; Web3 Platform Contributor',
      org: 'RAMM.ai, New York, NY',
      note: 'Iterated across the full stack of development: smart contracts, frontend, and backend implementations. Translated user and partner requirements into product, API, and smart-contract constraints.',
    },
    {
      era: '2019 – 2022',
      role: 'Independent E-Commerce Operator',
      org: 'Self-Employed',
      note: 'Built Python-based automation to monitor supply-constrained e-commerce markets and optimize execution across competitive retail and payments platforms.',
    },
    {
      era: '2017 – 2019',
      role: 'VP, Fixed Income Portfolio Manager',
      org: 'Prudential Financial (PGIM)',
      note: 'Managed global interest-rate and relative-value portfolios across U.S., Canadian, European, and Japanese markets.',
    },
    {
      era: '2015 – 2017',
      role: 'VP, Asian Hours Macro Execution Desk',
      org: 'PointState Capital',
      note: 'Executed cross-asset trades and managed risk from Wellington through Sydney, Tokyo, Hong Kong, and Singapore.',
    },
    {
      era: '2011 – 2015',
      role: 'VP, Proprietary Trading',
      org: 'Nomura Securities',
      note: 'Traded macro and micro strategies in interest rates, FX, equities, and derivatives across U.S., European, and Japanese markets.',
    },
    {
      era: '2006 – 2011',
      role: 'Institutional Fixed Income Sales',
      org: 'Merrill Lynch · Jefferies',
      note: 'Covered institutional clients across interest-rate products.',
    },
  ];
  return items
    .map(
      (t) => `<div class="tl-item">
        <div class="tl-era">${t.era}</div>
        <div class="tl-role">${t.role}</div>
        <div class="tl-org">${t.org}</div>
        <div class="tl-note">${t.note}</div>
      </div>`
    )
    .join('');
}

function bridge() {
  return `<div class="container"><div class="bridge"><div class="n"></div><div class="seg"></div><div class="n on"></div><div class="seg"></div><div class="n"></div></div></div>`;
}

function layout({ title, description, body, depth = 0 }) {
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  const asset = depth === 0 ? '/assets' : `${prefix}assets`;
  const home = depth === 0 ? '/' : `${prefix}`;
  const css = fs.readFileSync(path.join(SRC, 'assets/css/main.css'), 'utf8');
  const js = fs.readFileSync(path.join(SRC, 'assets/js/main.js'), 'utf8');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="icon" type="image/svg+xml" href="${prefix}favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=Geist+Mono:wght@400;500;600&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
${body}
<script>${js}</script>
</body>
</html>`;
}

function renderNav(isArticle = false) {
  const link = (id) => (isArticle ? `/#${id}` : `#${id}`);
  const homeHref = isArticle ? '/' : '#top';
  return `<nav id="navbar">
  <a href="${homeHref}" class="nav-id">
    <span class="indicator"></span>
    daniel magro
  </a>
  <ul class="nav-links" id="navMenu">
    <li><a href="${link('projects')}" class="nav-scroll">Work</a></li>
    <li><a href="${link('writing')}" class="nav-scroll">Writing</a></li>
    <li><a href="${link('history')}" class="nav-scroll">History</a></li>
    <li><a href="${link('contact')}" class="nav-scroll">Contact</a></li>
  </ul>
  <button class="nav-hamburger" id="hamburgerBtn" aria-label="Toggle menu">
    <span></span><span></span><span></span>
  </button>
</nav>`;
}

function renderContactSection() {
  return `<section id="contact" class="contact-section">
  <div class="container">
    <div class="section-label reveal">Contact</div>
    <div class="contact-grid">
      <div class="contact-text reveal">
        <div class="resume-section" id="resume">
          <div class="resume-label">Resume</div>
          <div class="resume-actions">
            <button type="button" class="resume-btn" id="resumeViewBtn" aria-label="View resume">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View
            </button>
            <a href="Daniel%20Magro%20Resume.pdf" download="Daniel-Magro-Resume.pdf" class="resume-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </a>
            <a href="${IPFS_URL}" class="resume-btn" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              IPFS
            </a>
          </div>
        </div>
        <div class="c-links">
          <a href="mailto:dan@magro.dev" class="c-link">
            <div class="c-link-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent)"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            dan@magro.dev
          </a>
          <a href="https://github.com/DanDo385" class="c-link" target="_blank" rel="noopener noreferrer">
            <div class="c-link-ico">
              <svg viewBox="0 0 24 24" fill="currentColor" style="color:var(--accent)"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </div>
            GitHub
          </a>
          <a href="https://linkedin.com/in/daniel-magro-2323941a2" class="c-link" target="_blank" rel="noopener noreferrer">
            <div class="c-link-ico">
              <svg viewBox="0 0 24 24" fill="currentColor" style="color:var(--accent)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </div>
            LinkedIn
          </a>
          <a href="https://twitter.com/DanQB13" class="c-link" target="_blank" rel="noopener noreferrer">
            <div class="c-link-ico">
              <svg viewBox="0 0 24 24" fill="currentColor" style="color:var(--accent)"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </div>
            @DanQB13
          </a>
        </div>
      </div>
      <div class="signals-panel reveal">
        <div class="signals-head">At a Glance</div>
        <div class="sig-row">
          <span class="sig-label">Institutional experience</span>
          <span class="sig-val">13 years</span>
        </div>
        <div class="sig-row">
          <span class="sig-label">Building with</span>
          <span class="sig-val">Go · Solidity · EVM · AI</span>
        </div>
        <div class="sig-row">
          <span class="sig-label">Education</span>
          <span class="sig-val">Penn State (Magna) · CS50 · Cyfrin</span>
        </div>
        <div class="sig-row">
          <span class="sig-label">Certifications</span>
          <span class="sig-val">CFA Level I</span>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function renderFooter() {
  return `<footer>
  <div class="container footer-inner">
    <div class="footer-l">&copy; 2026 Daniel Magro</div>
    <div class="footer-r">
      <div class="footer-dot"></div>
      Built with intention
    </div>
  </div>
</footer>`;
}

function renderResumeModal() {
  return `<div class="resume-modal" id="resumeModal" role="dialog" aria-modal="true" aria-label="Resume viewer">
  <div class="resume-modal-body">
    <button type="button" class="resume-modal-close" id="resumeModalClose" aria-label="Close resume viewer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <iframe class="resume-modal-iframe" id="resumeModalIframe" src="" title="Daniel Magro Resume"></iframe>
  </div>
</div>`;
}

function renderHome(projects, published) {
  const writingBySlug = Object.fromEntries(published.map((w) => [w.slug, w]));
  const projectCards = projects.map((p) => renderProjectCard(p, writingBySlug, {})).join('\n');

  const writingList =
    published.length > 0
      ? published.map(renderWritingItem).join('\n')
      : '<p class="writing-empty reveal">Published articles will appear here.</p>';

  return `${renderNav(false)}

<section class="hero" id="top">
  <div class="hero-grid"></div>
  <div class="container hero-content">
    <h1>Daniel Magro</h1>
    <p class="hero-identity">Former institutional rates and macro trader and portfolio manager. Now building AI and financial systems.</p>
    <p class="hero-positioning">Working at the intersection of AI, finance, and market structure. The projects and writing below are the output.</p>
    <div class="hero-cta">
      <a href="#projects" class="resume-btn nav-scroll">Work</a>
      <a href="#writing" class="resume-btn nav-scroll">Writing</a>
      <a href="#resume" class="resume-btn nav-scroll">Resume</a>
      <a href="#contact" class="resume-btn nav-scroll">Contact</a>
    </div>
  </div>
  <div class="hero-scroll">
    <div class="bar"></div>
    Scroll
  </div>
</section>

${bridge()}

<section id="projects">
  <div class="container">
    <div class="section-label reveal">Work</div>
    ${projectCards}
  </div>
</section>

${bridge()}

<section id="writing">
  <div class="container">
    <div class="section-label reveal">Writing</div>
    <div class="writing-list">
      ${writingList}
    </div>
  </div>
</section>

${bridge()}

<section id="history">
  <div class="container">
    <div class="section-label reveal">Professional History</div>
    <div class="history-block reveal">
      <p class="history-summary"><strong>13 years</strong> across institutional fixed income sales, trading, and portfolio management: rates, macro, and cross-asset. Merrill Lynch, Nomura, PointState Capital, and Prudential (PGIM).</p>
      <div class="firm-logos" aria-label="Employers">
        <span class="firm-logo">Merrill Lynch</span>
        <span class="firm-logo">Nomura</span>
        <span class="firm-logo">PointState</span>
        <span class="firm-logo">Prudential</span>
      </div>
      <p class="firm-todo">TODO(dan): supply logo assets, or use text wordmarks if licensing is a concern.</p>
      <details class="history-details">
        <summary>Full history</summary>
        <div class="timeline">${renderTimeline()}</div>
      </details>
    </div>
  </div>
</section>

${bridge()}

${renderContactSection()}
${renderResumeModal()}
${renderFooter()}`;
}

function renderArticle(article, projectsBySlug) {
  const htmlBody = marked.parse(article.body);
  let related = '';
  if (article.relatedProject && projectsBySlug[article.relatedProject]) {
    const p = projectsBySlug[article.relatedProject];
    related = `<p class="article-related">Related project: <a href="/#projects">${escapeHtml(p.title)}</a></p>`;
  }
  const loom = article.loomUrl ? renderLoom(article.loomUrl) : '';

  return `${renderNav(true)}

<main class="article-page">
  <div class="container">
    <a href="/#writing" class="article-back">&larr; Writing</a>
    <header class="article-header reveal">
      <div class="writing-meta">
        <span class="writing-cat ${categoryClass(article.category)}">${escapeHtml(article.category)}</span>
        <time datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time>
      </div>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="article-excerpt">${escapeHtml(article.excerpt)}</p>
    </header>
    ${loom}
    <div class="article-body prose reveal">${htmlBody}</div>
    ${related}
  </div>
</main>

${renderFooter()}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyAssets() {
  // CSS and JS are inlined at build time from src/assets/
}

function build() {
  const projects = loadProjects();
  const allWriting = loadWriting();
  const published = allWriting
    .filter((w) => w.status === 'published')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const projectsBySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));

  copyAssets();

  const homeHtml = layout({
    title: 'Daniel Magro',
    description:
      'Former institutional rates and macro trader and portfolio manager. Now building AI and financial systems.',
    body: renderHome(projects, published),
    depth: 0,
  });
  fs.writeFileSync(path.join(ROOT, 'index.html'), homeHtml);

  const writingRoot = path.join(ROOT, 'writing');
  if (fs.existsSync(writingRoot)) {
    fs.rmSync(writingRoot, { recursive: true });
  }

  for (const article of published) {
    const dir = path.join(writingRoot, article.slug);
    ensureDir(dir);
    const page = layout({
      title: `${article.title} | Daniel Magro`,
      description: article.excerpt,
      body: renderArticle(article, projectsBySlug),
      depth: 2,
    });
    fs.writeFileSync(path.join(dir, 'index.html'), page);
  }

  console.log(`Built homepage + ${published.length} article(s), ${projects.length} project(s).`);
}

build();
