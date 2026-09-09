import { redirect } from 'next/navigation';

/** Trading Lab is paused until Perpetual Funding & Basis Benchmark ships. */
export default function TradingLabPage() {
  redirect('/#projects');
}
