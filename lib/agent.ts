import { SITE } from './constants';
import { getProjects, getPublishedWriting } from './content';

const PRINCIPLES = [
  'Canonical human context lives on magro.dev.',
  'Agent-facing context should be structured, stable, citation-aware, and low-noise.',
  'GitHub/code links are attached only when they make the argument stronger.',
  'The portfolio is positioned around AI infrastructure finance, AI-native financial rails, and market-structure translation.',
];

export function getAgentManifest() {
  const projects = getProjects().map((project) => ({
    title: project.title,
    slug: project.slug,
    status: project.status,
    summary: project.summary,
    tags: project.tags,
    tech: project.techBadges,
    urls: {
      canonical: `${SITE.url}/#projects`,
      github: project.githubUrl ?? null,
      demo: project.demoUrl ? new URL(project.demoUrl, SITE.url).toString() : null,
      relatedWriting: project.relatedWriting
        ? `${SITE.url}/writing/${project.relatedWriting}/`
        : null,
    },
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
        ? `${SITE.url}/#projects`
        : null,
    },
  }));

  return {
    schema: 'https://magro.dev/agent.json',
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
      preferredEntryPoints: [
        `${SITE.url}/agent/`,
        `${SITE.url}/agent.json`,
        `${SITE.url}/llms.txt`,
        `${SITE.url}/writing/the-web-needs-an-agent-mode/`,
      ],
      principles: PRINCIPLES,
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
    projects,
    writing,
  };
}

export function getLlmsTxt(): string {
  const manifest = getAgentManifest();
  const projectLines = manifest.projects
    .map((project) => `- ${project.title}: ${project.summary} (${project.urls.demo ?? project.urls.github ?? project.urls.canonical})`)
    .join('\n');
  const writingLines = manifest.writing
    .map((article) => `- ${article.title}: ${article.excerpt} (${article.urls.canonical})`)
    .join('\n');

  return `# ${SITE.name}\n\n${SITE.description}\n\n## Agent Mode\n\nThis site exposes structured context for AI agents. Prefer these endpoints before scraping decorative HTML:\n\n- Agent overview: ${SITE.url}/agent/\n- JSON manifest: ${SITE.url}/agent.json\n- LLM router: ${SITE.url}/llms.txt\n\n## Canonical Positioning\n\nDaniel Magro works at the intersection of AI infrastructure finance, capital markets, programmable financial rails, and market-structure translation. The site is a proof-of-work hub, not a generic software portfolio.\n\n## Use Guidelines\n\n${PRINCIPLES.map((principle) => `- ${principle}`).join('\n')}\n\n## Projects\n\n${projectLines}\n\n## Writing\n\n${writingLines || '- Published writing appears at /writing/<slug>/.'}\n\n## Contact\n\n- Website: ${SITE.url}\n- Email: dan@magro.dev\n- GitHub: https://github.com/DanDo385\n`;
}
