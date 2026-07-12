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
- **Research** in `agent.json` / `llms.txt`: from `getPublishedResearch()` (`content/agent-research/*.md`, `status: published`)
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
- [ ] New or updated **research paper** → `content/agent-research/<slug>.md` published if it should appear in manifest.
- [ ] **Nav / homepage sections** changed → `lib/agent.ts` → `navigation` matches `components/Nav.tsx`.
- [ ] **About or Contact** changed → `lib/agent.ts` → `about` and `contact` blocks reviewed.
- [ ] **Interactive demo** added → follow **Interact rules** below (CLI = no Interact; in-site = `/demos/<slug>`; hosted apps = external Vercel `demoUrl`).
- [ ] **`portfolio-agent-mode.json`** still accurately describes Agent Mode endpoints and purpose.
- [ ] **`/agent/` page** copy still matches live endpoints and principles.
- [ ] Build passes: `npm run build`.
- [ ] Spot-check: `/agent.json` and `/llms.txt` locally reflect the change.

## Adding content (quick reference)

- Projects: `content/projects/*.json` — see `CONTENT.md`
- Writing: `content/writing/*.md` — drafts (`status: draft`) are excluded from Agent Mode
- Research: `content/agent-research/*.md` — drafts (`status: draft`) are excluded from Agent Mode
- Unlisted projects (`"listed": false`) are hidden from homepage and agent manifest project lists
- Foundations projects (`"tier": "foundations"`) stay listed but render under a collapsed **Foundations** block on the homepage and are labeled in `/llms.txt`

## Interact rules (project cards)

Decide Interact from the project type. Never invent Interact by falling back to
`/projects/<slug>` — that incorrectly adds Interact to CLI/video-only cards.

| Kind | Examples | Interact | Where the app lives |
|------|----------|----------|---------------------|
| **CLI / non-interactive** | `eth-rpc-monitor` | **No Interact section** | Source + YouTube/video demos only |
| **Renders fully on magro.dev** | `agent-runtime`, `portfolio-agent-mode` | Internal `/demos/<slug>` or `/agent` | Same-origin magro.dev subdirectory |
| **Hosted on its own Vercel app** | `eth-l2`, `eth-tx-lifecycle` | External Vercel URL | Separate Vercel project; magro.dev links out |

### Rules

1. **CLI projects** — set `demoUrl` to `null`. Do not register them in
   `FULLSCREEN_DEMO_SLUGS`. Cards keep Source and video demos only.
2. **In-site interactive** — ship a fullscreen route under `/demos/<slug>` (or
   `/agent` for Agent Mode), register the slug in `FULLSCREEN_DEMO_SLUGS`, set
   `demoUrl` to that path. Interact uses Go to Page / Open in New Tab on magro.dev.
3. **External Vercel apps** (eth-l2, eth-tx-lifecycle) — set `demoUrl` to the
   production Vercel URL (e.g. `https://eth-l2.vercel.app`). Do **not** iframe
   those apps as the Interact destination. magro.dev project pages may explain
   the stack and link out; live UI stays on the Vercel hostname. Ship a
   portfolio-domain agent brief at `public/project-assets/<slug>/llms.txt`
   so search/agents find project context on magro.dev (auto-linked from
   `/agent.json` and site `/llms.txt`).
4. Keep `/projects/<slug>` as the write-up surface (card, screenshots, YouTube).
5. **Per-project `llms.txt`** — required for in-site demos (under `demo/`) and
   external Vercel apps (under `public/project-assets/<slug>/llms.txt`). Optional
   for CLI/video-only cards. Site `/llms.txt` remains the router; project files
   are deeper briefs on the same domain.

Canonical external apps today:

- eth-l2 → `https://eth-l2.vercel.app` (backend: `https://api-staging-eth-l2.magro.dev` → MBP `127.0.0.1:8080`)
- eth-tx-lifecycle → `https://eth-tx-lifecycle.vercel.app` (backend: `https://api-staging-eth-tx.magro.dev` → MBP `127.0.0.1:8081`)

Each app owns `config/ports.json` as the source of truth (frontend + backend bind). eth-tx uses **8081** so it can coexist with eth-l2 on **8080**. Cloudflare Tunnel ingress must match those binds. eth-tx keeps the Go API durable via launchd (`com.danmagro.eth-tx-lifecycle.backend`); do not put loopback ports in Agent Mode JSON or public UI copy — only the `api-staging-*.magro.dev` hostnames.

## Interactive demos and MBP backends

Portfolio project pages (`/projects/<slug>`) are the write-up surface: card, media, and
embedded video demos. Experiences that render entirely on magro.dev use `/demos/<slug>`.
Full-stack apps with their own Vercel frontend link out; their Go backends stay on the MBP.

