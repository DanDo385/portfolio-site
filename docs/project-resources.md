# Project resources

Project repositories own their portfolio media. `portfolio-site` consumes that media during `predev` and `prebuild` instead of storing a second canonical copy.

## Data flow

```text
content/projects/<slug>.json
  githubUrl
  resourceSource.ref (default: main)
        |
        v
GitHub repository archive
        |
        v
scripts/sync-project-resources.mjs
        |
        +--> public/project-assets/<slug>/...
        +--> content/generated/project-resources.json
        +--> public/project-assets/.source-manifest.json
        |
        v
lib/content.ts overlays generated media fields onto the project card
```

The generated files exist in the deployment artifact because Vercel must serve the bytes, but they are not duplicated in Git history.

## Canonical source layout

The synchronizer accepts either `repo-resources/` or `public/` at the project repository root. `repo-resources/` wins when both exist.

```text
<project>/
  public/                         # or repo-resources/
    gif/preview.gif
    screenshots/                 # PNG, JPG, JPEG, WebP, AVIF, GIF
    demo/                         # static HTML, CSS, JS, JSON, text, images
    llms.txt
    media.json
```

Screenshot source names must describe the captured state, for example `00-full-page-idle.png`, `03-op-in-motion.png`, or `05-verify-persist.png`. The synchronizer natural-sorts and preserves those basenames in portfolio URLs. Do not rename them to `image1.png`, `image2.png`, or other context-free sequences.

`media.json` can supply YouTube metadata:

```json
{
  "shortClip": {
    "youtubeUrl": "https://www.youtube.com/watch?v=SHORT_ID"
  },
  "longClip": {
    "youtubeUrl": "https://www.youtube.com/watch?v=LONG_ID"
  }
}
```

The generated card overlay maps the short URL to `youtubeUrl` and `shortClipUrl`, and the long URL to `recordingUrl`.

MOV, MP4, WebM, `.DS_Store`, and symlinks are excluded. Portfolio pages should use YouTube for walkthrough video instead of copying large recordings into the site build.

## Project card configuration

Every card with a canonical GitHub `githubUrl` is inspected automatically. Optional configuration:

```json
{
  "githubUrl": "https://github.com/DanDo385/example-project",
  "resourceSource": {
    "ref": "main",
    "required": true,
    "families": ["gif", "screenshots", "media"]
  }
}
```

- `ref` selects the Git branch or tag. It defaults to `main`.
- `families` declares the exact ownership contract for a strict cutover. Supported values are `gif`, `screenshots`, `demo`, `llms`, and `media`.
- `required: true` fails the build when GitHub cannot be fetched or any declared family is absent. Without `families`, it retains the legacy check that at least one canonical family exists.
- Omit `required` during migration. Existing portfolio assets remain as a legacy fallback until the source repository publishes that resource family.

The portfolio's own project card is skipped to avoid recursively importing `portfolio-site` into itself.

## Ownership and migration

Ownership is family-based: `gif`, `screenshots`, `demo`, `llms`, and `media`.

A family transfers to the project repository only when canonical source files exist. When a screenshot family transfers, the generated destination mirror is replaced with the current natural-sorted source set. Source-repository screenshots are never deleted. Optional projects retain the prior generated override and files when an upstream family disappears. Strict projects fail the build when any declared family disappears.

Canonical roots, fixed resources, nested demo content, and destination paths reject symlinks. Project slugs must be lowercase kebab-case and every destination is constrained beneath `public/project-assets`. Generated override and provenance JSON files are published with atomic rename so a running dev server never observes a partially written document.

Portfolio-local video files may be moved to macOS Trash only after the corresponding card field contains a real YouTube URL and the YouTube record resolves. Require one-to-one evidence for each recording. A second local clip is not covered by a URL whose title identifies it as Walkthrough 1. Keep unverified recordings and never delete screenshots as part of video cleanup.

Recommended cutover:

1. Publish and verify the canonical resource kit in the project repository.
2. Run `npm run sync:project-resources` in `portfolio-site`.
3. Inspect `public/project-assets/.source-manifest.json` and the generated card overlay.
4. Set `resourceSource.required` to `true` on that card.
5. Remove the old tracked files for the transferred families from `portfolio-site`.
6. Run tests and a production build.

## Commands

```bash
npm test
npm run sync:project-resources
npm run sync:project-resources:local
npm run build
```

## How sync works in this environment

This machine keeps `portfolio-site` and the project repos as siblings under `~/Code/`:

