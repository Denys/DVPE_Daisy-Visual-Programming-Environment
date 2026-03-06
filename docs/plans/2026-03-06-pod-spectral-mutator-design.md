# Pod_SpectralMutator Design

**Date:** 2026-03-06

**Goal:** Create a Daisy Pod effect box that sits after `Field_AdditiveSynth` and adds unusual spectral color rather than duplicating its built-in chorus and reverb.

## Why This Exists

`Field_AdditiveSynth` already provides width and space through chorus and `ReverbSc`. A companion Daisy Pod effect box should therefore focus on post-FX coloration: moving notches, resonant peaks, comb-like metallic color, and controlled nonlinear glue.

The desired result is a box that can make the synth sound hollow, vocal, metallic, unstable, or animated while preserving the original character at lower wet/dry settings.

## Scope

- New Daisy Pod project: `Pod_SpectralMutator`
- Stereo audio input from the external synth
- Stereo output to monitors, mixer, or recorder
- No internal synth voice in v1
- No redundant large reverb block in v1
- Strong emphasis on playability with Pod's limited control surface

## Signal Chain

`Field_AdditiveSynth -> input trim -> dual animated filter core -> optional comb/resonant stage -> soft drive -> wet/dry output`

### Stage Roles

- **Input trim**
  - Keep synth peaks controlled before hitting resonant filters
  - Provide headroom for louder `Field_AdditiveSynth` presets such as `Buzz`

- **Dual animated filter core**
  - Main timbral engine
  - One branch provides broad tone focus
  - The second branch creates moving notches, peaks, or vocal-like emphasis

- **Comb/resonant color stage**
  - Very short delay or resonant feedback path
  - Adds metallic or pseudo-physical-model coloration
  - Must stay stable under high resonance and hot synth input

- **Soft drive**
  - Sits after the resonant stages
  - Prevents thin resonant filtering from feeling detached
  - Adds glue and controlled edge rather than heavy distortion

- **Wet/dry output**
  - Essential because the box should layer onto the synth's own internal FX, not erase them

## Control Model

The Pod should use three encoder-selected pages to keep the two-knob interface musical.

### Page 1: Focus

- `K1`: center / emphasis frequency
- `K2`: resonance / sharpness

Purpose:
- quickly locate the most musical spectral region

### Page 2: Motion

- `K1`: modulation depth
- `K2`: modulation rate or scan speed

Purpose:
- move from static tone-shaping into animated spectral mutation

### Page 3: Color

- `K1`: comb feedback or resonant color amount
- `K2`: wet/dry mix

Purpose:
- define how strange the box gets and how much of it is blended back with the original synth

### Buttons

- `B1`: cycle color mode
  - `Notch`
  - `Bandpass`
  - `Peak/Formant`
  - `Comb`
- `B2`: hold/freeze the current modulation position

### LEDs

- `LED1`: current page color
- `LED2`: modulation depth or hold-state indicator

## DSP Modes

### Notch

- Hollow spectral subtraction
- Best for organ and sustained pad presets

### Bandpass

- Narrow, nasal, focused color
- Best for lead-like or exposed monophonic lines

### Peak/Formant

- Dual resonant emphasis
- Most vocal and talk-filter-like mode

### Comb

- Short feedback delay coloration
- Metallic and object-like
- Must be range-limited to avoid unstable self-oscillation

## Reuse Targets In This Repo

Primary references:

- `DaisyExamples/MyProjects/_projects/Pod_SynthFxWorkstation/Pod_SynthFxWorkstation.cpp`
  - page handling
  - compact multi-stage Pod FX structure
- `DaisyExamples/MyProjects/_projects/Pod_MultiFX_Chain/Pod_MultiFX_Chain.cpp`
  - straightforward serial effect-box organization
- `DaisyExamples/MyProjects/_projects/pod_fuzz_distortion/pod_fuzz_distortion.cpp`
  - post-filter drive voicing
  - simple external-input processing pattern
- `DaisyExamples/MyProjects/_projects/pod_nebula_resonator/pod_nebula_resonator.cpp`
  - useful later if a freeze/resonator variant is desired

## Validation Strategy

Technical validation:

- `Makefile` target and source naming aligned
- project audit passes
- `make` succeeds for the Pod project

Listening validation with `Field_AdditiveSynth`:

- `Organ`: verify formant and notch modes stay musical
- `Hollow`: verify motion remains audible without collapsing level
- `Buzz`: verify input trim and drive prevent brittle overload

Behavior constraints:

- low wet/dry settings preserve the original synth identity
- high resonance does not cause uncontrollable output spikes
- comb mode remains playable rather than turning into runaway feedback

## Non-Goals For V1

- giant ambient reverb
- internal sequencer
- internal synth voice
- full preset management system
- granular freeze engine

Those can be explored later once the core spectral mutation box is proven.

## Notes

- This repo already contains unrelated uncommitted changes, so any commit for this design should be isolated to the new planning files only.
