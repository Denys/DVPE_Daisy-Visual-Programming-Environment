# daisy-qae Skill

**DAISY Quality Assurance Enforcer** — mandatory 5-step workflow for all Daisy Seed/Pod/Field projects.

---

## Introduction

Every Daisy project in this repo follows the **DAISY_QAE** (Quality Assurance Ecosystem) workflow.
Without it, projects accumulate the same class of errors every time:

- Hallucinated DaisySP APIs (`SetCutoff()` instead of `SetFreq()`, `SetQ()` instead of `SetRes()`)
- Controls placed in the audio callback (causes dropouts and glitches)
- Missing `hw.StartAdc()` before `hw.StartAudio()` (Field silently fails)
- No parameter smoothing (audible zipper noise on every knob move)
- Undefined control mappings (knob 6 does what exactly?)
- LED index bugs (`kLedKeysA` reversed, manually wrong)

The `daisy-qae` skill solves this by **blocking implementation** until three design artifacts are
complete and user-approved: CONCEPT, BLOCK DIAGRAMS, and CONTROLS.md. Only then does code get written
— and only using verified APIs read from the QAE knowledge base.

**Result**: First-compile success rate goes from ~40% to ~90%. Hardware behavior matches the design.

---

## Invocation

### Automatic (preferred)

The skill triggers automatically when you ask for any of these:

```
"Create a synth for Daisy Field"
"Build a reverb effect for Pod"
"Write firmware for Daisy Seed"
"New Daisy project: arpeggiator"
"Generate C++ for a drum machine"
```

Claude detects the keywords and loads the skill before responding.

### Manual

Type the slash command at the start of your message:

```
/daisy-qae Create a monophonic subtractive synth for Daisy Field with MIDI input
```

### When it does NOT trigger

- Fixing a bug in **existing** code → use systematic debugging instead
- Modifying a single file in an already-designed project
- DVPE block definition work → use `/dvpe-development`

---

## The 5-Step Workflow

Each step ends with a **gate** — Claude stops and waits for your explicit approval before advancing.
You can refine any artifact at its gate before moving on.

```
STEP 1  CONCEPT        → purpose, modules, platform, complexity
   ↓ [Gate: you approve]
STEP 2  BLOCK DIAGRAMS → 3 Mermaid diagrams (System / Signal / Control)
   ↓ [Gate: you approve all 3]
STEP 3  CONTROLS.md    → knob/key/switch/OLED mapping + 1 preset
   ↓ [Gate: you approve]
STEP 4  IMPLEMENTATION → C++ + Makefile, validated by linter
STEP 5  VERIFY         → build, flash, hardware test, update CONTROLS.md
```

### Step 1 — CONCEPT

Claude produces:

| Field | Example |
|-------|---------|
| Purpose | "Monophonic synth with MIDI input, SVF filter, ADSR" |
| Platform | Field / Pod / Seed |
| DaisySP modules | `Oscillator`, `Svf`, `Adsr` |
| DAFX_2_Daisy modules | `fdn_reverb`, `wahwah`, … (if needed) |
| LGPL needed? | Yes/No — determines Makefile flag |
| Complexity | 1–10 |

Claude consults `dsp/core.txt` and `dsp/advanced.txt` to select modules before presenting CONCEPT.

### Step 2 — Block Diagrams

Three mandatory Mermaid diagrams, each capturing a different view:

| Diagram | Type | Shows |
|---------|------|-------|
| A. System Architecture | `block-beta` | Hardware blocks, data domains (MIDI/Audio/Control/Display) |
| B. Signal Flow | `flowchart LR` | Audio signal path from source to output |
| C. Control Flow | `flowchart TD` | Main loop logic, parameter update sequence |

These are not decorative. They are the spec that the audio callback is written against.
If the signal flow has a node, there will be a variable for it in the code.

### Step 3 — CONTROLS.md

A Markdown file saved to the project folder with:

- Full knob mapping table (parameter, range, unit)
- Key mapping table (A-row and B-row for Field)
- Switch behavior
- OLED display layout (idle state and zoom state)
- At least one named preset with concrete values

This file becomes the source of truth for hardware testing in Step 5.
It is updated whenever testing reveals a gap.

### Step 4 — Implementation

Before writing a single line of C++, Claude reads:

1. `DAISY_DEVELOPMENT_STANDARDS.md` — platform code template
2. `DAISY_TUTORIALS_KNOWLEDGE.md` — verified API method signatures
3. `DAISY_HALLUCINATION_REFERENCE.md` — common wrong APIs to avoid
4. The relevant platform example file (`field1.txt`, `pod.txt`, etc.)
5. `field_defaults.h` for all Field targets

After writing, Claude runs the linter:

```bash
python DaisyExamples/DAISY_QAE/validate_daisy_code.py <project>.cpp
```

