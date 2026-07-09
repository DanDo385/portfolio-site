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
  "tags": ["AI", "Go"],
  "summary": "One or two lines describing the project.",
  "techBadges": ["Go", "TypeScript"],
  "githubUrl": "https://github.com/DanDo385/your-repo",
  "demoUrl": null,
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
| `tags` | yes | Badge labels on the card |
| `summary` | yes | Short description (1-2 lines) |
| `techBadges` | yes | Tech stack chips |
| `githubUrl` | no | GitHub repo link |
| `demoUrl` | no | Interactive demo hosted on magro.dev (`/projects/<slug>` or `/agent`) |
| `loomUrl` | no | Loom walkthrough link |
| `youtubeUrl` | no | Full project demo on YouTube when distinct from `shortClipUrl` |
| `zoomUrl` | no | Zoom recording link |
| `previewGif` | no | GIF in the preview box (first preview wins) |
| `previewVideo` | no | Short demo MP4 fallback when `shortClipUrl` is unset |
| `shortClipUrl` | no | Short demo on YouTube or MP4; embeds on the project page |
| `recordingUrl` | no | Full project demo on YouTube or long recording; embeds on the project page |
| `screenshots` | no | Screenshot carousel when no GIF or video preview is set |
| `previewType` | no | Set to `agent-json` for structured JSON preview; otherwise use `screenshots`. Cards always show a preview box; empty projects display "Preview pending". |
| `relatedWriting` | no | Slug of a published article to cross-link |
| `featured` | no | When `true`, pins above date sort |

Use `null` or `[]` when a field is not ready. Placeholders like `TODO(dan): ...` are fine in text fields.

## Articles

Create `content/writing/your-slug.md`:

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

## Operating thesis

The thesis article lives at `content/writing/operating-thesis.md` as a draft. Send final prose and flip `status` to `published`.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (.next/)
```

## Interactive demos

Interactive apps prefer fullscreen routes under `/demos/<slug>` with a thin DemoShell
navbar. MBP-backed demos iframe the live Vercel frontend; health is checked through
same-origin Next.js proxies:

```text
/demos/eth-tx-lifecycle          → iframe https://eth-tx-lifecycle.vercel.app
/demos/eth-l2-fraud-proof        → iframe https://eth-l2.vercel.app
/api/demos/eth-tx/health         → https://api-staging-eth-tx.magro.dev
/api/demos/eth-l2/health         → https://api-staging-eth-l2.magro.dev
```

Configure public staging origins with:

```env
NEXT_PUBLIC_API_URL=https://api-staging-eth-l2.magro.dev
NEXT_PUBLIC_ETH_TX_API_URL=https://api-staging-eth-tx.magro.dev
```

Defaults match those URLs so local previews work without secrets. When a tunnel is
offline, the Vercel UI still loads as an explainer and the portfolio status line
reports the outage.

Register MBP-backed demos in `lib/demos.ts`, add `/demos/<slug>/page.tsx`, set
`demoUrl` to `/demos/<slug>`, and add the project slug to `FULLSCREEN_DEMO_SLUGS` in
`lib/utils.ts`. Interact only appears for fullscreen demos or an explicit `demoUrl`
(never a bare project page fallback).

## Project structure

```
app/
  layout.tsx          # Root layout, fonts, metadata
  page.tsx            # Homepage
  globals.css         # Site styles
  writing/[slug]/     # Article pages
components/           # React UI components
content/
  projects/           # One JSON file per project
  writing/            # One Markdown file per article
lib/
  content.ts          # Content loaders
  constants.ts        # Site constants
public/               # Static assets (resume PDF, favicon)
```
