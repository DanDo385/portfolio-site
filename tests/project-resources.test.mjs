import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { mkdtemp, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  githubArchiveUrl,
  parseGitHubRepo,
  syncPortfolioResources,
  syncProjectResources,
  writeJsonAtomic,
} from '../scripts/project-resources-lib.mjs';

const temporaryRoots = [];

test('rejects symlinked canonical resources instead of publishing host files', async () => {
  const { sourceRoot, destinationRoot } = await fixture();
  const hostSecret = await put(sourceRoot, '../host-secret.txt', 'must-not-publish');
  await mkdir(path.join(sourceRoot, 'public'), { recursive: true });
  await symlink(hostSecret, path.join(sourceRoot, 'public/llms.txt'));

  await assert.rejects(
    syncProjectResources({
      project: { slug: 'safe-project' },
      sourceRoot,
      destinationRoot,
    }),
    /symlink/i,
  );
  await assert.rejects(stat(path.join(destinationRoot, 'llms.txt')));
});

test('rejects a symlinked canonical root', async () => {
  const { sourceRoot, destinationRoot } = await fixture();
  const externalRoot = path.join(path.dirname(sourceRoot), 'external-public');
  await put(externalRoot, 'llms.txt', 'outside-root');
  await symlink(externalRoot, path.join(sourceRoot, 'public'));

  await assert.rejects(
    syncProjectResources({
      project: { slug: 'safe-project' },
      sourceRoot,
      destinationRoot,
    }),
    /symlink/i,
  );
  await assert.rejects(stat(path.join(destinationRoot, 'llms.txt')));
});

test('rejects symlinked destination families before replacement', async () => {
  const { sourceRoot, destinationRoot } = await fixture();
  const outside = path.join(path.dirname(destinationRoot), 'outside-destination');
  await put(sourceRoot, 'public/screenshots/00-home.png', 'new-image');
  await put(outside, 'keep.txt', 'outside-must-survive');
  await symlink(outside, path.join(destinationRoot, 'screenshots'));

  await assert.rejects(
    syncProjectResources({
      project: { slug: 'safe-project' },
      sourceRoot,
      destinationRoot,
    }),
    /symlink/i,
  );
  assert.equal(await readFile(path.join(outside, 'keep.txt'), 'utf8'), 'outside-must-survive');
  await assert.rejects(stat(path.join(outside, '00-home.png')));
});

test('rejects project slugs that can escape the project-assets root', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-slug-escape-'));
  temporaryRoots.push(root);
  const portfolioRoot = path.join(root, 'portfolio-site');
  const sourceRoot = path.join(root, 'source');
  await put(portfolioRoot, 'content/projects/escape.json', JSON.stringify({
    slug: '../escaped',
    githubUrl: 'https://github.com/DanDo385/escaped',
  }));
  await put(sourceRoot, 'public/screenshots/00-host.png', 'escaped-write');

  await assert.rejects(
    syncPortfolioResources({
      portfolioRoot,
      resolveSource: async () => sourceRoot,
    }),
    /invalid project slug/i,
  );
  await assert.rejects(stat(path.join(portfolioRoot, 'public/escaped/screenshots/00-host.png')));
});

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-resources-'));
  temporaryRoots.push(root);
  const sourceRoot = path.join(root, 'source');
  const destinationRoot = path.join(root, 'destination');
  await mkdir(sourceRoot, { recursive: true });
  await mkdir(destinationRoot, { recursive: true });
  return { sourceRoot, destinationRoot };
}