### Preferred surfaces

| Surface | Path | Purpose |
|---------|------|---------|
| Project write-up | `/projects/<slug>` | Card, summary, screenshots/GIF, inline video demos |
| Project llms.txt | `/project-assets/<slug>/llms.txt` (or `.../demo/llms.txt`) | Same-domain agent brief for the project |
| In-site fullscreen demo | `/demos/<slug>` | Minimal chrome + full-viewport interactive **on magro.dev** |
| External hosted app | `https://<app>.vercel.app` | Separate Vercel UI (eth-l2, eth-tx-lifecycle) |
| Same-origin health probe | `/api/demos/<slug>/health` | Optional status check for MBP-backed apps |
| Public tunnel hostname | `https://api-staging-<name>.magro.dev` | Cloudflare Tunnel to the MBP service |

### Architecture (in-site demos)

```text
Visitor browser
   │
   ▼
magro.dev/demos/<slug>          ← Next.js UI on portfolio Vercel
   │
   ▼
(optional) static assets or same-origin APIs on magro.dev
```

### Architecture (external Vercel + MBP backend)

```text
Visitor browser
   │
   ├─ magro.dev/projects/<slug>     ← write-up + link out
   │
   └─ <app>.vercel.app              ← live UI (separate Vercel project)
         │
         ▼
      api-staging-<name>.magro.dev  ← Cloudflare Tunnel
         │
         ▼
      Go / Anvil / service on MBP
```

| Layer | Where it runs | Job |
|-------|---------------|-----|
| Portfolio write-up | magro.dev `/projects/<slug>` | Card, media, links |
| In-site demo UI | magro.dev `/demos/<slug>` | Fullscreen interactive that belongs on the portfolio |
| External app UI | Separate Vercel project | Live eth-l2 / eth-tx (and similar) frontends |
| Health probe | magro.dev `/api/demos/<slug>/health` | Optional tunnel status on the write-up |
| Backend | MBP via Cloudflare Tunnel | Long-running compute, chain, RPC, simulation |

### Demo types

1. **In-site / frontend-only** (renders on magro.dev)
   - Examples: `agent-runtime` static walkthrough
   - Ship UI at `/demos/<slug>`; register `FULLSCREEN_DEMO_SLUGS`; `demoUrl` = `/demos/<slug>`
   - No tunnel required

2. **External Vercel UI + MBP backend**
   - Examples: eth-l2 (`eth-l2.vercel.app`), eth-tx-lifecycle (`eth-tx-lifecycle.vercel.app`)
   - UI on its own Vercel project; `demoUrl` = that production URL
   - Backend on MBP (`localhost:PORT`) exposed as `https://api-staging-<name>.magro.dev`
   - Portfolio Interact links out; do not use magro.dev `/demos/<slug>` as the primary Interact target
   - Ship `public/project-assets/<slug>/llms.txt` on magro.dev for agent search/context
   - Optional: register health in `lib/demos.ts` and show status on the project page

### Adding an in-site demo

1. Add `app/demos/<slug>/page.tsx` with DemoShell (title + back link + full-viewport interactive).
2. Register the slug in `lib/utils.ts` (`FULLSCREEN_DEMO_SLUGS`).
3. Set project `demoUrl` to `/demos/<slug>`.
4. Confirm Agent Mode lists the demo URL when the project is listed.

### Adding an external Vercel + MBP demo

1. Deploy the app on its own Vercel project; document the public URL.
2. Set project `demoUrl` to that `https://…vercel.app` URL (Interact links out).
3. Register the tunnel in `lib/demos.ts` if the write-up shows backend health.
4. Document the public tunnel hostname in `.env.example` (never LAN IPs).
5. Degrade gracefully when the MBP/tunnel is offline: portfolio page still useful; live app fails closed.

### Constraints

- Do not put MBP LAN IPs, private hostnames, or secrets in frontend code or Agent Mode surfaces.
- Only document public tunnel hostnames already intended for demos.
- Vercel serverless is not the long-running backend. Anvil, websockets, and heavy Go services stay on the MBP.
- Assume the MBP can be offline; demos must fail closed without breaking the portfolio page.
- One tunnel hostname per backend service keeps ops simple.
- When demo entry URLs change, update `demoUrl`, Interact wiring, and `agentMode.preferredEntryPoints` if the demo is a high-value agent entry.
- Never add Interact to CLI-only projects.

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
app/demos/                # In-site fullscreen demos (e.g. agent-runtime)
app/api/demos/            # Optional health/proxy routes to MBP tunnels
lib/utils.ts              # FULLSCREEN_DEMO_SLUGS + Interact href rules
components/AgentJsonPreview.tsx
content/projects/portfolio-agent-mode.json
```
