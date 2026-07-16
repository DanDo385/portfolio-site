# Resume rewrite recommendation

`public/resume/Daniel Magro Resume.pdf` exists in this repository only as a compiled PDF.
There is no editable source (no `.docx`, `.tex`, `.md`, or generator script) checked in, so
this agent cannot safely regenerate the PDF without risking layout breakage. Per the task
instructions, the PDF is left unchanged and this document contains the exact recommended
replacement copy for Daniel to apply in whatever tool produced the original (Google Docs,
Word, Canva, etc.), then re-export and replace the file at that path.

This is copy guidance only. It does not change any Sharpe ratio, dollar figure, portfolio
size, or Primary Dealer claim; every one of those is marked "revise" (not "verified") in
`docs/CLAIMS_LEDGER.md`, and the task's non-negotiable rules say not to modify those without
verified evidence. Only structural sections (summary, projects, skills, education heading)
are updated below.

## What changes

1. **Summary** — replaced with the canonical positioning summary from this task.
2. **`PROJECTS & OPEN SOURCE` → `SELECTED ENGINEERING PROJECTS`** — now features exactly the
   three flagship projects (Rollup Mechanics Lab, Ethereum Transaction Lifecycle, Agent
   Runtime) instead of five, each with two lines: what was built, and an architecture/
   verification/decision line. Portfolio Agent Mode, Hermes X-Ray, and AMM Simulation Engine
   are dropped from the resume's project list (they remain listed on magro.dev under
   Supporting engineering work; a resume has less room than a website).
3. **Skills line** — restructured into an "Engineering" and "Agent systems" line.
4. **`EDUCATION & CERTIFICATIONS` → `EDUCATION & TECHNICAL TRAINING`**.

## What does not change

- The entire **Professional Experience** section (RAMM.ai, Independent E-Commerce Operator,
  Prudential/PGIM, PointState, Nomura, Merrill Lynch & Jefferies), including every Sharpe
  ratio, dollar figure, and the Jefferies Primary Dealer sentence, stays exactly as currently
  worded in the PDF. See `docs/CLAIMS_LEDGER.md` for the interview-safe framing of each of
  these claims; none are altered here.
- Contact header, GPA figures, and Community & Interests section stay exactly as currently
  worded.

## Recommended replacement copy

```text
DANIEL MAGRO
Port St. Lucie, FL  |  dan@magro.dev  |  github.com/DanDo385  |  linkedin.com/in/dmagro
Portfolio: https://magro.dev  -  projects, writing, Agent Mode, and infrastructure thesis

SUMMARY
Former institutional rates and macro trader and portfolio manager building systems at the
intersection of market infrastructure, programmable finance, and AI agents. Combines
thirteen years of experience in liquidity, collateral, execution, and risk with hands-on
engineering in Go, Solidity, TypeScript, Python, Ethereum, and agent runtimes.

Core expertise:
Market structure, liquidity & settlement, trading & risk, DeFi mechanics, agentic systems

Engineering: Go, Solidity, TypeScript, Python, Foundry, Geth, JSON-RPC, EVM systems
Agent systems: Tool use, session state, structured interfaces, observability, and persistence

SELECTED ENGINEERING PROJECTS

Rollup Mechanics Lab
github.com/DanDo385/eth-l2
-  Built an interactive lab comparing optimistic fraud proofs with a simplified, mock
   validity-verification path that stands in for a succinct ZK proof.
-  Go orchestration across three Anvil chains, Solidity fraud-proof and validity-lane
   contracts, and a WebSocket-driven Next.js UI, covered by Foundry and Go test suites.

Ethereum Transaction Lifecycle
github.com/DanDo385/eth-tx-lifecycle
-  Built a full-stack visualization of a transaction's path from broadcast through mempool,
   MEV, builder auctions, and finality, using live chain data.
-  Go backend aggregating execution, consensus, and MEV relay APIs with timeouts, fallback,
   and caching, plus a Next.js frontend; verified with Go unit tests across backend packages.

Agent Runtime
github.com/DanDo385/agent-runtime
-  Built an interactive walkthrough comparing how two real tool-using agent runtimes, Hermes
   Agent (Python) and OpenClaw (TypeScript), implement the same five-part loop.
-  A static, source-anchored comparison: every code excerpt is tied to a specific file in
   either reference project, verified against a source-anchor table in the README.

PROFESSIONAL EXPERIENCE
[Unchanged. Keep every line exactly as currently worded in the PDF, including all Sharpe
ratios, dollar figures, and the Jefferies Primary Dealer sentence. See docs/CLAIMS_LEDGER.md
for interview-safe framing of each claim; do not alter the substance of any of these bullets.]

Product & Web3 Platform Contributor
03/2024 - 07/2025
RAMM.ai, New York, NY
-  Owned the technical and external translation layer for an early-stage Web3 marketplace: wrote EVM smart contracts and built the product
   frontend and public website end to end.
-  Took the product story into the field at retail and Web3 conventions nationwide, explaining the marketplace model and on-chain value
   proposition to retailers, prospective partners, and users.

Independent E-Commerce Operator (Automation & Market Analysis)
05/2019 - 07/2022
Self-Employed
-  Automated supply monitoring and execution optimization across retail platforms using Python; analyzed secondary-market liquidity,
   pricing, and operational risk.
-  Generated average annual profits of approximately $100K, $215K, and $155K across three years through automated execution in a
   constrained opportunity set.

Vice President - Fixed Income Portfolio Manager
04/2017 - 04/2019
Prudential Financial (PGIM), Newark, NJ
-  Managed global interest-rate and relative-value portfolios across U.S., Canadian, European, and Japanese markets, achieving a
   personal Sharpe ratio of 2.1 and contributing to outperformance of multi-billion-dollar real-money portfolios.

Vice President - Asian Hours Macro Execution Desk
05/2015 - 02/2017
PointState Capital, New York, NY
-  Executed cross-asset fixed income, FX, equity, and derivatives trades during Asia hours as the real-time interface between portfolio
   managers and global trading desks.

Vice President - Proprietary Trading
03/2011 - 05/2015
Nomura Securities, New York, NY
-  Traded global rates, FX, and equities across U.S., European, and Japanese markets, delivering positive P/L annually with a personal
   Sharpe ratio of 2.4 versus a desk average of approximately 1.8.

Institutional Fixed Income Sales
07/2006 - 02/2011
Merrill Lynch & Jefferies, New York, NY
-  Covered institutional interest-rate clients within senior sales pods generating approximately $45MM in annual production at Merrill Lynch
   and $10MM at Jefferies; worked with the Federal Reserve and other regulators contributing to Jefferies' Primary Dealer designation.

EDUCATION & TECHNICAL TRAINING
B.S. Finance, Pennsylvania State University - Magna Cum Laude
Overall GPA: 3.73  |  Major GPA: 3.93
Cyfrin Updraft  |  boot.dev  |  CS50  |  MIT OpenCourseWare

COMMUNITY & INTERESTS
Volunteer assisting new citizens with documentation and English support; animal shelter volunteer; active pickleball player.
```

## Next step for Daniel

Apply the "What changes" edits above in the source tool used to produce the current PDF,
export, and replace `public/resume/Daniel Magro Resume.pdf` with the new export. No code
changes are required afterward; `RESUME_PDF` in `lib/constants.ts` already points at that
exact filename and both the hero "View resume" button and the Contact section's View/Download
resume modal already resolve to it.
