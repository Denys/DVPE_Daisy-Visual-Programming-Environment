# Node Specification: UI_ParameterToggle - Boolean Toggle

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a checkbox or toggle switch control for BOOL parameters. Render a labeled toggle that reflects the current boolean state and calls updateBlockParameter when the user switches it.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** label, current value (boolean), onChange callback from parent UI_Inspector

## 3. Interfaces
* **Outputs / Results:** onChange(newValue: boolean) invoked on toggle interaction
* **File Location:** src/components/Inspector/ParameterToggle.tsx

## 4. Core Logic & Processing Steps
1. Receive props: label, value (boolean), onChange
2. Render a toggle switch (pill-style) or checkbox with label
3. Visual state: ON → filled/active color (accent); OFF → muted/inactive
4. On click or keyboard (Space/Enter): invert current value, call onChange(!value)

## 5. Data Structures
* Props: `{ label: string, value: boolean, disabled?: boolean, onChange: (v: boolean) => void }`

## 6. Error Handling & Edge Cases
* Non-boolean value passed (e.g., 0/1 number): coerce to boolean before rendering
* Disabled state: render grayed out, ignore click events

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify clicking toggle switches value from false to true and vice versa
    * ARC_FUNC_02: Verify onChange is called with new boolean value, not old value
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify non-boolean prop is coerced to boolean (0 → false, 1 → true)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify disabled toggle does not call onChange on click

## 8. Notes & Considerations
* Use role="switch" and aria-checked for accessibility compliance
* Toggle switch pill style is more intuitive than a bare checkbox for audio-focused parameter UIs
* Consider animating the pill slide on toggle for visual polish