async function put(root, relativePath, contents = relativePath) {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
  return target;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

test('builds encoded GitHub archive URLs from repository identity', () => {
  assert.equal(
    githubArchiveUrl({ owner: 'DanDo385', repo: 'eth-l2', ref: 'feature/media kit' }),
    'https://api.github.com/repos/DanDo385/eth-l2/tarball/feature%2Fmedia%20kit',
  );
});

test('parses only canonical GitHub repository URLs', () => {
  assert.deepEqual(parseGitHubRepo('https://github.com/DanDo385/eth-l2'), {
    owner: 'DanDo385',
    repo: 'eth-l2',
  });
  assert.deepEqual(parseGitHubRepo('git@github.com:DanDo385/eth-l2.git'), {
    owner: 'DanDo385',
    repo: 'eth-l2',
  });
  assert.equal(parseGitHubRepo('https://example.com/DanDo385/eth-l2'), null);
});

test('canonical media replaces its destination family and hydrates card URLs', async () => {
  const { sourceRoot, destinationRoot } = await fixture();
  await put(sourceRoot, 'public/gif/preview.gif', 'gif');
  await put(sourceRoot, 'public/screenshots/00-home.png', 'home');
  await put(sourceRoot, 'public/screenshots/10-detail.webp', 'detail');
  await put(sourceRoot, 'public/media.json', JSON.stringify({
    shortClip: { youtubeUrl: 'https://youtu.be/short' },
    longClip: { youtubeUrl: 'https://youtu.be/long' },
  }));
  await put(destinationRoot, 'screenshots/image9.png', 'stale');
  await put(destinationRoot, 'llms.txt', 'legacy brief');

  const result = await syncProjectResources({
    project: { slug: 'eth-l2' },
    sourceRoot,
    destinationRoot,
  });

  await assert.rejects(stat(path.join(destinationRoot, 'screenshots/image9.png')));
  assert.equal(await readFile(path.join(destinationRoot, 'screenshots/00-home.png'), 'utf8'), 'home');
  assert.equal(await readFile(path.join(destinationRoot, 'screenshots/10-detail.webp'), 'utf8'), 'detail');
  assert.equal(await readFile(path.join(destinationRoot, 'gif/preview.gif'), 'utf8'), 'gif');
  assert.equal(await readFile(path.join(destinationRoot, 'llms.txt'), 'utf8'), 'legacy brief');
  assert.deepEqual(result.ownership.sort(), ['gif', 'media', 'screenshots']);
  assert.deepEqual(result.overrides, {
    previewGif: '/project-assets/eth-l2/gif/preview.gif',
    screenshots: [
      '/project-assets/eth-l2/screenshots/00-home.png',
      '/project-assets/eth-l2/screenshots/10-detail.webp',
    ],
    youtubeUrl: 'https://youtu.be/short',
    shortClipUrl: 'https://youtu.be/short',
    recordingUrl: 'https://youtu.be/long',
  });
});

test('missing canonical resources preserve legacy portfolio assets', async () => {
  const { sourceRoot, destinationRoot } = await fixture();
  await put(sourceRoot, 'README.md', '# Project');
  await put(destinationRoot, 'gif/preview.gif', 'legacy');

  const result = await syncProjectResources({
    project: { slug: 'legacy-project' },
    sourceRoot,
    destinationRoot,
  });

  assert.equal(await readFile(path.join(destinationRoot, 'gif/preview.gif'), 'utf8'), 'legacy');
  assert.deepEqual(result.ownership, []);
  assert.deepEqual(result.overrides, {});
});

test('portfolio sync emits overrides and provenance from project repositories', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-orchestrator-'));
  temporaryRoots.push(root);
  const portfolioRoot = path.join(root, 'portfolio-site');
  const sourceBase = path.join(root, 'sources');
  await put(portfolioRoot, 'content/projects/ready.json', JSON.stringify({
    slug: 'ready',
    githubUrl: 'https://github.com/DanDo385/ready-repo',
  }));
  await put(portfolioRoot, 'content/projects/fallback.json', JSON.stringify({
    slug: 'fallback',
    githubUrl: 'https://github.com/DanDo385/fallback-repo',
  }));
  await put(portfolioRoot, 'content/projects/self.json', JSON.stringify({
    slug: 'portfolio-agent-mode',
    githubUrl: 'https://github.com/DanDo385/portfolio-site',
  }));
  await put(sourceBase, 'ready-repo/public/gif/preview.gif', 'ready-gif');
  await put(sourceBase, 'fallback-repo/README.md', '# Not ready');

  const result = await syncPortfolioResources({
    portfolioRoot,
    portfolioRepo: 'portfolio-site',
    resolveSource: async ({ repo }) => path.join(sourceBase, repo),
    generatedAt: '2026-07-16T12:00:00.000Z',
  });

  const overrides = JSON.parse(await readFile(
    path.join(portfolioRoot, 'content/generated/project-resources.json'),
    'utf8',
  ));
  const provenance = JSON.parse(await readFile(
    path.join(portfolioRoot, 'public/project-assets/.source-manifest.json'),
    'utf8',
  ));
  assert.deepEqual(overrides, {
    ready: { previewGif: '/project-assets/ready/gif/preview.gif' },
  });
  assert.equal(provenance.generatedAt, '2026-07-16T12:00:00.000Z');
  assert.deepEqual(provenance.projects.ready.ownership, ['gif']);
  assert.deepEqual(provenance.projects.fallback.ownership, []);
  assert.equal(provenance.projects['portfolio-agent-mode'], undefined);
  assert.equal(result.synced, 1);
  assert.equal(result.fallback, 1);
});

