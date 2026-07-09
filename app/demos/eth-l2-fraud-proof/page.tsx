import type { Metadata } from 'next';
import { DemoShell } from '@/components/DemoShell';
import { ExternalDemoFrame } from '@/components/ExternalDemoFrame';

/** Live Vercel frontend; Go backend on MBP via api-staging-eth-l2.magro.dev */
const DEMO_SRC = 'https://eth-l2.vercel.app';

export const metadata: Metadata = {
  title: 'Rollup Mechanics Lab Demo | Daniel Magro',
  description:
    'Fullscreen Rollup Mechanics Lab: optimistic and ZK rollup labs on magro.dev.',
};

export default function EthL2FraudProofDemoPage() {
  return (
    <DemoShell
      title="Rollup Mechanics Lab"
      projectHref="/projects/eth-l2-fraud-proof"
      wide
    >
      <ExternalDemoFrame
        src={DEMO_SRC}
        title="Rollup Mechanics Lab on eth-l2.vercel.app"
        loading="eager"
        variant="shell"
      />
    </DemoShell>
  );
}
