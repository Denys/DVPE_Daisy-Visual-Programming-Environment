# Session Entry: Daisy Firmware Development

**Noderr instance:** `DaisyExamples/noderr/`
**Mode:** Firmware | **Language:** C/C++ (libDaisy + DaisySP)

## Pre-flight Check

1. Read `DaisyExamples/noderr/INSTANCE_IDENTITY.md` → confirm `DAISY-FIRMWARE-SECONDARY`
2. If you see `UI_` or `SVC_` NodeIDs anywhere → wrong instance, stop.

## Proceed

Run: `DaisyExamples/noderr/prompts/NDv1.9__Start_Work_Session.md`

All relative paths in that prompt (`noderr_project.md`, `noderr_tracker.md`, etc.)
resolve from `DaisyExamples/noderr/` as root.

---

Build: `cd DaisyExamples/<project> && make`
Flash (ST-Link): `make program`
Flash (DFU): `make program-dfu`
Clean: `make clean`
