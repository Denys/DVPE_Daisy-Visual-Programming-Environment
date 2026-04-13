# dvpe-development Skill

**DVPE Visual Patch Design** — Mermaid-first workflow for creating `.dvpe` block diagrams
from natural language or C++ code, with structured handoff to `/daisy-qae` for firmware.

---

## Introduction

DVPE (Daisy Visual Programming Environment) is a visual block-based patch editor where each
node on the canvas corresponds to a DaisySP DSP module or hardware I/O block. Patches are
stored as `.dvpe` JSON files and can be exported to C++ firmware for Daisy Field, Pod, or Seed.

Without a structured design workflow, two problems repeat every time:

- **Wrong block selected** — e.g., `reverb` instead of `reverb_sc`, or `filter` instead of `svf`.
  The DVPE block library has 108+ blocks with specific `definitionId` strings. Guessing the ID
  produces broken `.dvpe` files that won't load.
- **Unvalidated signal flow** — connections drawn between incompatible port types (`audio` vs `cv`
  vs `trigger`) only become obvious after attempting to generate C++.
- **Hardware mismatches** — generating a Field patch with an encoder block (Field has no encoder),
  or placing CV inputs that weren't requested.

The `dvpe-development` skill solves this by requiring **3 Mermaid diagrams to be approved before
any `.dvpe` JSON is written**. The Audio Flow diagram maps 1:1 to block `definitionId` strings.
Every connection in the Mermaid becomes a connection in the `.dvpe`. Gap analysis happens at
diagram stage, not after half the JSON is written.

**Result**: `.dvpe` files load on first attempt. Block selections match the actual library.
C++ skeletons reflect the actual signal graph.

---

## Invocation

### Automatic (preferred)

The skill triggers automatically when you describe a visual patch design task:

```
"Create a reverb patch for Daisy Pod as a block diagram"
"Design a mono synth in DVPE for Daisy Field"
"Generate a .dvpe file for a drum machine"
"Reverse engineer this C++ code into a block diagram"
"Map this signal flow to DVPE blocks"
"I want to visualize my patch before writing C++"
```

Claude detects the DVPE/visual/block diagram intent and loads the skill before responding.

### Manual

Type the slash command at the start of your message:

```
/dvpe-development Create a stereo chorus effect for Daisy Pod
```

### When it does NOT trigger

- Writing production-ready C++ firmware directly → use `/daisy-qae` instead
- Debugging existing C++ code → use systematic debugging
- Working on the DVPE TypeScript application itself (block definitions, UI) → this skill is for
  **using** DVPE to design patches, not for developing the DVPE app

---

## The Workflow

### Mermaid-First Rule

> **NO `.dvpe` JSON written before all 3 Mermaid diagrams are user-approved.**

The 3 diagrams serve different purposes, all required:

| Diagram | Mermaid Type | Purpose |
|---------|-------------|---------|
| **A. Block Diagram** | `block-beta` | System architecture — hardware platform, data domains (MIDI/Audio/Control/Display) |
| **B. Audio Flow** | `flowchart LR` | Signal path from source to output — maps directly to `.dvpe` block connections |
| **C. Control Visualization** | `flowchart TD` | Main loop logic — how knobs/keys/MIDI update DSP parameters |

Diagram B is the spec that the `.dvpe` is written against. Every node in B becomes a block.
Every arrow in B becomes a connection. If a node has no matching `definitionId` in the Block
Catalog, it is flagged at diagram stage before any JSON is produced.

### 4 Modes

```
MODE 1  DESIGN       NL or C++ → 3 Mermaid diagrams
   ↓ [Gate: you approve all 3]
MODE 2  MAP          Mermaid → .dvpe JSON (exact definitionId strings, gap analysis)
MODE 3  CODEGEN      .dvpe → raw C++ skeleton
   ↓ [Handoff: /daisy-qae Step 4 for production firmware]
MODE D  FULL PIPELINE  1 → 2 → 3 automatically
```

---

## Mode Details

### MODE 1 — DESIGN

Claude parses your input (natural language or C++ code) and identifies:

1. Target platform (Field / Pod / Seed / Custom)
2. Signal chain (sources → processing → output)
3. Control scheme (which knobs/keys/switches map to which parameters)
4. MIDI usage (`midi_note` for pitch+gate, `midi_cc` for continuous control)

Then produces all 3 Mermaid diagrams.

**For C++ reverse engineering**, Claude:

- Parses class declarations → maps to `definitionId` candidates
- Traces `AudioCallback` signal chain for Diagram B
- Traces main loop knob reads for Diagram C
- Flags any C++ class that has no matching DVPE block

**Gate**: After producing all 3, Claude asks:
*"Approve all 3 diagrams to advance to .dvpe generation?"*

You can refine any diagram before advancing. Gate does not self-advance.

### MODE 2 — MAP

For every Audio Flow node, Claude:

1. Looks up the `definitionId` in the Block Catalog (108+ blocks)
2. Verifies the block exists in `BlockRegistry.ts`
3. Flags any unmapped node with the nearest available alternative
4. Generates `.dvpe` JSON following SCHEMA.md rules
5. Validates the schema checklist (6 common mistakes) before declaring done

Output is saved to `_block_diagrams_code/{patch_name}.dvpe`.

### MODE 3 — CODEGEN

Claude generates a raw C++ skeleton from the `.dvpe`:

- Topological sort of the block graph
- Platform-specific audio callback (Field non-interleaved, Pod/Seed interleaved)
- DaisySP object declarations, Init calls, Process calls in correct order
- Makefile with library paths and LGPL flag if LGPL blocks are present

This skeleton is **structural only** — it is not production-ready firmware.
After generation, Claude always adds the daisy-qae handoff note (see Best Practices).

### MODE D — FULL PIPELINE

Runs Modes 1 → 2 → 3 in sequence with Gate 1 in between. Use this when you want to go
from description to raw C++ in a single session.

---

## How to Respond at the Gate

After Claude presents all 3 Mermaid diagrams, your options:

| Response | What happens |
|----------|-------------|
| "Approve" / "Yes" / "Looks good" | Advance to `.dvpe` generation (MODE 2) |
| "Change K3 to Attack instead of Decay" | Claude revises diagram B, re-presents, re-asks |
| "Add a delay before the reverb" | Claude updates the Audio Flow, adds the block to B, re-presents |
| "Can we use FDN reverb instead of ReverbSc?" | Claude swaps the node, verifies `fdn_reverb` exists, updates B |
| "Skip the block diagram" | Claude explains: all 3 required — redirects to Gate |

---

## Best Practices

### Do

- **Use Diagram B as the contract.** Every node you see there will appear as a block in
  the `.dvpe`. Review it carefully — adding a block later means revising the diagram and
  re-running gap analysis.

- **Correct the platform before Gate 1.** Platform determines which hardware I/O blocks
  are available. Changing from Field to Pod after `.dvpe` is generated requires rewriting
  the metadata and swapping I/O blocks.

- **Let gap analysis run before approving.** If Claude flags a node with no matching block,
  decide at diagram stage whether to use the nearest alternative or mark it as custom code.

- **Check LGPL flags in the gap analysis table.** `reverb_sc`, `moog_ladder`, `string_voice`,
  and `modal_voice` require `USE_DAISYSP_LGPL = 1` in the Makefile. Claude adds this
  automatically in MODE 3, but it's good to know before committing to those blocks.

- **Pass the MODE 3 output to `/daisy-qae`.**  The raw C++ skeleton is structurally correct
  but skips: `fonepole()` smoothing, `StartAdc()` placement, `field_defaults.h`, OLED zoom
  pattern, and all 9 linter rules. `/daisy-qae` Step 4 catches all of these.

### Don't

- **Don't add an encoder block to a Field patch.** Daisy Field has no encoder. Only Pod has
  one. This is the most common hardware mismatch. The skill enforces this, but double-check
  Diagram A to confirm.

- **Don't add CV/Gate blocks by default for Field.** Field has CV and Gate I/O, but they are
  modular-integration features, not standard patch controls. Only add `cv_input`, `cv_output`,
  or `gate_output` when you explicitly need external modular connectivity.

- **Don't use the raw C++ skeleton as production firmware.** It lacks parameter smoothing,
  OLED visualization, correct LED indexing, and other FieldUX requirements. Always pass it
  through `/daisy-qae` before flashing to hardware.

- **Don't guess `definitionId` strings.** The Block Catalog in SKILL.md lists all 108+
  verified IDs. Using a made-up ID (like `"reverb"` instead of `"reverb_sc"`) produces a
  `.dvpe` that fails to load silently.

- **Don't skip Diagram A for "simple patches."** Simple patches still run on real hardware.
  The block diagram catches platform mismatches (Field vs Pod), MIDI assumptions, and OLED
  expectations — all in 2 minutes at design time vs 2 hours at debug time.

---

## Block Catalog Quick Reference

Full catalog with all `definitionId` strings is in SKILL.md. Key blocks by use case:

### Synthesis Starting Points

| Use case | Blocks to use |
|----------|--------------|
| Basic synth voice | `oscillator` + `svf` + `adsr` + `vca` |
| FM synthesis | `fm2` + `adsr` + `vca` |
| Granular | `grainlet_oscillator` or `particle` |
| Physical string | `string_voice`* or `pluck` |
| Physical percussion | `modal_voice`* |
| Noise/drone | `white_noise` + `svf` |

### Effects Starting Points

| Use case | Blocks to use |
|----------|--------------|
| Reverb (high quality) | `reverb_sc`* or `fdn_reverb` |
| Delay | `delay_line` |
| Chorus / flanger / phaser | `chorus`, `flanger`, `phaser` |
| Distortion chain | `overdrive` → `tone_stack` |
| Bit destruction | `bitcrush` + `decimator` |
| Dynamics | `compressor` + `limiter` |

### Drum Machine Starting Points