All 9 rules must pass before Step 4 is declared done.

### Step 5 — Verify

```bash
make clean && make      # Must exit 0
make program            # ST-Link flash (default)
```

Hardware checklist: knobs, keys, switches, OLED, MIDI (if applicable).
Any discrepancy → fix in code, re-flash, update CONTROLS.md.
Any non-obvious bug → log to `DaisyExamples/DAISY_QAE/DAISY_BUGS.md`.

---

## How to Respond at Each Gate

At each gate, Claude presents the artifact and asks for approval. Your options:

| Response | What happens |
|----------|-------------|
| "Approve" / "Yes" / "Looks good" | Advance to next step |
| "Change X to Y" | Claude revises the artifact, re-presents, re-asks |
| "Skip this step" | Claude explains why the step exists and redirects |
| "I already know the controls" | Claude says "Great — let's write it quickly. 5 min." |
| No response to gate | Claude waits — it does not self-advance |

---

## Best Practices

### Do

- **Read the CONCEPT carefully.** The module list is where scope gets agreed on.
  Adding a module later means revising the Signal Flow diagram.

- **Refine diagrams at Gate 2, not after.** If the signal flow looks wrong,
  fix it now — not during a debug session at 2am.

- **Keep CONTROLS.md next to the source file.** Future you (and future AI agents)
  will need it to understand what K7 does.

- **Use Gate 3 to think about UX.** Eight knobs is a lot. Which one matters most
  should be K1. The zoom display should confirm what the user just touched.

- **Run the linter before testing on hardware.** It catches hallucinated APIs that
  compile but produce silence or crashes at runtime.

### Don't

- **Don't skip Block Diagrams "for a simple patch."** Simple patches are where
  the workflow overhead is smallest. And they still have the same bugs when skipped.

- **Don't ask for code at Gate 1 or Gate 2.** The skill will redirect you.
  The workflow is non-negotiable.

- **Don't put control reads in the audio callback.** `ProcessAllControls()` and
  knob reads belong in the main loop only. The skill enforces this.

- **Don't manually index Field LEDs.** Use `kLedKeysA[]` and `kLedKeysB[]`
  from `field_defaults.h`. The indexing is reversed and counter-intuitive —
  the constants exist precisely because every project got it wrong manually.

- **Don't write code before reading `DAISY_HALLUCINATION_REFERENCE.md`.**
  The wrong API names compile without errors on some builds and fail silently on others.

---

## Knowledge Base Quick Reference

| When you need | Read this file |
|---------------|---------------|
| Platform code template | `DAISY_DEVELOPMENT_STANDARDS.md` |
| Correct API signatures | `DAISY_TUTORIALS_KNOWLEDGE.md` |
| "Is this API name right?" | `DAISY_HALLUCINATION_REFERENCE.md` |
| Hardware debugging | `DAISY_DEBUG_STRATEGY.md` |
| Known bugs and fixes | `DAISY_BUGS.md` |
| Field LED constants, OLED helper | `field_defaults.h` + `FIELD_DEFAULTS_USAGE.md` |
| Platform boilerplate (Field/Pod/Seed) | `platforms/field1.txt`, `platforms/pod.txt`, etc. |
| DSP module examples | `dsp/core.txt`, `dsp/advanced.txt` |

All QAE files: `DaisyExamples/DAISY_QAE/`
All foundation examples: `DaisyExamples/MyProjects/foundation_examples/`

---

## Relationship to Other Skills

| Skill | When to use instead |
|-------|---------------------|
| `/dvpe-development` | Working on DVPE TypeScript app or block definitions |
| `/document-analysis` | Indexing a PDF or large reference document |
| `daisy_cpp` (in `.agent/skills/`) | Coding standards reference (loaded automatically by this skill at Step 4) |

---

## Skill Files

```
.claude/skills/daisy-qae/
├── README.md      ← This file
├── SKILL.md       ← Iron Law + 5 gated steps (loaded by Claude)
└── EXAMPLES.md    ← 3 complete workflow traces + anti-pattern table
```

---

## Extending the Skill

To update the workflow (e.g., add a new mandatory check at Step 4):

1. Edit `SKILL.md` — update the relevant step section
2. Add a matching example to `EXAMPLES.md` showing the new check in action
3. If a new reference file is added to `DAISY_QAE/`, add it to the **Reference Files** section in `SKILL.md`

To add platform support (e.g., Daisy Patch):

1. Add `patch.txt` reference to Step 2 and Step 4 in `SKILL.md`
2. Add a Patch example to `EXAMPLES.md`
3. Add platform-specific mandatory rules (equivalent to the Field/Pod rules currently in Step 4)

---

*Part of the DVPE project — DAISY_QAE ecosystem.*
*See also: `DaisyExamples/DAISY_QAE/README.md` for the full QAE system overview.*
