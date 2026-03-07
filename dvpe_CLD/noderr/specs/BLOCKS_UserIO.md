# Node Specification: BLOCKS_UserIO - User I/O Block Category

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Group of ~12 hardware I/O block definitions representing the physical interface between the DVPE patch and the Daisy hardware platform. These blocks are special: they do not implement DaisySP DSP classes but instead map directly to Daisy hardware peripherals (audio codec, MIDI, knobs, keys, CV jacks, LEDs). The selected platform (Pod, Field, Seed) determines which User I/O blocks are valid.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition, TYPES_HardwareConfig, SVC_BlockRegistry
* **Input Data/State:** TYPES_HardwareConfig PlatformDefinition for the active platform; TYPES_BlockDefinition interfaces

## 3. Interfaces
* **Outputs / Results:** Exported BlockDefinition objects registered in SVC_BlockRegistry under the `UserIO` category; SVC_CodeGenerator maps these blocks to Daisy hardware API calls in the generated audio callback and main loop
* **File Location:** src/core/blocks/definitions/ (user IO definition files)

## 4. Core Logic & Processing Steps
1. Define each I/O block as a BlockDefinition const with hardware-specific metadata (hardware ID, platform constraints)
2. Register all under SVC_BlockRegistry UserIO category
3. SVC_CodeGenerator routes these blocks to the correct Daisy hardware API (e.g., AudioOutput → `out[0][i]`, Knob 1 → `hw.knob[0].Process()`)
4. I/O blocks to define:
   - **AudioInput** — stereo/mono audio from codec; AUDIO OUTPUT ports (left, right)
   - **AudioOutput** — stereo/mono audio to codec; AUDIO INPUT ports (left, right); required for any sound-producing patch
   - **MidiNote** — MIDI note events; AUDIO OUTPUT (pitch as CV 0–1 V/Oct), TRIGGER OUTPUT (gate), AUDIO OUTPUT (velocity 0–1)
   - **MidiCC** — MIDI continuous controller; CV OUTPUT (normalized 0–1); param: CC number
   - **Knob** — analog potentiometer; CV OUTPUT (0–1); param: hardware knob index; platform-limited (Pod: 2, Field: 8)
   - **Slider** — linear fader (Field); CV OUTPUT (0–1); param: slider index
   - **Encoder** — rotary encoder with button; CV OUTPUT (increment), TRIGGER OUTPUT (click)
   - **Key** — keyboard key trigger (Field); TRIGGER OUTPUT; param: key index (0–15)
   - **Switch** — button/toggle switch; TRIGGER OUTPUT (rising edge)
   - **CVInput** — CV jack input (Field); CV INPUT port → CV OUTPUT for patch
   - **CVOutput** — CV jack output (Field); CV INPUT from patch → hardware CV output
   - **GateTriggerIn** — gate/trigger input jack; TRIGGER OUTPUT
   - **GateOutput** — gate output jack; TRIGGER INPUT from patch → hardware gate output
   - **LEDOutput** — LED control; AUDIO/CV INPUT; param: LED index

## 5. Data Structures
* `UserIOBlockDefinition` extends BlockDefinition with:
  - `hardwareId`: string (e.g., 'knob_0', 'audio_out_left')
  - `platformConstraints`: PlatformType[] (which platforms support this block)
  - `maxInstances`: number (e.g., Pod supports max 2 Knob instances)
* `PlatformType` — 'seed' | 'pod' | 'field'

## 6. Error Handling & Edge Cases
* Platform validation: placing a Key block in a Pod patch (which has no keyboard) should show an error in UI_Canvas
* AudioOutput is required in every patch for SVC_CodeGenerator to produce valid code; warn if absent
* Maximum instance counts must be enforced per platform (Pod: 2 knobs, Field: 8 knobs)
* MidiNote should handle velocity=0 as NoteOff (standard MIDI convention)

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify AudioOutput block generates correct `out[0][i] = signal` (non-interleaved for Field) or `out[i] = signal` (interleaved for Pod) in generated code
    * ARC_FUNC_02: Verify Knob block generates `hw.knob[index].Process()` call in the generated audio callback
    * ARC_FUNC_03: Verify MidiNote block generates MIDI event handler code reading pitch, gate, and velocity from MIDI events
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify Key block is invalid (shows error) when placed on a Pod or Seed patch
    * ARC_VAL_02: Verify placing more Knob blocks than the platform supports shows a validation error
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify SVC_CodeGenerator emits a validation error (not corrupt code) when AudioOutput block is absent from the patch

## 8. Notes & Considerations
* AudioOutput block is the single most critical UserIO block — SVC_CodeGenerator's entire output routing depends on it
* Platform detection at patch creation time should pre-filter the UI_ModuleLibrary to show only valid I/O blocks
* Pod uses interleaved audio `out[i], out[i+1]`; Field uses non-interleaved `out[0][i]`, `out[1][i]` — SVC_CodeGenerator handles this difference based on platform config
