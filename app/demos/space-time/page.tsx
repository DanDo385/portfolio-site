import type { Metadata } from 'next';
import { DemoShell } from '@/components/DemoShell';

const DEMO_SRC = '/project-assets/space-time/demo/index.html?embed=1';

export const metadata: Metadata = {
  title: 'Space-time Twin Lab Demo | Daniel Magro',
  description:
    'Fullscreen interactive special-relativity laboratory for the twin paradox.',
};

export default function SpaceTimeDemoPage() {
  return (
    <DemoShell title="Space-time Twin Lab" projectHref="/projects/space-time" wide>
      <div className="demo-shell-frame-wrap">
        <iframe
          title="Space-time Twin Lab interactive walkthrough"
          src={DEMO_SRC}
          className="demo-shell-frame"
          loading="eager"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </DemoShell>
  );
}
