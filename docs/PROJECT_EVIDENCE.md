# Project evidence

Internal reference documenting what each primary project actually contains, based on direct
inspection of the sibling project repositories on this machine (`~/Code/<repo>`). Case-study
copy on the site (`components/ProjectCaseStudy.tsx`, per-project case study data) must stay
consistent with this document. Update this file first when a project's implementation
changes, then update the site copy to match.

Template used for each entry:

```text
Problem:
What Daniel designed:
What Daniel implemented:
Architecture:
Verification and testing:
What is simulated:
Known limitations:
Production analogy:
Production differences:
Demo:
Repository:
Interview-safe description:
```

---

## Rollup Mechanics Lab (`eth-l2`)

```text
Problem: Rollup fraud proofs and validity proofs are usually explained in prose or slides.
  The project asks: can a visitor watch a lying sequencer get caught, and compare that
  mechanism side by side with a validity-proof lane, in one interactive session?

What Daniel designed: The overall lab structure (optimistic lab at /op, ZK-style lab at
  /zk), the bond/challenge-window economics, the WebSocket event vocabulary that drives the
  frontend visualizations, and the hosted split between a Vercel frontend and an Ubuntu VPS
  backend reached through a Cloudflare Tunnel.

What Daniel implemented: A Go backend that spawns three local Anvil chains (L1, an
  optimistic L2, and a ZK-style L2), a seeded-PRNG sequencer that occasionally posts a bad
  state root, an "honest watcher" that flags mismatches off-chain, Solidity contracts for
  bond posting, Merkle-bisection fraud proofs with on-chain one-step re-execution
  (`FraudProofGame`, `SwapStepVM`), a separate `ZkRollupMock` / `ZkValidityVerifier` path
  that re-executes a batch witness on L1, and a Next.js frontend that streams WebSocket
  events into two focused labs.

Architecture:
  - Go orchestration process spawns and manages three Anvil chains (L1 8545, OP-L2 9545,
    ZK-L2 10545 in local dev; Anvil stays loopback-only and idle-stops after sessions end).
  - Solidity contracts: `OptimisticPortalMock` (batch posting, bonds, challenge window,
    finalization), `FraudProofGame` (Merkle bisection over swap-VM traces, one-step
    re-execution), `SwapStepVM` (minimal step machine), `HonestSwapEngine`/lying engines
    (swappable L2 execution logic), `ZkValidityVerifier` and `ZkRollupMock` (validity-lane
    submission and witness re-execution).
  - Go API + WebSocket service (`/stream`) emits typed events: `block_mined`,
    `batch_posted`, `batch_flagged`, `batch_verified`, `batch_challenged`, `dispute_stage`,
    `dispute_resolved`, `bond_settled`, `zk_inspect_ready`, `session_state_changed`,
    `error_occurred`.
  - Next.js frontend renders a lab chooser, then `/op` (batch canvas, Block Inspector,
    Optimistic Tracker, opcode walkthroughs) and `/zk` (proof-batch canvas, concept tour,
    public-input panel, validity/DA caveats).
  - Hosted split: Vercel Next.js frontend -> same-origin API rewrites -> Cloudflare Tunnel
    (`api-staging-eth-l2.magro.dev`) -> Ubuntu VPS (`127.0.0.1:8080` Go API, managed by
    systemd `eth-l2.service` and `cloudflared-eth-l2.service`) -> loopback-only Anvil chains
    spawned on demand per session.

Verification and testing: Foundry/Solidity tests exist per contract family
  (`OptimisticPortal.t.sol`, `FraudProofGame.t.sol`, `ZkRollup.t.sol`,
  `ZkValidityVerifier.t.sol`, `DisputeGame.t.sol`, `SwapEngines.t.sol`,
  `TradeEngine.t.sol`), plus Go unit tests in the backend (`internal/seed/prng_test.go`,
  `internal/sourcemap/sourcemap_test.go`, `internal/trace/diff_test.go`,
  `internal/watcher/honest_test.go`, `internal/config/ports_test.go`,
  `internal/server/security_test.go`, `internal/server/idle_stop_test.go`). Deterministic
  scenarios: the fraud-injection rate (~1 in 8 OP batches) and invalid-claim rate (~1 in 16
  ZK batches) are seeded so a reviewer can reliably observe both the honest and dishonest
  path in a short session.

What is simulated: All three chains are local Anvil instances, not public testnets or
  mainnet. Bond sizes (0.1 ETH), the 120-second challenge window, and the batch window (5
  L2 blocks) are demo-scale values chosen for a short live session, not production
  parameters. Most importantly, the "/zk" lab's validity check is L1 witness re-execution
  inside `ZkValidityVerifier`, a deterministic re-run of the batch witness. It is a
  simplified, mock validity-verification path used as a stand-in for a succinct proof. It
  is not a real zero-knowledge proving system: there is no SNARK/STARK circuit, no succinct
  proof generation, and no succinct verifier. It should never be described as "ZK validity
  proofs" without that qualification.

Known limitations:
  - No public testnet or mainnet deployment; everything runs on local/hosted Anvil chains.
  - The ZK lane's "proof" is re-execution, not succinctness, zero-knowledge, or a real
    circuit; it demonstrates the validity-vs-optimistic mechanics tradeoff, not a production
    ZK rollup's cryptography.
  - Challenge windows and bond sizes are tuned for a short demo, not economic security
    modeling at production scale.
  - The app never auto-challenges; a human has to click "Verify locally" and choose to post
    a bond, which is intentional (mirrors real challenger economics) but means the fraud
    path is not automatically resolved end to end without user action.

Production analogy: OP Stack-style optimistic rollups (fraud proofs, challenge windows,
  sequencer bonds) and general-purpose zkEVM/zk-rollup systems (validity proofs replacing a
  challenge window).

Production differences: A production optimistic rollup runs a ~7-day challenge window (vs.
  120 seconds here), posts to a public L1, and has independently operated challenger
  infrastructure. A production ZK rollup generates and verifies a real succinct
  zero-knowledge proof (e.g. a SNARK/STARK circuit compiled from the state-transition
  function) rather than re-executing a witness directly on L1.

Demo: Open the Vercel app at https://eth-l2.vercel.app, choose the Optimistic Rollup Lab
  (`/op`) to watch batches post, watch for a flagged batch, then click through "Verify
  locally" and the challenge flow. Choose the ZK Rollup Lab (`/zk`) to watch the
  witness-re-execution path and read the validity/DA caveats panel, which explains the
  simplification directly in the UI.

Repository: https://github.com/DanDo385/eth-l2

Interview-safe description: "An interactive lab comparing optimistic fraud proofs with a
  simplified, mock validity-verification path that stands in for a succinct ZK proof. Built
  with a Go orchestration layer, Solidity contracts, three Anvil chains, WebSocket events,
  and a Next.js interface, hosted with a Vercel frontend and an Ubuntu VPS backend behind a
  Cloudflare Tunnel."
```

