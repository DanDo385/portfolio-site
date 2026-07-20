import type { Metadata } from 'next';
import { DemoShell } from '@/components/DemoShell';

const DEMO_SRC = '/project-assets/ai-physical-infra-debt/demo/index.html?embed=1';

export const metadata: Metadata = {
  title: 'AI Infrastructure Financing Demo | Daniel Magro',
  description:
    'Fullscreen interactive research report on GPU-backed credit, securitization, and funding transmission.',
};

export default function AiPhysicalInfraDebtDemoPage() {
  return (
    <DemoShell
      title="AI Infrastructure Financing"
      projectHref="/projects/ai-physical-infra-debt"
      wide
    >
      <div className="demo-shell-frame-wrap">
        <iframe
          title="AI Infrastructure Financing interactive report"
          src={DEMO_SRC}
          className="demo-shell-frame"
          loading="eager"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </DemoShell>
  );
}
