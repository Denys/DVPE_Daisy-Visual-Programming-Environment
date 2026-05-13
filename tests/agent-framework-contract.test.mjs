import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function read(relPath) {
  return fs.readFileSync(path.join(process.cwd(), relPath), 'utf8');
}

function expectIncludes(content, needles, label) {
  for (const needle of needles) {
    assert.ok(
      content.includes(needle),
      `${label} should include "${needle}"`
    );
  }
}

const checks = [
  [
    'root AGENTS contract routes agents by workspace and memory surfaces',
    () => {
      const content = read('AGENTS.md');
      expectIncludes(
        content,
        [
          'LATEST_PROJECTS.md',
          'dvpe_CLD/',
          'DaisyExamples/',
          'DaisyExamples/AGENTS.md',
          'noderr/noderr/',
          '.agent/daisy_memory/decisions.md',
          'START_DVPE_SESSION.md',
          'START_FIRMWARE_SESSION.md',
        ],
        'AGENTS.md'
      );
    },
  ],
  [
    'LATEST_PROJECTS captures the primary work areas in this mixed workspace',
    () => {
      const content = read('LATEST_PROJECTS.md');
      expectIncludes(
        content,
        [
          'dvpe_CLD/',
          'DaisyExamples/',
          'noderr/noderr/',
          '.agent/',
          'directives/',
          'execution/',
        ],
        'LATEST_PROJECTS.md'
      );
    },
  ],
  [
    'CODEX wrapper bootstraps the shared contract',
    () => {
      const content = read('CODEX.md');
      expectIncludes(
        content,
        [
          'Read `AGENTS.md` first, then `LATEST_PROJECTS.md`.',
          'DaisyExamples/AGENTS.md',
          'START_DVPE_SESSION.md',
        ],
        'CODEX.md'
      );
    },
  ],
  [
    'existing wrappers reference the root contract and recency inventory',
    () => {
      const wrappers = ['CLAUDE.md', 'CHATGPT.md', 'GEMINI.md', 'KILO.md', 'OPENCODE.md'];
      for (const wrapper of wrappers) {
        const content = read(wrapper);
        expectIncludes(content, ['AGENTS.md', 'LATEST_PROJECTS.md'], wrapper);
      }
    },
  ],
  [
    'legacy agent workflow points through the new entrypoints',
    () => {
      const content = read('.agent/workflows/agent.md');
      expectIncludes(
        content,
        [
          'LATEST_PROJECTS.md',
          'START_DVPE_SESSION.md',
          'START_FIRMWARE_SESSION.md',
        ],
        '.agent/workflows/agent.md'
      );
    },
  ],
];

let failures = 0;

for (const [label, check] of checks) {
  try {
    check();
    console.log(`PASS ${label}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${label}`);
    console.error(error instanceof Error ? error.message : String(error));
  }
}

if (failures > 0) {
  process.exitCode = 1;
}