## Ethereum Transaction Lifecycle Visualizer (`eth-tx-lifecycle`)

```text
Problem: What actually happens between a wallet clicking "send" and a transaction becoming
  irreversible is spread across mempool mechanics, builder/searcher auctions, MEV-Boost
  relays, and Casper-FFG finality, each with its own vocabulary. The project asks: can one
  guided visualization make that whole pipeline legible with live chain data?

What Daniel designed: The six-step lifecycle model (wallet send, mempool, builders/
  searchers, relays, validators/proposers, finality), the aggregation strategy across
  execution JSON-RPC, consensus REST, and MEV relay data sources, and the split between a
  beginner-facing lifecycle guide and an advanced MEV Lab.

What Daniel implemented: A Go backend that aggregates heterogeneous upstreams (execution
  JSON-RPC via public providers, consensus Beacon API, and MEV relays such as Flashbots)
  with per-source timeouts, fallback behavior, and a generic TTL cache; MEV detection logic
  that scans blocks for sandwiches, arbitrage, liquidations, and JIT liquidity using parallel
  receipt fetching; transaction decoding that classifies swaps, transfers, approvals, mints,
  claims, and contract calls; and a Next.js frontend with a synced step explainer, gas
  pricing explainers, and a transaction-tracking view that follows a given hash (or
  "latest") through the pipeline.

Architecture:
  - Go backend aggregates three upstream classes: execution JSON-RPC (Alchemy/Infura-style
    providers), consensus REST (Beacon API), and MEV relay data (e.g. Flashbots). No local
    node is required; the backend uses public APIs with bounded worker pools (goroutines)
    for parallel fetches.
  - Shared generic TTL cache across data sources; health/liveness/readiness endpoints for
    each upstream class.
  - Next.js frontend renders the lifecycle guide (`/`) with a synced diagram/explainer, and
    an advanced MEV Lab (`/mev-lab`) for MEV detection and PBS (proposer-builder separation)
    framing.
  - Hosted split: Vercel Next.js frontend -> Cloudflare Tunnel
    (`api-staging-eth-tx.magro.dev`) -> Go API on the Ubuntu VPS (loopback bind), kept
    durable via systemd.

Verification and testing: Go unit tests across backend packages
  (`config/config_test.go`, `internal/clients/eth/eth_test.go`,
  `internal/server/server_test.go`, `internal/domain/snapshot_test.go`,
  `internal/domain/track_test.go`, `internal/pkg/cache_test.go`,
  `internal/pkg/health_test.go`). Health/readiness endpoints give an operational check that
  each upstream class (execution, consensus, relay) is reachable.

What is simulated: Nothing in the transaction data itself; the app reads real Ethereum
  mainnet data from public providers rather than a local chain. The "simulation" boundary
  here is about backend resilience (timeouts, fallback, caching), not synthetic chain state.

Known limitations:
  - Depends on third-party public API availability (Alchemy/Infura-style JSON-RPC, Beacon
    API, MEV relay endpoints); if those upstreams degrade, the app's live-data views degrade
    with them (mitigated by caching and fallback, not eliminated).
  - MEV detection is heuristic (pattern detection over receipts/traces), not a
    cryptographically certain classification; it can mislabel or miss edge cases.
  - No wallet-side transaction submission from the app itself; the app visualizes existing
    transactions and network state rather than acting as a wallet or relay.

Production analogy: Block explorers and MEV-monitoring dashboards (e.g. Etherscan-style
  explorers, Flashbots-style MEV dashboards) that aggregate execution, consensus, and relay
  data for end users.

Production differences: A production-grade explorer or MEV dashboard would run its own
  indexed data pipeline (not just live API aggregation), maintain historical data at scale,
  and carry SLAs and on-call operations for its data sources. This project demonstrates the
  aggregation and presentation layer with production-style resilience patterns (timeouts,
  fallback, caching, health checks) rather than production-scale historical indexing.

Demo: Open https://eth-tx-lifecycle.vercel.app, step through the six lifecycle stages on the
  homepage, then visit `/mev-lab` and look for sandwich/arbitrage/liquidation detections on
  recent blocks. Enter a transaction hash (or "latest") to track it through the pipeline.

Repository: https://github.com/DanDo385/eth-tx-lifecycle

Interview-safe description: "A full-stack visualization of what happens between clicking
  send and a transaction becoming irreversible: execution and consensus layers, MEV,
  builder auctions, and finality. Go backend aggregating live execution, consensus, and MEV
  relay data with timeouts, fallback, and caching; Next.js frontend; hosted with a Vercel
  UI and an Ubuntu VPS backend behind a Cloudflare Tunnel."
```

