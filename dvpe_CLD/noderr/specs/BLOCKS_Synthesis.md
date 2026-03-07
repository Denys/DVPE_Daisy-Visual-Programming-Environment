# Node Specification: BLOCKS_Synthesis - Synthesis Block Category

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Group of 11 oscillator and synthesis block definitions registered in SVC_BlockRegistry. These are the primary sound generation blocks for any DVPE patch. Each maps to a DaisySP synthesis class and implements the standard BlockDefinition interface with full parameter and port definitions.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition, SVC_BlockRegistry
* **Input Data/State:** DaisySP class documentation for each synthesis module; TYPES_BlockDefinition interfaces (PortDefinition, ParameterDefinition, BlockDefinition)

## 3. Interfaces
* **Outputs / Results:** Exported BlockDefinition objects registered in SVC_BlockRegistry under the `Sources` category; available for placement on the canvas via UI_ModuleLibrary
* **File Location:** src/core/blocks/definitions/ (individual files per block or grouped synthesis file)

## 4. Core Logic & Processing Steps
1. Define each block as a const implementing BlockDefinition
2. Specify DaisySP class binding: className, initMethod ('Init'), initParams (['sample_rate']), processMethod ('Process')
3. Declare output ports: each synthesis block has at least one AUDIO output port
4. Declare parameters matching DaisySP setter methods: frequency (SetFreq), waveform (SetWaveform), amplitude (SetAmp), etc.
5. Register each definition in SVC_BlockRegistry on module load
6. Blocks in this category (all standard, no LGPL):
   - **Oscillator** — sawtooth/sine/square/triangle/polyblep waveforms; params: frequency, waveform, amplitude
   - **FM2** — 2-operator FM synthesis; params: frequency, ratio, index, amplitude
   - **VariableShapeOscillator** — morphable waveform; params: frequency, waveshape, sync
   - **GrainletOscillator** — granular oscillator; params: frequency, grain size, pitch
   - **HarmonicOscillator** — additive harmonic; params: frequency, amplitude per partial
   - **VosimOscillator** — VOSIM formant synthesis; params: frequency, pulse width, number of pulses
   - **FormantOscillator** — formant oscillator; params: frequency, formant frequency, shape
   - **ZOscillator** — Z-oscillator complex waveform; params: frequency, multiplier, phase
   - **Particle** — particle noise/resonator; params: frequency, density, speed
   - **WhiteNoise** — white noise generator; params: amplitude

## 5. Data Structures
* Each block is a `BlockDefinition` const with:
  - `id`: string (e.g., 'oscillator', 'fm2')
  - `className`: string (e.g., 'daisysp::Oscillator')
  - `category`: BlockCategory.Sources
  - `parameters`: ParameterDefinition[]
  - `ports`: PortDefinition[] (at minimum one AUDIO OUTPUT)
  - `colorScheme`: BlockColorScheme (Sources color)

## 6. Error Handling & Edge Cases
* Frequency parameter should have sensible min/max/default values (e.g., 20–20000 Hz, default 440 Hz)
* Waveform parameter for Oscillator should be an ENUM type referencing DaisySP waveform constants
* Blocks with LGPL requirements must NOT be included here; they belong in BLOCKS_PhysicalModeling

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify all 10+ synthesis blocks are registered in SVC_BlockRegistry under the Sources category
    * ARC_FUNC_02: Verify each block definition has at least one AUDIO OUTPUT port
    * ARC_FUNC_03: Verify SVC_CodeGenerator produces valid C++ init and process calls for each synthesis block
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify frequency parameter min/max values are physically meaningful (20 Hz minimum)
    * ARC_VAL_02: Verify ENUM-type parameters list all valid DaisySP waveform constants
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify SVC_BlockRegistry throws a clear error if a duplicate block ID is registered

## 8. Notes & Considerations
* All synthesis blocks are standard license — no USE_DAISYSP_LGPL=1 required
* Oscillator waveforms map to DaisySP Oscillator::WAVE_* constants; the ParameterDefinition enum values must match exactly
* WhiteNoise does not have a frequency parameter — ensure its ParameterDefinition list reflects this
* OscillatorBank (oscillatorBank.ts) may be an existing file in this category; check before creating duplicates
