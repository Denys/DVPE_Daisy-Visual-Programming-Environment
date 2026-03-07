# Pod Spectral Mutator DVPE Design

**Date:** March 7, 2026

## Goal

Create a complete `Pod_SpectralMutator.dvpe` patch for
`DaisyExamples/MyProjects/_projects/Pod_SpectralMutator` using
`Field_AdditiveSynth/Field_Additive_Synth.dvpe` as the structural reference.

The patch should document the real Pod effect architecture:

- stereo external audio input
- focus filter stage
- animated spectral mode stage
- post-filter drive
- wet/dry output mix
- Pod encoder, buttons, page controls, and indicator blocks

## Reference Style

The closest structural reference is
`DaisyExamples/MyProjects/_projects/Field_AdditiveSynth/Field_Additive_Synth.dvpe`.

That reference does not model page-state persistence as a literal hardware state
machine. Instead, it duplicates the same physical control channels in multiple
logical page groups. This is the correct precedent for `Pod_SpectralMutator.dvpe`
because DVPE's currently available CV-state blocks do not cleanly express the
exact runtime page behavior from the C++ firmware.

So the Pod patch will follow the same style:

- one physical encoder block for page selection
- one physical switch block for mode advance
- one physical switch block for hold
- duplicated `knob` blocks on channels `0` and `1` for each logical page

This keeps the patch complete and readable without inventing unsupported control
machinery.

## Architecture

The DVPE patch will have three main regions.

### 1. Hardware and Page Controls

This region documents the Pod front panel:

- `audio_input`
- `encoder`
- `switch` for `B1` mode
- `switch` for `B2` hold
- `led_output` indicators
- duplicated knob groups for:
  - `Focus`: `K1 focus frequency`, `K2 focus resonance`
  - `Motion`: `K1 motion depth`, `K2 motion rate`
  - `Color`: `K1 color amount`, `K2 wet mix`

The encoder and switches are present as real hardware blocks, even though the
page routing itself is represented in the same conceptual style as the Field
reference rather than as a literal runtime page-mux implementation.

### 2. Control and State Logic

This region captures the main non-audio behavior:

- mode stepping with a `counter` driven by the `B1` switch trigger
- mode normalization for `mux` selection
- hold state represented with a `toggle`
- motion source with `lfo`
- optional smoothing blocks for major CV signals
- range maps for color-derived or mode-derived parameter shaping

The exact C++ behavior is richer than the available DVPE control graph. The patch
therefore aims for architectural truth, not sample-for-sample equivalence.

### 3. Stereo Audio Chain

The audio path mirrors the firmware at a stage level:

`audio in -> trim -> focus filter -> spectral mode selection -> drive -> wet/dry -> audio out`

Per channel the patch will include:

- input trim gain
- focus `svf`
- focused-output mixer
- mode `svf`
- peak or formant-like filter branch
- comb branch
- mode-selection `mux`
- `overdrive`
- output `crossfade`

## Mode Modeling

The four audible modes will be represented explicitly:

1. `Notch`
2. `Bandpass`
3. `Peak/Formant-ish`
4. `Comb`

The patch uses the closest built-in DVPE blocks for each:

- notch and bandpass from `svf`
- peak or formant emphasis from `peakFilter`
- comb coloration from `universalComb`

This is deliberately close to the firmware intent, even where the available DVPE
blocks are not exact one-to-one matches for the underlying C++ calls.

## Fidelity Boundaries

The `.dvpe` patch will be complete, but not numerically identical to the C++
implementation in every detail.

Known differences that are acceptable:

- page behavior is represented conceptually, matching the Field `.dvpe` style
- parameter smoothing is simplified
- hold state is represented architecturally rather than by the exact
  `held_motion_value` variable semantics
- left/right comb asymmetry may be reduced to a readable approximation
- LED behavior is functional, not exact RGB color mixing

These are acceptable because the `.dvpe` file is meant to communicate the patch
architecture in DVPE's native block language, not replace the C++ firmware as the
single source of truth.

## Verification

The generated patch should be checked for:

- valid top-level DVPE JSON structure
- correct metadata and target hardware (`pod`)
- valid block IDs and `definitionId` values
- connection endpoints pointing to existing blocks and port names
- coverage of all major firmware sections from `Pod_SpectralMutator.cpp`

## Deliverable

Create:

- `DaisyExamples/MyProjects/_projects/Pod_SpectralMutator/Pod_SpectralMutator.dvpe`

Supplementary planning docs:

- `docs/plans/2026-03-07-pod-spectral-mutator-dvpe-design.md`
- `docs/plans/2026-03-07-pod-spectral-mutator-dvpe-implementation.md`
