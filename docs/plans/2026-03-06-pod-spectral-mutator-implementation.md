# Pod_SpectralMutator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Daisy Pod stereo effect box that adds unusual post-FX spectral color to `Field_AdditiveSynth` using animated filters, resonant coloration, soft drive, and wet/dry blend.

**Architecture:** Start from an audio-input Pod FX structure rather than a synth voice project. Use a compact serial chain with shared control pages: input trim, dual filter core, optional comb coloration, then post-drive and wet/dry mix. Keep the DSP stable and conservative first, then add the more extreme mode logic once the shell builds cleanly.

**Tech Stack:** C++, libDaisy, DaisySP, Daisy Pod hardware APIs, GNU Make

---

### Task 1: Create the Pod project shell

**Files:**
- Create: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Makefile`
- Create: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp`
- Create: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/README.md`
- Reference: `DaisyExamples/MyProjects/_projects/Pod_MultiFX_Chain/Makefile`
- Reference: `DaisyExamples/MyProjects/_projects/Pod_MultiFX_Chain/Pod_MultiFX_Chain.cpp`
- Reference: `DaisyExamples/MyProjects/_projects/pod_fuzz_distortion/pod_fuzz_distortion.cpp`

**Step 1: Create the new project directory and empty files**

Create the Pod project with the target/source names already aligned.

**Step 2: Run the project audit to establish the baseline**

Run: `python C:/Users/denko/.codex/skills/daisy-cpp/scripts/audit_daisy_project.py DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: The audit reports missing files until the shell is populated.

**Step 3: Copy the basic project structure from a Pod FX reference**

Populate `Makefile` and create a minimal `Pod_SpectralMutator.cpp` that:
- initializes `DaisyPod`
- starts ADC and audio
- passes stereo input to stereo output

**Step 4: Re-run the project audit**

Run: `python C:/Users/denko/.codex/skills/daisy-cpp/scripts/audit_daisy_project.py DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: `TARGET` and `CPP_SOURCES` align and the source file is found.

**Step 5: Commit**

```bash
git add DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Makefile DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/README.md
git commit -m "feat: add Pod Spectral Mutator project shell"
```

### Task 2: Add the Pod UI and page system

**Files:**
- Modify: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp`
- Reference: `DaisyExamples/MyProjects/_projects/Pod_SynthFxWorkstation/Pod_SynthFxWorkstation.cpp`

**Step 1: Write the failing compile target**

Add the page enum, knob state, button state, and LED declarations in source.

**Step 2: Run build to surface missing handlers**

Run: `make`
Workdir: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: The build fails until the page-processing functions are fully declared and wired.

**Step 3: Implement the minimal control framework**

Add:
- encoder-driven page selection
- `B1` mode cycling
- `B2` hold toggle
- two-knob page control handling
- page-colored LED feedback

**Step 4: Re-run the build**

Run: `make`
Workdir: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: Build succeeds with a bypass-capable shell and working control structure.

**Step 5: Commit**

```bash
git add DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp
git commit -m "feat: add Pod Spectral Mutator page controls"
```

### Task 3: Implement the stable base signal chain

**Files:**
- Modify: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp`
- Reference: `DaisyExamples/MyProjects/_projects/pod_fuzz_distortion/pod_fuzz_distortion.cpp`

**Step 1: Add input trim and wet/dry plumbing**

Implement:
- stereo input read
- input trim
- dry signal preservation
- output wet/dry mix

**Step 2: Run build**

Run: `make`
Workdir: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: Build succeeds, but the project is still mostly a clean pass-through or lightly colored shell.

**Step 3: Add the first filter core**

Use `Svf` to implement a musically stable center-frequency and resonance stage.

**Step 4: Add post-filter soft drive**

Use `Overdrive` conservatively after the filter to keep peaks controlled and audible.

**Step 5: Re-run the build**

Run: `make`
Workdir: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: Build succeeds with the first usable color path.

**Step 6: Commit**

```bash
git add DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp
git commit -m "feat: add base filter and drive chain to Pod Spectral Mutator"
```

### Task 4: Add the unusual spectral modes

**Files:**
- Modify: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp`
- Reference: `DaisyExamples/MyProjects/_projects/Pod_SynthFxWorkstation/Pod_SynthFxWorkstation.cpp`
- Reference: `DaisyExamples/MyProjects/_projects/Pod_MultiFX_Chain/Pod_MultiFX_Chain.cpp`

