# Node Specification: BLOCKS_Filters - Filter Block Category

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Group of 12 filter block definitions registered in SVC_BlockRegistry. Filters shape the frequency content of audio signals. Each definition maps to a DaisySP filter class with appropriate parameters and ports. The SVF is the most flexible filter providing simultaneous low/high/band/notch outputs.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition, SVC_BlockRegistry
* **Input Data/State:** DaisySP filter class APIs; TYPES_BlockDefinition interfaces

## 3. Interfaces
* **Outputs / Results:** Exported BlockDefinition objects registered in SVC_BlockRegistry under the `Filters` category
* **File Location:** src/core/blocks/definitions/ (filter definition files)

## 4. Core Logic & Processing Steps
1. Define each filter as a BlockDefinition const implementing the standard interface
2. Declare AUDIO INPUT port (signal to filter) and appropriate AUDIO OUTPUT ports per filter type
3. Declare CV INPUT ports for frequency modulation where applicable (e.g., SVF cutoff CV)
4. Declare parameters for each filter's DaisySP API
5. Register all filter definitions in SVC_BlockRegistry under Filters category
6. Filter blocks to define:
   - **SVF** (State Variable Filter) — outputs: low, high, band, notch; params: frequency (cutoff), resonance; DaisySP: `daisysp::Svf`
   - **MoogLadder** — classic 4-pole; params: cutoff frequency, resonance (0–1); DaisySP: `daisysp::MoogLadder`
   - **OnePole** — single-pole filter; params: frequency, filter type (lowpass/highpass)
   - **ATone** — high-pass filter; params: frequency; DaisySP: `daisysp::ATone`
   - **DCBlock** — DC offset removal; no parameters; DaisySP: `daisysp::DcBlock`
   - **Tone** — low-pass filter; params: frequency; DaisySP: `daisysp::Tone`
   - **LowShelving** — EQ low shelf; params: frequency, gain (dB)
   - **HighShelving** — EQ high shelf; params: frequency, gain (dB)
   - **PeakFilter** — parametric EQ peak; params: frequency, gain (dB), bandwidth
   - **ToneStack** — 3-band EQ stack; params: bass, mid, treble
   - **WahWah** — auto/manual wah; params: frequency, resonance, mix
   - **BiQuad** — direct biquad filter; params: type, frequency, Q, gain

## 5. Data Structures
* Each block is a `BlockDefinition` with:
  - AUDIO INPUT port (the signal to process)
  - One or more AUDIO OUTPUT ports (filtered output)
  - CV INPUT port for cutoff modulation (on SVF, MoogLadder)
  - ParameterDefinition[] for cutoff, resonance, gain etc.
  - `category`: BlockCategory.Filters

## 6. Error Handling & Edge Cases
* SVF has 4 simultaneous outputs (low, high, band, notch) — all must be declared as separate OUTPUT ports
* MoogLadder resonance parameter clamped 0–1 in parameter definition to prevent self-oscillation runaway in code generation
* DCBlock has no parameters; its ParameterDefinition array should be empty (not omitted)

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify all 12 filter blocks are registered in SVC_BlockRegistry under the Filters category
    * ARC_FUNC_02: Verify SVF block has 4 distinct AUDIO OUTPUT ports (low, high, band, notch)
    * ARC_FUNC_03: Verify SVC_CodeGenerator produces valid Init() and Process() calls for each filter type
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify resonance/Q parameters have max values that prevent unstable filter behavior in generated code
    * ARC_VAL_02: Verify cutoff frequency parameter has a minimum of at least 1 Hz (avoid DC)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify connecting the wrong signal type (e.g., TRIGGER) to a filter AUDIO INPUT is flagged as invalid by connection validation

## 8. Notes & Considerations
* MoogLadder is standard license despite its resonant character — no LGPL flag needed
* SVF is the recommended default filter for most patches due to its multiple output modes
* ATone and Tone are DaisySP's high-pass and low-pass respectively — their naming can be confusing; block displayName should clarify
