import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function source(relativePath) {
  const absolutePath = path.join(root, relativePath);
  await access(absolutePath);
  return readFile(absolutePath, 'utf8');
}

test('robots route permits crawling and advertises the canonical sitemap', async () => {
  const robots = await source('app/robots.ts');

  assert.match(robots, /userAgent:\s*['"]\*['"]/);
  assert.match(robots, /allow:\s*['"]\/['"]/);
  assert.match(robots, /sitemap:\s*`\$\{SITE\.url\}\/sitemap\.xml`/);
  assert.match(robots, /host:\s*SITE\.url/);
});

test('sitemap route covers public content and the Agent Mode entry point', async () => {
  const sitemap = await source('app/sitemap.ts');

  assert.match(sitemap, /getListedProjects/);
  assert.match(sitemap, /getPublishedWriting/);
  assert.match(sitemap, /getPublishedResearch/);
  assert.match(sitemap, /['"]\/agent['"]/);
  assert.match(sitemap, /\/projects\/\$\{project\.slug\}/);
  assert.match(sitemap, /\/writing\/\$\{article\.slug\}/);
  assert.match(sitemap, /\/agent-research\/\$\{paper\.slug\}/);
  assert.match(sitemap, /new URL\(/);
});
