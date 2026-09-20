/** One selection shared by the homepage and agent-readable manifest. */
export const FEATURED_WORK = [
  {
    slug: 'eth-tx-lifecycle', discipline: 'Data integration', format: 'Hosted application',
    title: 'Making Ethereum legible.',
    summary: 'A single view of a transaction across execution, consensus, and MEV relay data. Built with a Go service and a Next.js interface.',
    evidence: 'Three data sources. Timeouts, caching, and health checks.',
  },
  {
    slug: 'hermes-xray', discipline: 'AI systems', format: 'Interactive teaching lab',
    title: 'Inside the agent loop.',
    summary: 'An interactive walkthrough of model context, tool calls, verification gates, and persistence in a Hermes-style agent. A static teaching lab.',
    evidence: 'Makes context and tool boundaries visible. No live inference.',
  },
  {
    slug: 'eth-amm-sim', discipline: 'Financial engineering', format: 'Hosted simulation',
    title: 'Market mechanics, made tangible.',
    summary: 'A Go-backed AMM lab for exploring price impact, liquidity concentration, fee accrual, and impermanent loss across volatility scenarios.',
    evidence: 'Connects market intuition to inspectable simulation behavior.',
  },
  {
    slug: 'ai-physical-infra-debt', discipline: 'Applied research', format: 'Interactive research',
    title: 'Underwriting the AI buildout.',
    summary: 'An interactive credit memo exploring GPU-backed lending and data-center securitization, with recovery scenarios and source provenance.',
    evidence: 'Financial judgment translated into an explorable research tool.',
  },
] as const;
