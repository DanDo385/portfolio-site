/**
 * Central homepage focus signals. Update here rather than scattering copy
 * across Hero / CurrentlyResearching / Contact.
 */
export const TRAJECTORY =
  'Institutional trader → technical builder → systematic/agentic digital-asset trader';

export const CURRENT_FOCUS = [
  'Funding & basis',
  'Liquidity & market making',
  'CEX/DEX execution',
  'MEV & onchain market structure',
  'Systematic research',
  'Agent-assisted trading workflows',
] as const;

export const INTERESTED_IN = [
  'Digital-asset trading',
  'Quantitative research',
  'Systematic trading',
  'Execution / market structure',
  'DeFi trading',
  'Trading systems',
  'Agentic quantitative research',
] as const;

export const CURRENTLY_RESEARCHING = [
  {
    title: 'Perpetual funding & basis',
    summary:
      'Cross-venue carry, persistence, execution costs, and regime behavior across digital-asset markets.',
    href: '/trading/perpetual-funding-basis/',
  },
  {
    title: 'Agentic quantitative research',
    summary:
      'Specialized agents for market research, hypothesis generation, experimentation, and monitoring, with deterministic systems retaining risk and execution control.',
    href: '/projects/hermes-xray/',
  },
  {
    title: 'Onchain market structure',
    summary:
      'Liquidity, execution, MEV, and CEX/DEX interactions through simulation and transaction lifecycle tooling.',
    href: '/projects/eth-amm-sim/',
  },
] as const;
