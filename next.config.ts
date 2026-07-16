import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        // Old resume filename (with spaces) was published in agent.json/llms.txt
        // before the July 2026 rewrite replaced it with Daniel_Magro_Resume.pdf.
        source: '/resume/Daniel%20Magro%20Resume.pdf',
        destination: '/resume/Daniel_Magro_Resume.pdf',
        permanent: true,
      },
      {
        source: '/projects/eth-l2-fraud-proof',
        destination: '/projects/eth-l2',
        permanent: true,
      },
      {
        source: '/projects/eth-l2-fraud-proof/',
        destination: '/projects/eth-l2/',
        permanent: true,
      },
      {
        source: '/demos/eth-l2-fraud-proof',
        destination: 'https://eth-l2.vercel.app',
        permanent: true,
      },
      {
        source: '/demos/eth-l2-fraud-proof/',
        destination: 'https://eth-l2.vercel.app',
        permanent: true,
      },
      {
        source: '/projects/agent-machine-deep-dive',
        destination: '/projects/agent-runtime',
        permanent: true,
      },
      {
        source: '/projects/agent-machine-deep-dive/',
        destination: '/projects/agent-runtime/',
        permanent: true,
      },
      {
        source: '/demos/agent-machine-deep-dive',
        destination: '/demos/agent-runtime',
        permanent: true,
      },
      {
        source: '/demos/agent-machine-deep-dive/',
        destination: '/demos/agent-runtime/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
