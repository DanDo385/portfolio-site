import { IPFS_URL, RESUME_PDF, SITE } from './constants';
import { getListedProjects, getPublishedWriting, hasRecentContent } from './content';
import { isValidUrl, projectPath } from './utils';
import { DEMO_CONFIGS } from './demos';
import type { Project } from './types';

const PRINCIPLES = [
  'Canonical human context lives on magro.dev.',
  'Agent-facing context should be structured, stable, citation-aware, and low-noise.',
  'GitHub/code links are attached only when they make the argument stronger.',
  'The portfolio is positioned around AI infrastructure finance, AI-native financial rails, and market-structure translation.',
];

function siteUrl(path?: string | null): string | null {
  if (!isValidUrl(path)) return null;
  if (path!.startsWith('http://') || path!.startsWith('https://')) return path!;
  return new URL(path!, SITE.url).toString();
}

function projectUrls(project: Project) {
  const media: Record<string, string> = {};
  const previewGif = siteUrl(project.previewGif);
  const shortClip = siteUrl(project.shortClipUrl);
  const recording = siteUrl(project.recordingUrl);
  const previewVideo = siteUrl(project.previewVideo);

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
        role: 'AI infrastructure finance, capital markets, and programmable financial systems',
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
      ],
      principles: PRINCIPLES,
    },
    navigation: [
      ...(hasRecentContent()
        ? [{ id: 'recent', label: 'Recent', href: `${SITE.url}/#recent` }]
        : []),
      { id: 'projects', label: 'Projects', href: `${SITE.url}/#projects` },
      { id: 'writing', label: 'Writing', href: `${SITE.url}/#writing` },
      { id: 'about', label: 'About me', href: `${SITE.url}/#about` },
      { id: 'contact', label: 'Contact', href: `${SITE.url}/#contact` },
    ],
    about: {
      institutionalExperienceYears: 13,
      education: 'Penn State, Magna Cum Laude',
      technicalStudy: ['CS50', 'boot.dev', 'Cyfrin'],
      buildingWith: ['Go', 'Solidity', 'EVM', 'AI', 'Hermes'],
      summary:
        'Former institutional rates and macro trader and portfolio manager now building at the intersection of AI infrastructure finance, programmable financial rails, and market-structure translation.',
    },
    contact: {
      email: 'dan@magro.dev',
      github: 'https://github.com/DanDo385',
      linkedin: 'https://linkedin.com/in/dmagro',
      twitter: 'https://twitter.com/DanQB13',
      resume: `${SITE.url}${RESUME_PDF}`,
      resumeIpfs: IPFS_URL,
    },
    canonicalTopics: [
      'AI infrastructure finance',
      'compute and GPU markets',
      'datacenter debt and collateral',
      'AI-native financial rails',
      'stablecoins and programmable settlement',
      'DeFi market structure',
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
        runtime: 'Go service on MBP via Cloudflare Tunnel',
        status: 'staging',
      })),
    projects,
    writing,
  };
}

function llmsLink(label: string, href: string, note?: string): string {
  return note ? `- [${label}](${href}): ${note}` : `- [${label}](${href})`;
}

export function getLlmsTxt(): string {
  const manifest = getAgentManifest();

  const agentLines = [
    llmsLink('Agent overview', manifest.agentMode.endpoints.overview, 'Human-readable contract and endpoint map'),
    llmsLink('JSON manifest', manifest.agentMode.endpoints.manifest, 'Structured projects, writing, topics, and links'),
    llmsLink('LLM router', manifest.agentMode.endpoints.router, 'This file; compact markdown router for language models'),
    llmsLink(
      'Agent Mode essay',
      `${SITE.url}/writing/agent-mode-and-the-inference-tax/`,
      'Why structured agent surfaces matter'
    ),
  ].join('\n');

  const projectLines = manifest.projects
    .map((project) => {
      const href = project.urls.demo ?? project.urls.github ?? project.urls.canonical;
      return llmsLink(project.title, href, project.summary);
    })
    .join('\n');

  const writingLines = manifest.writing
    .map((article) => llmsLink(article.title, article.urls.canonical, article.excerpt))
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
    llmsLink('Resume on IPFS', manifest.contact.resumeIpfs, 'Immutable resume copy'),
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
    '## Writing',
    '',
    writingLines || '- Published writing appears at /writing/<slug>/.',
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
