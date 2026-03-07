# Node Specification: SVC_HardwareMappingAnalyzer - Hardware Mapping Analyzer

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Analyzes the patch's hardware I/O blocks (audioInput, audioOutput, knob, midiNote, cvInput, gateInput, etc.) and maps them to specific Daisy platform hardware methods. Determines the correct C++ code for each I/O block based on the target platform (Seed, Pod, or Field), including which hardware accessor calls to emit in the audio callback and main loop.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_HardwareConfig, TYPES_BlockDefinition
* **Input Data/State:** `BlockInstance[]` from `STATE_PatchStore` filtered to User I/O category; `HardwareConfiguration.platform` from the architecture config; `BlockDefinition` for each I/O block from `SVC_BlockRegistry`; knob/control index (from block instance parameters or position in the patch)

## 3. Interfaces
* **Outputs / Results:** `HardwareMappingResult` consumed by `SVC_CodeGenerator` to emit correct platform-specific hardware access code in the audio callback and main loop
* **File Location:** `src/codegen/analyzers/HardwareMappingAnalyzer.ts`

## 4. Core Logic & Processing Steps
1. `analyze(blocks: BlockInstance[], config: HardwareConfiguration): HardwareMappingResult`:
   - Filter `blocks` to those with `BlockDefinition.category === BlockCategory.UserIO`
   - For each I/O block, call the appropriate resolver based on `BlockDefinition.id`
2. `resolveKnobMapping(block: BlockInstance, platform: Platform, knobIndex: number): HardwareAccessor`:
   - Pod: `hw.knob1.Process()` (index 0) or `hw.knob2.Process()` (index 1); max 2 knobs → warn if index > 1
   - Field: `hw.knob[n].Process()` where n = `knobIndex` (0–7); max 8 knobs → warn if index > 7
   - Seed: requires manual ADC setup — emit `hw.adc.GetFloat(n)` and include ADC init code in `generateInit()`; warn that Seed has no built-in knobs
3. `resolveAudioInputMapping(block: BlockInstance, platform: Platform): HardwareAccessor`:
   - All platforms: `in[0][i]` / `in[1][i]` for non-interleaved (Field/Seed) or `in[i]` / `in[i+1]` for interleaved (Pod)
4. `resolveAudioOutputMapping(block: BlockInstance, platform: Platform): HardwareAccessor`:
   - Non-interleaved: `out[0][i] = out[1][i] = sig;`
   - Interleaved: `out[i] = out[i+1] = sig;`
5. `resolveMidiMapping(block: BlockInstance, platform: Platform): HardwareAccessor`:
   - All platforms (hardware MIDI default): `hw.midi` accessor; emit `hw.midi.StartReceive()` in init, `hw.midi.Listen()` in main loop
   - USB MIDI: only if explicitly configured in block parameters — use `MidiUsbHandler` pattern
6. `resolveCVMapping(block: BlockInstance, platform: Platform, cvIndex: number): HardwareAccessor`:
   - Field: 4 CV inputs via ADC channels; emit appropriate `hw.adc.GetFloat(n)` scaled to ±5V range
   - Pod: 2 CV inputs on CV_1, CV_2 jacks
   - Seed: manual ADC config required
7. `resolveGateMapping(block: BlockInstance, platform: Platform, gateIndex: number): HardwareAccessor`:
   - Field: 2 gate inputs; emit `hw.gate_input[n].State()`
   - Pod: 1 gate input
8. Assign indices: track how many knobs, CV inputs, etc. have been assigned so far to auto-increment index for each new block of the same type

## 5. Data Structures
* `HardwareAccessor { readCode: string, initCode: string, mainLoopCode: string }` — code fragments for each context (callback read, init setup, main loop polling)
* `HardwareMappingResult { accessors: Map<string, HardwareAccessor>, warnings: string[] }` — keyed by block instance ID

## 6. Error Handling & Edge Cases
* **Exceeding platform knob count:** Pod > 2 knobs, or Field > 8 knobs — add warning to `HardwareMappingResult.warnings`; map overflow knobs to the last valid index (knob 2 / knob 7) as a fallback, clearly marked with a `// WARNING: knob index exceeded` comment in generated code
* **Seed with knob blocks:** Seed has no built-in knobs — emit ADC-based code but add warning that user must wire physical potentiometers to ADC pins
* **USB MIDI requested on unsupported target:** Warn if USB MIDI is configured but platform is Pod (Pod supports hardware MIDI only via TRS jack)
* **CV/Gate blocks on Seed:** Must configure ADC/GPIO manually — emit template code with `// TODO: configure ADC pin` comments

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: A Knob block in a Pod patch generates `hw.knob1.Process()` for the first knob and `hw.knob2.Process()` for the second knob
    * ARC_FUNC_02: A Knob block in a Field patch generates `hw.knob[0].Process()` for the first knob, `hw.knob[1].Process()` for the second, up to `hw.knob[7].Process()` for the eighth
* **Input Validation Criteria:**
    * (Covered by edge case handling — excess knobs produce warnings in output)
* **Error Handling Criteria:**
    * (Warnings returned in `HardwareMappingResult.warnings` rather than exceptions)

## 8. Notes & Considerations
* TECH DEBT: Field OLED parameter display (the "zoom visualization" pattern from DAISY_EXPERT_AGENT v1.1 Section 7) is not yet supported — the analyzer does not generate OLED update code for knob changes. This is a planned feature requiring: change detection per knob, `zoomParam` state variable, and `DrawZoomedParameter()` function generation.
* Hardware MIDI (TRS jack via `hw.midi`) is the project default — USB MIDI (`MidiUsbHandler`) should only be generated if the block explicitly requests it via a parameter
* Knob index assignment is order-dependent: the first Knob block encountered gets index 0, the second gets index 1, etc. The ordering follows topological sort order from `SVC_GraphAnalyzer`. Users can override index via block parameters (future feature).
* `hw.StartAdc()` must be emitted before `hw.StartAudio()` in `main()` — this requirement is tracked by `SVC_CodeGenerator` but the init code snippets from this analyzer feed into that sequencing