## Agent Runtime (`agent-runtime`)

```text
Problem: Tool-using agent runtimes (platform input, session hydration, an agent loop, tool
  dispatch, persistence) are usually understood by reading two different unrelated
  codebases. The project asks: can the same five-part runtime model be shown side by side
  across two real, differently-shaped open-source agent runtimes?

What Daniel designed: The five-part runtime model (platform input, session hydration,
  agent loop, tool dispatch, persistence) used as the comparison frame, and the choice of
  two reference runtimes with genuinely different shapes: Hermes Agent (Python, monolithic
  gateway/session/loop) and OpenClaw (TypeScript, factored packages).

What Daniel implemented: A single self-contained static HTML/CSS page that maps each of the
  five runtime parts to real source files and public APIs in both reference projects, with
  compact Python-shaped Hermes excerpts and TypeScript-shaped OpenClaw excerpts that
  preserve filenames, class/function names, and data flow while omitting product-specific
  branches and provider details. Also implemented: `agent-runtime-map.json` and `llms.txt`
  agent-readable exports, sticky sidebar navigation, and dark/light theme persistence.

Architecture:
  - Entirely static: one `index.html` (HTML, CSS, and JavaScript) with no backend, no build
    step, and no package manager required to view it.
  - Content is a curated comparison table and per-section code excerpts, not a live
    connection to either reference repository.
  - `agent-runtime-map.json` is a machine-readable version of the same five-part mapping,
    exposed for Agent Mode.
  - On magro.dev: embedded at `/demos/agent-runtime` (in-site fullscreen) via an iframe of
    the synced static bundle, with `externalDemoUrl` pointing at the standalone Vercel copy.

Verification and testing: There is no backend or runtime logic to unit test; correctness
  here means the code excerpts and file/function names accurately reflect the real
  `hermes-agent` and `openclaw` source at the time of writing. The primary "verification" is
  the source-anchor table in the README, which lists the exact files each excerpt is drawn
  from (e.g. `run_agent.py`, `agent/conversation_loop.py`, `tools/registry.py` for Hermes;
  `packages/agent-core/src/agent-loop.ts`, `harness/agent-harness.ts`,
  `harness/session/session.ts`, `harness/session/jsonl-storage.ts` for OpenClaw).

What is simulated: The code excerpts are compact reconstructions, not verbatim file
  contents pulled live from the two repositories, and not an executable runtime. Nothing
  runs; there is no live agent loop executing inside this project.

Known limitations:
  - No live connection to the reference repositories; if Hermes Agent or OpenClaw change
    their internals, this page can drift out of date until manually refreshed.
  - The excerpts intentionally omit product-specific branches and provider details, so they
    are illustrative rather than complete implementations.
  - No interactivity beyond navigation and theme toggling; it is a walkthrough, not a live
    sandbox.

Production analogy: Internal engineering documentation or architecture decision records that
  compare how two real systems solve the same problem, using real source references instead
  of abstract diagrams.

Production differences: A production agent-runtime comparison tool would pull live source
  from both repositories (e.g. via CI-synced snapshots) rather than manually curated
  excerpts, and would need a process to detect drift when either upstream project changes.

Demo: Open `/demos/agent-runtime` on magro.dev (or the standalone Vercel copy) and scroll
  through the five sections; each section shows the Hermes and OpenClaw treatment of that
  runtime stage side by side, with source anchors linking back to the real files.

Repository: https://github.com/DanDo385/agent-runtime

Interview-safe description: "An interactive walkthrough comparing how two real tool-using
  agent runtimes, Hermes Agent (Python) and OpenClaw (TypeScript), implement the same
  five-part loop: platform input, session hydration, the agent loop, tool dispatch, and
  persistence, with source references back to both projects."
```

