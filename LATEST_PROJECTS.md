# LATEST_PROJECTS.md

Volatile companion to `AGENTS.md`.

Refresh this file when a new subtree becomes an active work area or when the
recommended entrypoints for an existing root change materially.

## Last Refreshed

- 2026-04-20

## How To Use This File

1. Find the target subtree here if the workspace is ambiguous.
2. Start from the listed local docs and entrypoints before relying on older
   repo-wide instructions.
3. Treat `docs/plans/` and `PLANNING/` as design context, not implementation
   proof.
4. If the target is not listed here, fall back to `AGENTS.md` plus the nearest
   local docs.

## Active Work Areas

| Project | Latest Activity | Key Local Docs | Agent Notes |
|---------|-----------------|----------------|-------------|
| `dvpe_CLD/` | 2026-04-20 | `START_DVPE_SESSION.md`, `README.md`, `noderr/noderr/INSTANCE_IDENTITY.md`, `noderr/noderr/environment_context.md` | Main React/Vite/Tauri application. Run npm commands from `dvpe_CLD/`. If the task is UI, stores, codegen, or patch editing, this is usually the primary root. |
| `noderr/noderr/` | 2026-04-20 | `INSTANCE_IDENTITY.md`, `noderr_project.md`, `noderr_architecture.md`, `noderr_tracker.md` | Primary DVPE memory and specification surface. Use for `UI_`, `SVC_`, `STORE_`, `CONFIG_`, and `UTIL_` work. |
| `DaisyExamples/` | 2026-04-20 | `DaisyExamples/AGENTS.md`, `DaisyExamples/LATEST_PROJECTS.md`, `DaisyExamples/README.md`, `START_FIRMWARE_SESSION.md`, `DaisyExamples/noderr/INSTANCE_IDENTITY.md` | Nested firmware workspace with its own contract. If the task mentions `.cpp`, `make`, `libDaisy`, `DaisySP`, or firmware Noderr, switch to this local authority. |
| `.agent/` | 2026-04-20 | `.agent/workflows/agent.md`, `.agent/daisy_memory/decisions.md`, `.agent/daisy_memory/patterns.md` | Legacy memory, workflow, and helper assets. Keep these connected, but treat them as strategic memory and support tooling rather than primary source of truth. |
| `directives/` | 2026-04-20 | `directives/README.md`, `directives/build_firmware.md`, `directives/launch_dev_servers.md` | Repo-level SOP layer describing what to do. Relevant when the task is about orchestration, automation, or agent framework behavior. |
| `execution/` | 2026-04-20 | `execution/README.md` | Deterministic execution layer. Use or extend this when a repeated workflow should become a script instead of prompt-only logic. |

## Additional Notes

- `.claude/` and `_agentic_promts/` remain active instruction assets and should
  stay wired into the root contract rather than being replaced wholesale.
- `docs/plans/` contains the most recent design and implementation context for
  larger feature work.
- `PLANNING/` still contains older planning artifacts and discrepancy reports;
  use it as context only.