test('required project resources fail closed when the source has no canonical assets', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-required-'));
  temporaryRoots.push(root);
  const portfolioRoot = path.join(root, 'portfolio-site');
  const sourceRoot = path.join(root, 'empty-source');
  await put(portfolioRoot, 'content/projects/required.json', JSON.stringify({
    slug: 'required',
    githubUrl: 'https://github.com/DanDo385/required',
    resourceSource: { required: true },
  }));
  await put(sourceRoot, 'README.md', '# Empty');

  await assert.rejects(
    syncPortfolioResources({
      portfolioRoot,
      resolveSource: async () => sourceRoot,
    }),
    /required project required has no canonical repository resources/,
  );
});

test('demo and llms resources sync while recordings and macOS junk stay out', async () => {
  const { sourceRoot, destinationRoot } = await fixture();
  await put(sourceRoot, 'repo-resources/demo/index.html', '<h1>demo</h1>');
  await put(sourceRoot, 'repo-resources/demo/data.json', '{}');
  await put(sourceRoot, 'repo-resources/demo/walkthrough.mp4', 'large-video');
  await put(sourceRoot, 'repo-resources/screenshots/.DS_Store', 'junk');
  await put(sourceRoot, 'repo-resources/llms.txt', 'agent brief');
  await put(destinationRoot, 'demo/stale.js', 'obsolete');

  const result = await syncProjectResources({
    project: { slug: 'agent-runtime' },
    sourceRoot,
    destinationRoot,
  });

  assert.equal(await readFile(path.join(destinationRoot, 'demo/index.html'), 'utf8'), '<h1>demo</h1>');
  assert.equal(await readFile(path.join(destinationRoot, 'demo/data.json'), 'utf8'), '{}');
  assert.equal(await readFile(path.join(destinationRoot, 'llms.txt'), 'utf8'), 'agent brief');
  await assert.rejects(stat(path.join(destinationRoot, 'demo/stale.js')));
  await assert.rejects(stat(path.join(destinationRoot, 'demo/walkthrough.mp4')));
  await assert.rejects(stat(path.join(destinationRoot, 'screenshots/.DS_Store')));
  assert.deepEqual(result.ownership.sort(), ['demo', 'llms']);
});

test('preserves prior family overrides when an optional upstream family disappears', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-family-fallback-'));
  temporaryRoots.push(root);
  const portfolioRoot = path.join(root, 'portfolio-site');
  const sourceRoot = path.join(root, 'source');
  await put(portfolioRoot, 'content/projects/project.json', JSON.stringify({
    slug: 'project',
    githubUrl: 'https://github.com/DanDo385/project',
  }));
  await put(sourceRoot, 'public/gif/preview.gif', 'gif');
  await put(sourceRoot, 'public/screenshots/00-home.png', 'home');

  await syncPortfolioResources({ portfolioRoot, resolveSource: async () => sourceRoot });
  await rm(path.join(sourceRoot, 'public/screenshots'), { recursive: true });
  const second = await syncPortfolioResources({ portfolioRoot, resolveSource: async () => sourceRoot });

  assert.deepEqual(second.overrides.project, {
    previewGif: '/project-assets/project/gif/preview.gif',
    screenshots: ['/project-assets/project/screenshots/00-home.png'],
  });
  assert.equal(await readFile(
    path.join(portfolioRoot, 'public/project-assets/project/screenshots/00-home.png'),
    'utf8',
  ), 'home');
});

