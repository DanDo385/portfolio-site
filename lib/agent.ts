import fs from 'fs';
import path from 'path';
import { IPFS_URL, RESUME_PDF, SITE } from './constants';
import { getListedProjects, getPublishedResearch, getPublishedWriting, projectCluster, projectTier } from './content';
import { CURRENT_FOCUS, INTERESTED_IN, TRAJECTORY } from './site-focus';
import { getListedTradingResearch, tradingResearchStatusLabel } from './trading-research';
import { isValidUrl, projectPath } from './utils';
import { DEMO_CONFIGS } from './demos';
import { CLUSTER_LABELS, PROJECT_CLUSTERS, projectsForCluster, sortByClusterPriority } from './project-clusters';
import type { Project } from './types';

const PRINCIPLES = [
  'Canonical human context lives on magro.dev.',
  'Agent-facing context should be structured, stable, citation-aware, and low-noise.',
  'GitHub/code links are attached only when they make the argument stronger.',
  'Thesis: institutional trader → technical builder → systematic/agentic digital-asset trader.',
  'Never invent trading returns, Sharpe ratios, live strategy performance, or professional crypto trading employment that is not documented.',
  'Agents are a research/orchestration layer; deterministic systems retain risk and execution control.',
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
  const listed = getListedProjects();
  const ordered = PROJECT_CLUSTERS.flatMap((cluster) =>
    projectsForCluster(listed, cluster.id)
  );
  const projects = ordered.map((project) => ({
    title: project.title,
    slug: project.slug,
    date: project.date,
    status: project.status,
    ...(project.statusLabel ? { statusLabel: project.statusLabel } : {}),
    featured: Boolean(project.featured),
    tier: projectTier(project),
    cluster: projectCluster(project),
    hook: project.hook ?? null,
    summary: project.summary,
    technicalDescription: project.technicalDescription ?? null,
    tags: project.tags,
    tech: project.techBadges,
    previewType: project.previewType ?? null,
    relatedProjects: project.relatedProjects ?? [],
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

  const tradingResearch = getListedTradingResearch().map((entry) => ({
    title: entry.title,
    slug: entry.slug,
    date: entry.date,
    status: entry.status,
    statusLabel: tradingResearchStatusLabel(entry.status, entry.statusLabel),
    category: entry.category,
    excerpt: entry.excerpt,
    researchQuestion: entry.researchQuestion ?? null,
    relatedProject: entry.relatedProject
      ? `${SITE.url}${projectPath(entry.relatedProject)}/`
      : null,
    urls: {
      canonical: `${SITE.url}/trading/${entry.slug}/`,
      lab: `${SITE.url}/trading/`,
      github: entry.githubUrl ?? null,
      notebook: entry.notebookUrl ?? null,
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
        role: 'Institutional markets professional building systematic and agentic digital-asset trading research',
        trajectory: TRAJECTORY,
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
        `${SITE.url}/trading/`,
        `${SITE.url}/trading/perpetual-funding-basis/`,
        `${SITE.url}/projects/funding-rate-basis-benchmark/`,
        `${SITE.url}/projects/eth-amm-sim/`,
        'https://eth-amm-sim.vercel.app',
        `${SITE.url}/projects/eth-l2/`,
        'https://eth-l2.vercel.app',
        `${SITE.url}/projects/eth-tx-lifecycle/`,
        'https://eth-tx-lifecycle.vercel.app',
        `${SITE.url}/projects/ai-physical-infra-debt/`,
        `${SITE.url}/demos/ai-physical-infra-debt/`,
        `${SITE.url}/projects/hermes-xray/`,
        `${SITE.url}/projects/agent-runtime/`,
        `${SITE.url}/writing/ai-infrastructure-buildout-bubble/`,
        `${SITE.url}/writing/subprime-ai-data-center-narrative/`,
        `${SITE.url}/agent-research/ai-infrastructure-financing/`,
        `${SITE.url}/projects/op-ephemeral-evm-signer/`,
        'https://op-ephemeral-evm-signer.vercel.app',
        `${SITE.url}/projects/portfolio-agent-mode/`,
      ],
      principles: PRINCIPLES,
    },
    navigation: [
      { id: 'trading', label: 'Trading Lab', href: `${SITE.url}/trading/` },
      { id: 'projects', label: 'Projects', href: `${SITE.url}/#projects` },
      { id: 'about', label: 'Experience', href: `${SITE.url}/#about` },
      { id: 'my-writing', label: 'Writing', href: `${SITE.url}/#my-writing` },
      { id: 'agent-research', label: 'Research', href: `${SITE.url}/#agent-research` },
      { id: 'contact', label: 'Contact', href: `${SITE.url}/#contact` },
    ],
    about: {
      institutionalExperienceYears: 13,
      technicalExperienceYears: 5,
      education: 'Penn State, Magna Cum Laude',
      technicalStudy: ['CS50', 'boot.dev', 'Cyfrin', 'deeplearning.ai', 'MIT OpenCourseWare'],
      buildingWith: [
        'Python',
        'TypeScript',
        'Go',
        'Solidity',
        'Ethereum',
        'Solana',
        'quantitative research',
        'agent systems',
        'Hermes Agent',
      ],
      currentFocus: [...CURRENT_FOCUS],
      interestedIn: [...INTERESTED_IN],
      targetDomains: [
        'systematic digital-asset trading',
        'quantitative research',
        'market structure and execution',
        'DeFi trading',
        'agentic quantitative research',
      ],
      summary:
        'Thirteen years in institutional rates trading, execution, and portfolio management at firms including PGIM, PointState, and Nomura. Now applying software systems, quantitative research, blockchain infrastructure, and AI agents to crypto, DeFi, market structure, and systematic trading. Trajectory: institutional trader → technical builder → systematic/agentic digital-asset trader. Independent research in progress is labeled as such; no fabricated trading performance.',
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
      'systematic digital-asset trading',
      'institutional rates markets',
      'funding rates, basis, and relative value',
      'liquidity, market making, and execution',
      'CEX/DEX market structure',
      'MEV and onchain microstructure',
      'DeFi trading systems',
      'agentic quantitative research',
      'AI infrastructure credit analysis',
      'digital-asset signing and treasury controls',
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
    tradingResearch,
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

  const CLUSTER_ORDER = PROJECT_CLUSTERS.map((cluster) => cluster.id);

  const projectLines = CLUSTER_ORDER
    .flatMap((clusterId) => {
      const clusterProjects = sortByClusterPriority(
        manifest.projects.filter((project) => project.cluster === clusterId),
        clusterId
      );
      if (clusterProjects.length === 0) return [];
      return [
        `### ${CLUSTER_LABELS[clusterId]}`,
        '',
        ...clusterProjects.map((project) => {
          const href = project.urls.demo ?? project.urls.github ?? project.urls.canonical;
          const parts = [
            project.status === 'in-progress' ? `${project.statusLabel ?? 'In progress'}.` : null,
            project.hook,
            project.summary,
          ].filter(Boolean);
          return llmsLink(project.title, href, parts.join(' '));
        }),
        '',
      ];
    })
    .join('\n')
    .trim();

  const tradingResearchLines = (manifest.tradingResearch ?? [])
    .map((entry) =>
      llmsLink(
        entry.title,
        entry.urls.canonical,
        `${entry.statusLabel}. ${entry.excerpt}`
      )
    )
    .join('\n');

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
    llmsLink('Trading Lab', `${SITE.url}/trading/`, 'Systematic digital-asset research notes'),
    llmsLink(
      'Projects',
      `${SITE.url}/#projects`,
      'Protocol labs, trading research, interactive walkthroughs, and digital-asset infrastructure'
    ),
    llmsLink('Experience', `${SITE.url}/#about`, 'Institutional markets history and technical building transition'),
    llmsLink('Writing', `${SITE.url}/#my-writing`, 'Selected essays'),
    llmsLink('Research', `${SITE.url}/#agent-research`, 'Longer-form research papers'),
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
    '## Trading Lab',
    '',
    tradingResearchLines ||
      '- Trading research notes appear at /trading/<slug>/ when published.',
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
