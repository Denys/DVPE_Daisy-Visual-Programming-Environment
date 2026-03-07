# Node Specification: UI_FrequencyDial - Frequency Knob

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a specialized rotary knob for frequency parameters. Display the value in Hz (or kHz for large values) and apply a logarithmic scale appropriate for musical frequency ranges (20Hz–20kHz) so that equal angular movement corresponds to equal musical intervals rather than equal linear increments.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** label, current frequency value (Hz), min/max range, onChange callback from parent UI_Inspector

## 3. Interfaces
* **Outputs / Results:** onChange(newValue: number) in Hz invoked on pointer drag
* **File Location:** src/components/Inspector/FrequencyDial.tsx

## 4. Core Logic & Processing Steps
1. Receive props: label, value (Hz), min (default 20), max (default 20000), onChange
2. Apply logarithmic mapping: sliderPos = log(value/min) / log(max/min); maps [min, max] → [0, 1]
3. Compute dial rotation angle from sliderPos in [0, 1] → [−135°, +135°]
4. On pointer drag: compute new sliderPos from drag delta; invert log mapping: newValue = min * pow(max/min, sliderPos); clamp to [min, max]; call onChange(newValue)
5. Format display value: if value < 1000 show "440 Hz"; if value >= 1000 show "4.40 kHz" (1 decimal place)
6. Render SVG arc dial (same structure as UI_ParameterDial) with Hz/kHz value in center
7. Render label below dial

## 5. Data Structures
* Props: `{ label: string, value: number, min?: number, max?: number, onChange: (v: number) => void }`
* Default min: 20 Hz, default max: 20000 Hz

## 6. Error Handling & Edge Cases
* value=0 or value<min: clamp to min before log computation to avoid log(0)
* min=0: substitute epsilon (e.g., 0.1 Hz) to prevent math errors
* Negative value: clamp to min

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify logarithmic scaling places the center of the dial arc at approximately 632 Hz (geometric mean of 20–20000 Hz), not at 10010 Hz (linear midpoint)
    * ARC_FUNC_02: Verify value displays as "440 Hz" for 440 and "4.40 kHz" for 4400
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify value=0 is clamped to min without NaN or Infinity in display
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify log computation with min=0 uses epsilon fallback rather than producing NaN

## 8. Notes & Considerations
* Logarithmic scale is musically essential for frequency: each octave doubles frequency, so a linear knob would be almost entirely unusable at the low end of the range
* 440 Hz (concert A) as a musical reference: the geometric mean of 20–20000 Hz is approximately 632 Hz; users familiar with synthesizers will expect the "noon" position of the dial to be near the middle of the audible vocal/instrument range
* This component wraps UI_ParameterDial logic with logarithmic transformation; consider extending UI_ParameterDial with scale='log' prop instead of duplicating code
