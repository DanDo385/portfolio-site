---
title: Agent Mode and the Inference Tax
slug: agent-mode-and-the-inference-tax
date: 2026-07-02
status: published
category: Web for Agents
excerpt: "Agents burn most of their tokens decoding HTML. Structured surfaces like /llms.txt and /agent.json cut that tax and open a market for clean data."
coverImage: null
loomUrl: null
relatedProject: portfolio-agent-mode
---

Just like light/dark mode for web-based user interfaces, [/llms.txt](https://llmstxt.org) and `/agent.json` are setting standards for agentic consumption. This is a bit of a tricky situation, because many companies do not want their data scraped, so don't expect Reddit or Medium to start using these standards anytime soon. It's really for content that the website wants agents to reference, so it currently exists mainly in documentation pages and other open research platforms.

The token usage required to reason through complex web pages is truly astounding. Cloudflare ran a study in February 2026, measuring their own blog post two ways: as HTML, it consumed 16,180 tokens; as clean markdown, 3,150 [1]. Four-fifths of the token budget went to structure the model had to decode before it could read a single word of substance. 80% is a crazy number just to get to the data you're extracting.

As these numbers scale, it makes much more sense to use micropayments for users. But since it's a standard that isn't widely adopted, it's currently still cheaper to pay for the reasoning required to extract the data. I'd be surprised if startups don't emerge in this space offering MCPs or APIs that hand over cleaned-up data fitting these standards.

Longer term, there are forces fighting against each other. Token costs are likely to drop, agentic engineering is likely to enable better model selection, and KV-cache interoperability between models is likely to improve. On the other hand, these standards are genuinely effective, and it's always better not to waste inference on a web that wasn't built for agents.

Like everything else in AI, things are moving fast and furious. Not everyone agrees with this assumption: John Mueller from Google called markdown-for-agents a "stupid idea" [2]. That disagreement shows how much of this space is still an open question rather than settled practice. I do think I'm onto something here, where the traditional internet works in parallel with these new agent standards, and I wouldn't be surprised if creative solutions allowing models to obtain data with little to no inference tax emerge as incredibly valuable ways for agents to source information at scale, and businesses that provide agents with the best data have big opportunities ahead.

## References

[1] "Cloudflare Markdown for Agents: Complete Technical Guide to 80% Token Reduction and SEO Implications for 2026," ALM Corp, February 18, 2026. https://almcorp.com/blog/cloudflare-markdown-for-agents-complete-guide/

[2] John Mueller (@johnmu.com), Bluesky post, February 3, 2026. https://bsky.app/profile/johnmu.com/post/3mdxp3zkwa22o
