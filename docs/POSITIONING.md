# Positioning

Internal reference for how magro.dev should describe Daniel Magro. This is the source of
truth for homepage copy, metadata, About section, Agent Mode, and resume-adjacent surfaces.
When copy drifts from this document, update the copy, not this document, unless the
underlying facts change.

## Canonical positioning statement

> Former institutional rates and macro trader and portfolio manager building systems at the
> intersection of market infrastructure, programmable finance, and AI agents. Combines
> thirteen years of experience in liquidity, collateral, execution, and risk with hands-on
> work in Go, Solidity, Ethereum infrastructure, APIs, and agent systems.

## Primary target roles

- Solutions architecture
- Technical strategy
- Digital-asset and financial-infrastructure product roles
- Technical business development
- Hybrid market-structure and engineering roles

## Secondary adjacent roles

- Developer relations or technical advocacy for financial infrastructure or crypto-native
  products, where the audience benefits from a market-structure translator who can also read
  code
- Platform or partnerships roles at trading venues, market infrastructure vendors, or
  digital-asset firms that need someone fluent in both the desk and the stack
- Research or strategy roles focused on market microstructure, collateral, or execution where
  hands-on technical fluency (Go, Solidity, EVM tooling) is a differentiator, not a
  requirement

## Roles not primarily targeted

- Generic junior or mid-level frontend/UI engineering roles. Daniel did not spend a career
  writing production frontend code, and the site should not imply that.
- Senior production backend/software engineering roles that assume years of shipping and
  operating production systems at scale. Daniel's engineering work is real, self-directed,
  and technically substantive, but it is a second act, not a decade of production ownership.
- Pure quant research roles disconnected from market structure, execution, or infrastructure.
- Generic "AI enthusiast" or prompt-engineering roles with no market-structure or
  infrastructure grounding.

## Homepage messaging hierarchy

1. **Hero** — who Daniel is (former institutional trader/PM), what he builds now (market
   infrastructure, programmable finance, AI agents), and what he is looking for (solutions
   architecture, technical strategy, technical BD).
2. **Selected projects** — the three flagship projects, immediately below the hero. This is
   the primary evidence a recruiter should see in the first screen or two.
3. **Experience and differentiators** — the thirteen-year institutional track record plus the
   builder track, framed as one combined advantage rather than two disconnected careers.
4. **Selected writing** — a small number of pieces that connect to financial infrastructure,
   AI infrastructure economics, agent systems, or market structure.
5. **Research** — longer-form research, positioned after writing so it supports rather than
   competes with the hiring thesis.
6. **Contact** — resume, email, and links.

Recent-content utilities may remain in the codebase for future use (e.g. a working
"what's new" feed on a future page), but Recent should not be the first homepage section or a
primary navigation item. Projects lead.

## The three flagship projects

1. **Rollup Mechanics Lab** (`eth-l2`) — optimistic fraud proofs vs. a simplified,
   mock validity-verification path standing in for a succinct ZK proof. Go orchestration,
   Solidity contracts, three Anvil chains, WebSocket events, Next.js UI.
2. **Ethereum Transaction Lifecycle Visualizer** (`eth-tx-lifecycle`) — what happens between
   broadcast and finality: mempool, builders/relays, MEV, consensus. Go backend, Next.js UI.
3. **Agent Runtime** (`agent-runtime`) — an interactive walkthrough of a tool-using agent
   loop: session hydration, tool dispatch, persistence, made observable step by step.

These three carry the hiring thesis because they combine infrastructure engineering
(Go/Solidity/EVM), market-structure literacy (fraud proofs, MEV, rollup economics), and
AI-agent systems thinking in one evidence set. Supporting projects (Ethereum RPC Monitor,
Hermes X-Ray, AMM Simulation Engine, Portfolio Agent Mode) remain available but do not
compete with the flagships for primary visual weight. Foundations projects stay collapsed.

## Language that must not be used

- Never use em dashes (—) in any published copy (homepage, `/agent`, `agent.json` prose
  fields intended for display, resume-adjacent copy, writing, research).
- Do not describe the Rollup Mechanics Lab's validity-verification path as a real,
  unqualified ZK proving system. Use "mock," "simplified," or "a stand-in for a succinct
  proof."
- Do not call simulated or staging systems "production" without qualification. "Production
  build," "production-style," or "staging" are fine when accurate; bare "production-grade" is
  not, unless the repository shows sustained production operation.
- Do not call `/llms.txt`, `/agent.json`, or similar surfaces an established or settled
  standard. Use "an emerging proposal" or equivalent hedged language.
- Do not label Daniel's own repositories as "open source contributions" to imply contribution
  to someone else's project. "Open-source project" (source is public) is fine; "open-source
  contribution" is reserved for actual contributions to external projects.
- Do not describe Daniel as a generic junior frontend engineer, and do not overstate him as a
  senior production software engineer with a long operating track record. The differentiated
  claim is the combination of institutional markets experience and hands-on technical work,
  not either one alone.
- Do not invent metrics, users, production deployments, external validation, or open-source
  contributions that are not backed by repository evidence or `docs/CLAIMS_LEDGER.md`.
