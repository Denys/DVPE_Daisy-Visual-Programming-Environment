# Node Specification: UI_WaveformSelector - Waveform Picker

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a grid of waveform icon buttons for selecting the oscillator waveform type. Support all DaisySP Oscillator waveforms including sine, triangle, sawtooth, reverse sawtooth (ramp), square, and polyblep variants. Highlight the currently selected waveform.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** current waveform value (string or int enum), available waveform options from ParameterDefinition; onChange callback from parent UI_Inspector

## 3. Interfaces
* **Outputs / Results:** onChange(newWaveform: string | number) invoked on waveform button click
* **File Location:** src/components/Inspector/WaveformSelector.tsx

## 4. Core Logic & Processing Steps
1. Receive props: value (current waveform), options (string[] from ParameterDefinition), onChange
2. Map each option string to a corresponding waveform SVG icon (sine, triangle, saw, ramp, square, polyblep_tri, polyblep_saw, polyblep_square)
3. Render a grid (2–3 columns) of icon buttons, one per waveform option
4. Highlight the button whose option matches the current value prop
5. On button click: call onChange(clickedOption)
6. Show UI_WaveformDisplay preview for the currently selected waveform below or beside the grid

## 5. Data Structures
* Props: `{ value: string | number, options: string[], onChange: (v: string | number) => void }`
* Waveform icon map: `Record<string, React.ReactNode>` mapping option string to SVG icon component

## 6. Error Handling & Edge Cases
* Value not in options: no button highlighted; still render all buttons normally
* Unknown option string (no icon mapped): render text label in button as fallback

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify clicking a waveform button calls onChange with the correct waveform value
    * ARC_FUNC_02: Verify the currently selected waveform button has a distinct highlight/active style
    * ARC_FUNC_03: Verify all waveform options from ParameterDefinition.options are rendered as buttons
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify a value not in options leaves all buttons unhighlighted without crashing
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify unknown option string renders a text-only fallback button rather than an error

## 8. Notes & Considerations
* DaisySP Oscillator waveform constants: WAVE_SIN=0, WAVE_TRI=1, WAVE_SAW=2, WAVE_RAMP=3, WAVE_SQUARE=4, WAVE_POLYBLEP_TRI=5, WAVE_POLYBLEP_SAW=6, WAVE_POLYBLEP_SQUARE=7
* SVG waveform icons should be simple single-cycle waveform outlines, clear at small size (32x20px)
* This component replaces UI_ParameterSelect for the specific case of waveform ENUM parameters; UI_Inspector should detect waveform ENUMs by the parameter ID or a hint in ParameterDefinition metadata
