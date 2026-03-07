# Node Specification: BLOCKS_MathUtility - Math/Utility Block Category

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** The largest block category: ~80+ math, logic, signal routing, and utility block definitions registered in SVC_BlockRegistry. These blocks perform arithmetic, logic operations, signal routing, and algorithmic functions that connect other blocks together or transform CV/audio signals in flexible ways.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition, SVC_BlockRegistry
* **Input Data/State:** TYPES_BlockDefinition interfaces; signal type rules (AUDIO vs CV vs TRIGGER routing)

## 3. Interfaces
* **Outputs / Results:** Exported BlockDefinition objects registered in SVC_BlockRegistry under the `MathUtility` category; SVC_CodeGenerator emits inline C++ expressions for most math blocks (no DaisySP class instantiation needed)
* **File Location:** src/core/blocks/definitions/utility/ (math/utility subdirectory)

## 4. Core Logic & Processing Steps
1. Define each math/utility block as a BlockDefinition const
2. Most math blocks are pure functions — no state, no Init() call, just inline arithmetic in the audio callback
3. SVC_CodeGenerator should recognize math blocks and emit inline expressions rather than class instances
4. Register all blocks in SVC_BlockRegistry under MathUtility (or Utility) category
5. Block groups:
   - **Arithmetic**: Add (A+B), Subtract (A-B), Multiply (A*B), Divide (A/B), Abs (|A|), Pow2 (A²), Sqrt, Clamp, Scale (remap range)
   - **Trigonometry**: Sin, Cos, Tan, Atan2, Tanh (soft saturation)
   - **Logic**: AND, OR, XOR, NOT, NAND, NOR (for TRIGGER signals)
   - **Comparison**: Greater (A>B), Less (A<B), Equals (A≈B), NotEquals, GreaterOrEqual, LessOrEqual — output TRIGGER
   - **Level/Convert**: DB_to_Linear, Linear_to_DB, CvToFreq (V/Oct to Hz), FreqToCv, MidiToFreq, NoteToFreq
   - **Timing/Rhythm**: Metro (metronome pulse generator), ClockDivider, ClockMultiplier
   - **Sequencing**: StepSequencer (N-step CV or trigger sequencer), Arpeggiator
   - **Signal Routing**: Mux (select one of N inputs), Demux (route one input to one of N outputs), Switch (on/off gate), Merge (mix N signals), Split (duplicate signal)
   - **Dynamics**: NoiseGate, Rectifier (half/full wave), Fold (wavefolder math)
   - **Noise/Random**: Dust (random impulses at given density), ClockNoise, SampleHold
   - **Physical Modeling Utilities**: Resonator, Pluck (basic Karplus-Strong), Drip (water drop model)
   - **Quantizers**: Quantize (snap CV to semitones or scale), ScaleQuantizer

## 5. Data Structures
* Pure math blocks: 2 CV/AUDIO INPUTS (A, B), 1 OUTPUT; no parameters (inline expression)
* Metro: no inputs, TRIGGER OUTPUT; params: frequency (BPM or Hz)
* StepSequencer: TRIGGER INPUT (clock), multiple CV OUTPUTS (one per step value); params: step count, step values[]
* Mux: N CV/AUDIO inputs + 1 selector CV input, 1 OUTPUT; params: input count
* CvToFreq: CV INPUT (V/Oct pitch), CV OUTPUT (Hz frequency value)

## 6. Error Handling & Edge Cases
* Divide block must guard against divide-by-zero in generated C++ (add epsilon or conditional)
* Logic blocks (AND, OR, etc.) expect TRIGGER signals; connecting AUDIO to them should warn but is allowed (threshold-based conversion)
* StepSequencer step values are parameters that can be set in the Inspector; they are not ports
* Arpeggiator requires MIDI or CV pitch input — its complexity may warrant a Complex classification

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify all major arithmetic blocks (Add, Subtract, Multiply, Divide, Abs) are registered in SVC_BlockRegistry
    * ARC_FUNC_02: Verify SVC_CodeGenerator emits inline arithmetic expressions (not class instances) for pure math blocks
    * ARC_FUNC_03: Verify CvToFreq block generates `powf(2.0f, cv * 10.0f - 5.0f) * 440.0f` or equivalent V/Oct conversion
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify Divide block generated code includes a divide-by-zero guard
    * ARC_VAL_02: Verify StepSequencer step count parameter has a sensible maximum (e.g., 32 steps)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify connecting incompatible signal types to logic blocks shows a type warning in the UI

## 8. Notes & Considerations
* This category is the largest and most varied — consider splitting into subcategories (Arithmetic, Logic, Routing, Sequencing) within the UI_ModuleLibrary for better discoverability
* Most math blocks generate no C++ class declarations — SVC_CodeGenerator must have a code generation path for pure-expression blocks
* Drip and Pluck may internally use DaisySP classes (Drip, Pluck) — check if they require Init() calls