test('strict projects fail when any declared resource family disappears', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-required-families-'));
  temporaryRoots.push(root);
  const portfolioRoot = path.join(root, 'portfolio-site');
  const sourceRoot = path.join(root, 'source');
  await put(portfolioRoot, 'content/projects/project.json', JSON.stringify({
    slug: 'project',
    githubUrl: 'https://github.com/DanDo385/project',
    resourceSource: {
      required: true,
      families: ['gif', 'screenshots', 'media'],
    },
  }));
  await put(sourceRoot, 'public/gif/preview.gif', 'gif');
  await put(sourceRoot, 'public/screenshots/00-home.png', 'home');
  await put(sourceRoot, 'public/media.json', '{}');

  await syncPortfolioResources({ portfolioRoot, resolveSource: async () => sourceRoot });
  await rm(path.join(sourceRoot, 'public/screenshots'), { recursive: true });
  await assert.rejects(
    syncPortfolioResources({ portfolioRoot, resolveSource: async () => sourceRoot }),
    /missing required resource families: screenshots/i,
  );
});

test('canonical media explicitly clears missing legacy video fields', async () => {
  const { sourceRoot, destinationRoot } = await fixture();
  await put(sourceRoot, 'public/media.json', JSON.stringify({
    longClip: { youtubeUrl: 'https://www.youtube.com/watch?v=long-id' },
  }));

  const result = await syncProjectResources({
    project: { slug: 'media-project' },
    sourceRoot,
    destinationRoot,
  });

  assert.deepEqual(result.overrides, {
    youtubeUrl: null,
    shortClipUrl: null,
    recordingUrl: 'https://www.youtube.com/watch?v=long-id',
  });
});

test('canonical media rejects non-YouTube URLs', async () => {
  const { sourceRoot, destinationRoot } = await fixture();
  await put(sourceRoot, 'public/media.json', JSON.stringify({
    shortClip: { youtubeUrl: 'https://example.com/not-youtube' },
  }));

  await assert.rejects(
    syncProjectResources({
      project: { slug: 'media-project' },
      sourceRoot,
      destinationRoot,
    }),
    /invalid YouTube URL/i,
  );
});

test('atomic JSON publication leaves a complete document and no temp files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-atomic-json-'));
  temporaryRoots.push(root);
  const target = path.join(root, 'generated/state.json');
  await Promise.all([
    writeJsonAtomic(target, { generation: 1, payload: 'a'.repeat(1000) }),
    writeJsonAtomic(target, { generation: 2, payload: 'b'.repeat(1000) }),
  ]);

  const parsed = JSON.parse(await readFile(target, 'utf8'));
  assert.ok(parsed.generation === 1 || parsed.generation === 2);
  assert.equal((await readdir(path.dirname(target))).filter((name) => name.endsWith('.tmp')).length, 0);
});

test('self-repository matching is owner-aware and case-insensitive', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-self-repo-'));
  temporaryRoots.push(root);
  const portfolioRoot = path.join(root, 'portfolio-site');
  const sourceBase = path.join(root, 'sources');
  await put(portfolioRoot, 'content/projects/self.json', JSON.stringify({
    slug: 'self',
    githubUrl: 'https://github.com/dando385/PORTFOLIO-SITE',
  }));
  await put(portfolioRoot, 'content/projects/fork.json', JSON.stringify({
    slug: 'fork',
    githubUrl: 'https://github.com/OtherOwner/portfolio-site',
  }));
  await put(sourceBase, 'portfolio-site/public/gif/preview.gif', 'fork-gif');
  let resolved = 0;

  const result = await syncPortfolioResources({
    portfolioRoot,
    portfolioOwner: 'DanDo385',
    portfolioRepo: 'portfolio-site',
    resolveSource: async ({ repo }) => {
      resolved += 1;
      return path.join(sourceBase, repo.toLowerCase());
    },
  });

  assert.equal(resolved, 1);
  assert.deepEqual(result.overrides, {
    fork: { previewGif: '/project-assets/fork/gif/preview.gif' },
  });
});

test('dev:clean synchronizes project resources before starting Next.js', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const command = packageJson.scripts['dev:clean'];
  assert.match(command, /^npm run sync:project-resources && /);
  assert.ok(command.indexOf('sync:project-resources') < command.indexOf('next dev'));
});