## Ethereum RPC Monitor (`eth-rpc-monitor`)

```text
Problem: Teams integrating with Ethereum JSON-RPC providers need an honest, low-abstraction
  way to see tail latency, reliability, and cross-provider agreement on the same block,
  without a heavy SDK hiding what is actually happening on the wire.

What Daniel designed: The four-subcommand CLI shape (`block`, `test`, `snapshot`,
  `monitor`), the design stance of no app-level response cache and no automatic retries (so
  failures remain a visible signal rather than being silently smoothed over), and the
  framing of RPC monitoring as a market-structure concern (single canonical ledger vs.
  traditional T+1/T+2 reconciliation).

What Daniel implemented: A Go CLI (`ethrpc`) built on Cobra, with raw `net/http` +
  `encoding/json` (no heavy RPC SDK): `block` fetches one block from an auto-selected or
  pinned provider; `test` runs many samples per provider and reports P50/P95/P99/Max
  latency with a colored table and optional JSON report; `snapshot` fetches the same block
  tag from every configured provider and detects height/hash mismatches; `monitor` runs a
  live terminal dashboard with an intentionally "cold" client per tick to measure realistic
  poll cost.

Architecture:
  - Single Go binary (`ethrpc`), YAML-configured provider list (`config/providers.yaml`).
  - `internal/rpc` (client, types, formatting), `internal/cli` (subcommands: block, test,
    monitor), `internal/format` (tail-latency, snapshot, monitor, error formatting),
    `internal/config`, `internal/reportjson` (optional JSON report output).
  - No response cache and no automatic retries by design; a failed call is reported as a
    failure rather than retried or masked.

Verification and testing: Go unit tests across the CLI and supporting packages
  (`internal/cli/block_test.go`, `internal/cli/monitor_test.go`,
  `internal/format/test_tail_latency_test.go`, `internal/format/brief_error_test.go`,
  `internal/format/snapshot_test.go`, `internal/format/monitor_test.go`,
  `internal/rpc/types_test.go`, `internal/rpc/format_test.go`,
  `internal/rpc/client_test.go`, `internal/config/config_test.go`,
  `internal/reportjson/reportjson_test.go`), plus a CI workflow badge in the README
  referencing GitHub Actions.

What is simulated: Nothing; this tool talks to real configured JSON-RPC providers (public
  endpoints such as Alchemy/Infura or a self-hosted node) over HTTP. There is no local
  chain or mock RPC server involved in normal use.

Known limitations:
  - CLI only; there is no hosted UI or backend service, and it is not meant to have one
    (this is intentional, not a gap: it is a monitoring tool, not a dashboard product).
  - No app-level caching or automatic retries means transient provider hiccups surface
    directly to the user, which is a deliberate tradeoff for signal clarity, not a
    production reliability feature.
  - Requires the user to supply their own provider API keys/config; it does not ship with
    hosted credentials.

Production analogy: Provider health/latency monitoring tools used by trading, market-making,
  or infrastructure teams to compare RPC provider performance and detect divergence before
  it affects downstream systems.

Production differences: A production monitoring deployment would run continuously (not
  on-demand from a terminal), persist historical latency/agreement data, alert on
  thresholds, and likely add authentication and multi-tenant configuration. This project
  demonstrates the measurement and comparison logic, not a hosted, continuously-running
  monitoring service.

Demo: No hosted Interact target; this is a CLI. Reviewers should read the README quick
  start and run `./bin/ethrpc test --samples 3` or `./bin/ethrpc monitor` locally against
  their own provider config, or review the source and CI badge on GitHub.

Repository: https://github.com/DanDo385/eth-rpc-monitor

Interview-safe description: "A Go CLI for Ethereum JSON-RPC monitoring: block inspection,
  mempool snapshots, cross-provider agreement checks, and real-time transaction tracing,
  built with no app-level cache and no automatic retries so provider failures stay visible
  as a signal rather than being hidden."
```

