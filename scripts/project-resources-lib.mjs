import { copyFile, lstat, mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
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

export async function writeJsonAtomic(target, value) {
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = path.join(path.dirname(target), `.${path.basename(target)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}

const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertProjectSlug(slug) {
  if (typeof slug !== 'string' || !PROJECT_SLUG_PATTERN.test(slug)) {
    throw new Error(`invalid project slug: ${String(slug)}`);
  }
  return slug;
}

async function lstatOrNull(target) {
  try {
    return await lstat(target);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function assertContained(root, target, label) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  if (relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) {
    return;
  }
  throw new Error(`${label} escapes its allowed root`);
}

async function inspectRelativePath(root, relativePath) {
  const rootInfo = await lstatOrNull(root);
  if (!rootInfo) return null;
  if (rootInfo.isSymbolicLink()) throw new Error(`symlink is not allowed: ${root}`);
  if (!rootInfo.isDirectory()) throw new Error(`expected directory: ${root}`);

  const parts = relativePath.split(/[\\/]+/).filter(Boolean);
  let current = root;
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]);
    const info = await lstatOrNull(current);
    if (!info) return null;
    if (info.isSymbolicLink()) throw new Error(`symlink is not allowed: ${current}`);
    if (index < parts.length - 1 && !info.isDirectory()) {
      throw new Error(`expected directory: ${current}`);
    }
    if (index === parts.length - 1) return info;
  }
  return rootInfo;
}

async function sourceDirectory(root, relativePath) {
  const info = await inspectRelativePath(root, relativePath);
  if (!info) return null;
  if (!info.isDirectory()) throw new Error(`expected directory: ${path.join(root, relativePath)}`);
  return path.join(root, relativePath);
}

async function sourceFile(root, relativePath) {
  const info = await inspectRelativePath(root, relativePath);
  if (!info) return null;
  if (!info.isFile()) throw new Error(`expected regular file: ${path.join(root, relativePath)}`);
  return path.join(root, relativePath);
}

async function safeDestinationPath(destinationRoot, relativePath) {
  const target = path.resolve(destinationRoot, relativePath);
  assertContained(destinationRoot, target, 'resource destination');
  const rootInfo = await lstatOrNull(destinationRoot);
  if (!rootInfo?.isDirectory() || rootInfo.isSymbolicLink()) {
    throw new Error(`unsafe destination root: ${destinationRoot}`);
  }

  const parts = relativePath.split(/[\\/]+/).filter(Boolean);
  let current = destinationRoot;
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]);
    const info = await lstatOrNull(current);
    if (!info) break;
    if (info.isSymbolicLink()) throw new Error(`symlink is not allowed: ${current}`);
    if (index < parts.length - 1 && !info.isDirectory()) {
      throw new Error(`expected directory: ${current}`);
    }
  }
  return target;
}

async function canonicalRoot(sourceRoot) {
  const sourceInfo = await lstatOrNull(sourceRoot);
  if (!sourceInfo) return null;
  if (sourceInfo.isSymbolicLink()) throw new Error(`symlink is not allowed: ${sourceRoot}`);
  if (!sourceInfo.isDirectory()) throw new Error(`expected directory: ${sourceRoot}`);
  for (const candidate of ['repo-resources', 'public']) {
    const root = await sourceDirectory(sourceRoot, candidate);
    if (root) return root;
  }
  return null;
}

async function copyDirectoryFiltered(source, destinationRoot, destinationRelative, { replace = false } = {}) {
  const candidates = [];
  async function collect(currentSource, relativeDirectory = '') {
    const entries = await readdir(currentSource, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => naturalOrder.compare(a.name, b.name))) {
      if (EXCLUDED_NAMES.has(entry.name)) continue;
      const sourcePath = path.join(currentSource, entry.name);
      const relativePath = path.join(relativeDirectory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`symlink is not allowed: ${sourcePath}`);
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
  const destination = await safeDestinationPath(destinationRoot, destinationRelative);
  if (replace) await rm(destination, { recursive: true, force: true });
  const copied = [];
  for (const candidate of candidates) {
    const destinationPath = await safeDestinationPath(
      destinationRoot,
      path.join(destinationRelative, candidate.relativePath),
    );
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(candidate.sourcePath, destinationPath);
    copied.push(destinationPath);
  }
  return copied;
}

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

function validatedYouTubeUrl(value, field) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') throw new Error(`invalid YouTube URL for ${field}`);
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`invalid YouTube URL for ${field}: ${value}`);
  }
  if (parsed.protocol !== 'https:' || !YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error(`invalid YouTube URL for ${field}: ${value}`);
  }
  return value;
}

function mediaOverrides(media) {
  const shortUrl = validatedYouTubeUrl(
    media?.shortClip?.youtubeUrl || media?.short?.youtubeUrl || media?.shortClipUrl || null,
    'short clip',
  );
  const longUrl = validatedYouTubeUrl(
    media?.longClip?.youtubeUrl ||
      media?.detailedClip?.youtubeUrl ||
      media?.detailed?.youtubeUrl ||
      media?.recordingUrl ||
      null,
    'long clip',
  );
  return {
    youtubeUrl: shortUrl,
    shortClipUrl: shortUrl,
    recordingUrl: longUrl,
  };
}

export async function syncProjectResources({ project, sourceRoot, destinationRoot }) {
  const slug = assertProjectSlug(project.slug);
  const root = await canonicalRoot(sourceRoot);
  if (!root) return { ownership: [], overrides: {}, files: [] };
  await mkdir(destinationRoot, { recursive: true });
  const destinationInfo = await lstatOrNull(destinationRoot);
  if (!destinationInfo?.isDirectory() || destinationInfo.isSymbolicLink()) {
    throw new Error(`unsafe destination root: ${destinationRoot}`);
  }

  const ownership = [];
  const overrides = {};
  const files = [];
  const publicBase = `/project-assets/${slug}`;

  const gifSource = await sourceFile(root, path.join('gif', 'preview.gif'));
  if (gifSource) {
    const gifDestination = await safeDestinationPath(destinationRoot, path.join('gif', 'preview.gif'));
    await mkdir(path.dirname(gifDestination), { recursive: true });
    await copyFile(gifSource, gifDestination);
    ownership.push('gif');
    files.push(gifDestination);
    overrides.previewGif = `${publicBase}/gif/preview.gif`;
  }

  const screenshotsSource = await sourceDirectory(root, 'screenshots');
  if (screenshotsSource) {
    const allEntries = await readdir(screenshotsSource, { withFileTypes: true });
    const symlinkEntry = allEntries.find((entry) => entry.isSymbolicLink());
    if (symlinkEntry) {
      throw new Error(`symlink is not allowed: ${path.join(screenshotsSource, symlinkEntry.name)}`);
    }
    const entries = allEntries
      .filter((entry) => entry.isFile() && !EXCLUDED_NAMES.has(entry.name))
      .filter((entry) => IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .sort((a, b) => naturalOrder.compare(a.name, b.name));
    if (entries.length > 0) {
      const screenshotsDestination = await safeDestinationPath(destinationRoot, 'screenshots');
      await rm(screenshotsDestination, { recursive: true, force: true });
      await mkdir(screenshotsDestination, { recursive: true });
      overrides.screenshots = [];
      for (const entry of entries) {
        const filename = entry.name;
        const destination = await safeDestinationPath(
          destinationRoot,
          path.join('screenshots', filename),
        );
        await copyFile(path.join(screenshotsSource, entry.name), destination);
        files.push(destination);
        overrides.screenshots.push(`${publicBase}/screenshots/${filename}`);
      }
      ownership.push('screenshots');
    }
  }

  const demoSource = await sourceDirectory(root, 'demo');
  if (demoSource) {
    const copied = await copyDirectoryFiltered(demoSource, destinationRoot, 'demo', { replace: true });
    if (copied.length > 0) {
      ownership.push('demo');
      files.push(...copied);
    }
  }

  const llmsSource = await sourceFile(root, 'llms.txt');
  if (llmsSource) {
    const llmsDestination = await safeDestinationPath(destinationRoot, 'llms.txt');
    await mkdir(path.dirname(llmsDestination), { recursive: true });
    await copyFile(llmsSource, llmsDestination);
    ownership.push('llms');
    files.push(llmsDestination);
  }

  const mediaSource = await sourceFile(root, 'media.json');
  if (mediaSource) {
    const raw = await readFile(mediaSource, 'utf8');
    const media = JSON.parse(raw);
    const mediaDestination = await safeDestinationPath(destinationRoot, 'media.json');
    await mkdir(path.dirname(mediaDestination), { recursive: true });
    await copyFile(mediaSource, mediaDestination);
    ownership.push('media');
    files.push(mediaDestination);
    Object.assign(overrides, mediaOverrides(media));
  }

  return { ownership, overrides, files };
}

const FAMILY_OVERRIDE_KEYS = {
  gif: ['previewGif'],
  screenshots: ['screenshots'],
  media: ['youtubeUrl', 'shortClipUrl', 'recordingUrl'],
};
const RESOURCE_FAMILIES = new Set(['gif', 'screenshots', 'demo', 'llms', 'media']);

async function readJsonOrEmpty(target) {
  try {
    return JSON.parse(await readFile(target, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
}

function mergeFamilyOverrides(previous, current, ownership) {
  const merged = { ...current };
  const owned = new Set(ownership);
  for (const [family, keys] of Object.entries(FAMILY_OVERRIDE_KEYS)) {
    if (owned.has(family)) continue;
    for (const key of keys) {
      if (Object.hasOwn(previous, key)) merged[key] = previous[key];
    }
  }
  return merged;
}

function expectedResourceFamilies(project) {
  const families = project.resourceSource?.families ?? [];
  if (!Array.isArray(families)) {
    throw new Error(`resourceSource.families must be an array for project ${project.slug}`);
  }
  for (const family of families) {
    if (!RESOURCE_FAMILIES.has(family)) {
      throw new Error(`invalid resource family for project ${project.slug}: ${String(family)}`);
    }
  }
  return [...new Set(families)];
}

export async function syncPortfolioResources({
  portfolioRoot,
  resolveSource,
  portfolioOwner = 'DanDo385',
  portfolioRepo = 'portfolio-site',
  generatedAt = new Date().toISOString(),
}) {
  const cardsDirectory = await sourceDirectory(portfolioRoot, path.join('content', 'projects'));
  if (!cardsDirectory) throw new Error('missing content/projects directory');
  const cardEntries = await readdir(cardsDirectory, { withFileTypes: true });
  const invalidCard = cardEntries.find((entry) => entry.isSymbolicLink());
  if (invalidCard) throw new Error(`symlink is not allowed: ${path.join(cardsDirectory, invalidCard.name)}`);
  const cardFiles = cardEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort((a, b) => naturalOrder.compare(a, b));

  const generatedContentDirectory = await safeDestinationPath(
    portfolioRoot,
    path.join('content', 'generated'),
  );
  const assetsDirectory = await safeDestinationPath(
    portfolioRoot,
    path.join('public', 'project-assets'),
  );
  await mkdir(generatedContentDirectory, { recursive: true });
  await mkdir(assetsDirectory, { recursive: true });
  const generatedOverridesPath = path.join(generatedContentDirectory, 'project-resources.json');
  const provenancePath = path.join(assetsDirectory, '.source-manifest.json');
  const previousOverrides = await readJsonOrEmpty(generatedOverridesPath);

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
    const slug = assertProjectSlug(project.slug);
    const repository = parseGitHubRepo(project.githubUrl);
    if (!repository) continue;
    const isPortfolioRepository =
      repository.owner.toLowerCase() === portfolioOwner.toLowerCase() &&
      repository.repo.toLowerCase() === portfolioRepo.toLowerCase();
    if (isPortfolioRepository) continue;

    const ref = project.resourceSource?.ref || 'main';
    const expectedFamilies = expectedResourceFamilies(project);
    const destinationRoot = path.resolve(assetsDirectory, slug);
    assertContained(assetsDirectory, destinationRoot, `destination for project ${slug}`);
    if (path.dirname(destinationRoot) !== path.resolve(assetsDirectory)) {
      throw new Error(`destination for project ${slug} escapes the project-assets root`);
    }
    const previous = previousOverrides[slug] ?? {};
    let result;
    try {
      const sourceRoot = await resolveSource({ ...repository, ref, project });
      result = await syncProjectResources({ project, sourceRoot, destinationRoot });
    } catch (error) {
      if (project.resourceSource?.required) throw error;
      if (Object.keys(previous).length > 0) overrides[slug] = previous;
      fallback += 1;
      provenance.projects[slug] = {
        repository: `${repository.owner}/${repository.repo}`,
        ref,
        ownership: [],
        error: error instanceof Error ? error.message : String(error),
      };
      continue;
    }

    if (project.resourceSource?.required) {
      if (expectedFamilies.length > 0) {
        const owned = new Set(result.ownership);
        const missing = expectedFamilies.filter((family) => !owned.has(family));
        if (missing.length > 0) {
          throw new Error(`required project ${slug} is missing required resource families: ${missing.join(', ')}`);
        }
      } else if (result.ownership.length === 0) {
        throw new Error(`required project ${slug} has no canonical repository resources`);
      }
    }

    const merged = mergeFamilyOverrides(previous, result.overrides, result.ownership);
    if (Object.keys(merged).length > 0) overrides[slug] = merged;
    if (result.ownership.length > 0) {
      synced += 1;
    } else {
      fallback += 1;
    }
    provenance.projects[slug] = {
      repository: `${repository.owner}/${repository.repo}`,
      ref,
      ownership: result.ownership,
      files: result.files.map((file) => path.relative(portfolioRoot, file).split(path.sep).join('/')),
    };
  }

  await writeJsonAtomic(generatedOverridesPath, overrides);
  await writeJsonAtomic(provenancePath, provenance);

  return { synced, fallback, overrides, provenance };
}
