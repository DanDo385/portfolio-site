import { getAgentManifest } from '@/lib/agent';

export function AgentJsonPreview() {
  const manifest = getAgentManifest();
  const json = JSON.stringify(manifest, null, 2);

  return (
    <pre className="agent-code project-preview-code">
      <code>{json}</code>
    </pre>
  );
}
