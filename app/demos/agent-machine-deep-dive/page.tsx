import type { Metadata } from 'next';
import { DemoShell } from '@/components/DemoShell';

const DEMO_SRC = '/project-assets/agent-machine-deep-dive/demo/index.html';

export const metadata: Metadata = {
  title: 'Agent Machine Deep Dive Demo | Daniel Magro',
  description:
    'Fullscreen interactive walkthrough of the AI agent machine loop on magro.dev.',
};

export default function AgentMachineDemoPage() {
  return (
    <DemoShell
      title="Agent Machine Deep Dive"
      projectHref="/projects/agent-machine-deep-dive"
      wide
    >
      <div className="demo-shell-frame-wrap">
        <iframe
          title="Agent machine deep dive interactive walkthrough"
          src={DEMO_SRC}
          className="demo-shell-frame"
          loading="eager"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </DemoShell>
  );
}