## Hermes X-Ray (`hermes-xray`)

```text
Problem: Agent observability demos often either overclaim (implying access to hidden
  chain-of-thought or secrets) or underclaim (showing nothing useful). The project asks: can
  a browser-only tool show a believable, honestly-scoped slice of a tool-using agent's
  runtime path, without overclaiming what is actually observable?

What Daniel designed: The explicit observability boundary (what is shown vs. what is
  deliberately not shown, documented directly in the README and the UI), and the five-stage
  walkthrough (prompt intake, context construction, loop policy, tool dispatch, verification
  and persistence) as a companion to, but independent from, Agent Runtime.

What Daniel implemented: A standalone browser-only HTML/CSS/JavaScript application (no
  backend, no build step) that accepts a user prompt and renders model-visible prompt
  context, operational rationale summaries, tool events, token estimates, stop reasons, and
  verification evidence; a machine-readable `hermes-xray.json` runtime/observability map;
  and an `llms.txt` agent-readable summary.

Architecture:
  - Entirely client-side: `index.html` contains the full HTML, CSS, and JavaScript
    experience; no server-side component and no external API calls for the core walkthrough.
  - `hermes-xray.json` documents the observability boundary machine-readably (what is
    exposed vs. withheld).
  - On magro.dev: embedded at `/demos/hermes-xray` via an iframe of the synced static bundle
    (loaded with `?embed=1` to hide the demo's own chrome), with `externalDemoUrl` pointing
    at the standalone Vercel copy.

Verification and testing: No backend logic to unit test; verification here is structural
  and documentation-based: the README and `hermes-xray.json` explicitly enumerate what the
  tool exposes (exact user input, model-visible prompt/context summaries with redaction,
  loop stages and stop reasons, tool names/arguments/results and verification, provider
  token/latency metrics when available) and what it does not (hidden chain-of-thought,
  secrets/credentials, private memory/session fragments, fabricated token precision, or
  fake live model output).

What is simulated: The "model" behavior shown in the walkthrough is a scripted
  representation of a Hermes-style tool-using agent's runtime path, not a live call to a
  real LLM. Token estimates and tool events are illustrative and clearly scoped as such
  rather than presented as live production telemetry.

Known limitations:
  - No live model integration; it demonstrates the shape of observability data a real agent
    runtime could expose, not a live connection to a production agent.
  - Independent from Agent Runtime by design (separate repo, slug, and history), which means
    the two projects can drift in style even though they share a five-part inspiration.
  - Browser-only scope: no server-side logging, persistence, or multi-session state.

Production analogy: Agent observability/tracing dashboards (e.g. tool-call tracing, prompt
  inspection panels) used to debug and audit production LLM agent systems.

Production differences: A production agent-observability system would instrument a real,
  live agent runtime (capturing actual tool calls, actual token usage, and actual latencies)
  and would need redaction, access control, and retention policy for sensitive session data.
  This project demonstrates the UI/data model for that kind of observability without a live
  backend or real model integration.

Demo: Open `/demos/hermes-xray` on magro.dev (or the standalone Vercel copy), enter a
  prompt, and step through prompt intake, loop policy, tool dispatch, and the
  verification/persistence boundary panel.

Repository: https://github.com/DanDo385/hermes-xray

Interview-safe description: "A standalone browser observability lab, inspired by Agent
  Runtime, that lets a visitor enter a prompt and inspect model-visible context, loop
  stages, tool events, token estimates, verification, and persistence boundaries, with an
  explicit, documented boundary around what is and is not observable."
```

