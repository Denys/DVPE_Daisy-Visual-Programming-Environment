# Node Specification: UI_ParameterSelect - Enum Dropdown

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a dropdown select control for ENUM parameters. Display all valid options from the ParameterDefinition.options array and call updateBlockParameter when the user selects a new option.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** label, current value (string), options array, onChange callback from parent UI_Inspector

## 3. Interfaces
* **Outputs / Results:** onChange(newValue: string) invoked on selection change
* **File Location:** src/components/Inspector/ParameterSelect.tsx

## 4. Core Logic & Processing Steps
1. Receive props: label, value, options (string[]), onChange
2. Render labeled dropdown using native <select> or custom styled dropdown
3. Populate <option> elements from options array
4. Set selected option to match current value prop
5. On change event: call onChange(selectedValue)

## 5. Data Structures
* Props: `{ label: string, value: string, options: string[], onChange: (v: string) => void }`

## 6. Error Handling & Edge Cases
* Current value not in options array: show value as selected with a warning indicator; do not crash
* Empty options array: render disabled dropdown with placeholder "No options"

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify selecting an option calls onChange with the correct string value
    * ARC_FUNC_02: Verify all entries from the options array appear in the dropdown
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify current value not in options renders dropdown with visible warning rather than crashing
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify empty options array renders disabled dropdown without errors

## 8. Notes & Considerations
* For waveform ENUM parameters, prefer UI_WaveformSelector instead, which shows visual waveform icons
* Native <select> is accessible by default; custom styled dropdowns require ARIA attributes for accessibility
* Options may include human-readable display labels mapped from internal string values; consider supporting { value: string, label: string } tuple format in props
