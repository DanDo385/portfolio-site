# Content authoring

Add projects and articles by dropping a single file into the right folder. Run `npm run dev` to preview locally, or `npm run build` to generate the static site. New items sort to the top automatically by `date` (newest first).

The site is a **Next.js App Router** project. Pages live under `app/`, components under `components/`, and content under `content/`.

## Projects

Create `content/projects/your-slug.json`:

```json
{
  "title": "Project Title",
  "slug": "your-slug",
  "date": "2026-07-01",
  "status": "complete",
  "featured": false,
  "listed": true,
  "tier": "primary",
  "tags": ["AI", "Go"],
  "summary": "One or two lines describing the project.",
  "techBadges": ["Go", "TypeScript"],
  "githubUrl": "https://github.com/DanDo385/your-repo",
  "resourceSource": {
    "ref": "main",
    "required": false
  },
  "demoUrl": null,
  "externalDemoUrl": null,
  "loomUrl": null,
  "youtubeUrl": null,
  "zoomUrl": null,
  "screenshots": [],
  "previewType": null,
  "relatedWriting": null
}
```

**Fields**

| Field | Required | Notes |
|-------|----------|-------|
| `title` | yes | Display name |
| `slug` | yes | URL-safe identifier |
| `date` | yes | ISO date (`YYYY-MM-DD`). Drives sort order |
| `status` | yes | `complete` or `in-progress` |
| `tags` | yes | The only badges on the project card. Mix domain + distinctive stack (e.g. `Fraud Proofs`, `MEV`, `JSON-RPC`). Keep to ~4–5. |
| `summary` | yes | Short description (1-2 lines) |
| `techBadges` | yes | Fuller stack list for Agent Mode (`agent.json` / `llms.txt`) only. Not shown on cards. |
| `githubUrl` | no | GitHub repo link |
| `resourceSource` | no | Build-time repository media source. `ref` defaults to `main`; set `required: true` only after the repo publishes a verified canonical resource kit. |
| `demoUrl` | no | In-window Interact target: `/demos/<slug>`, `/agent`, or external Vercel URL |
| `externalDemoUrl` | no | Optional. When set, Interact → Open in New Tab uses this URL (e.g. standalone Vercel app) while Go to Page keeps `demoUrl` |
| `loomUrl` | no | Loom walkthrough link |
| `youtubeUrl` | no | Full project demo on YouTube when distinct from `shortClipUrl` |
| `zoomUrl` | no | Zoom recording link |
| `previewGif` | no | GIF in the preview box (first preview wins) |
| `previewVideo` | no | Short demo MP4 fallback when `shortClipUrl` is unset |
| `shortClipUrl` | no | Short demo on YouTube or MP4; embeds on the project page |
| `recordingUrl` | no | Full project demo on YouTube or long recording; embeds on the project page |
| `screenshots` | no | Screenshot carousel when no GIF or video preview is set |
| `previewType` | no | Set to `agent-json` for structured JSON preview; otherwise use `screenshots`. Cards always show a preview box; empty projects display "Preview pending". |
| `relatedWriting` | no | Slug of a published article to cross-link on the project card |
| `relatedResearch` | no | Slug of a published Agent Research paper to cross-link on the project card |
| `featured` | no | When `true`, pins above date sort |
| `tier` | no | `primary` (default) or `foundations`. Foundations render in a collapsed homepage tier under the flagships and are labeled in Agent Mode |
| `listed` | no | When `false`, hidden from homepage and agent project lists |

Use `null` or `[]` when a field is not ready. Placeholders like `TODO(dan): ...` are fine in text fields.

### Repo-owned project media

Project screenshots, GIFs, static demos, agent briefs, and YouTube metadata belong in the project repository. `npm run dev` and `npm run build` run a pre-step that fetches those resources and generates `public/project-assets/<slug>/` plus card media overrides. Generated files are ignored by Git.

Canonical source folders are `public/` or `repo-resources/` at the project root. See `docs/project-resources.md` for the accepted layout, fallback behavior, strict cutover, and verification commands.

Use descriptive screenshot filenames that state the captured UI state, such as `02-op-lab-start.png` or `05-verify-persist.png`. The build preserves those names. Do not use generic `image1.png` sequences for new repo-owned resources.

## Articles (My Writing)

Homepage section id: `my-writing`. Create `content/writing/your-slug.md`:

```markdown
---
title: Article Title
slug: your-slug
date: 2026-07-01
status: published
category: AI x Finance
excerpt: One-line summary for the writing list.
coverImage: null
loomUrl: null
relatedProject: null
---

Your article body in Markdown.

Second paragraph here.
```

**Fields**

| Field | Required | Notes |
|-------|----------|-------|
| `title` | yes | Display name |
| `slug` | yes | URL path: `/writing/your-slug` |
| `date` | yes | ISO date. Drives sort order |
| `status` | yes | `draft` (hidden) or `published` (live) |
| `category` | yes | Small label on the card |
| `excerpt` | yes | One-line summary |
| `coverImage` | no | Reserved for future use |
| `loomUrl` | no | Optional embedded video |
| `relatedProject` | no | Project slug to cross-link |
| body | yes | Markdown below the frontmatter |

