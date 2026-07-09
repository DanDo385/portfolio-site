import type { Metadata } from 'next';
import { DemoShell } from '@/components/DemoShell';
import { EthTxLifecycleInteractive } from '@/components/EthTxLifecycleInteractive';

export const metadata: Metadata = {
  title: 'Ethereum Transaction Lifecycle Demo | Daniel Magro',
  description:
    'Fullscreen interactive walkthrough of the Ethereum transaction lifecycle on magro.dev.',
};

export default function EthTxLifecycleDemoPage() {
  return (
    <DemoShell
      title="Ethereum Transaction Lifecycle"
      projectHref="/projects/eth-tx-lifecycle"
    >
      <EthTxLifecycleInteractive />
    </DemoShell>
  );
}
