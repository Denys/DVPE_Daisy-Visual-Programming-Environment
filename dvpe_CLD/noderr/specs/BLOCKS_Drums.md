# Node Specification: BLOCKS_Drums - Drum Block Category

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Group of 5 drum synthesis block definitions registered in SVC_BlockRegistry. Each block implements a DaisySP drum synthesis module and is triggered by a TRIGGER input signal. Drum blocks produce percussive audio output without requiring a continuous oscillator.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition, SVC_BlockRegistry
* **Input Data/State:** DaisySP drum module APIs; TYPES_BlockDefinition interfaces; SignalType.TRIGGER for gate inputs

## 3. Interfaces
* **Outputs / Results:** Exported BlockDefinition objects registered in SVC_BlockRegistry under the `Drums` category
* **File Location:** src/core/blocks/definitions/ (drum definition files)

## 4. Core Logic & Processing Steps
1. Define each drum block as a BlockDefinition const
2. Each drum block has a TRIGGER INPUT port (gate) that triggers the percussion hit
3. Each drum block has an AUDIO OUTPUT port
4. DaisySP drum modules use a Trig(true) call pattern driven by the gate signal; SVC_CodeGenerator must emit this pattern
5. Declare parameters matching DaisySP drum module setters
6. Register all 5 drum blocks in SVC_BlockRegistry under Drums category
7. Drum blocks:
   - **AnalogBassDrum** — analog kick drum synthesis; params: frequency, tone, decay, attack, sustain, drive, mid freq, mid gain, accent; DaisySP: `daisysp::AnalogBassDrum`
   - **AnalogSnareDrum** — analog snare synthesis; params: frequency, tone, decay, snappy; DaisySP: `daisysp::AnalogSnareDrum`
   - **SynthBassDrum** — digital kick synthesis; params: frequency, sustain level, decay, attack, tone; DaisySP: `daisysp::SynthBassDrum`
   - **SynthSnareDrum** — digital snare synthesis; params: frequency, decay, snappy, tone; DaisySP: `daisysp::SynthSnareDrum`
   - **Hihat** — hi-hat cymbal synthesis; params: frequency, decay, noise amount, tone; DaisySP: `daisysp::HiHat`

## 5. Data Structures
* Each drum block is a `BlockDefinition` with:
  - TRIGGER INPUT port named 'gate' or 'trigger'
  - AUDIO OUTPUT port
  - ParameterDefinition[] for timbre shaping parameters
  - `category`: BlockCategory.Drums
  - `processMethod`: typically 'Process' returning float
  - DaisySP trigger pattern: call `.Trig(gate_signal > 0.5f)` before `.Process()`

## 6. Error Handling & Edge Cases
* TRIGGER input must be of SignalType.TRIGGER — connecting AUDIO or CV to a drum gate should be rejected by connection validation
* All drum modules in DaisySP use Init(sample_rate, bool) with a bool for use as accent; this second init parameter must be documented in the block definition
* Hihat module naming: check DaisySP source — class may be `daisysp::HiHat` (capital H) vs `daisysp::Hihat`

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify all 5 drum blocks are registered in SVC_BlockRegistry under Drums category
    * ARC_FUNC_02: Verify each drum block has exactly one TRIGGER INPUT port and one AUDIO OUTPUT port
    * ARC_FUNC_03: Verify SVC_CodeGenerator emits the Trig() call pattern correctly for drum blocks when a TRIGGER signal is connected
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify connection validation rejects AUDIO-type signal connected to a TRIGGER INPUT port on a drum block
    * ARC_VAL_02: Verify decay parameters have a minimum value of 0 and sensible maximum (e.g., 2.0 seconds)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify that a drum block placed on the canvas without a connected TRIGGER port generates a warning in SVC_CodeGenerator (unconnected trigger produces silence)

## 8. Notes & Considerations
* DaisySP drum modules (AnalogBassDrum, etc.) do not use LGPL — all are standard license
* The accent parameter on AnalogBassDrum controls velocity sensitivity; it takes a bool in Init() — SVC_CodeGenerator needs special handling
* For MIDI-driven drum blocks, a BLOCKS_UserIO MidiNote block with TRIGGER output can feed the drum gate input