| Voice | Block |
|-------|-------|
| Bass drum (analog) | `analog_bass_drum` |
| Bass drum (synthetic) | `synth_bass_drum` |
| Snare (analog) | `analog_snare_drum` |
| Snare (synthetic) | `synth_snare_drum` |
| Hi-hat | `hihat` |
| Clock | `metro` + `step_sequencer` |

### Essential Utility

| Purpose | Block |
|---------|-------|
| VCA / amplitude control | `vca` or `linear_vca` |
| Mix signals | `mixer` or `stereo_mixer` |
| Smooth a knob | `slew` or `smooth` |
| Map CV range | `range_map` or `scale` + `offset` |
| CV to frequency | `cv_to_freq` |
| Select between signals | `mux` or `select` |

`*` = LGPL — requires `USE_DAISYSP_LGPL = 1` in Makefile

---

## Platform Quick Reference

### Daisy Field

| Control | Count | DVPE block | Notes |
|---------|-------|------------|-------|
| Knobs | 8 (K1–K8) | `knob` (index 0–7) | Each has a Knob LED |
| Keys A-row | 8 (A1–A8) | `key` (index 0–7) | Each has a Key LED |
| Keys B-row | 8 (B1–B8) | `key` (index 8–15) | Each has a Key LED |
| Switches | 2 (SW1, SW2) | `switch` | |
| MIDI | IN + OUT | `midi_note`, `midi_cc` | TRS hardware MIDI (default) |
| CV / Gate | IN + OUT | `cv_input`, `cv_output`, `gate_output` | Use only when explicitly requested |
| Encoder | None | — | **Field has no encoder** |
| Audio | Non-interleaved | — | `out[0][i]` (L), `out[1][i]` (R) |

### Daisy Pod

| Control | Count | DVPE block | Notes |
|---------|-------|------------|-------|
| Knobs | 2 | `knob` (index 0–1) | |
| Buttons | 2 | `key` (index 0–1) | |
| Encoder | 1 | `encoder` | Pod has the encoder |
| LEDs | 2x RGB | `led_output` | |
| Audio | Interleaved | — | `out[i]` (L), `out[i+1]` (R) |

### Daisy Seed

No built-in controls. Use `cv_input` for ADC channels, `gate_trigger_in` for digital inputs.

---

## Relationship to Other Skills

| Skill | When to use instead |
|-------|---------------------|
| `/daisy-qae` | Use AFTER MODE 3 — takes the raw C++ skeleton and runs it through the 5-step QAE workflow for production-ready firmware |
| `/document-analysis` | Indexing a PDF or large reference document |
| `daisy-qae` (triggered automatically) | When user asks for C++ firmware directly, without any DVPE/visual intent |

### The dvpe-development + daisy-qae Pipeline

The two skills are designed to work together:

```
/dvpe-development
  → 3 Mermaid diagrams (approved)
  → .dvpe file (saved)
  → raw C++ skeleton

         ↓ handoff

/daisy-qae Step 4
  → reads DAISY_TUTORIALS_KNOWLEDGE.md (verified APIs)
  → runs validate_daisy_code.py (9 rules)
  → adds fonepole() smoothing, field_defaults.h, OLED zoom
  → Step 5: build + flash + hardware test
```

The raw C++ from MODE 3 is the input to Step 4 of `/daisy-qae`. You skip Steps 1–3 of
`daisy-qae` because the CONCEPT, BLOCK DIAGRAMS, and CONTROLS.md are already satisfied by
the DVPE workflow.

---

## Skill Files

```
.claude/skills/dvpe-development/
├── README.md      ← This file
├── SKILL.md       ← Mermaid-First Rule + 4 modes + Block Catalog + Platform Reference
└── EXAMPLES.md    ← 3 complete workflow traces + anti-pattern table
```

---

## Extending the Skill

### Adding a new block to the catalog

When a new block is added to `dvpe_CLD/src/core/blocks/definitions/`:

1. Find its `id` property in the `.ts` definition file
2. Add it to the Block Catalog in SKILL.md under the appropriate category
3. Note LGPL status if applicable
4. Add to EXAMPLES.md if it introduces a new usage pattern

### Adding a new platform

To add support for a new Daisy platform (e.g., Daisy Patch):

1. Add platform hardware spec to the Platform Reference section in SKILL.md
2. Add the `targetHardware` value for `.dvpe` metadata
3. Note the audio buffer format (interleaved or non-interleaved)
4. List the DVPE I/O blocks available for that platform
5. Add a platform example to EXAMPLES.md

### Adding a new diagram type

If a 4th diagram type becomes useful (e.g., memory layout for delay-heavy patches):

1. Add it to MODE 1 in SKILL.md with Mermaid type and purpose
2. Make it mandatory or optional — document the gate behavior clearly
3. Add an example to EXAMPLES.md showing when and why to use it

---

*Part of the DVPE project.*
*See also: `daisy-qae` skill for production firmware quality assurance.*
*Block definitions: `dvpe_CLD/src/core/blocks/definitions/`*
*Schema: `_block_diagrams_code/SCHEMA.md`*
