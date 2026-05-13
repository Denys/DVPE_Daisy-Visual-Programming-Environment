# CODEX.md

Read `AGENTS.md` first, then `LATEST_PROJECTS.md`.

Repo-specific priorities:

- Work from the exact target directory before editing.
- If the target is under `DaisyExamples/`, defer to `DaisyExamples/AGENTS.md`
  and `DaisyExamples/LATEST_PROJECTS.md`.
- For `dvpe_CLD/` or `noderr/noderr/`, start from `START_DVPE_SESSION.md` and
  `.claude/MODE_SELECTOR.md`.
- For firmware or nested DaisyExamples work, start from
  `START_FIRMWARE_SESSION.md`.
- Use `.agent/daisy_memory/decisions.md` and `.agent/daisy_memory/patterns.md`
  as strategic memory only after checking local docs and code.
- Prefer targeted validation such as `cd dvpe_CLD && npm run test`,
  `cd dvpe_CLD && npm run build`, subtree-local validation inside
  `DaisyExamples/`, or `node tests/agent-framework-contract.test.mjs` for root
  framework changes.
- Keep `.agent/`, `_agentic_promts/`, `.claude/`, `directives/`, and
  `execution/` connected. Extend them instead of replacing them wholesale
  unless the task explicitly requires a larger migration.