## AMM Simulation Engine (`eth-amm-sim`)

```text
Problem: AMM mechanics (constant-product pricing, fees, LP economics, price impact) are
  easier to reason about with a live, inspectable system than with formulas alone. The
  project asks: can a small, realistic on-chain AMM be wired end to end (contracts, backend,
  UI) so the mechanics are demoable in an interview-length session?

What Daniel designed: The end-to-end demo shape (contracts -> Go execution engine -> React
  dashboard), the bot-driven stress model (bots trading against the pool to generate
  meaningful metrics), and the account/performance model for comparing trading strategies.

What Daniel implemented: Solidity contracts for a token (`AppleToken`) and a
  constant-product AMM (`AppleAMM`); a Go backend using go-ethereum bindings that
  orchestrates sessions, executes trades on-chain, and streams metrics; a data pipeline from
  on-chain reads to WebSocket-streamed metrics (trades, candles/TWAP, volatility, LP
  metrics); and a Vite + React dashboard with live charts/controls and a per-account
  performance view.

Architecture:
  - Local dev: Foundry (Anvil + `forge`) deploys `AppleToken`/`AppleAMM`; a Go backend
    (`go-ethereum` bindings) runs session and bot orchestration and executes on-chain trades;
    a Vite + React SPA reads REST snapshots and a WebSocket stream for live charts.
  - Hosted split (same Ubuntu VPS + Cloudflare Tunnel pattern as eth-l2/eth-tx-lifecycle):
    Vercel SPA (`eth-amm-sim.vercel.app`) -> REST/WebSocket via
    `api-staging-eth-amm-sim.magro.dev` -> Ubuntu VPS (Go backend on a loopback port,
    Anvil on a loopback port) running `AppleToken`/`AppleAMM`.
  - Hosted SPA is wired on the portfolio card as Interact → Open in New Tab to
    `https://eth-amm-sim.vercel.app`. YouTube short/full embeds come from source
    `repo-resources/media.json` via build-time resource sync.

Verification and testing: Foundry/Solidity tests exist per contract
  (`AppleAMM.t.sol`, `AppleToken.t.sol`), run via `forge test` against the local Anvil chain.

What is simulated: The chain itself is a local (or VPS-hosted, loopback-only) Anvil
  instance, not a public testnet or mainnet; "whale" and bot trades are synthetic load
  generated by the backend to stress the pool and produce metrics, not organic user demand.

Known limitations:
  - No public testnet or mainnet deployment; all trading activity happens against a local or
    hosted Anvil instance.
  - Bot-driven trade flow is designed to make the dashboard demoable, not to model real
    market participant behavior or adversarial MEV against the pool.
  - Portfolio card wires Interact → Open in New Tab to the hosted Vercel SPA and
    embeds short/full YouTube walkthroughs from the source media kit.

Production analogy: Constant-product AMMs such as Uniswap v2-style pools, and the
  operational tooling (bots, dashboards) teams use to monitor and stress-test them.

Production differences: A production AMM would face real, adversarial order flow (including
  MEV searchers), require audited contracts and formal verification beyond unit tests, and
  operate on a public chain with real liquidity at risk, rather than a controlled Anvil
  environment with synthetic bot flow.

