---
title: "The Subprime AI Data Center Narrative: A Trader's View, Part II"
slug: subprime-ai-data-center-narrative
date: 2026-07-29
status: published
category: AI x Finance
excerpt: "Part II of the AI infrastructure financing series: Ed Zitron's subprime-data-center comparison, checked against funding structure, SPVs, and hyperscaler demand."
coverImage: null
loomUrl: null
relatedProject: ai-physical-infra-debt
---

This is Part II of my AI infrastructure financing series. [Part I](/writing/ai-infrastructure-buildout-bubble/) asked whether the buildout is a bubble through a fixed-income lens: who owns the debt, how it is funded, and where correlation hides. This piece takes Ed Zitron's ["The Subprime Data Center Crisis"](https://www.wheresyoured.at/the-subprime-data-center-crisis) and checks whether his claims change that read.

It is tempting. AI stocks, chipmakers, memory suppliers, and neoclouds are trading at valuations that make people reach for the last time markets looked this stretched. The easy map is 2005 through 2007, when housing was ripping in California, Nevada, and Florida.

## What 2005 looked like from a mortgage desk

In the summer of 2005 I was interning on the Mortgage Sales desk at Merrill Lynch. After three weeks, my final project was pitching a new CDO they were launching. When I looked under the hood at the collateral pool, the alarm bells went off immediately. I picked the deal with the least California exposure I could find, and it still sat close to 70%. No-doc loans had been standard practice for years. Pushing bonds with a 7% or 8% yield was just what people did.

The answers to every question were the same: the bonds are backed by real estate, and look here (for the thousandth time) at a chart of real estate that only goes up. The logic was that even if the underwriting was garbage, as long as property values did not drop (look at the chart again), borrowers could refinance if rates rose. And by the way, the paper was wrapped in insurance anyway.

Banks routinely funded those CDOs through off-balance-sheet SIVs that money market funds gobbled up. That is why the first thing I dug into in [Part I](/writing/ai-infrastructure-buildout-bubble/) was how this AI data center buildout is actually financed.

By 2007, investment banks were sitting on these vehicles and running around 25x leverage in the ordinary course of business. There was a direct asset-liability mismatch at the dealer level: banks were warehousing and facilitating the paper on short-term balance sheet. When the SIV commercial paper market dried up, the leverage cascade hit. The most leveraged players with the thinnest capital cushions, the non-commercial investment banks, were wiped out overnight.

I am raising this because leverage and funding mismatches are still the scariest part of any bubble. Back then you also had outright fraud, junk collateral, and falling home prices, all multiplied by a thick web of shadow derivatives.

## Why the bank comparison does not travel cleanly

First, banks got neutered after 2008. Investment banks were absorbed or turned into bank holding companies. Rules like Dodd-Frank made it much harder for dealers to run at those old leverage ratios.

Anyone who lived through the crisis is allowed to flinch when asset-backed structures show up again. I get the reflex. I just look at today's setup and see a different machine.

Zitron writes:

> Put simply, every time somebody builds a data center, they form a completely separate entity that owns the chips, owns the debt, and, in many cases, owns most of the risk. These SPVs only pay out to their creditors in the event that customer revenue flows in, which means that they are dependent both on the speed of construction of said data centers and their customers' ability to pay.

Reading that actually made me more comfortable with my original stance. How else do you finance a multi-trillion-dollar infrastructure project without putting the whole thing on one balance sheet?

These SPVs are funded by large private equity and private credit pools. Investors put capital in because hard contracts with large tech companies sit behind a lot of the demand. Who else would you rather have buying the compute? Amazon, Apple, Meta, Alphabet, and Microsoft are sitting on nearly $750 billion in cash and liquid assets after spending hard. They keep buying because falling behind competitors is existential for the core business.

The SPV separation isolates risk. If a project fails or GPUs depreciate faster than expected, more of the damage stays inside that box. Lenders are already haircutting the hardware up front, usually advancing something like 60 cents on the dollar against the chips. That is the same conservatism I flagged in Part I.

A lot of this paper sits with long-term institutional investors who want the duration and can take write-downs without forcing a funding run the next morning.

It feels odd to say this with 2008 as the reference frame, but the structure is doing a lot of what you want a credit structure to do: draw cash as needed, ring-fence risk in SPVs, and haircut hardware values before the loan goes out. That keeps more of the risk in private credit hands.

## Why hyperscalers keep buying

A fair question is whether hyperscalers can justify what they pay for compute against what they get back. The economics look coherent to me for a few direct reasons.

**Demand is already here.** OpenAI and Anthropic already have paying users. Subscription revenue scaled hard, and Anthropic's enterprise growth has been among the fastest anyone has seen in software. People are paying for this compute now.

**Training versus inference.** Frontier training burns capital at an absurd rate. Over the next couple of years, more of the stack shifts toward running the models. As models get better at the job, the cost to serve a basic query should fall while subscription and API revenue can stay sticky. Margins get better as inference takes a larger share of the stack.

**The cost of doing nothing.** For Big Tech, losing cloud, search, or software share is worse than a few quarters of thinner margins from overspend. With tens of billions in annual cash flow, they keep buying.

## Where that leaves me

If the data center buildout comes under pressure, investors still have to answer a practical question: what else is the growth trade?

Some SPVs will be messy. Some equity valuations will look wrong. Some GPU loans will not pencil. Parts of this market can lose a lot of money and still leave the financing architecture looking less dangerous than 2007. Frustration that AI has moved slowly through real companies is no reason to scrap the physical buildout. Wiring agents into real workflows takes coordination, safety checks, and risk management. That work is underway.

So Zitron's SPV description does not change my core read from [Part I](/writing/ai-infrastructure-buildout-bubble/). I still care most about who owns the paper and how they fund it. On that score, this still looks like long-duration private credit risk. If the ownership or funding picture changes, my view changes with it.
