#!/usr/bin/env node
import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { githubArchiveUrl, syncPortfolioResources } from './project-resources-lib.mjs';

const execFileAsync = promisify(execFile);

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientGitHubStatus(status) {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

async function downloadGitHubSource({ owner, repo, ref, temporaryRoot }) {
  const key = `${owner}-${repo}-${ref}`.replace(/[^a-zA-Z0-9._-]+/g, '-');
  const archivePath = path.join(temporaryRoot, `${key}.tar.gz`);
  const extractionPath = path.join(temporaryRoot, key);
  await mkdir(extractionPath, { recursive: true });

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'magro-dev-project-resource-sync',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const maxAttempts = 5;
  let response;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    response = await fetch(githubArchiveUrl({ owner, repo, ref }), {
      headers,
      redirect: 'follow',
    });
    if (response.ok && response.body) break;
    if (!isTransientGitHubStatus(response.status) || attempt === maxAttempts) {
      throw new Error(`GitHub archive fetch failed for ${owner}/${repo}@${ref}: HTTP ${response.status}`);
    }
    const retryAfter = Number(response.headers.get('retry-after'));
    const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : Math.min(30_000, 1000 * 2 ** (attempt - 1));
    console.warn(
      `GitHub archive rate-limited for ${owner}/${repo}@${ref} (HTTP ${response.status}); retry ${attempt}/${maxAttempts} in ${Math.round(delayMs / 1000)}s`,
    );
    await sleep(delayMs);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(archivePath));
  await execFileAsync('tar', ['-xzf', archivePath, '-C', extractionPath]);

  const roots = (await readdir(extractionPath, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory());
  if (roots.length !== 1) {
    throw new Error(`unexpected GitHub archive layout for ${owner}/${repo}@${ref}`);
  }
  return path.join(extractionPath, roots[0].name);
}

async function main() {
  const portfolioRoot = process.cwd();
  const localRoot = argumentValue('--local-root');
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'portfolio-project-resources-'));

  try {
    const resolveSource = localRoot
      ? async ({ repo }) => path.resolve(localRoot, repo)
      : async ({ owner, repo, ref }) => downloadGitHubSource({
          owner,
          repo,
          ref,
          temporaryRoot,
        });
    const result = await syncPortfolioResources({ portfolioRoot, resolveSource });
    console.log(`Project resources: ${result.synced} repo-backed, ${result.fallback} legacy fallback.`);
    for (const [slug, details] of Object.entries(result.provenance.projects)) {
      const ownership = details.ownership.length > 0 ? details.ownership.join(', ') : 'legacy';
      console.log(`  ${slug}: ${details.repository}@${details.ref} -> ${ownership}`);
      if (details.error) console.warn(`    ${details.error}`);
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
