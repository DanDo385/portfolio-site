import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const PROJECTS_DIR = path.join(process.cwd(), 'content/projects');
const KNOWN_CLUSTERS = new Set([
  'trading-research',
  'market-structure',
  'walkthroughs',
  'agentic',
  'infra',
  'labs',
]);

async function loadListedProjects() {
  const files = (await readdir(PROJECTS_DIR)).filter((file) => file.endsWith('.json'));
  const projects = await Promise.all(
    files.map(async (file) => JSON.parse(await readFile(path.join(PROJECTS_DIR, file), 'utf8')))
  );
  return projects.filter((project) => project.listed !== false);
}

test('listed projects use a known cluster and protocol labs stay hosted backends', async () => {
  const listed = await loadListedProjects();
  for (const project of listed) {
    const cluster = project.cluster ?? 'labs';
    assert.ok(KNOWN_CLUSTERS.has(cluster), `${project.slug} has unknown cluster ${cluster}`);
  }

  const protocolLabs = listed.filter((project) => project.cluster === 'market-structure');
  assert.deepEqual(
    protocolLabs.map((project) => project.slug).sort(),
    ['eth-amm-sim', 'eth-l2', 'eth-tx-lifecycle'].sort()
  );

  const walkthroughs = listed.filter((project) => project.cluster === 'walkthroughs');
  assert.ok(walkthroughs.some((project) => project.slug === 'agent-runtime'));
  assert.ok(walkthroughs.some((project) => project.slug === 'hermes-xray'));
  for (const project of walkthroughs) {
    assert.ok(project.hook, `${project.slug} should lead with a question hook`);
    assert.equal(project.tags.includes('Walkthrough'), true, `${project.slug} should be tagged Walkthrough`);
  }
});
