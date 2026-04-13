# Daisy Development — Implementation Decisions Log

**Purpose**: Record key architecture and implementation decisions for session continuity.
**Created**: 2026-02-10 (reconstructed from project history)

---

## Decision #001: Hardware MIDI Default (TRS, not USB)
- **Date**: 2026-01-24
- **Context**: FieldArpeggiator crashed when using `MidiUsbHandler`. USB MIDI on Daisy Field is unreliable for real-time use.
- **Decision**: Default to **hardware MIDI (TRS jack)** via `hw.midi` for all Field/Pod projects.
- **Alternative**: USB MIDI (`MidiUsbHandler`) — only if explicitly requested.
- **Source**: CHECKPOINT.md 2026-01-24 session, Bug investigation.

## Decision #002: ST-Link as Default Programming Method
- **Date**: 2026-01-24
- **Context**: ST-Link is more reliable than DFU and doesn't require boot mode changes.
- **Decision**: Default to `make program` (ST-Link). DFU (`make program-dfu`) is fallback.
- **Source**: CHECKPOINT.md 2026-01-24.

## Decision #003: Non-Interleaved Audio for Field
- **Date**: 2026-01-19 (established in first Field projects)
- **Context**: Daisy Field uses non-interleaved audio buffers (`out[0][i]`), unlike Pod's interleaved (`out[i]`).
- **Decision**: Always use `AudioHandle::OutputBuffer` (non-interleaved) for Field, `InterleavingOutputBuffer` for Pod.
- **Consequence**: Critical — using wrong pattern causes silence or crashes.

## Decision #004: LGPL Modules Require Makefile Flag
- **Date**: 2026-01-19
- **Context**: `ReverbSc`, `MoogLadder`, `StringVoice`, `ModalVoice` are in DaisySP-LGPL. Missing flag causes linker errors.
- **Decision**: Add `USE_DAISYSP_LGPL = 1` to Makefile whenever these modules are used.
- **Source**: Bug #013, Pod_Synth_Voice compilation.

## Decision #005: fonepole() for Parameter Smoothing
- **Date**: Established convention
- **Context**: Direct parameter changes in audio callback cause zipper noise.
- **Decision**: Always use `fonepole(current, target, coefficient)` for smoothing knob values.

## Decision #006: Phase 13 Architecture — Flattening for Custom Blocks
- **Date**: 2026-01-28
- **Context**: Custom (hierarchical) blocks could be compiled as separate functions or flattened inline.
- **Decision**: **Flatten** — inline inner blocks with prefixed variable names during C++ code generation.
- **Rationale**: Simpler, avoids function pointer overhead on embedded ARM, no recursion risk.
- **Source**: Phase13_3_TODO.md Step 4.

## Decision #007: Custom Block Persistence Embedded in .dvpe
- **Date**: 2026-02-10
- **Context**: Custom block definitions lived only in `localStorage`. Sharing patches lost custom blocks.
- **Decision**: Embed referenced `CustomBlockDefinition[]` in `.dvpe` files (Bug #016 fix).
- **Backward Compatible**: Old files without `customBlocks` key load normally.
- **Source**: dvpe_bugs.md Bug #016.

## Decision #008: Block Size = 4 (Default)
- **Date**: Established convention
- **Context**: Smaller block sizes reduce latency but increase CPU overhead.
- **Decision**: Default `hw.SetAudioBlockSize(4)` for all projects. Increase only if CPU-bound.

## Decision #009: OLED Updates in Main Loop Only
- **Date**: Established convention (Bug E003)
- **Context**: Calling `display.Update()` from audio callback causes timing issues and visual glitches.
- **Decision**: All display updates happen in `for(;;)` main loop, never in `AudioCallback`.

## Decision #010: A5 Persistence — Excluded from Agent Scope
- **Date**: 2026-02-10
- **Context**: User prefers to handle `.dvpe` persistence for custom blocks manually.
- **Decision**: Task A5 excluded from Phase 13 agent work. User handling exclusively.
- **Source**: Phase13_Progress_Checklist_RT.md.

---

## Template for New Decisions

```markdown
## Decision #NNN: [Title]
- **Date**: YYYY-MM-DD
- **Context**: [Why this decision was needed]
- **Decision**: [What was decided]
- **Alternative**: [What was considered but rejected]
- **Source**: [Reference file or session]
```
