# Node Specification: BLOCKS_Effects - Effects Block Category

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Group of 25+ effects block definitions registered in SVC_BlockRegistry. Effects process audio signals to add reverb, delay, distortion, modulation, dynamics, and spectral transformations. Each definition maps to a DaisySP effects class with wet/dry mixing and appropriate parameter/port declarations.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition, SVC_BlockRegistry
* **Input Data/State:** DaisySP effects class APIs; TYPES_BlockDefinition interfaces; LGPL status awareness for ReverbSc

## 3. Interfaces
* **Outputs / Results:** Exported BlockDefinition objects registered in SVC_BlockRegistry under the `Effects` category; SVC_CodeGenerator reads requiresLGPL flag to include USE_DAISYSP_LGPL=1 in Makefile
* **File Location:** src/core/blocks/definitions/ (effects definition files)

## 4. Core Logic & Processing Steps
1. Define each effect as a BlockDefinition const
2. All effects have: AUDIO INPUT, AUDIO OUTPUT, wet/dry parameter, and effect-specific parameters
3. Mark LGPL-required effects with a requiresLGPL: true flag for SVC_CodeGenerator
4. Register all in SVC_BlockRegistry under Effects category
5. Effects blocks to define:
   - **ReverbSc** — algorithmic reverb; params: feedback, lpfreq; requiresLGPL: true; DaisySP: `daisysp::ReverbSc`
   - **FDNReverb** — feedback delay network reverb; params: feedback, density
   - **DelayLine** — variable delay; params: delay time (ms), feedback
   - **SampleDelay** — fixed sample-accurate delay; params: delay (samples)
   - **Overdrive** — soft saturation; params: drive; DaisySP: `daisysp::Overdrive`
   - **Distortion** — hard clipping distortion; params: drive, tone
   - **Tube** — tube saturation emulation; params: drive, bias
   - **Wavefolder** — wavefolding distortion; params: gain, offset; DaisySP: `daisysp::Wavefolder`
   - **SoftClip** — soft clipping saturator; params: gain
   - **HardClip** — hard clipping; params: threshold
   - **Bitcrush** — bit depth reduction; params: bit depth, sample rate reduction
   - **Chorus** — chorus effect; params: rate, depth, feedback, delay; DaisySP: `daisysp::Chorus`
   - **Flanger** — flanger; params: rate, depth, feedback, delay; DaisySP: `daisysp::Flanger`
   - **Phaser** — phaser; params: rate, depth, feedback; DaisySP: `daisysp::Phaser`
   - **Tremolo** — amplitude modulation; params: rate, depth, waveform
   - **Vibrato** — pitch modulation; params: rate, depth
   - **RingModulator** — ring mod; params: carrier frequency, mix
   - **Compressor** — dynamics compressor; params: threshold, ratio, attack, release; DaisySP: `daisysp::Compressor`
   - **Limiter** — hard limiter; params: input gain; DaisySP: `daisysp::Limiter`
   - **AutoWah** — envelope-following wah; params: sensitivity, frequency range
   - **Decimator** — sample rate and bit depth reducer; params: downsample factor, bit depth
   - **SampleRateReducer** — sample rate reduction only; params: downsample factor
   - **PitchShifter** — pitch shifting; params: semitones, mix
   - **SolaTimeStretch** — time stretching; params: stretch ratio, mix

## 5. Data Structures
* Each block is a `BlockDefinition` with at minimum:
  - AUDIO INPUT, AUDIO OUTPUT ports
  - `wet` parameter (0–1 float, default 0.5) for dry/wet mix
  - Effect-specific ParameterDefinition entries
  - Optional `requiresLGPL`: boolean flag for LGPL-licensed DaisySP modules

## 6. Error Handling & Edge Cases
* ReverbSc LGPL flag must be present; SVC_CodeGenerator checks for it when generating Makefile
* DelayLine requires a state buffer allocation — SVC_CodeGenerator must emit DSY_SDRAM_BSS for large delay buffers
* Compressor ratio parameter minimum is 1:1 (unity), maximum should be capped (e.g., 20:1)

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify all 24+ effects blocks are registered in SVC_BlockRegistry under Effects category
    * ARC_FUNC_02: Verify ReverbSc BlockDefinition has requiresLGPL: true (or equivalent flag)
    * ARC_FUNC_03: Verify SVC_CodeGenerator adds USE_DAISYSP_LGPL=1 to the Makefile when any LGPL effect is present in the patch
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify wet/dry parameter exists on every effects block with range 0–1
    * ARC_VAL_02: Verify delay time parameter for DelayLine has a sensible maximum (e.g., 2000ms) to prevent SDRAM overflow
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify a patch with ReverbSc but without LGPL flag in generated Makefile is caught by a lint/validation step

## 8. Notes & Considerations
* ReverbSc is LGPL — SVC_CodeGenerator must detect its presence and set USE_DAISYSP_LGPL=1 in generated Makefile
* DelayLine with long delay times requires SDRAM allocation; SVC_CodeGenerator must handle this via DSY_SDRAM_BSS attribute
* Tube saturation may be a custom DaisySP module added to the library — check BLOCKS_Synthesis.md notes and oscillatorBank.ts for precedent
