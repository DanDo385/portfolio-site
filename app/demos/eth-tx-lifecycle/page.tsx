import type { Metadata } from 'next';
import { DemoShell } from '@/components/DemoShell';
import { ExternalDemoFrame } from '@/components/ExternalDemoFrame';

/** Live Vercel frontend; Go backend on MBP via api-staging-eth-tx.magro.dev */
const DEMO_SRC = 'https://eth-tx-lifecycle.vercel.app';

export const metadata: Metadata = {
  title: 'Ethereum Transaction Lifecycle Demo | Daniel Magro',
  description:
    'Fullscreen interactive Ethereum transaction lifecycle visualizer on magro.dev.',
};

export default function EthTxLifecycleDemoPage() {
  return (
    <DemoShell
      title="Ethereum Transaction Lifecycle"
      projectHref="/projects/eth-tx-lifecycle"
      wide
    >
      <ExternalDemoFrame
        src={DEMO_SRC}
        title="Ethereum transaction lifecycle visualizer on eth-tx-lifecycle.vercel.app"
        loading="eager"
        variant="shell"
      />
    </DemoShell>
  );
}