Demo: Interact → Open in New Tab → `https://eth-amm-sim.vercel.app`. Project page embeds
  short and full YouTube walkthroughs from source `repo-resources/media.json`. Reviewers can
  also inspect contracts and the Go backend on GitHub, or run `make up` locally per the
  repository README.

Repository: https://github.com/DanDo385/eth-amm-sim

Interview-safe description: "An AMM and EVM mechanics lab covering impermanent loss under
  volatility regimes, fee accrual, and fixed-point math, with Solidity contracts, a Go
  execution engine using go-ethereum bindings, and bots that stress the pool to generate
  metrics, modeled the way a rates trader would run scenarios."
```

## Portfolio Agent Mode (`portfolio-site`, slug `portfolio-agent-mode`)

```text
Problem: AI agents and language models reading a portfolio site by parsing decorative HTML
  waste most of their token budget on structure instead of substance. The project asks: can
  a portfolio site expose a small, stable, structured layer that agents can read directly?

What Daniel designed: The three-surface shape (`/agent` human explainer, `/agent.json`
  structured manifest, `/llms.txt` compact router), the principle that agent-facing context
  should be structured, stable, low-noise, and citation-aware, and the rule that canonical
  human context stays on magro.dev rather than being duplicated as long prose inside the
  manifest.

What Daniel implemented: `lib/agent.ts` (manifest and `llms.txt` generator), `app/agent/
  page.tsx` (human-readable Agent Mode page), `app/agent.json/route.ts` and
  `app/llms.txt/route.ts` (route handlers that serve the generated manifest/router), and the
  per-project `llms.txt` discovery convention (`projectLlmsTxtPath`) that auto-links deeper
  project-specific agent briefs from the site-wide manifest.

Architecture:
  - `lib/agent.ts` is the single source of truth: it reads project/writing/research content
    via `lib/content.ts`, derives per-project URLs (canonical, github, demo, media,
    project-specific `llms.txt`), and assembles both the JSON manifest and the markdown
    router from the same data.
  - `app/agent.json/route.ts` and `app/llms.txt/route.ts` serve that generated output as
    routes; `app/agent/page.tsx` renders a human-readable explanation plus a live preview of
    the manifest.
  - No separate database or service; this is derived entirely from the same content sources
    that drive the human-facing homepage, so the two surfaces cannot silently drift out of
    sync as long as `lib/agent.ts` is kept current (see `AGENTS.md`).

Verification and testing: No dedicated automated test suite for the manifest content itself;
  verification is structural (the manifest is generated from the same typed content loaders
  used by the homepage, so a broken shape fails the Next.js build) and manual (the
  `AGENTS.md` checklist requires spot-checking `/agent.json` and `/llms.txt` after content
  changes).

What is simulated: Nothing; this is a real, functioning feature of the live site, not a
  simulation. The "demo" is the actual production manifest and router.

Known limitations:
  - `/llms.txt` and `/agent.json` are not an established, widely-adopted standard; they
    should be described as an emerging proposal for giving language models a cleaner entry
    point into website content, not as settled practice.
  - Coverage is limited to what `lib/agent.ts` explicitly serializes; any site section not
    wired into the manifest will not appear there even if it exists on the human site.
  - Depends on the author manually keeping `lib/agent.ts` synchronized with navigation, About
    copy, and positioning changes elsewhere on the site (see `AGENTS.md`'s manual-update
    checklist); there is no automatic drift detection beyond the build succeeding.

Production analogy: Structured metadata and machine-readable feeds that sites already expose
  for other consumers (sitemaps for search engines, OpenGraph/structured data for social
  previews), applied to the newer case of language-model agents.

Production differences: A larger-scale version of this idea would likely need actual usage
  analytics (which agents/models request these endpoints and how), versioned schema
  guarantees, and possibly authenticated or rate-limited access if usage grew; this
  implementation is intentionally minimal and low-noise for a single-owner portfolio site.

Demo: Visit `/agent` for the human explanation, `/agent.json` for the structured manifest,
  and `/llms.txt` for the compact router. Compare the three against the live homepage
  sections and project pages to confirm they describe the same site.

Repository: https://github.com/DanDo385/portfolio-site

Interview-safe description: "A minimal agent-readable layer for magro.dev: a human overview
  at /agent, a structured JSON manifest at /agent.json, and a low-noise markdown router at
  /llms.txt, generated from the same content sources as the human-facing site so the two
  cannot silently drift apart."
```
