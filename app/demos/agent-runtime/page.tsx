import type { Metadata } from 'next';
import { DemoShell } from '@/components/DemoShell';

const DEMO_SRC = '/project-assets/agent-runtime/demo/index.html?embed=1';

export const metadata: Metadata = {
  title: 'Agent Runtime Demo | Daniel Magro',
  description:
    'Fullscreen interactive walkthrough of the AI agent runtime loop on magro.dev.',
};

export default function AgentRuntimeDemoPage() {
  return (
    <DemoShell
      title="Agent Runtime"
      projectHref="/projects/agent-runtime"
      wide
    >
      <div className="demo-shell-frame-wrap">
        <iframe
          title="Agent Runtime interactive walkthrough"
          src={DEMO_SRC}
          className="demo-shell-frame"
          loading="eager"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </DemoShell>
  );
}
