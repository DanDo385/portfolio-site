import { getAgentManifest } from '@/lib/agent';

function getCardPreviewManifest() {
  const manifest = getAgentManifest();

  return {
    schema: manifest.schema,
    schemaVersion: manifest.schemaVersion,
    site: manifest.site,
    agentMode: {
      endpoints: manifest.agentMode.endpoints,
      principles: manifest.agentMode.principles,
    },
    projects: manifest.projects.map((project) => ({
      title: project.title,
      slug: project.slug,
      summary: project.summary,
    })),
    writing: manifest.writing.map((article) => ({
      title: article.title,
      slug: article.slug,
    })),
    research: manifest.research.map((paper) => ({
      title: paper.title,
      slug: paper.slug,
    })),
  };
}

export function AgentJsonPreview() {
  const json = JSON.stringify(getCardPreviewManifest(), null, 2);

  return (
    <div className="project-preview-shell">
      <pre className="agent-code project-preview-code">
        <code>{json}</code>
      </pre>
    </div>
  );
}
