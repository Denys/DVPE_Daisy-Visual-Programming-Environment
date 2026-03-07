# Pod Spectral Mutator DVPE Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a complete `Pod_SpectralMutator.dvpe` patch that documents the Pod effect architecture in DVPE using the same conceptual completeness as `Field_Additive_Synth.dvpe`.

**Architecture:** The patch will mirror the firmware at the stage level: hardware controls, modulation and mode logic, stereo filter and color stages, and wet/dry output. To stay consistent with the Field DVPE reference, repeated Pod control pages will be represented by duplicated knob-channel blocks rather than a literal page-state machine.

**Tech Stack:** DVPE `.dvpe` JSON patch format, existing DVPE block definitions in `dvpe_CLD/src/core/blocks/definitions`, Daisy Pod project source in `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator`.

---

### Task 1: Finalize the DVPE block inventory

**Files:**
- Read: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.cpp`
- Read: `DaisyExamples/MyProjects/_projects/Field_AdditiveSynth/Field_Additive_Synth.dvpe`
- Read: `dvpe_CLD/src/core/blocks/definitions/*.ts`
- Create: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe`

**Step 1: Confirm the firmware stages to represent**

Check these major stages in the C++ project:

- input trim
- focus SVF
- spectral mode stage
- LFO motion
- hold and mode logic
- overdrive
- wet/dry output

**Step 2: Confirm the DVPE block equivalents**

Use these likely block types:

- `audio_input`, `audio_output`
- `knob`, `encoder`, `switch`, `led_output`
- `lfo`, `counter`, `toggle`, `range_map`, `smooth`
- `gain`, `svf`, `peakFilter`, `universalComb`, `overdrive`, `crossfade`, `mux`, `mixer`

**Step 3: Commit planning milestone**

```bash
git add -f docs/plans/2026-03-07-pod-spectral-mutator-dvpe-design.md docs/plans/2026-03-07-pod-spectral-mutator-dvpe-implementation.md
git commit -m "docs: add Pod Spectral Mutator DVPE design and plan"
```

### Task 2: Write the patch skeleton and hardware control region

**Files:**
- Modify: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe`

**Step 1: Create the top-level DVPE structure**

Include:

- `version`
- `patch.metadata`
- `patch.blocks`
- `patch.connections`

Metadata must set:

- `name = "Pod Spectral Mutator"`
- `targetHardware = "pod"`
- `sampleRate = 48000`
- `blockSize = 48`

**Step 2: Add the Pod hardware blocks**

Create blocks for:

- stereo audio input and output
- encoder page selector
- `B1` mode switch
- `B2` hold switch
- two LED indicators

**Step 3: Add duplicated control-page knob groups**

Create separate knob blocks for:

- focus frequency and focus resonance
- motion depth and motion rate
- color amount and wet mix

Use the same Pod ADC channels across logical page groups, following the Field
reference style.

**Step 4: Save milestone**

```bash
git add -f DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe
git commit -m "feat: add Pod Spectral Mutator DVPE hardware skeleton"
```

### Task 3: Build the control and state graph

**Files:**
- Modify: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe`

**Step 1: Add mode logic**

Use:

- `switch` trigger from `B1`
- `counter` with max `4`
- `range_map` from `0..3` to `0..1` for `mux` selection

**Step 2: Add motion and hold logic**

Use:

- `lfo`
- `toggle` for hold indication
- optional `smooth` blocks on motion-related CV where helpful

Represent hold as an architectural control-state block path even if the exact
runtime frozen-value behavior is simplified.

**Step 3: Add parameter shaping**

Add CV shaping blocks for:

- color-derived trim compensation
- color-derived drive amount
- comb feedback range
- mode or LED indication scaling

**Step 4: Save milestone**

```bash
git add -f DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe
git commit -m "feat: add Pod Spectral Mutator DVPE control graph"
```

### Task 4: Build the stereo audio graph

**Files:**
- Modify: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe`

**Step 1: Add the focus stage**

Per channel:

- trim gain
- `svf`
- focused-output mixer using low and band outputs

**Step 2: Add spectral-mode branches**

Per channel:

- notch branch from `svf.notch`
- band branch from `svf.band`
- peak/formant-ish branch using `peakFilter`
- comb branch using `universalComb`

**Step 3: Add mode routing**

Per channel:

- one `mux` block with four inputs
- connect normalized mode CV to `select_cv`

**Step 4: Add post-color and output mix**

Per channel:

- `overdrive`
- `crossfade` for dry/wet
- final connection to audio output

**Step 5: Save milestone**

```bash
git add -f DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe
git commit -m "feat: add Pod Spectral Mutator DVPE audio chain"
```

### Task 5: Validate the patch structure

**Files:**
- Verify: `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe`

**Step 1: Parse the JSON**

Run:

```powershell
$p='DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe'
Get-Content -Raw $p | ConvertFrom-Json | Out-Null
```

Expected:

- no parse errors

**Step 2: Verify block and connection references**

Run:

```powershell
$p='DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe'
$j=Get-Content -Raw $p | ConvertFrom-Json
$ids=@{}
$j.patch.blocks | ForEach-Object { $ids[$_.id]=$true }
$missing=@()
foreach($c in $j.patch.connections){
  if(-not $ids.ContainsKey($c.sourceBlockId)){ $missing += "missing source $($c.id): $($c.sourceBlockId)" }
  if(-not $ids.ContainsKey($c.targetBlockId)){ $missing += "missing target $($c.id): $($c.targetBlockId)" }
}
if($missing.Count -eq 0){ 'OK' } else { $missing }
```

Expected:

- `OK`

**Step 3: Cross-check against firmware stages**

Confirm the patch contains blocks corresponding to:

- focus filter
- motion LFO
- mode selector
- comb branch
- drive
- wet/dry

**Step 4: Final commit**

```bash
git add -f DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe
git commit -m "feat: add Pod Spectral Mutator DVPE patch"
```