Drafts never appear on the homepage or as routes. Set `status: published` when ready to ship.

**Style:** Never use em dashes (—). Prefer commas, periods, colons, or parentheses.

## Agent Research

Homepage section id: `agent-research`. Long-form research papers from deep research runs.

Create `content/agent-research/your-slug.md`:

```markdown
---
title: Research Paper Title
slug: your-slug
date: 2026-07-11
status: published
category: Agentic Systems
excerpt: One-line summary for the research list.
subtitle: Optional longer subtitle
---

Your research body in Markdown.
```

**Fields**

| Field | Required | Notes |
|-------|----------|-------|
| `title` | yes | Display name |
| `slug` | yes | URL path: `/agent-research/your-slug` |
| `date` | yes | ISO date. Drives sort order |
| `status` | yes | `draft` (hidden) or `published` (live) |
| `category` | yes | Small label on the card |
| `excerpt` | yes | One-line summary |
| `subtitle` | no | Shown under the title |
| body | yes | Markdown below the frontmatter |

Source material can live outside the repo (e.g. `~/AI Research/*.docx`); convert to markdown before publishing.

**Style:** Never use em dashes (—). Prefer commas, periods, colons, or parentheses.

## Operating thesis

The thesis article lives at `content/writing/operating-thesis.md` as a draft. Send final prose and flip `status` to `published`.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (.next/)
```

## Interactive demos

Follow **Interact rules** in `AGENTS.md`:

| Kind | Interact |
|------|----------|
| CLI (e.g. eth-rpc-monitor) | No Interact — Source + YouTube only |
| In-site (e.g. agent-runtime, hermes-xray) | Go to Page → `/demos/<slug>` on magro.dev; Open in New Tab → `externalDemoUrl` when set |
| External Vercel (eth-l2, eth-tx-lifecycle) | Link to `https://….vercel.app` |

```text
/demos/agent-runtime             → in-site fullscreen on magro.dev (Go to Page)
Open in New Tab agent-runtime    → https://agent-runtime-rho.vercel.app
Open in New Tab hermes-xray      → https://hermes-xray.vercel.app
Interact eth-l2                  → https://eth-l2.vercel.app
Interact eth-tx-lifecycle        → https://eth-tx-lifecycle.vercel.app
/api/demos/eth-l2/health         → https://api-staging-eth-l2.magro.dev  (Ubuntu VPS :8080)
/api/demos/eth-tx/health         → https://api-staging-eth-tx.magro.dev  (Ubuntu VPS :8081)
```

Each external app's `config/ports.json` owns local binds (eth-l2 **8080**, eth-tx **8081**)
on the Ubuntu VPS, which is the hosted production backend source of truth. A MacBook can
run the same stack for local or offline development, but it does not serve the public
`api-staging-*.magro.dev` hostnames. eth-tx staging API is kept up with systemd
(`eth-tx-lifecycle-backend.service`).

Configure public staging origins with:

```env
NEXT_PUBLIC_API_URL=https://api-staging-eth-l2.magro.dev
NEXT_PUBLIC_ETH_TX_API_URL=https://api-staging-eth-tx.magro.dev
```

Register Ubuntu VPS health probes in `lib/demos.ts` when the write-up shows backend status.
In-site demos: add `/demos/<slug>/page.tsx`, set `demoUrl` to `/demos/<slug>`, add slug to
`FULLSCREEN_DEMO_SLUGS`. External apps: set `demoUrl` to the Vercel production URL.
Interact only appears for fullscreen demos or an explicit `demoUrl` (never a bare project
page fallback).

### Project `llms.txt` (same domain)

Ship a short agent brief on magro.dev so project context is searchable without leaving the portfolio:

| Kind | Path |
|------|------|
| In-site demo | `public/project-assets/<slug>/demo/llms.txt` |
| External Vercel app | `public/project-assets/<slug>/llms.txt` |

`lib/agent.ts` auto-discovers either path and exposes `urls.llmsTxt` in `/agent.json` plus a
**Project llms.txt** section in site `/llms.txt`. Link it from the project Interact panel.

## Project structure

```
app/
  layout.tsx          # Root layout, fonts, metadata
  page.tsx            # Homepage
  globals.css         # Site styles
  writing/[slug]/     # My Writing article pages
  agent-research/[slug]/  # Agent Research paper pages
components/           # React UI components
content/
  projects/           # One JSON file per project
  writing/            # One Markdown file per article
  agent-research/     # One Markdown file per research paper
lib/
  content.ts          # Content loaders
  constants.ts        # Site constants
public/               # Static assets (resume PDF, favicon, project-assets/*/llms.txt)
scripts/              # Build-time project resource ingestion
docs/project-resources.md
```
