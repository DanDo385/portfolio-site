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
| `youtubeUrl` | no | Full project demo (YouTube) |
| `zoomUrl` | no | Zoom recording link |
| `previewGif` | no | GIF in the preview box (first preview wins) |
| `previewVideo` | no | Short demo MP4 fallback when `shortClipUrl` is unset |
| `shortClipUrl` | no | Short demo link (YouTube or MP4) |
| `recordingUrl` | no | Full demo fallback when `youtubeUrl` is unset |
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

The site supports project-specific interactive demos from the existing project routes.
`eth-l2-fraud-proof` renders an additional client panel below its project card and checks
the staging Go backend through a same-origin Next.js route:

```text
/projects/eth-l2-fraud-proof
/api/demos/eth-l2/health
```

Configure the public staging origin with:

```env
NEXT_PUBLIC_API_URL=https://api-staging-eth-l2.magro.dev
```

The current default points to the same URL so local previews still work without secrets.
The health proxy probes `/health`, `/api/health`, and `/status` on the backend. It does
not assume a scenario endpoint yet. When the MBP Cloudflare Tunnel is offline, the page
shows an explicit offline state and remains useful as a static walkthrough.

To add another interactive demo, add a config entry in `lib/demos.ts`, add a focused
component under `components/`, and branch in `app/projects/[slug]/page.tsx` for that
project slug. Use server-side API routes for calls that need credentials or CORS control.

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
