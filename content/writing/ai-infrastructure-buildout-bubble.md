---
title: "Is the AI Infrastructure Buildout a Bubble? A Fixed-Income Trader's Read"
slug: ai-infrastructure-buildout-bubble
date: 2026-07-20
status: published
category: AI x Finance
excerpt: "Funding structure, correlation, and GPU depreciation: a rates trader's lens on whether AI physical buildout is a bubble or a durable credit market."
coverImage: null
loomUrl: null
relatedProject: ai-physical-infra-debt
---

I ran one large research prompt through Fable and GPT-5.6 Sol to address the question investors keep asking: is AI infrastructure a bubble, or are we still early in a long buildout?

The answer is path-dependent, so this is an analysis rather than a yes-or-no verdict. The buildout is enormous, and parts of it can absolutely lose money, but the biggest risks are not where the AI doomers tend to locate them. I care much more about who owns the debt, how they fund it, and what happens when several supposedly separate risks turn out to be the same trade.

*(The full interactive report is here: [AI Infrastructure Financing: State of the Market](https://ai-physical-infra-debt-analysis.vercel.app). The portfolio project card and Agent Research paper are on magro.dev.)*

## Historical context: dotcom, subprime, and what we are actually comparing

I wanted a rough sense of scale against both the dotcom bubble and the 2008 financial crisis. Rough is the important word. Comparing peak subprime stock, six years of fiber investment, and one year of AI debt produces a clean chart and a bad signal.

On a multi-year basis, Street estimates put AI data-center and hyperscaler capex at roughly $2.0T to $2.5T from 2025 through 2027e, or about $2.2T at the midpoint. Peak U.S. subprime was about $1.3T outstanding in 2007. That number was smaller than I expected, especially with the U.S. MBS market now somewhere between $11T and $12T, although subprime sat inside an MBS market of roughly $8.5T at the time.

The dotcom-era telecom and fiber buildout is probably the better physical analogue. Estimates still cluster around $750B, with a wide range, spent over roughly six years by more companies than anyone could name. AI financing is a different number again. Cumulative AI-related debt for 2025 through 2027e is roughly $600B to $900B, with about $750B as the base path. The 2025 flow alone is closer to $200B.

The internet buildout worked; a lot of the securities attached to it did not. The NASDAQ fell from 5,048.62 in March 2000 to 1,114.11 by October 2002, a 78% drawdown. Credit spreads widened, but dotcom was overwhelmingly an equity story, while subprime was the reverse: credit and funding broke first. That distinction, equity risk versus funding risk, is the right framing for the AI buildout.

## Risk one: funding. Balance sheet is the scarce resource

I spent years trading fixed income: UST basis, liquidity premium, repo, off-the-runs versus on-the-runs, and futures calendar spreads shaped by inflexible real-money buyers expressing duration views through futures. It is a first-principles lesson in shadow banking, except the lesson arrives in P&L. Distortions can sit in plain sight because the balance sheet required to put on the offsetting trade is finite.

One of my best mentors reduced the whole exercise to a question: which trades offer the best return on balance sheet?

An investment bank does not hand that balance sheet out evenly. Higher-margin loans, credit, and mortgage products usually get more of it. The Treasury desk gets enough to facilitate auctions, warehouse reasonable off-the-run positions, and capture bid/offer; after that, scarce capacity goes to the customers and relationships the bank values most. That constraint lets obvious anomalies persist, and it explains why funding, more than the label stamped on a bond, matters so much in a crisis.

CDOs were the product of the day in the run-up to 2008. Much of the senior paper carried AAA ratings, and the top of the capital structure suffered fewer defaults than the headlines might lead you to think. What killed Bear Stearns and Lehman Brothers was not primarily the paper distributed to real-money investors. It was the inventory left behind: equity tranches with awful credit risk, unsold super-senior slices still in the warehouse, and all of it financed overnight through repo and commercial paper.

That's a great strategy... until your overnight lenders stop showing up.

That is why the first AI question is not "how much debt exists?" It is: who holds the paper, and how is it funded? The narrower version put to the research agent was how much AI debt is sitting on levered dealer balance sheets and financed short.

The honest answer is that we do not know precisely, but the available evidence looks nothing like the subprime setup. Most of the paper appears to sit with long-term private-credit investors and other locked-up pools of capital that do not need to roll their funding overnight. Those investors may still underwrite bad loans, and they may take losses, but they are much less vulnerable to the specific mechanism that turned mortgage losses into a dealer run in 2008. That is the structural difference that matters most.

## Risk two: correlation hides inside the stack

The second risk is correlation. I have watched UST and bond-future basis move toward a full point under stress. The participants who normally keep those markets efficient get forced out, and once the basis reaches that level, everybody knows what is happening. The market can remain "liquid" right up until the balance sheet disappears.

AI infrastructure has a similar concentration problem. The end customers for this compute are mostly the same companies: Meta, Microsoft, Google, Amazon, and the labs they finance. A shock to one tends to reach the others. Worse, it can hit the borrower and the collateral at the same time. The hyperscalers are loaded with cash and have enormous buffers to absorb shocks, which makes the concentration less fragile than it first appears.

The supply side looks more diversified. Land, power, hardware, cooling, memory, and the rest of the chain come from many suppliers. We all received an unwanted education in memory constraints during the recent DRAM crunch. These inputs arrive at different stages of the data-center buildout, but they still form a chain rather than a collection of independent exposures. A bottleneck anywhere can slow the entire process. It is almost anti-diversification: more suppliers, same shared failure path.

## Risk three: GPU depreciation gets too much attention

GPU useful life and utilization receive the most press, but in my opinion they matter less than funding.

I am not an AI hardware expert, so the disclosed accounting and lending terms have to carry the analysis here. CoreWeave uses a six-year life for technology equipment; Amazon uses five to six years for servers. Lenders already apply another layer of conservatism by advancing roughly 60 cents on the dollar of book value against the chips.

That seems reasonable. H100s may fall out of the frontier-training race as newer generations arrive, but they should remain useful for inference, and the market is going to need a lot of that regardless of whether frontier, open-source, or hybrid systems win at the model layer. If the chips become obsolete faster than the accounting assumes, investors can force new data-center projects and new bonds onto newer hardware, lower the advance rate, or charge more for the risk. None of that is painless, but it is easier to reprice than overnight funding that simply vanishes.

## Putting the risks together

The scale is not exactly comforting. Physical AI capex from 2025 through 2027e is already in the same league as, and perhaps larger than, peak subprime stock or the entire telecom and fiber episode. The cumulative debt beneath it is smaller: roughly $600B to $900B, with a base path around $750B. The first year contributes about $200B of AI-related debt plus roughly $27B of data-center securitization. Still, large bars on a chart do not show where the break happens. Ownership and funding do.

The current market is negotiated among sophisticated parties with far more information than existed at the household edge of subprime. Borrowers were taking out undocumented ARMs they could not afford and were decidedly not hedging their rate exposure with eurodollar futures. AI private-credit investors know what they are buying. That does not make them right, but it removes one layer of informational absurdity from the structure.

So I am cautiously constructive on the financing. The paper appears to be in stronger hands, and the funding mismatch looks far less dangerous than it did before 2008. If that changes, my view changes with it.

## What actually worries me

I keep coming back to software. Better model harnesses, using the right model for the job, interoperability across memory, models, and sessions, and open source winning more use cases could change the economics faster than accountants change GPU lives. That is where more uncertainty sits.

Even then, we will still need inference to run the robots.
