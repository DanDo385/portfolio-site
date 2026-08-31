---
title: Perpetual Funding & Basis Benchmark
slug: perpetual-funding-basis
date: 2026-08-17
status: researching
statusLabel: Research in progress
category: Trading Research
excerpt: Notes on perpetual funding, futures basis, cross-venue dislocations, carry after costs, and regime behavior in digital-asset markets.
researchQuestion: When does apparent funding or basis carry survive fees, slippage, collateral, and execution constraints across venues?
hypothesis: Cross-venue funding and basis dislocations are often overstated once transaction costs, margin, and regime changes are normalized.
market: Crypto perpetual futures, dated futures, and spot across major CEXs
methodology: Rates-desk framing applied to crypto funding and basis series. Venue prints normalized to a common tenor, then stress-tested against execution and collateral assumptions.
relatedProject: funding-rate-basis-benchmark
githubUrl: null
notebookUrl: null
---

# Perpetual Funding & Basis Benchmark

Notes on perpetual funding, futures basis, cross-venue dislocations, carry after costs, and regime behavior in digital-asset markets.

This entry is **research in progress**. No backtest results, Sharpe ratios, or live performance figures are published here.

## Research question

When does apparent funding or basis carry survive fees, slippage, collateral requirements, and execution constraints across venues?

## Why it matters

Institutional rates desks already think in carry, basis, and relative value. Crypto perpetuals publish an explicit funding mechanism that looks familiar, but venue conventions, leverage, liquidation risk, and stablecoin borrow costs change the economics. The goal is a rates-native benchmark that makes those differences explicit.

## Planned research objectives

These are objectives, not completed deliverables:

- Annualized and realized funding
- Spot/perpetual basis and dated futures basis
- Cross-exchange dispersion and funding persistence
- Regime changes and volatility interaction
- Liquidity constraints and execution costs
- Collateral requirements, leverage, and liquidation risk
- Stablecoin borrow costs
- Delta-neutral return paths, drawdowns, and capacity

## Current status

| Area | Status |
|------|--------|
| Portfolio thesis card | Published as a placeholder |
| Methodology write-up | In progress |
| Cross-venue data pipeline | Not published |
| Backtests / notebooks | Not published |
| Live or paper trading | Not started |

## Connection to institutional rates work

Thirteen years in institutional rates sales, trading execution, and portfolio management inform the framing: normalize the series, state assumptions, separate signal from implementation friction, and refuse to call something arb until costs and capacity are honest.

## Next experiment

Publish a transparent methodology page and a first historical series with known-answer checks against venue reference prints. Until then, treat this as independent trading notes, not a finished product.
