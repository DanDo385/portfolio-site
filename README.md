# magro.dev

Personal portfolio for [Daniel Magro](https://magro.dev): institutional markets background, digital-asset trading, and the software systems built around both.

**Trajectory:** institutional trader → technical builder → digital-asset trader

This is a Next.js site with a human homepage and a first-class **Agent Mode** so language models can load structured context instead of scraping decorative HTML.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Content as files: project JSON, Markdown writing / research / Trading Lab notes
- Project media synced from sibling GitHub repos at `predev` / `prebuild`
- Deployed on Vercel at [magro.dev](https://magro.dev)

## Quick start

```bash
npm install
npm run inject:intro-secrets   # optional; writes gitignored .env.local from 1Password
npm run dev
```

`predev` runs `npm run sync:project-resources`, which fetches published GIFs, screenshots, demos, and YouTube metadata from each project's GitHub repo into `public/project-assets/` (gitignored).

Other useful commands:

```bash
npm test
npm run build
npm run sync:project-resources        # refresh media from GitHub
npm run sync:project-resources:local  # unpublished sibling-repo WIP only
```

Copy `.env.example` for optional public tunnel hostnames and `FRED_API_KEY`. Secrets live in 1Password; never commit tokens.

## Content model

| Kind | Location | Notes |
|------|----------|--------|
| Projects | `content/projects/*.json` | Cards, clusters, Interact rules |
| Writing | `content/writing/*.md` | `status: published` to appear |
| Research | `content/agent-research/*.md` | Longer papers |
| Trading Lab | `content/trading-research/*.md` | Market notes; honest status labels. Currently paused (`listed: false`) until the funding/basis benchmark ships. |
| Site copy / focus | `lib/constants.ts`, `lib/site-focus.ts` | Title, description, focus lists |

Authoring details: [`CONTENT.md`](./CONTENT.md). Agent and Interact rules: [`AGENTS.md`](./AGENTS.md). Media sync: [`docs/project-resources.md`](./docs/project-resources.md).

Homepage clusters (Protocol Labs, Interactive AI, walkthroughs, infra, in-progress) are defined in `lib/project-clusters.ts`. Trading Lab stays in the cluster config but is unlisted until the funding/basis benchmark is ready.

## Agent Mode

Structured surfaces for AI systems, kept in sync with the human site:

| Surface | URL |
|---------|-----|
| Human overview | `/agent/` |
| JSON manifest | `/agent.json` |
| LLM router | `/llms.txt` |

Generators live in `lib/agent.ts`. When you change navigation, About, Contact, projects, or demos, update Agent Mode in the same change.

## Project media

Project repositories own screenshots, preview GIFs, static demos, `llms.txt`, and `media.json`. This repo consumes them during sync rather than storing a second canonical copy.

Default sync uses GitHub archives so Cursor, local `npm run dev`, and Vercel builds see the same committed media. Local sibling sync (`--local-root ..`) is only for testing unpublished resource work. See **How sync works in this environment** in [`docs/project-resources.md`](./docs/project-resources.md).

A push to a project repo does not redeploy magro.dev by itself. Production updates when Vercel builds this portfolio again.

## Writing style

Do not use em dashes (`—`) in published prose. Prefer commas, periods, colons, parentheses, or a plain hyphenated phrase.

Never invent trading returns, Sharpe ratios, live strategy performance, or professional crypto trading employment that is not documented.

## Deploy

Vercel builds from this repository. `prebuild` syncs project resources before `next build`. Set `FRED_API_KEY` in the Vercel project env if the homepage intro should use live FRED yields; without it, the intro still uses prior-close public sources.
