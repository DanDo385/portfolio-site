# Agent instructions for portfolio-site

This repo powers **magro.dev**. It includes **Portfolio Agent Mode**, a first-class feature: structured surfaces for AI systems alongside the human-facing site.

**Always keep Agent Mode up to date when you change the site or add content.** Treat it as part of the same change, not a follow-up.

## Agent Mode surfaces

| Surface | Path | Source |
|---------|------|--------|
| Human overview | `/agent/` | `app/agent/page.tsx` |
| JSON manifest | `/agent.json` | `lib/agent.ts` via `app/agent.json/route.ts` |
| LLM router | `/llms.txt` | `lib/agent.ts` (`getLlmsTxt`) via `app/llms.txt/route.ts` |
| Project card preview | homepage + `/projects/portfolio-agent-mode` | `content/projects/portfolio-agent-mode.json`, `components/AgentJsonPreview.tsx` |

The portfolio project itself documents the feature: `content/projects/portfolio-agent-mode.json` (slug: `portfolio-agent-mode`).

## What updates automatically

These pull from content loaders at build/request time. No manual list edits needed if content files are correct:

- **Projects** in `agent.json` / `llms.txt`: from `getListedProjects()` (`content/projects/*.json`, `listed !== false`)
- **Writing** in `agent.json` / `llms.txt`: from `getPublishedWriting()` (`content/writing/*.md`, `status: published`)
- **Project URLs** (canonical, github, demo, media): derived in `lib/agent.ts` → `projectUrls()`
- **Interactive demos** in manifest: from `lib/demos.ts` when the linked project is listed

## What you must update manually

When the site changes, check and update these in **`lib/agent.ts`** (and related files if copy/UI changed):

1. **`navigation`** — must match `components/Nav.tsx` section ids and labels. When recent content exists, **Recent** is listed first (bold in the UI); otherwise omit it.
2. **`about`** — education, technical study, building stack, summary if About section copy changes.
3. **`contact`** — email, social links, resume paths if Contact or `lib/constants.ts` changes.
4. **`canonicalTopics`** — when positioning or focus areas change.
5. **`PRINCIPLES`** — when Agent Mode guidelines or site positioning change.
6. **`agentMode.preferredEntryPoints`** — when new high-value agent entry URLs are added.
7. **`getLlmsTxt()`** — section structure and link notes if new manifest sections are added (e.g. new demo types).

Also update when relevant:

- **`lib/constants.ts`** — `SITE.name`, `SITE.description`, `SITE.url` flow into manifest and `llms.txt`.
- **`app/agent/page.tsx`** — human-readable Agent Mode page if endpoints, principles, or explanation change.
- **`content/projects/portfolio-agent-mode.json`** — summary, tech badges, `relatedWriting`, `demoUrl` (`/agent`) if the feature scope changes.
- **`components/AgentJsonPreview.tsx`** — card preview manifest shape if `agent.json` schema meaningfully changes.
- **`CONTENT.md`** — document new content or demo patterns that affect agent surfaces.

## Checklist: run on every site change

Before finishing a PR or commit that touches content, navigation, projects, writing, About, Contact, or demos:

- [ ] New or updated **project** → `content/projects/<slug>.json` exists; `listed` set intentionally; `demoUrl` / media paths valid.
- [ ] New or updated **article** → `content/writing/<slug>.md` published if it should appear in manifest.
- [ ] **Nav / homepage sections** changed → `lib/agent.ts` → `navigation` matches `components/Nav.tsx`.
- [ ] **About or Contact** changed → `lib/agent.ts` → `about` and `contact` blocks reviewed.
- [ ] **Interactive demo** added → prefer `/demos/<slug>` fullscreen route; register fullscreen slug in `lib/utils.ts` (`FULLSCREEN_DEMO_SLUGS`); register in `lib/demos.ts` if MBP-backed; set `demoUrl` to `/demos/<slug>`; optional env in `.env.example`; demo appears in manifest when project is listed.
- [ ] **`portfolio-agent-mode.json`** still accurately describes Agent Mode endpoints and purpose.
- [ ] **`/agent/` page** copy still matches live endpoints and principles.
- [ ] Build passes: `npm run build`.
- [ ] Spot-check: `/agent.json` and `/llms.txt` locally reflect the change.

## Adding content (quick reference)

- Projects: `content/projects/*.json` — see `CONTENT.md`
- Writing: `content/writing/*.md` — drafts (`status: draft`) are excluded from Agent Mode
- Unlisted projects (`"listed": false`) are hidden from homepage and agent manifest project lists

## Interactive demos and MBP backends

Portfolio project pages (`/projects/<slug>`) are the write-up surface: card, media, and
embedded video demos. Interactive experiences that should feel like separately deployed
apps belong on dedicated demo routes.

