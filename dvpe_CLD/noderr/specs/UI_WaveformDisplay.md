# Node Specification: UI_WaveformDisplay - Waveform Visualization

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Render an SVG preview of the visual shape of the currently selected oscillator waveform. A purely display component with no user interaction; used alongside UI_WaveformSelector or in the block node to indicate the active waveform at a glance.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** None (pure display component)
* **Input Data/State:** waveform type identifier (string or number) passed as prop; no state subscription

## 3. Interfaces
* **Outputs / Results:** SVG element rendering the waveform shape; no callbacks or state mutations
* **File Location:** src/components/Inspector/WaveformDisplay.tsx

## 4. Core Logic & Processing Steps
1. Receive prop: waveform (string | number), width, height, color
2. Look up SVG path data for the given waveform type from a static waveform path map
3. Render <svg> element with the waveform path scaled to the specified width and height
4. Apply color prop to stroke; transparent or no fill

## 5. Data Structures
* Props: `{ waveform: string | number, width?: number, height?: number, color?: string }`
* Waveform path map: `Record<string | number, string>` mapping waveform identifiers to SVG d-attribute path strings (precomputed single-cycle waveforms)

## 6. Error Handling & Edge Cases
* Unknown waveform type: render a flat line (no waveform) as fallback

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify sine waveform prop renders a smooth S-curve SVG path
    * ARC_FUNC_02: Verify square waveform prop renders a rectangular waveform path
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify unknown waveform identifier renders a fallback flat line without errors
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify null/undefined waveform prop renders fallback without throwing

## 8. Notes & Considerations
* Waveform SVG paths should be precomputed and stored as constants (not computed at render time) for performance
* Single-cycle waveform paths: normalized to viewBox "0 0 100 40" with signal ranging between y=5 and y=35
* This component is intentionally stateless and has no dependencies outside of React; it can be used in any context (inspector, library tooltip, block node header, etc.)