**Step 1: Add the second filter branch**

Implement the additional `Svf` branch or equivalent processing needed for:
- notch behavior
- peak/formant behavior
- bandpass emphasis

**Step 2: Run build**

Run: `make`
Workdir: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: Build succeeds, but mode switching may still be basic.

**Step 3: Add comb coloration**

Implement a short `DelayLine`-based resonant color stage with:
- strict feedback clamp
- safe delay-time bounds
- no runaway self-oscillation

**Step 4: Wire B1 mode cycling through all four modes**

Modes:
- `Notch`
- `Bandpass`
- `Peak/Formant`
- `Comb`

**Step 5: Re-run the build**

Run: `make`
Workdir: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: Build succeeds with all four spectral modes present.

**Step 6: Commit**

```bash
git add DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp
git commit -m "feat: add spectral mutation modes to Pod Spectral Mutator"
```

### Task 5: Add motion, hold, and safety behavior

**Files:**
- Modify: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp`

**Step 1: Add modulation motion**

Implement:
- modulation depth
- modulation rate / scan speed
- safe smoothing on frequency or mode-sensitive parameters

**Step 2: Add hold behavior**

`B2` should freeze the modulation position rather than stopping audio.

**Step 3: Add defensive clamps**

Clamp:
- resonance
- comb feedback
- input trim
- drive amount
- wet/dry

**Step 4: Re-run the build**

Run: `make`
Workdir: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: Build succeeds and parameter changes are stable.

**Step 5: Commit**

```bash
git add DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp
git commit -m "feat: add motion and safety controls to Pod Spectral Mutator"
```

### Task 6: Document and verify the project

**Files:**
- Modify: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/README.md`
- Review: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Makefile`
- Review: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp`

**Step 1: Document the control map**

Describe:
- page functions
- button behavior
- mode descriptions
- intended pairing with `Field_AdditiveSynth`

**Step 2: Run the project audit**

Run: `python C:/Users/denko/.codex/skills/daisy-cpp/scripts/audit_daisy_project.py DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: No audit errors.

**Step 3: Run the final build**

Run: `make`
Workdir: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

Expected: Clean build.

**Step 4: Manual validation checklist**

Verify with `Field_AdditiveSynth`:
- `Organ` remains musical in `Peak/Formant`
- `Hollow` sounds animated in `Notch`
- `Buzz` does not overload the input trim stage
- low wet/dry preserves the original synth identity
- `Comb` stays controlled under maximum feedback settings

**Step 5: Commit**

```bash
git add DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Makefile DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/README.md
git commit -m "docs: finish Pod Spectral Mutator controls and verification"
```

### Task 7: Request review before merge

**Files:**
- Review: `docs/plans/2026-03-06-pod-spectral-mutator-design.md`
- Review: `docs/plans/2026-03-06-pod-spectral-mutator-implementation.md`
- Review: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Makefile`
- Review: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp`
- Review: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/README.md`

**Step 1: Request code review**

Use `@requesting-code-review` after the final build passes.

**Step 2: Verify before completion**

Use `@verification-before-completion` and re-run:
- `python C:/Users/denko/.codex/skills/daisy-cpp/scripts/audit_daisy_project.py DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`
- `make` in `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`

**Step 3: Final commit**

```bash
git add DaisyExamples/MyProjects/_projects/Pod_SpectralMutator docs/plans/2026-03-06-pod-spectral-mutator-design.md docs/plans/2026-03-06-pod-spectral-mutator-implementation.md
git commit -m "feat: add Pod Spectral Mutator effect box"
```