### Preferred surfaces

| Surface | Path | Purpose |
|---------|------|---------|
| Project write-up | `/projects/<slug>` | Card, summary, screenshots/GIF, inline video demos |
| Fullscreen demo | `/demos/<slug>` | Minimal chrome + full-viewport interactive |
| Same-origin proxy | `/api/demos/<slug>/*` | Health checks and backend calls from the browser |
| Public tunnel hostname | `https://api-staging-<name>.magro.dev` | Cloudflare Tunnel to the MBP service |

**Interact** links on project cards should point at the fullscreen demo when one exists:

- **Go to Page** → `/demos/<slug>` (same tab; browser back returns to the card)
- **Open in New Tab** → same URL in a new tab

Keep `/projects/<slug>` as the documentation/media page. Do not make Interact dump users
into a long project page when a dedicated demo route is available.

### Architecture

```text
Visitor browser
   │
   ▼
magro.dev/demos/<slug>          ← Next.js UI on Vercel (fullscreen demo shell)
   │
   ▼
magro.dev/api/demos/<slug>/*    ← same-origin Next.js API proxy / health probe
   │
   ▼
api-staging-<name>.magro.dev    ← Cloudflare Tunnel hostname
   │
   ▼
Go / Anvil / service on MBP
```

| Layer | Where it runs | Job |
|-------|---------------|-----|
| Demo UI | Vercel (`/demos/<slug>`) | Fullscreen interactive frontend |
| Proxy / health | Vercel (`/api/demos/<slug>/*`) | CORS-safe calls, status checks, no LAN exposure |
| Backend | MBP via Cloudflare Tunnel | Long-running compute, chain, RPC, simulation |

### Demo types

1. **Frontend-only** (no MBP needed)
   - Examples: browser walkthroughs, static HTML embeds
   - Ship UI at `/demos/<slug>`
   - No tunnel required

2. **Next.js UI + MBP backend**
   - Examples: eth-l2 fraud-proof staging; future live RPC / simulation demos
   - UI on Vercel at `/demos/<slug>`
   - Backend on MBP (`localhost:PORT`) exposed as `https://api-staging-<name>.magro.dev`
   - Browser calls same-origin magro.dev routes when possible:
     - `fetch('/api/demos/<slug>/health')`
     - `fetch('/api/demos/<slug>/...')`
   - Prefer proxying through Next.js over calling the tunnel hostname directly from the browser

### Adding a backend-backed demo

1. Register the demo in `lib/demos.ts` (slug, projectSlug, env key, default tunnel URL, health paths).
2. Add `app/demos/<slug>/page.tsx` with minimal chrome (title + back link + full-viewport interactive).
3. Add or extend `app/api/demos/<slug>/...` routes for health and any browser-facing API calls.
4. Point project `demoUrl` / Interact hrefs at `/demos/<slug>`.
5. Document the public tunnel hostname in `.env.example` (never LAN IPs).
6. Confirm Agent Mode: listed projects expose demo URLs; demos from `lib/demos.ts` appear in the manifest when the linked project is listed.
7. Degrade gracefully when the MBP/tunnel is offline: keep the page useful as an explainer and show an explicit offline/status state.

### Constraints

- Do not put MBP LAN IPs, private hostnames, or secrets in frontend code or Agent Mode surfaces.
- Only document public tunnel hostnames already intended for demos.
- Vercel serverless is not the long-running backend. Anvil, websockets, and heavy Go services stay on the MBP.
- Assume the MBP can be offline; demos must fail closed without breaking the portfolio page.
- One tunnel hostname per backend service keeps ops simple.
- When demo entry URLs change, update `demoUrl`, Interact wiring, and `agentMode.preferredEntryPoints` if the demo is a high-value agent entry.

## Principles

- Agent surfaces should stay **structured, stable, low-noise, and citation-aware**.
- Do not duplicate long prose in `agent.json`; link to canonical URLs.
- Do not expose secrets, LAN IPs, or private staging details beyond public tunnel hostnames already documented for demos.
- Prefer updating `lib/agent.ts` once so `/agent.json` and `/llms.txt` stay in sync.

## Related files

```
lib/agent.ts              # Manifest + llms.txt generator (primary)
lib/demos.ts              # Interactive demo registry
lib/constants.ts          # Site URL, description, resume
app/agent/page.tsx        # Human Agent Mode page
app/agent.json/route.ts   # Serves getAgentManifest()
app/llms.txt/route.ts     # Serves getLlmsTxt()
app/demos/                # Fullscreen interactive demo routes (preferred Interact target)
app/api/demos/            # Same-origin health/proxy routes to MBP tunnels
components/AgentJsonPreview.tsx
content/projects/portfolio-agent-mode.json
```
