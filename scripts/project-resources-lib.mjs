import { copyFile, lstat, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);
const EXCLUDED_EXTENSIONS = new Set(['.mov', '.mp4', '.webm']);
const EXCLUDED_NAMES = new Set(['.DS_Store']);
const naturalOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

export function githubArchiveUrl({ owner, repo, ref }) {
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tarball/${encodeURIComponent(ref)}`;
}

export function parseGitHubRepo(url) {
  if (typeof url !== 'string') return null;
  const httpsMatch = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  const sshMatch = url.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i);
  const match = httpsMatch || sshMatch;
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function exists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function canonicalRoot(sourceRoot) {
  for (const candidate of ['repo-resources', 'public']) {
    const root = path.join(sourceRoot, candidate);
    if (await exists(root)) return root;
  }
  return null;
}

async function copyDirectoryFiltered(source, destination, { replace = false } = {}) {
  const candidates = [];
  async function collect(currentSource, relativeDirectory = '') {
    const entries = await readdir(currentSource, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => naturalOrder.compare(a.name, b.name))) {
      if (EXCLUDED_NAMES.has(entry.name)) continue;
      const sourcePath = path.join(currentSource, entry.name);
      const relativePath = path.join(relativeDirectory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        await collect(sourcePath, relativePath);
        continue;
      }
      if (!entry.isFile() || EXCLUDED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
      candidates.push({ sourcePath, relativePath });
    }
  }
  await collect(source);
  if (candidates.length === 0) return [];
  if (replace) await rm(destination, { recursive: true, force: true });
  const copied = [];
  for (const candidate of candidates) {
    const destinationPath = path.join(destination, candidate.relativePath);
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(candidate.sourcePath, destinationPath);
    copied.push(destinationPath);
  }
  return copied;
}

function mediaOverrides(media) {
  const shortUrl =
    media?.shortClip?.youtubeUrl ||
    media?.short?.youtubeUrl ||
    media?.shortClipUrl ||
    null;
  const longUrl =
    media?.longClip?.youtubeUrl ||
    media?.detailedClip?.youtubeUrl ||
    media?.detailed?.youtubeUrl ||
    media?.recordingUrl ||
    null;
  return {
    ...(shortUrl ? { youtubeUrl: shortUrl, shortClipUrl: shortUrl } : {}),
    ...(longUrl ? { recordingUrl: longUrl } : {}),
  };
}

export async function syncProjectResources({ project, sourceRoot, destinationRoot }) {
  const root = await canonicalRoot(sourceRoot);
  if (!root) return { ownership: [], overrides: {}, files: [] };

  const ownership = [];
  const overrides = {};
  const files = [];
  const publicBase = `/project-assets/${project.slug}`;

  const gifSource = path.join(root, 'gif', 'preview.gif');
  if (await exists(gifSource)) {
    const gifDestination = path.join(destinationRoot, 'gif', 'preview.gif');
    await mkdir(path.dirname(gifDestination), { recursive: true });
    await copyFile(gifSource, gifDestination);
    ownership.push('gif');
    files.push(gifDestination);
    overrides.previewGif = `${publicBase}/gif/preview.gif`;
  }

  const screenshotsSource = path.join(root, 'screenshots');
  if (await exists(screenshotsSource)) {
    const entries = (await readdir(screenshotsSource, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && !EXCLUDED_NAMES.has(entry.name))
      .filter((entry) => IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .sort((a, b) => naturalOrder.compare(a.name, b.name));
    if (entries.length > 0) {
      const screenshotsDestination = path.join(destinationRoot, 'screenshots');
      await rm(screenshotsDestination, { recursive: true, force: true });
      await mkdir(screenshotsDestination, { recursive: true });
      overrides.screenshots = [];
      for (const entry of entries) {
        const filename = entry.name;
        const destination = path.join(screenshotsDestination, filename);
        await copyFile(path.join(screenshotsSource, entry.name), destination);
        files.push(destination);
        overrides.screenshots.push(`${publicBase}/screenshots/${filename}`);
      }
      ownership.push('screenshots');
    }
  }

  const demoSource = path.join(root, 'demo');
  if (await exists(demoSource)) {
    const demoDestination = path.join(destinationRoot, 'demo');
    const copied = await copyDirectoryFiltered(demoSource, demoDestination, { replace: true });
    if (copied.length > 0) {
      ownership.push('demo');
      files.push(...copied);
    }
  }

  const llmsSource = path.join(root, 'llms.txt');
  if (await exists(llmsSource)) {
    const llmsDestination = path.join(destinationRoot, 'llms.txt');
    await mkdir(path.dirname(llmsDestination), { recursive: true });
    await copyFile(llmsSource, llmsDestination);
    ownership.push('llms');
    files.push(llmsDestination);
  }

  const mediaSource = path.join(root, 'media.json');
  if (await exists(mediaSource)) {
    const raw = await readFile(mediaSource, 'utf8');
    const media = JSON.parse(raw);
    const mediaDestination = path.join(destinationRoot, 'media.json');
    await mkdir(path.dirname(mediaDestination), { recursive: true });
    await copyFile(mediaSource, mediaDestination);
    ownership.push('media');
    files.push(mediaDestination);
    Object.assign(overrides, mediaOverrides(media));
  }

  return { ownership, overrides, files };
}

export async function syncPortfolioResources({
  portfolioRoot,
  resolveSource,
  portfolioRepo = 'portfolio-site',
  generatedAt = new Date().toISOString(),
}) {
  const cardsDirectory = path.join(portfolioRoot, 'content', 'projects');
  const cardFiles = (await readdir(cardsDirectory))
    .filter((filename) => filename.endsWith('.json'))
    .sort((a, b) => naturalOrder.compare(a, b));
  const overrides = {};
  const provenance = {
    version: 1,
    generatedAt,
    projects: {},
  };
  let synced = 0;
  let fallback = 0;

  for (const filename of cardFiles) {
    const project = JSON.parse(await readFile(path.join(cardsDirectory, filename), 'utf8'));
    const repository = parseGitHubRepo(project.githubUrl);
    if (!repository || repository.repo === portfolioRepo) continue;
    const ref = project.resourceSource?.ref || 'main';
    const destinationRoot = path.join(portfolioRoot, 'public', 'project-assets', project.slug);
    let result;
    try {
      const sourceRoot = await resolveSource({ ...repository, ref, project });
      result = await syncProjectResources({ project, sourceRoot, destinationRoot });
    } catch (error) {
      if (project.resourceSource?.required) throw error;
      fallback += 1;
      provenance.projects[project.slug] = {
        repository: `${repository.owner}/${repository.repo}`,
        ref,
        ownership: [],
        error: error instanceof Error ? error.message : String(error),
      };
      continue;
    }

    if (project.resourceSource?.required && result.ownership.length === 0) {
      throw new Error(`required project ${project.slug} has no canonical repository resources`);
    }
    if (result.ownership.length > 0) {
      overrides[project.slug] = result.overrides;
      synced += 1;
    } else {
      fallback += 1;
    }
    provenance.projects[project.slug] = {
      repository: `${repository.owner}/${repository.repo}`,
      ref,
      ownership: result.ownership,
      files: result.files.map((file) => path.relative(portfolioRoot, file).split(path.sep).join('/')),
    };
  }

  const generatedContentDirectory = path.join(portfolioRoot, 'content', 'generated');
  const assetsDirectory = path.join(portfolioRoot, 'public', 'project-assets');
  await mkdir(generatedContentDirectory, { recursive: true });
  await mkdir(assetsDirectory, { recursive: true });
  await writeFile(
    path.join(generatedContentDirectory, 'project-resources.json'),
    `${JSON.stringify(overrides, null, 2)}\n`,
  );
  await writeFile(
    path.join(assetsDirectory, '.source-manifest.json'),
    `${JSON.stringify(provenance, null, 2)}\n`,
  );

  return { synced, fallback, overrides, provenance };
}
