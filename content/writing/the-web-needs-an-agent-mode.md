---
title: The Web Needs an Agent Mode
slug: the-web-needs-an-agent-mode
date: 2026-07-02
status: published
category: Web for Agents
excerpt: "Light mode is for human eyes. Agent Mode is for machine context: structured, canonical, provenance-aware surfaces that help AI systems understand what a site actually means."
coverImage: null
loomUrl: null
relatedProject: portfolio-agent-mode
---

Light mode is for human eyes. Agent Mode is for machine context.

The web is full of beautifully decorated pages that are hostile to the systems now asked to read them. Navigation, cards, carousels, hero copy, tracking links, and marketing layout all make sense to humans. An AI agent sees a different problem: a noisy pile of HTML where the canonical claims, sources, project links, author identity, and current context have to be inferred.

That inference tax is going to matter.

Agents will not only search pages. They will compare products, cite work, route opportunities, summarize people, diligence projects, generate memos, and act on behalf of users. If a website has no machine-readable surface, the agent has to guess what matters. Guessing is a bad interface.

## The small idea

Every serious site should expose an agent-readable layer next to the human one.

Not a chatbot. Not another dark-mode toggle. A structured context surface.

For this site, the first slice is intentionally small:

- `/agent/` explains the agent-facing surface to humans.
- `/agent.json` exposes structured context: owner, positioning, projects, writing, links, and canonical topics.
- `/llms.txt` acts as a low-noise router for language models before they scrape decorative HTML.

This is not a finished standard. It is a proof artifact. The point is to make the idea concrete enough to critique, improve, and reuse.

## Why this matters

The current web assumes the reader is a person looking at pixels. The next web increasingly has two readers:

1. Humans, who need story, design, trust, and taste.
2. Agents, who need stable context, provenance, constraints, and links that map cleanly to action.

Most websites optimize only for the first reader. That leaves agents reconstructing meaning from layout artifacts. It also leaves site owners with little control over which claims get treated as canonical.

Agent Mode gives the site a better contract:

- Here is who owns this domain.
- Here is what this site is about.
- Here are the canonical projects and essays.
- Here are the links that matter.
- Here is what should not be inferred from decorative copy.

## The finance analogy

This is similar to attribution infrastructure in markets.

A trade blotter, a settlement message, or an onchain transaction without attribution can still move value. But the system becomes more useful when provenance, ownership, routing, and intent are legible.

The same pattern shows up in agentic web infrastructure. A page can still be scraped without Agent Mode. But it becomes more useful when the site publishes structured context directly.

## What this proves

The first implementation on `magro.dev` is deliberately modest. It proves that the portfolio can be both human-readable and agent-readable without rebuilding the whole site.

That is the important wedge.

Do the smallest useful thing first. Publish it. Let the essay point at the artifact and the artifact point back at the essay. That loop is stronger than a thousand words about what the agent web might become.

## Next versions

The next layer should add:

- per-essay `agent.json` exports with citations and claim boundaries
- project-level machine-readable README summaries
- JSON-LD for person, project, and article metadata
- canonical source and freshness fields
- a reusable schema that other sites can copy without ceremony

The goal is not to make websites uglier for humans. The goal is to give non-human readers a better door.

Humans get the page. Agents get the context. Everybody stops pretending HTML decoration is a knowledge graph.
