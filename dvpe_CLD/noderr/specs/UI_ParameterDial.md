# Node Specification: UI_ParameterDial - Rotary Knob Control

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a rotary knob (dial) control for float parameters. Allow users to drag up to increase and drag down to decrease the value. Display the current value in the center of the dial for immediate feedback.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** label, value, min, max, scale, unit, onChange callback from parent UI_Inspector

## 3. Interfaces
* **Outputs / Results:** onChange(newValue: number) invoked on pointer drag; current value rendered inside dial SVG
* **File Location:** src/components/Inspector/ParameterDial.tsx

## 4. Core Logic & Processing Steps
1. Receive props: label, value, min, max, scale, unit, onChange
2. Compute dial rotation angle from value: map [min, max] to [−135°, +135°] arc
3. Render SVG dial: background arc track, foreground arc indicator from start to current position, center value text
4. On pointerdown: capture pointer, record initial Y and value
5. On pointermove (while captured): compute deltaY from initial position; scale deltaY to parameter range (sensitivity tunable, e.g., 1px = 0.5% of range); compute new value; for logarithmic scale apply log transformation; call onChange(newValue)
6. On pointerup: release pointer capture
7. Double-click: open text input overlay for direct value entry
8. Render label below dial

## 5. Data Structures
* Props: `{ label: string, value: number, min: number, max: number, scale?: 'linear'|'log', unit?: string, sensitivity?: number, onChange: (v: number) => void }`
* Internal state: `{ isDragging: boolean, startY: number, startValue: number }`

## 6. Error Handling & Edge Cases
* min === max: render static dial at center with no dragging
* NaN value: render at min position
* Very small parameter range (max - min < 0.001): increase sensitivity or switch to text input only

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify dragging up (negative deltaY) increases parameter value
    * ARC_FUNC_02: Verify dragging down (positive deltaY) decreases parameter value
    * ARC_FUNC_03: Verify dial arc visually reflects the current value within its rotation range
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify value clamped to [min, max] after drag computation before calling onChange
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify pointer capture is released on pointerup even if onChange throws

## 8. Notes & Considerations
* Use setPointerCapture / releasePointerCapture for reliable drag even when pointer exits the dial element
* Modifier key support: holding Shift during drag reduces sensitivity for fine adjustments; holding Ctrl for coarse adjustments
* SVG arc computation: use polar to cartesian conversion for arc endpoints; standard range −135° to +135° (270° total sweep) is the typical physical knob feel
* The center value text should use monospaced or tabular numerals to prevent layout shift as value changes
