# Node Specification: BLOCKS_Mixing - Mixing Block Category

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Group of ~8 mixing and level-control block definitions registered in SVC_BlockRegistry. Mixing blocks combine, balance, and route audio signals. VCA (voltage-controlled amplifier) is the fundamental level-control building block; Mixer combines multiple sources; Pan and Balance handle stereo placement.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition, SVC_BlockRegistry
* **Input Data/State:** TYPES_BlockDefinition interfaces; DaisySP where applicable

## 3. Interfaces
* **Outputs / Results:** Exported BlockDefinition objects registered in SVC_BlockRegistry under the `Mixing` category
* **File Location:** src/core/blocks/definitions/ (mixing definition files)

## 4. Core Logic & Processing Steps
1. Define each mixing block as a BlockDefinition const
2. Register all mixing blocks in SVC_BlockRegistry under Mixing category
3. Mixing blocks to define:
   - **Mixer** — N-channel audio mixer; N AUDIO INPUTS, 1 AUDIO OUTPUT; params: N channel levels (0–1), N channel pans; param: channel count
   - **StereoMixer** — dedicated 2-input stereo mixer; 2 AUDIO INPUTS, 2 AUDIO OUTPUTS (L/R); params: level A, level B, pan A, pan B
   - **VCA** — voltage-controlled amplifier; AUDIO INPUT, CV INPUT (gain), AUDIO OUTPUT; linear amplitude scaling
   - **LinearVCA** — VCA with linear CV response (vs. exponential); AUDIO INPUT, CV INPUT, AUDIO OUTPUT
   - **Pan** — mono to stereo panning; AUDIO INPUT, 2 AUDIO OUTPUTS (L/R); params: pan position (-1 to +1); CV INPUT for pan modulation
   - **Balance** — stereo balance control; 2 AUDIO INPUTS (L/R), 2 AUDIO OUTPUTS (L/R); params: balance (-1 to +1)
   - **Crossfade** — A/B crossfade; 2 AUDIO INPUTS, 1 AUDIO OUTPUT; params: crossfade position (0=A, 1=B); CV INPUT for modulation; DaisySP: `daisysp::CrossFade`
   - **Bypass** — passthrough on/off switch; AUDIO INPUT, AUDIO OUTPUT; TRIGGER INPUT (toggle); params: initial state

## 5. Data Structures
* VCA: AUDIO INPUT, CV INPUT (0–1 gain), AUDIO OUTPUT — no DaisySP class, inline multiply
* Mixer: dynamic number of AUDIO INPUT ports based on channel count parameter; SVC_CodeGenerator must handle variable port counts
* Crossfade: `daisysp::CrossFade` with SetPos() and Process(a, b)
* Pan: constant power panning using `cos/sin` law in generated code

## 6. Error Handling & Edge Cases
* VCA CV input of 0 produces silence — this is correct behavior, not an error
* Mixer with 0 channels connected should output silence; warn if all channel inputs are unconnected
* Crossfade CV input outside 0–1 range should be clamped in generated code
* Bypass with no TRIGGER connected defaults to the initial state parameter

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify all 8 mixing blocks are registered in SVC_BlockRegistry under Mixing category
    * ARC_FUNC_02: Verify VCA block generates `audio_in * cv_gain` inline multiplication in the audio callback
    * ARC_FUNC_03: Verify Crossfade block generates `CrossFade.SetPos(pos); CrossFade.Process(a, b)` in generated code
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify VCA CV input is clamped to 0–1 in generated code (prevent amplification above unity gain)
    * ARC_VAL_02: Verify Pan position parameter range is -1 to +1
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify SVC_CodeGenerator handles variable-port Mixer blocks without hardcoding port count

## 8. Notes & Considerations
* VCA is one of the most frequently used blocks in modular synthesis — its implementation must be simple and performant (inline multiply, no class overhead)
* Mixer channel count is a parameter set at design time; adding/removing channels requires re-definition of the block instance's ports — this is an architectural challenge for dynamic port counts
* CrossFade is a standard DaisySP class; LinearVCA and Pan are typically inline math
