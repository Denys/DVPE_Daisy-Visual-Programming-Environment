# Session Entry: DVPE Application Development

**Noderr instance:** `noderr/noderr/`
**Mode:** DVPE | **Language:** TypeScript / React / Tauri

## Pre-flight Check

1. Read `noderr/noderr/INSTANCE_IDENTITY.md` → confirm `DVPE-APP-PRIMARY`
2. If you see `DSP_` or `LIBDASY_` NodeIDs anywhere → wrong instance, stop.

## Proceed

Run: `noderr/noderr/prompts/NDv1.9__Start_Work_Session.md`

All relative paths in that prompt (`noderr_project.md`, `noderr_tracker.md`, etc.)
resolve from `noderr/noderr/` as root.

---

Dev server: `cd dvpe_CLD && npm run dev` → http://localhost:5173
Tests: `cd dvpe_CLD && npm run test`
Build: `cd dvpe_CLD && npm run build`
Desktop: `cd dvpe_CLD && npm run tauri:dev`
