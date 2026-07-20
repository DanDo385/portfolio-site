import fs from 'fs';
import path from 'path';
import { IPFS_URL, RESUME_PDF, SITE } from './constants';
import { getListedProjects, getPublishedResearch, getPublishedWriting, projectTier } from './content';
import { isValidUrl, projectPath } from './utils';
import { DEMO_CONFIGS } from './demos';
import type { Project } from './types';

const PRINCIPLES = [
  'Canonical human context lives on magro.dev.',
  'Agent-facing context should be structured, stable, citation-aware, and low-noise.',
  'GitHub/code links are attached only when they make the argument stronger.',
  'The portfolio is positioned around market infrastructure, programmable finance, and AI agent systems, built on thirteen years of institutional trading and portfolio management experience.',
];

function siteUrl(pathOrUrl?: string | null): string | null {
  if (!isValidUrl(pathOrUrl)) return null;
  if (pathOrUrl!.startsWith('http://') || pathOrUrl!.startsWith('https://')) return pathOrUrl!;
  return new URL(pathOrUrl!, SITE.url).toString();
}

/** Portfolio-domain project briefs: /project-assets/<slug>/llms.txt or .../demo/llms.txt */
export function projectLlmsTxtPath(slug: string): string | null {
  const candidates = [
    `/project-assets/${slug}/llms.txt`,
    `/project-assets/${slug}/demo/llms.txt`,
  ];
  for (const candidate of candidates) {
    const absolute = path.join(process.cwd(), 'public', candidate.replace(/^\//, ''));
    if (fs.existsSync(absolute)) return candidate;
  }
  return null;
}

function projectUrls(project: Project) {
  const media: Record<string, string> = {};
  const previewGif = siteUrl(project.previewGif);
  const shortClip = siteUrl(project.shortClipUrl);
  const recording = siteUrl(project.recordingUrl);
  const previewVideo = siteUrl(project.previewVideo);
  const llmsTxt = siteUrl(projectLlmsTxtPath(project.slug));

  if (previewGif) media.previewGif = previewGif;
  if (shortClip) media.shortClip = shortClip;
  if (recording) media.recording = recording;
  if (previewVideo) media.previewVideo = previewVideo;

  return {
    canonical: `${SITE.url}${projectPath(project.slug)}/`,
    github: project.githubUrl ?? null,
    demo: siteUrl(project.demoUrl),
    loom: siteUrl(project.loomUrl),
    youtube: siteUrl(project.youtubeUrl),
    zoom: siteUrl(project.zoomUrl),
    relatedWriting: project.relatedWriting
      ? `${SITE.url}/writing/${project.relatedWriting}/`
      : null,
    relatedResearch: project.relatedResearch
      ? `${SITE.url}/agent-research/${project.relatedResearch}/`
      : null,
    llmsTxt,
    media: Object.keys(media).length > 0 ? media : null,
  };
}

export function getAgentManifest() {
  const projects = getListedProjects().map((project) => ({
    title: project.title,
    slug: project.slug,
    date: project.date,
    status: project.status,
    featured: Boolean(project.featured),
    tier: projectTier(project),
    summary: project.summary,
    tags: project.tags,
    tech: project.techBadges,
    previewType: project.previewType ?? null,
    urls: projectUrls(project),
  }));

  const writing = getPublishedWriting().map((article) => ({
    title: article.title,
    slug: article.slug,
    date: article.date,
    category: article.category,
    excerpt: article.excerpt,
    urls: {
      canonical: `${SITE.url}/writing/${article.slug}/`,
      relatedProject: article.relatedProject
        ? `${SITE.url}${projectPath(article.relatedProject)}/`
        : null,
    },
  }));

  const research = getPublishedResearch().map((paper) => ({
    title: paper.title,
    slug: paper.slug,
    date: paper.date,
    category: paper.category,
    excerpt: paper.excerpt,
    subtitle: paper.subtitle ?? null,
    urls: {
      canonical: `${SITE.url}/agent-research/${paper.slug}/`,
    },
  }));

  return {
    schema: `${SITE.url}/agent.json`,
    schemaVersion: '0.1',
    site: {
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      owner: {
        name: 'Daniel Magro',
        email: 'dan@magro.dev',
        role: 'Former institutional rates and macro trader and portfolio manager building market infrastructure, programmable finance, and AI agent systems',
      },
    },
    agentMode: {
      purpose:
        'Expose canonical, structured context for AI agents so they do not have to infer meaning from decorative HTML.',
      endpoints: {
        overview: `${SITE.url}/agent/`,
        manifest: `${SITE.url}/agent.json`,
        router: `${SITE.url}/llms.txt`,
      },
      preferredEntryPoints: [
        `${SITE.url}/agent/`,
        `${SITE.url}/agent.json`,
        `${SITE.url}/llms.txt`,
        `${SITE.url}/writing/agent-mode-and-the-inference-tax/`,
        `${SITE.url}/agent-research/the-2050-economy/`,
        `${SITE.url}/agent-research/octopus-agentic-systems/`,
        `${SITE.url}/agent-research/ai-infrastructure-financing/`,
        `${SITE.url}/writing/ai-infrastructure-buildout-bubble/`,
        `${SITE.url}/projects/ai-physical-infra-debt/`,
        `${SITE.url}/demos/ai-physical-infra-debt/`,
      ],
      principles: PRINCIPLES,
    },
    navigation: [
      { id: 'projects', label: 'Projects', href: `${SITE.url}/#projects` },
      { id: 'about', label: 'Experience', href: `${SITE.url}/#about` },
      { id: 'my-writing', label: 'Writing', href: `${SITE.url}/#my-writing` },
      { id: 'agent-research', label: 'Research', href: `${SITE.url}/#agent-research` },
      { id: 'contact', label: 'Contact', href: `${SITE.url}/#contact` },
    ],
    about: {
      institutionalExperienceYears: 13,
      education: 'Penn State, Magna Cum Laude',
      technicalStudy: ['CS50', 'boot.dev', 'Cyfrin'],
      buildingWith: ['Go', 'Solidity', 'EVM', 'AI', 'Hermes'],
      summary:
        'Former institutional rates and macro trader and portfolio manager building systems at the intersection of market infrastructure, programmable finance, and AI agents. Combines thirteen years of experience in liquidity, collateral, execution, and risk with hands-on work in Go, Solidity, Ethereum infrastructure, APIs, and agent systems.',
    },
    contact: {
      email: 'dan@magro.dev',
      github: 'https://github.com/DanDo385',
      linkedin: 'https://linkedin.com/in/dmagro',
      twitter: 'https://twitter.com/DanQB13',
      resume: `${SITE.url}${RESUME_PDF}`,
      ...(IPFS_URL ? { resumeIpfs: IPFS_URL } : {}),
    },
    canonicalTopics: [
      'market infrastructure and execution',
      'programmable finance and settlement',
      'liquidity, collateral, and risk',
      'Ethereum infrastructure and EVM tooling',
      'rollup and validity-proof mechanics',
      'AI agent systems',
      'agent-readable web infrastructure',
      'capital markets translation for technical systems',
    ],
    demos: Object.values(DEMO_CONFIGS)
      .filter((config) => projects.some((project) => project.slug === config.projectSlug))
      .map((config) => ({
        slug: config.slug,
        name: config.name,
        project: `${SITE.url}${projectPath(config.projectSlug)}/`,
        healthProbe: `${SITE.url}/api/demos/${config.slug}/health`,
        stagingApi: config.defaultApiBaseUrl,
        runtime: 'Staging Go service via Cloudflare Tunnel',
        status: 'staging',
      })),
    projects,
    writing,
    research,
  };
}

function llmsLink(label: string, href: string, note?: string): string {
  return note ? `- [${label}](${href}): ${note}` : `- [${label}](${href})`;
}

export function getLlmsTxt(): string {
  const manifest = getAgentManifest();

  const agentLines = [
    llmsLink('Agent overview', manifest.agentMode.endpoints.overview, 'Human-readable contract and endpoint map'),
    llmsLink('JSON manifest', manifest.agentMode.endpoints.manifest, 'Structured projects, writing, research, topics, and links'),
    llmsLink('LLM router', manifest.agentMode.endpoints.router, 'This file; compact markdown router for language models'),
    llmsLink(
      'Agent Mode essay',
      `${SITE.url}/writing/agent-mode-and-the-inference-tax/`,
      'Why structured agent surfaces matter'
    ),
  ].join('\n');

  const projectLines = [
    ...manifest.projects
      .filter((project) => project.tier !== 'foundations')
      .map((project) => {
        const href = project.urls.demo ?? project.urls.github ?? project.urls.canonical;
        return llmsLink(project.title, href, project.summary);
      }),
    ...manifest.projects
      .filter((project) => project.tier === 'foundations')
      .map((project) => {
        const href = project.urls.demo ?? project.urls.github ?? project.urls.canonical;
        return llmsLink(`${project.title} (Foundations)`, href, project.summary);
      }),
  ].join('\n');

  const projectLlmsLines = manifest.projects
    .filter((project) => project.urls.llmsTxt)
    .map((project) =>
      llmsLink(
        `${project.title} llms.txt`,
        project.urls.llmsTxt!,
        'Project-specific agent brief on magro.dev'
      )
    )
    .join('\n');

  const writingLines = manifest.writing
    .map((article) => llmsLink(article.title, article.urls.canonical, article.excerpt))
    .join('\n');

  const researchLines = manifest.research
    .map((paper) => llmsLink(paper.title, paper.urls.canonical, paper.excerpt))
    .join('\n');

  const demoLines = manifest.demos
    .map((demo) =>
      llmsLink(
        demo.name,
        demo.project,
        `Interactive demo. Backend runs at ${demo.stagingApi}; probe status at ${demo.healthProbe}.`
      )
    )
    .join('\n');

  const siteLines = [
    llmsLink('Home', `${SITE.url}/`, 'Portfolio homepage'),
    llmsLink('About', `${SITE.url}/#about`, 'Professional history and builder track'),
    llmsLink('Contact', `${SITE.url}/#contact`, 'Email, resume, and social links'),
  ].join('\n');

  const optionalLines = [
    llmsLink('Resume PDF', manifest.contact.resume, 'Downloadable resume'),
    ...(manifest.contact.resumeIpfs
      ? [llmsLink('Resume on IPFS', manifest.contact.resumeIpfs, 'Immutable resume copy')]
      : []),
    llmsLink('GitHub', manifest.contact.github, 'Code repositories'),
    llmsLink('LinkedIn', manifest.contact.linkedin),
    llmsLink('X / Twitter', manifest.contact.twitter),
    ...manifest.projects
      .filter((project) => project.urls.media)
      .flatMap((project) => {
        const media = project.urls.media!;
        return Object.entries(media).map(([kind, href]) =>
          llmsLink(`${project.title} ${kind}`, href, 'Project media artifact')
        );
      }),
  ].join('\n');

  return [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    '',
    manifest.about.summary,
    '',
    '## Agent Mode',
    '',
    agentLines,
    '',
    '## Site',
    '',
    siteLines,
    '',
    '## Projects',
    '',
    projectLines,
    '',
    '## Project llms.txt',
    '',
    projectLlmsLines ||
      '- Project-specific briefs live under /project-assets/<slug>/llms.txt when present.',
    '',
    '## My Writing',
    '',
    writingLines || '- Published writing appears at /writing/<slug>/.',
    '',
    '## Agent Research',
    '',
    researchLines || '- Published research appears at /agent-research/<slug>/.',
    '',
    '## Interactive Demos',
    '',
    demoLines || '- Interactive demos are linked from individual project pages.',
    '',
    '## Contact',
    '',
    `- Email: dan@magro.dev`,
    `- Website: ${SITE.url}`,
    '',
    '## Optional',
    '',
    optionalLines,
    '',
  ].join('\n');
}
