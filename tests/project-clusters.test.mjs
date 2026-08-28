import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const PROJECTS_DIR = path.join(process.cwd(), 'content/projects');
const KNOWN_CLUSTERS = new Set([
  'trading-research',
  'market-structure',
  'walkthroughs',
  'interactive-ai',
  'agentic',
  'infra',
  'labs',
]);

const INTERACTIVE_AI = ['portfolio-agent-mode', 'hermes-xray', 'agent-runtime'];

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

  const interactiveAi = listed.filter((project) => project.cluster === 'interactive-ai');
  assert.deepEqual(
    interactiveAi.map((project) => project.slug).sort(),
    [...INTERACTIVE_AI].sort()
  );

  const walkthroughs = listed.filter((project) => project.cluster === 'walkthroughs');
  assert.deepEqual(
    walkthroughs.map((project) => project.slug).sort(),
    ['ai-physical-infra-debt']
  );
  for (const slug of INTERACTIVE_AI) {
    assert.equal(
      walkthroughs.some((project) => project.slug === slug),
      false,
      `${slug} should not remain in walkthroughs`
    );
  }
  for (const project of walkthroughs) {
    assert.ok(project.hook, `${project.slug} should lead with a question hook`);
    assert.equal(project.tags.includes('Walkthrough'), true, `${project.slug} should be tagged Walkthrough`);
  }

  const inProgress = listed
    .filter((project) => project.status === 'in-progress')
    .map((project) => project.slug)
    .sort();
  assert.deepEqual(
    inProgress,
    [
      'airgap-tx-signer',
      'funding-rate-basis-benchmark',
      'op-ephemeral-evm-signer',
      'solana-treasury-vault',
      'solidity-copilot',
      'treasury-policy-engine',
      'eth-rpc-monitor',
    ].sort()
  );
});
