# Node Specification: BLOCKS_Modulators - Modulator Block Category

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Group of ~8 modulator and envelope block definitions registered in SVC_BlockRegistry. Modulator blocks generate control signals (CV) used to animate parameters over time: ADSR envelopes, AD envelopes, LFOs, phasors, slew limiters, and sample-and-hold. These are the automation and modulation backbone of any patch.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition, SVC_BlockRegistry
* **Input Data/State:** DaisySP modulator class APIs; TYPES_BlockDefinition interfaces; SignalType.CV and SignalType.TRIGGER

## 3. Interfaces
* **Outputs / Results:** Exported BlockDefinition objects registered in SVC_BlockRegistry under the `Modulators` category
* **File Location:** src/core/blocks/definitions/ (modulator definition files)

## 4. Core Logic & Processing Steps
1. Define each modulator as a BlockDefinition const
2. Modulator blocks primarily output CV signals; they may take TRIGGER inputs for retrigger
3. Register all modulator blocks in SVC_BlockRegistry under Modulators category
4. Modulator blocks to define:
   - **ADSR** — 4-stage envelope; TRIGGER INPUT (gate), CV OUTPUT; params: attack (ms), decay (ms), sustain (0–1), release (ms); DaisySP: `daisysp::Adsr`
   - **ADEnv** — 2-stage attack-decay envelope (no sustain, no release); TRIGGER INPUT, CV OUTPUT; params: attack (ms), decay (ms), cycle (looping); DaisySP: `daisysp::AdEnv`
   - **LFO** — low-frequency oscillator; CV OUTPUT; params: frequency (0.01–20 Hz), waveform, amplitude, phase offset; based on DaisySP Oscillator at sub-audio rate
   - **Phasor** — sawtooth ramp 0–1; CV OUTPUT; params: frequency; DaisySP: `daisysp::Phasor`
   - **Slew** — slew rate limiter / portamento; CV INPUT, CV OUTPUT; params: rise time, fall time; DaisySP: `daisysp::SlewLimiter`
   - **Smooth** — exponential smoother (fonepole); CV INPUT, CV OUTPUT; params: smoothing coefficient
   - **SampleHold** — sample and hold; TRIGGER INPUT, CV INPUT, CV OUTPUT; samples input on trigger
   - **RandomLFO** — random stepped LFO; CV OUTPUT; params: rate, smoothing

## 5. Data Structures
* Envelope blocks (ADSR, ADEnv):
  - TRIGGER INPUT for gate signal
  - CV OUTPUT for the envelope curve
  - ParameterDefinition[] for ADSR time values in milliseconds
* LFO / Phasor:
  - CV OUTPUT only (no required input)
  - ParameterDefinition for frequency, waveform
* Slew / Smooth:
  - CV INPUT and CV OUTPUT
  - ParameterDefinition for time constants

## 6. Error Handling & Edge Cases
* ADSR gate: if no TRIGGER is connected, the envelope stays at 0; warn in SVC_CodeGenerator
* LFO frequency parameter minimum must be >0 to avoid division by zero in DaisySP Phasor
* Slew rise/fall times of 0ms should be valid (passes signal through immediately)
* SampleHold requires both TRIGGER and CV inputs; SVC_CodeGenerator should warn if either is unconnected

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify all 8 modulator blocks are registered in SVC_BlockRegistry under Modulators category
    * ARC_FUNC_02: Verify ADSR block has a TRIGGER INPUT and a CV OUTPUT port
    * ARC_FUNC_03: Verify SVC_CodeGenerator emits Adsr.Process(gate) correctly with the gate value from the connected TRIGGER input
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify ADSR time parameters (attack, decay, release) have minimum > 0 ms
    * ARC_VAL_02: Verify LFO frequency parameter minimum is constrained to > 0 Hz
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify a warning is generated when an ADSR or ADEnv block has no TRIGGER input connected

## 8. Notes & Considerations
* ADSR sustain is a level (0–1), not a time; the parameter type should be FLOAT not a time-domain value — ParameterDefinition units should make this clear
* LFO waveform should reuse the same waveform enum as the Oscillator block for consistency
* Slew limiter is often used as a portamento effect on CV pitch signals; the displayName should hint at this use case
