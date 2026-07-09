import type { Metadata } from 'next';
import { DemoShell } from '@/components/DemoShell';
import { ExternalDemoFrame } from '@/components/ExternalDemoFrame';

const DEMO_SRC = 'https://eth-l2.vercel.app';

export const metadata: Metadata = {
  title: 'L2 Fraud Proof Settlement Demo | Daniel Magro',
  description:
    'Fullscreen interactive optimistic rollup fraud-proof simulator on magro.dev.',
};

export default function EthL2FraudProofDemoPage() {
  return (
    <DemoShell
      title="L2 Fraud Proof Settlement Simulator"
      projectHref="/projects/eth-l2-fraud-proof"
      wide
    >
      <ExternalDemoFrame
        src={DEMO_SRC}
        title="L2 fraud proof settlement simulator"
        loading="eager"
        variant="shell"
      />
    </DemoShell>
  );
}