```text
~/Code/
  portfolio-site/          # magro.dev (this repo)
  eth-amm-sim/
  eth-l2/
  hermes-xray/
  ...
```

Cards in `content/projects/<slug>.json` point at each project's `githubUrl`. The synchronizer resolves that URL, reads the published media kit from the project repo, and writes a local mirror under `public/project-assets/<slug>/` plus a card overlay at `content/generated/project-resources.json`. `lib/content.ts` merges that overlay onto each card at request/build time, so homepage cards and `/projects/<slug>` pages show GIFs, screenshots, and YouTube demos without committing those bytes into `portfolio-site`.

### Why the default GitHub sync fits Cursor and Vercel

`npm run sync:project-resources` is the default for local Cursor sessions, CLI agents, and Vercel. It downloads each project's GitHub archive for `resourceSource.ref` (default `main`), extracts it to a temp directory, copies the canonical families, then deletes the temp tree.

That path works well here because:

1. **Same behavior locally and in production.** Cursor agents and Vercel both fetch committed GitHub state. A preview on `localhost` matches what a Vercel build will ingest.
2. **No dirty sibling surprises.** Local project checkouts often have uncommitted notes, `.DS_Store`, or WIP files. GitHub sync ignores those and only takes what is on the remote ref.
3. **Network is available.** Cursor shells and Vercel builds can reach `api.github.com`. The sync retries transient `429` / `502` / `503` / `504` responses. If `GITHUB_TOKEN` is set in the environment, authenticated fetches avoid anonymous rate limits. The token is never written into generated files or logs.
4. **Generated output is gitignored.** Screenshots, GIFs, demos, `media.json`, `llms.txt`, `.source-manifest.json`, and `content/generated/project-resources.json` stay out of Git. Agents can re-run the sync freely without creating a noisy media commit.
5. **Atomic JSON publish.** Overlay and provenance files are renamed into place, so a running `next dev` does not briefly see a half-written overlay.
6. **Self-repo skip.** The portfolio's own card (`portfolio-agent-mode`) is skipped so `portfolio-site` never recursively imports itself.

Hooks that run the sync automatically:

| Command | When | Source |
|---------|------|--------|
| `npm run dev` | `predev` | GitHub archives |
| `npm run build` | `prebuild` | GitHub archives |
| `npm run sync:project-resources` | on demand | GitHub archives |
| `npm run sync:project-resources:local` | on demand only | sibling dirs under `../<repo>` |

### Local sibling sync (exception, not default)

```bash
npm run sync:project-resources:local
```

This is `node scripts/sync-project-resources.mjs --local-root ..`. It reads `~/Code/<repo>` instead of GitHub. Use it only when you are explicitly testing **unpublished** resource work that has not been pushed yet. Do not use it for routine Cursor refreshes or for Vercel-facing verification. If a sibling worktree is dirty, inspect Git status first and do not overwrite unrelated WIP.

### Typical Cursor / agent loop

1. Keep `~/Code/portfolio-site` open in Cursor. One writer at a time for a given card or the synchronizer.
2. Confirm the project repo has published the media kit on `main` (or the card's `resourceSource.ref`).
3. From `portfolio-site`, run `npm run sync:project-resources`.
4. Inspect:
   - `public/project-assets/.source-manifest.json` (ownership per slug)
   - `content/generated/project-resources.json` (card overlay: `previewGif`, `screenshots`, YouTube fields)
   - the matching files under `public/project-assets/<slug>/`
5. Start or refresh the site with `npm run dev`. `predev` already syncs once; if a project repo changes while the server is open, re-run the sync command and reload the page.
6. Smoke-check the homepage card and `/projects/<slug>` for GIF, screenshots, and video demos.
7. Remember: pushing a project repo does **not** redeploy magro.dev. Production updates only when Vercel builds `portfolio-site` again (usually after a portfolio push, or a manual redeploy).

Recommended agent request:

```text
Add or refresh project <repo> in portfolio-site. Follow AGENTS.md and
docs/project-resources.md. Inspect the project repo, preserve descriptive
screenshot filenames, ingest repo-owned resources with
npm run sync:project-resources, verify YouTube URLs before removing duplicate
portfolio videos, run tests and npm run build, and show me the scoped diff.
Do not touch unrelated project worktrees.
```

After the source resources and card wiring are verified, commit and push the portfolio change (card JSON / docs / wiring only; generated media stays ignored). Wait for the Vercel deployment, then smoke-check the public project page, `/agent.json`, and `/llms.txt`.
