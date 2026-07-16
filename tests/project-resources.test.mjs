import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  githubArchiveUrl,
  parseGitHubRepo,
  syncPortfolioResources,
  syncProjectResources,
} from '../scripts/project-resources-lib.mjs';

const temporaryRoots = [];

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
