---
description: load the repo contract, route to the correct workspace entrypoint, and then load the matching agent wrapper
---

1. Read `AGENTS.md`, then `LATEST_PROJECTS.md`.
2. Load the tool-specific wrapper for the current model (`CODEX.md`,
   `CLAUDE.md`, or `GEMINI.md`) and report which wrapper you loaded.
3. Route by target subtree:
   - `dvpe_CLD/` or `noderr/noderr/` -> read `START_DVPE_SESSION.md`
   - `DaisyExamples/` or firmware `.cpp` / `make` work -> read
     `START_FIRMWARE_SESSION.md` and defer to `DaisyExamples/AGENTS.md`
4. After routing, load the nearest checkpoint or state file
   (`CHECKPOINT.md`, `noderr_tracker.md`, or the project-local equivalent)
   before implementing.
