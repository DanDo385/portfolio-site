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

1. **`navigation`** — must match `components/Nav.tsx` section ids and labels (Projects, Writing, About me, Contact).
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
- [ ] **Interactive demo** added → `lib/demos.ts`, project page branch, optional env in `.env.example`; demo appears in manifest when project is listed.
- [ ] **`portfolio-agent-mode.json`** still accurately describes Agent Mode endpoints and purpose.
- [ ] **`/agent/` page** copy still matches live endpoints and principles.
- [ ] Build passes: `npm run build`.
- [ ] Spot-check: `/agent.json` and `/llms.txt` locally reflect the change.

## Adding content (quick reference)

- Projects: `content/projects/*.json` — see `CONTENT.md`
- Writing: `content/writing/*.md` — drafts (`status: draft`) are excluded from Agent Mode
- Unlisted projects (`"listed": false`) are hidden from homepage and agent manifest project lists

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
components/AgentJsonPreview.tsx
content/projects/portfolio-agent-mode.json
```
