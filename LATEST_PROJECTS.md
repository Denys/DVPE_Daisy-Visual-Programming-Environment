# LATEST_PROJECTS.md

Volatile companion to `AGENTS.md`. Treat source, manifests, tests, and current
command output as stronger evidence than historical planning files.

## Last refreshed

- 2026-09-01

## Active work areas

| Project | Current state | Start here |
| --- | --- | --- |
| `dvpe_CLD/` | Primary React/Vite browser editor. The verified snapshot contains 174 runtime blocks; 883 tests pass, lint has no errors, and production build succeeds. | `README.md`, `START_DVPE_SESSION.md`, `dvpe_CLD/package.json` |
| Root launcher | Supported Windows one-click start. It checks Node.js 20+, installs the lockfile exactly, binds to `127.0.0.1:1420`, and opens the browser. | `START_DVPE.cmd`, `START_DVPE.ps1` |
| `docs/user-guide/` | Current end-user instructions for the block diagram, Inspector, the three designs, persistence, hardware mapping, and export. | `docs/user-guide/README.md` |
| `dvpe_CLD/examples/` | Runnable patch examples and the Daisy Field Mapping tutorial. | `dvpe_CLD/examples/field_mapping_subtractive_tutorial.md` |
| `dvpe_DESIGN/` | Design studies and visual references. They are context, not proof of implemented application behavior. | `dvpe_DESIGN/dvpe_glassmorphism_ai_guide.md` |
| `dashboard/` and `dashboard-server/` | Development dashboard surfaces, separate from the DVPE product runtime. | nearest README and manifests |
| `.agent/`, `.claude/`, `_agentic_promts/` | Agent support, history, and mode-routing assets. Keep them separate from end-user product instructions. | root `AGENTS.md` and nearest local instructions |
| `directives/` and `execution/` | Intended SOP and deterministic-execution layers. The public branch does not currently track `execution/dvpe_cli.py`; claims that depend on it are unavailable until the file exists. | `directives/README.md`, `execution/README.md` |
| `noderr/noderr/` | Optional ignored local planning/specification instance; absent from a normal public clone. | `INSTANCE_IDENTITY.md` when present |
| `DaisyExamples/` | Optional ignored firmware workspace with a separate contract; absent from a normal public clone. | `DaisyExamples/AGENTS.md` when present |

## Routing notes

- UI, state, code generation, patch editing, and browser behavior normally
  belong to `dvpe_CLD/`.
- Firmware compilation, flashing, and hardware acceptance belong to a specific
  external Daisy project and require their own evidence.
- `docs/plans/`, `PLANNING/`, design mockups, and agent memory are context, not
  implementation proof.
- The supported application runtime is the browser. There is no current Tauri
  project in the public repository.
