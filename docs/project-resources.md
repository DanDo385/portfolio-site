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
    "required": true
  }
}
```

- `ref` selects the Git branch or tag. It defaults to `main`.
- `required: true` fails the build when GitHub cannot be fetched or the repository has no canonical resources.
- Omit `required` during migration. Existing portfolio assets remain as a legacy fallback until the source repository publishes that resource family.

The portfolio's own project card is skipped to avoid recursively importing `portfolio-site` into itself.

## Ownership and migration

Ownership is family-based: `gif`, `screenshots`, `demo`, `llms`, and `media`.

A family transfers to the project repository only when canonical source files exist. When a screenshot family transfers, the generated destination mirror is replaced with the current natural-sorted source set. Source-repository screenshots are never deleted. Missing families are left untouched, which keeps incomplete resource jobs from breaking live cards.

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

The default sync fetches GitHub archives for reproducible local and Vercel behavior. The explicit local command reads sibling repositories under `../<repo>` and is intended only for testing unpublished resource work.

If `GITHUB_TOKEN` is present, the fetch uses it to avoid anonymous API rate limits. The token is never written to generated files or logs.

## Cursor and CLI operator loop

Keep `/Users/danmagro/Code/portfolio-site` open in Cursor. Cursor automatically notices files changed by Hermes, Codex, Claude Code, or another CLI agent in the same checkout.

Use one writer at a time. Cursor can remain open while a CLI agent works, but do not let two agents edit the same card or synchronizer concurrently.

Start the local site from the repository root:

```bash
npm run dev
```

`predev` fetches the latest GitHub resources once before Next.js starts. If a project repository changes while the dev server remains open, refresh explicitly:

```bash
npm run sync:project-resources
```

For unpublished sibling-repo changes on the iMac, use the explicit local source mode:

```bash
npm run sync:project-resources:local
```

Recommended agent request:

```text
Add or refresh project <repo> in portfolio-site. Follow AGENTS.md and
docs/project-resources.md. Inspect the project repo, preserve descriptive
screenshot filenames, ingest repo-owned resources, verify YouTube URLs before
removing duplicate portfolio videos, run tests and npm run build, and show me
the scoped diff. Do not touch unrelated project worktrees.
```

The production site updates only when Vercel runs another portfolio build. A project-repo push does not, by itself, redeploy `portfolio-site`. Until a Vercel deploy hook or cross-repository dispatch is configured, finish each refresh by committing and pushing the verified portfolio change or manually triggering a Vercel rebuild.
