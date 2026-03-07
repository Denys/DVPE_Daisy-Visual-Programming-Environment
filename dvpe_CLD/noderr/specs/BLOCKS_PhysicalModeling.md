# Node Specification: BLOCKS_PhysicalModeling - Physical Modeling Block Category (LGPL)

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Group of ~4 physical modeling block definitions registered in SVC_BlockRegistry. These blocks use DaisySP LGPL-licensed modules that synthesize physically-inspired tones (plucked strings, modal resonators). Requires USE_DAISYSP_LGPL=1 in the generated Makefile — SVC_CodeGenerator must detect any of these blocks and add this flag automatically.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition, SVC_BlockRegistry
* **Input Data/State:** DaisySP LGPL module APIs (StringVoice, ModalVoice, ResonatorSVF); TYPES_BlockDefinition interfaces

## 3. Interfaces
* **Outputs / Results:** Exported BlockDefinition objects registered in SVC_BlockRegistry under the `PhysicalModeling` category; SVC_CodeGenerator detects requiresLGPL: true flag and adds `USE_DAISYSP_LGPL = 1` to the generated Makefile
* **File Location:** src/core/blocks/definitions/ (physical modeling definition files)

## 4. Core Logic & Processing Steps
1. Define each physical modeling block as a BlockDefinition const with requiresLGPL: true
2. All physical modeling blocks follow the DaisySP voice pattern: SetFreq() + Trig() + Process()
3. Register in SVC_BlockRegistry under PhysicalModeling category
4. Blocks to define:
   - **StringVoice** — Karplus-Strong string synthesis; TRIGGER INPUT, CV INPUT (frequency), AUDIO OUTPUT; params: frequency, brightness, damping, structure; DaisySP: `daisysp::StringVoice`; LGPL
   - **ModalVoice** — modal synthesis (resonator banks); TRIGGER INPUT, CV INPUT (frequency), AUDIO OUTPUT; params: frequency, brightness, damping, structure, accent; DaisySP: `daisysp::ModalVoice`; LGPL
   - **PluckVoice** — Karplus-Strong variant with excitation; TRIGGER INPUT, CV INPUT (frequency), AUDIO OUTPUT; params: frequency, damping, nonlinearity; DaisySP: `daisysp::Pluck` (if available)
   - **DrumVoice** — physically-modeled membrane/resonator drum; TRIGGER INPUT, AUDIO OUTPUT; params: frequency, decay, tone

## 5. Data Structures
* Each physical modeling block is a `BlockDefinition` with:
  - TRIGGER INPUT (gate/trigger for excitation)
  - CV INPUT (pitch/frequency)
  - AUDIO OUTPUT
  - `requiresLGPL`: true — CRITICAL flag
  - `initParams`: ['sample_rate'] — standard DaisySP voice init
  - `processMethod`: 'Process' with Trig(gate) called before Process()

## 6. Error Handling & Edge Cases
* LGPL flag is critical: a patch with StringVoice or ModalVoice that generates a Makefile without USE_DAISYSP_LGPL=1 will fail to link
* SVC_CodeGenerator must scan all BlockInstances in the patch and set the LGPL flag if ANY physical modeling block is present
* If only PhysicalModeling blocks are removed from a patch, the LGPL flag should be removed from the generated Makefile
* StringVoice Init() signature: Init(sample_rate, float* buffer, size_t buffer_size) — requires a pre-allocated buffer; SVC_CodeGenerator must handle this

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify StringVoice and ModalVoice blocks are registered in SVC_BlockRegistry with requiresLGPL: true
    * ARC_FUNC_02: Verify SVC_CodeGenerator adds USE_DAISYSP_LGPL=1 to the generated Makefile when a physical modeling block is present in the patch
    * ARC_FUNC_03: Verify removing all physical modeling blocks from a patch causes SVC_CodeGenerator to omit the LGPL flag from the Makefile
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify physical modeling blocks cannot be placed without a UI warning about LGPL license implications
    * ARC_VAL_02: Verify TRIGGER INPUT port on StringVoice and ModalVoice rejects non-TRIGGER signal connections
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify that a build attempt on a patch containing StringVoice without the LGPL Makefile flag is caught before code generation (pre-generate validation)

## 8. Notes & Considerations
* LGPL license restriction means the generated firmware must comply with LGPL requirements (source availability for the LGPL portions) — this should be noted in the generated code's header comment
* StringVoice Init() requires a buffer pointer for the delay line — SVC_CodeGenerator must declare this buffer (e.g., `float string_buffer[SAMPLE_RATE]`) and pass it to Init()
* ModalVoice and StringVoice are among the highest-CPU-cost blocks in DaisySP — warn users via a UI badge on these blocks
