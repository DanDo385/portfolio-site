import type { Metadata } from 'next';
import { DemoShell } from '@/components/DemoShell';

const DEMO_SRC = '/project-assets/hermes-xray/demo/index.html';

export const metadata: Metadata = {
  title: 'hermes-xray Demo | Daniel Magro',
  description:
    'Fullscreen browser observability walkthrough for a Hermes-style tool-using agent.',
};

export default function HermesXrayDemoPage() {
  return (
    <DemoShell
      title="hermes-xray"
      projectHref="/projects/hermes-xray"
      wide
    >
      <div className="demo-shell-frame-wrap">
        <iframe
          title="hermes-xray interactive walkthrough"
          src={DEMO_SRC}
          className="demo-shell-frame"
          loading="eager"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </DemoShell>
  );
}
