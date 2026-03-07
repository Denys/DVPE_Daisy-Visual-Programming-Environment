# Node Specification: UI_ParameterSlider - Float Slider Control

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a horizontal slider control for float parameters. Support both linear and logarithmic scaling. Display the current numeric value alongside the slider track and call updateBlockParameter on every user interaction.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** parameterId, current value, min, max, scale ('linear'|'log'), unit string, label; onChange callback from parent UI_Inspector

## 3. Interfaces
* **Outputs / Results:** onChange(newValue: number) callback invoked on slider input; parameter value displayed in formatted text
* **File Location:** src/components/Inspector/ParameterSlider.tsx

## 4. Core Logic & Processing Steps
1. Receive props: label, value, min, max, scale, unit, onChange
2. For logarithmic scale: map value to slider position using log transformation; convert slider position back to value on change
3. Render labeled track with filled portion indicating current value
4. Render value display: format number to appropriate precision based on range magnitude (e.g., 2 decimal places for 0–1, integer for 0–100)
5. Append unit string to display (e.g., "Hz", "ms", "%")
6. On slider input event: convert slider position back to parameter value, call onChange(value)
7. Support double-click on value display to enter raw numeric input via text field
8. On text field blur/Enter: parse value, clamp to [min, max], call onChange

## 5. Data Structures
* Props: `{ label: string, value: number, min: number, max: number, scale?: 'linear'|'log', unit?: string, step?: number, onChange: (v: number) => void }`

## 6. Error Handling & Edge Cases
* min === max: render disabled slider at midpoint
* Logarithmic scale with min=0: guard against log(0); use min=0.001 or similar epsilon
* NaN value from parent: clamp to min as fallback

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify sliding to maximum position sets value to max (within floating point precision)
    * ARC_FUNC_02: Verify logarithmic scale slider center position maps to geometric mean of min and max, not arithmetic mean
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify manually typed value outside [min, max] range is clamped before calling onChange
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify NaN or undefined value prop renders the slider at min without crashing

## 8. Notes & Considerations
* Prefer native HTML input[type=range] for accessibility and keyboard navigation (arrow keys, Home, End)
* Logarithmic scale is particularly important for frequency and time parameters where linear feel is musically unnatural
* Consider debouncing onChange for performance if slider is connected to expensive computations downstream
