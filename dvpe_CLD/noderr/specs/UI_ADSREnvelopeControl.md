# Node Specification: UI_ADSREnvelopeControl - ADSR Envelope Editor

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Provide a visual interactive ADSR envelope editor that shows the envelope shape as a draggable SVG graphic. Attack, Decay, Sustain, and Release segments each have a draggable handle that the user moves to adjust the corresponding parameter. All four ADSR parameters update simultaneously as the envelope shape is manipulated.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** attack, decay, sustain, release values from parent UI_Inspector; onChange callbacks for each of the four ADSR parameters

## 3. Interfaces
* **Outputs / Results:** onChangeAttack(v), onChangeDecay(v), onChangeSustain(v), onChangeRelease(v) callbacks invoked when respective handles are dragged; SVG envelope shape rendered
* **File Location:** src/components/Inspector/ADSREnvelopeControl.tsx

## 4. Core Logic & Processing Steps
1. Receive props: attack (s), decay (s), sustain (0–1), release (s), plus four onChange callbacks (or single onChangeAll callback with { attack, decay, sustain, release })
2. Map parameter values to SVG canvas coordinates:
   - Time parameters (A, D, R): map using logarithmic or square-root scale to display coordinates (short times expand at low end)
   - Sustain: maps linearly to vertical height (inverted: 1.0 = top, 0.0 = bottom)
3. Compute 5 SVG path points: origin (0,0) → attack peak → decay end → sustain hold (horizontal) → release end
4. Render SVG <path> connecting the 5 points
5. Render a draggable circle handle at each transition point: AttackHandle (top of peak), DecayHandle (end of decay), SustainHandle (sustain level on the hold line), ReleaseHandle (end of release)
6. On handle pointerdown + pointermove: update corresponding parameter by inversely mapping new coordinate back to parameter value; call onChange
7. On release: release pointer capture

## 5. Data Structures
* Props: `{ attack: number, decay: number, sustain: number, release: number, onChangeAttack: (v: number) => void, onChangeDecay: (v: number) => void, onChangeSustain: (v: number) => void, onChangeRelease: (v: number) => void }`
* SVG coordinate system: width=200px, height=100px; time axis is X, amplitude axis is Y (inverted)
* Handle positions: `{ x: number, y: number }` computed from parameter values

## 6. Error Handling & Edge Cases
* attack=0: handle snaps to origin; ensure minimum display distance to remain draggable
* Very large attack+decay (e.g., both 10s): compress time scale so all segments remain visible
* Sustain=0 and sustain=1: clamp handle to SVG edges; ensure no visual overflow
* Parameter values outside expected ranges: clamp before coordinate mapping

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify dragging the attack handle to the right increases the Attack parameter value
    * ARC_FUNC_02: Verify dragging the sustain handle up increases the Sustain parameter value
    * ARC_FUNC_03: Verify all four ADSR parameters update correctly when their respective handles are dragged
    * ARC_FUNC_04: Verify the envelope SVG path updates in real time as handles are dragged (no lag)
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify handles cannot be dragged outside the SVG canvas bounds
    * ARC_VAL_02: Verify parameter values emitted by onChange are within their valid ranges
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify pointer capture is released on pointerup even if an onChange callback throws

## 8. Notes & Considerations
* This is the most visually complex inspector widget; SVG path updates on every pointermove must be efficient to avoid jank
* The time axis scale should use a square-root or logarithmic mapping so that typical musical envelope times (1ms to 1s) are well-distributed across the display width
* Consider adding subtle shading fill under the envelope curve to improve readability
* The handles should be large enough (minimum 10px radius) to be draggable on touch screens
* ADSR parameters may be spread across multiple ParameterDefinition entries with group='ADSR'; UI_Inspector groups them and passes all four to this component
