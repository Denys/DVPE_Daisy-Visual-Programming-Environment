# Node Specification: SVC_CodeGenerator - C++ Code Generator

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Critical

## 1. Purpose
* **Goal:** Transforms a validated DVPE patch graph into compilable Daisy C++ source code (`main.cpp`) and a platform-specific `Makefile`. This is the primary deliverable of the entire DVPE system — the output that a user flashes to their Daisy hardware.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** SVC_GraphAnalyzer, SVC_BlockRegistry, SVC_CVRoutingAnalyzer, SVC_HardwareMappingAnalyzer, TYPES_BlockDefinition, TYPES_HardwareConfig
* **Input Data/State:** Current patch from `STATE_PatchStore` (blocks, connections, parameters); `HardwareConfiguration` (platform, sample rate, block size); `BlockDefinition` objects from `SVC_BlockRegistry`

## 3. Interfaces
* **Outputs / Results:** `GeneratedCode { mainCpp: string, makefile: string, errors: string[], warnings: string[] }` consumed by `SVC_ExportService` (for download) and Export Modal (for preview)
* **File Location:** `src/codegen/CodeGenerator.ts`

## 4. Core Logic & Processing Steps
1. **Validate patch:** Call `SVC_GraphAnalyzer.getProcessingOrder()`; if `isValid === false`, populate `errors[]` with cycle/connectivity descriptions and return early (no code generated)
2. **Determine platform:** Read `HardwareConfiguration.platform` — `"seed"`, `"pod"`, or `"field"` — to select correct audio callback signature, hardware include, and control access patterns
3. **`generateIncludes()`:** Emit `#include "daisy_[platform].h"` and `#include "daisysp.h"`, followed by `using namespace daisy;` and `using namespace daisysp;`
4. **`generateDeclarations()`:** For each block in topological order, emit a C++ variable declaration using `BlockDefinition.className` (e.g., `Oscillator osc_0;`). Use block ID (sanitized to valid C++ identifier) as variable name.
5. **`generateInit()`:** For each block in order, emit `[varName].[initMethod]([initParams])` (e.g., `osc_0.Init(sample_rate);`), then emit parameter setter calls for all non-default initial values
6. **`generateMidiHandler()`:** If any block has MIDI input ports (e.g., `midiNote`, `midiGate`), emit `void HandleMidiMessage(MidiEvent m)` function with a switch on `m.type` and appropriate handler cases (`NoteOn`, `NoteOff`, `ControlChange`)
7. **`generateAudioCallback()`:** Emit audio callback function:
   - Pod: `void AudioCallback(AudioHandle::InterleavingInputBuffer in, AudioHandle::InterleavingOutputBuffer out, size_t size)` with `out[i] = out[i+1] = sig;` pattern
   - Field/Seed: `void AudioCallback(AudioHandle::InputBuffer in, AudioHandle::OutputBuffer out, size_t size)` with `out[0][i] = out[1][i] = sig;` pattern
   - Inside the callback loop: for each block in topological order, emit CV modulation calls (from `SVC_CVRoutingAnalyzer`), then emit `[varName].[processMethod](...)` with correct input arguments (outputs of upstream blocks)
8. **`generateMain()`:** Emit `int main()` with `hw.Init()`, `hw.SetAudioSampleRate(...)`, `hw.SetAudioBlockSize(...)`, DSP init calls, `hw.StartAdc()` (before `StartAudio`!), `hw.StartAudio(AudioCallback)`, and main loop with `hw.midi.Listen()` if MIDI is used
9. **`generateMakefile()`:** Emit `TARGET`, `CPP_SOURCES`, `LIBDAISY_DIR`, `DAISYSP_DIR` (with correct relative depth), and conditionally `USE_DAISYSP_LGPL = 1` if any block in the patch has `BlockDefinition.isLGPL === true`

## 5. Data Structures
* `GeneratedCode { mainCpp: string, makefile: string, errors: string[], warnings: string[] }` — primary output type
* Internal: `VariableNameMap = Map<string, string>` — maps `blockInstanceId` to sanitized C++ variable name

## 6. Error Handling & Edge Cases
* **Cyclic patch:** Return `GeneratedCode` with `errors[]` populated; `mainCpp` and `makefile` are empty strings — do NOT throw
* **Pod platform:** Must use interleaved buffer access `out[i], out[i+1]`; non-interleaved would compile but produce no audio or mono-only output
* **Field/Seed platform:** Must use non-interleaved `out[0][i]`, `out[1][i]`; interleaved is incorrect
* **LGPL blocks present:** `USE_DAISYSP_LGPL = 1` must be added to Makefile — omitting it causes linker errors on `StringVoice`, `ModalVoice`, `ReverbSc`, `MoogLadder`
* **Empty patch:** Return `warnings[]` with "No blocks in patch"; generate minimal valid skeleton code
* **Block variable name collision:** Sanitize block IDs to valid C++ identifiers; append index suffix if sanitized names collide
* **Audio callback must NEVER contain:** `malloc`, `new`, `printf`, blocking calls — validate and emit `// WARNING` comment if code gen would produce these

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: An Oscillator → VCA → AudioOutput patch generates syntactically valid C++ where the VCA's `Process()` is called after the Oscillator's `Process()` in the audio callback
    * ARC_FUNC_02: Selecting Pod platform generates an audio callback with `InterleavingOutputBuffer` signature and `out[i] = out[i+1] = sig;` output pattern
    * ARC_FUNC_03: Selecting Field platform generates an audio callback with `OutputBuffer` signature and `out[0][i] = out[1][i] = sig;` output pattern
    * ARC_FUNC_04: Including a `StringVoice` block in the patch causes `USE_DAISYSP_LGPL = 1` to appear in the generated Makefile
* **Input Validation Criteria:**
    * (Validated by SVC_GraphAnalyzer before generation)
* **Error Handling Criteria:**
    * ARC_ERR_01: A cyclic patch returns `GeneratedCode` with non-empty `errors[]` and empty `mainCpp` — no exception is thrown to the caller

## 8. Notes & Considerations
* The audio callback must NEVER contain `malloc`, `new`, or `printf` — these cause audio dropouts or crashes on embedded targets
* Parameter smoothing via `fonepole()` should be emitted for parameters that receive continuous CV modulation to prevent zipper noise
* `hw.StartAdc()` MUST be emitted before `hw.StartAudio(AudioCallback)` in generated `main()` — wrong order is a known critical bug (see DAISY_BUGS.md E001)
* Generated variable names: prefix block type abbreviation + index (e.g., `osc_0`, `filt_1`) for readability over raw UUID-based names
* TECH DEBT: Code generation for custom blocks with `codeModule` (inline C++) needs dedicated handling distinct from standard DaisySP class calls
