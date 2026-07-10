import { redirect } from 'next/navigation';

/** Legacy path: Interact now links to the separate Vercel app. */
export default function EthL2DemoPage() {
  redirect('https://eth-l2.vercel.app');
}
