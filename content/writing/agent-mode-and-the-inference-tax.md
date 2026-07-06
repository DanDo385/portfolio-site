---
title: Agent Mode and the Inference Tax
slug: agent-mode-and-the-inference-tax
date: 2026-07-02
status: published
category: Web for Agents
excerpt: "Agents spend most of their token budget decoding HTML before they read substance. Structured surfaces recover that context for actual reasoning."
coverImage: null
loomUrl: null
relatedProject: portfolio-agent-mode
---

Light mode is for human eyes. Agent Mode is for machine context. The gap between them is not aesthetic. It is measured in tokens, and tokens cost money.

When an agent fetches a web page, it gets raw HTML. Before it can reason about anything, it has to sort through nav bars, script tags, tracking pixels, class names, and nested divs to find the actual content. That sorting and extraction burns context window space on markup the model has to parse and then throw away.

Cloudflare put a number on this in February 2026. They measured their own blog post two ways: as HTML it consumed 16,180 tokens. As clean markdown, 3,150. Four-fifths of the token budget went to structure the model had to decode before it could read a single word of substance.

Now think about scale. An agent comparing ten product pages, reading five docs sites, pulling three research reports. It pays that 80% tax on every fetch. The tokens spent figuring out which div holds the price are tokens not spent figuring out whether the price is good.

Agent-readable surfaces cut the tax at the source. A structured file at a predictable path gives the model clean data with no classification step and no extraction step. The context budget goes straight to reasoning. The agent skips the busywork and spends its window on the actual job: comparing options, checking sources, making decisions.

## The cost math

Here is where it gets concrete. Token savings from clean data translate directly into API cost savings. And those savings are already large enough to fund a micropayment to the site serving the structured version.

Using Cloudflare's numbers: 16,180 tokens as HTML, 3,150 as structured data, 13,030 tokens saved per page. Priced across the most expensive models from four major providers:

| Model | Price/M | HTML cost | Clean cost | Savings | vs $0.005 |
|---|---|---|---|---|---|
| Claude Fable 5 | $10 | $0.1618 | $0.0315 | $0.1303 | 26.1x |
| GPT-5.6 Sol | $5 | $0.0809 | $0.0158 | $0.0652 | 13.0x |

All figures are input-token cost per page at published June 2026 rates. Output tokens would add to both columns. Claude Fable 5 at $10/M, GPT-5.6 Sol at $5/M, Grok 4 at $3/M, Gemini 3.1 Pro at $2/M.

On Claude Fable 5, reading one page of HTML costs $0.162. The same page as structured data costs $0.032. The savings, $0.130 per page, could pay a half-cent micropayment to the site owner 26 times over. Even on Gemini 3.1 Pro, the cheapest of the four, the savings cover the micropayment five times.

The point is not that every site should start charging agents tomorrow. The point is that the economics already work. The token cost of scraping decorative HTML exceeds what a rational micropayment for clean data would cost. Site owners who publish structured surfaces are providing a service that saves the caller real money. The gap between what agents waste on noise and what they would pay for signal is where a market forms.

## Where this is heading

Today most agent workflows run one model for everything. That will not last. The direction is task-aware routing: a cheap fast model for simple lookups, a mid-tier model for summarization, a frontier model for complex reasoning. When the model is picked per task, the token cost of noise matters more, not less. The cheap model's entire context window is small. Waste 80% of a 4,000-token budget on HTML structure and there is almost nothing left for analysis. Clean data extends what the cheap model can do before you have to escalate to the expensive one.

That is the real leverage. Agent-readable surfaces do not just save tokens on frontier models. They let lower-cost models handle tasks that currently require frontier context windows. If a $2/M model can do the job when you feed it clean data instead of raw HTML, the cost curve bends hard.

## Standards are forming

llms.txt is already shipping. The proposal at [llmstxt.org](https://llmstxt.org) defines a root markdown file with a summary, guidance, and links to clean `.md` versions of key pages. FastHTML and nbdev use it in production. WebMCP, now in Chrome Origin Trial for version 149, goes further by letting sites expose JavaScript functions and forms as explicit agent tools instead of forcing agents to guess DOM intent. MCP itself worked because it offered a narrow, open contract. Any client could discover capabilities without per-server adapters.

The pattern repeats across layers. A lightweight, copyable shape that removes per-site parsing code. The risk is fragmentation: if every domain invents its own JSON keys, agents still pay the tax across more code paths. The opportunity is convergence on a small shared vocabulary (owner, projects, claims, sources) that site owners can implement in minutes and agents can trust without custom adapters.

Implementation cost has dropped below the threshold of effort. A static `/agent.json` or `/llms.txt` takes an afternoon for a simple site and one build step for a dynamic one. When code generation tools can produce the file for you, the marginal cost approaches zero.

A standard is forming because the economics demand it. The token cost of inference became visible. The implementation cost collapsed. The gap between noise and signal is now wide enough to fund its own market. Sites that publish clean surfaces first will see their content used more accurately, more often, and at a lower cost to the agents doing the reading. The ones that don't will keep paying the tax in tokens, latency, and missed citations.
