# AGENTS.md

Repo-level instructions for coding agents working in
`DVPE_Daisy-Visual-Programming-Environment/`.

This repository is a mixed workspace. It contains the DVPE application,
the nested `DaisyExamples/` firmware workspace, two Noderr surfaces,
legacy agent memory under `.agent/`, and shared `directives/` plus
`execution/` layers. Work from the smallest relevant subtree and preserve
existing connections between these systems unless the task explicitly asks
to change the framework itself.

For volatile recency and active-root guidance, read `LATEST_PROJECTS.md`.

## Scope

- Default assumption: this repo mixes app code, embedded firmware, agent
  framework files, planning docs, and reference assets.
- Prefer the smallest possible change set. Do not "normalize" unrelated
  prompts, docs, or memory files while solving a local task.
- If work spans more than one root, identify the primary target first and
  validate only the affected surfaces.

## Instruction Priority

When instructions conflict, resolve by descending priority:

1. Explicit user instruction in the current session
2. Nearest local `AGENTS.md` for the target subtree
   Today this is primarily `DaisyExamples/AGENTS.md`
3. This root `AGENTS.md`
4. Entry docs and mode selectors such as `START_DVPE_SESSION.md`,
   `START_FIRMWARE_SESSION.md`, `.claude/MODE_SELECTOR.md`, and the
   relevant `INSTANCE_IDENTITY.md`
5. Tool-specific wrappers such as `CODEX.md`, `CLAUDE.md`, `CHATGPT.md`,
   `GEMINI.md`, `KILO.md`, and `OPENCODE.md`
6. `LATEST_PROJECTS.md` as volatile orientation
7. `docs/plans/` and `PLANNING/` as design context, not implementation proof
8. `.agent/daisy_memory/decisions.md` and
   `.agent/daisy_memory/patterns.md` as strategic memory only

## Start Here

1. Identify the exact target directory before editing anything.
2. If the target is inside `DaisyExamples/`, stop and read
   `DaisyExamples/AGENTS.md`, `DaisyExamples/LATEST_PROJECTS.md`, and
   `START_FIRMWARE_SESSION.md` before making assumptions.
3. If the task lives in `dvpe_CLD/` or `noderr/noderr/`, read
   `START_DVPE_SESSION.md`, `.claude/MODE_SELECTOR.md`, and
   `noderr/noderr/INSTANCE_IDENTITY.md`.
4. Read the nearest local docs such as `README.md`, `CHECKPOINT.md`,
   `CONTROLS.md`, and subtree notes before changing behavior.
5. If the target is unclear or several roots look plausible, use
   `LATEST_PROJECTS.md` to narrow to the active surface.
6. Use `.agent/daisy_memory/decisions.md` and
   `.agent/daisy_memory/patterns.md` only after local docs, never instead of
   them.
7. When the task is about repo automation or agent workflow itself, also read
   `directives/README.md`, `execution/README.md`, and `.agent/workflows/`.

## Repo Map

- `dvpe_CLD/`: main React/Vite/Tauri DVPE application
- `noderr/noderr/`: primary DVPE Noderr instance
- `DaisyExamples/`: nested firmware workspace with its own
  `DaisyExamples/AGENTS.md`, `LATEST_PROJECTS.md`, and `noderr/`
- `.agent/`: legacy memory, skills, workflows, reports, and helper assets
- `.claude/` and `_agentic_promts/`: mode-switched instruction libraries and
  prompt assets
- `directives/`: repo-level SOP layer describing what to do
- `execution/`: deterministic script layer for doing the work
- `docs/`, `PLANNING/`, and `project_description/`: design and reference context

## Pinned Workspace Roots

These roots are first-party work areas and should be considered before
assuming the active work lives only in one subtree:

- `dvpe_CLD/`
- `noderr/noderr/`
- `DaisyExamples/`
- `.agent/`
- `directives/`
- `execution/`

## Ignore By Default

Do not use these directories as primary evidence unless the task is
explicitly about them:

- `.worktrees/`
- `.tmp/`
- `out/`
- `archive/`
- `build/`
- `dist/`
- `__pycache__/`
- nested `node_modules/`

Generated output in these trees should not override source or docs when
judging recency.

## Safety Rules

- Expect a dirty worktree. Preserve unrelated edits.
- Do not delete or completely rework the existing connections between
  `.agent/`, `_agentic_promts/`, `.claude/`, `noderr/`, `DaisyExamples/`,
  `directives/`, and `execution/` unless the user explicitly asks for it.
- Do not treat `.agent/daisy_memory/*` as the source of truth when local docs
  or code disagree.
- Do not treat `DaisyExamples/` as generic reference material when you are
  editing there; it is a nested workspace with its own contract.
- Prefer thin routing changes over broad prompt rewrites.

## Build And Verification

Prefer targeted validation over repo-wide validation.

### DVPE app validation

From `dvpe_CLD/`:

```sh
npm run test
npm run build
```

Run only the smallest relevant command for the surface you changed.

### DaisyExamples validation

If the target lives under `DaisyExamples/`, follow `DaisyExamples/AGENTS.md`
and validate from the specific project directory there.

### Framework and repo-contract validation

For root workflow changes such as these files, run the contract test:

```sh
node tests/agent-framework-contract.test.mjs
```

Also run any subtree-specific validation affected by the change.

## Documentation Expectations

- Update `LATEST_PROJECTS.md` when active work areas or routing guidance change
  materially.
- Keep root wrappers thin and route to subtree-local authority when available.
- Use `.agent/daisy_memory/*` for continuity, but keep the authoritative
  instructions close to the code they govern.
