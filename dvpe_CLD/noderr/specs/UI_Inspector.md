# Node Specification: UI_Inspector - Parameter Inspector

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Provide the right panel that shows all parameters of the currently selected/inspected block. Dynamically render the appropriate control widget for each parameter based on its type and metadata (slider, dial, ADSR, waveform selector, etc.). Allow users to adjust block parameters in real time.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore, STATE_UIStore, UTIL_BindingMapper, HOOK_ParameterShortcuts, UI_ParameterSlider, UI_ParameterDial, UI_ParameterSelect, UI_ParameterToggle, UI_FrequencyDial, UI_ADSREnvelopeControl, UI_WaveformSelector, UI_WaveformDisplay, UI_MIDINoteSelector
* **Input Data/State:** inspectedBlockId from STATE_UIStore; BlockInstance parameter values from STATE_PatchStore; BlockDefinition (parameters metadata) from SVC_BlockRegistry

## 3. Interfaces
* **Outputs / Results:** Updated parameter values dispatched to STATE_PatchStore.updateBlockParameter(); inspector panel renders in the right sidebar
* **File Location:** src/components/Inspector/Inspector.tsx

## 4. Core Logic & Processing Steps
1. Subscribe to inspectedBlockId from STATE_UIStore
2. When inspectedBlockId is null: show "No block selected" empty state
3. Load BlockInstance from STATE_PatchStore using inspectedBlockId
4. Load BlockDefinition from SVC_BlockRegistry using BlockInstance.definitionId
5. Render block header: display name, category badge with color
6. For each ParameterDefinition in BlockDefinition.parameters:
   a. Resolve current value from BlockInstance.parameters
   b. Determine control widget type: special-case ADSR group → UI_ADSREnvelopeControl; waveform ENUM → UI_WaveformSelector; frequency FLOAT → UI_FrequencyDial; generic FLOAT → UI_ParameterDial or UI_ParameterSlider; ENUM → UI_ParameterSelect; BOOL → UI_ParameterToggle; MIDI_NOTE → UI_MIDINoteSelector
   c. Render chosen widget with current value and onChange callback
7. onChange callback: call STATE_PatchStore.updateBlockParameter(blockId, parameterId, newValue)
8. UTIL_BindingMapper: check if parameter is bound to a CV input; show binding indicator if so
9. HOOK_ParameterShortcuts: register keyboard shortcuts for parameter nudge (arrow keys)

## 5. Data Structures
* `ParameterDefinition`: { id: string, label: string, type: ParameterType, defaultValue: any, min?: number, max?: number, options?: string[], unit?: string, group?: string }
* `ParameterType` enum: FLOAT, INT, BOOL, ENUM, MIDI_NOTE, FREQUENCY
* Parameter value: `Record<string, number | string | boolean>`
* Special group marker: parameters with group='ADSR' are rendered together as UI_ADSREnvelopeControl

## 6. Error Handling & Edge Cases
* No block inspected: render empty state with instruction text "Select a block to inspect parameters"
* Block has no parameters: render block header + "No parameters" message
* inspectedBlockId points to a deleted block: clear inspectedBlockId in STATE_UIStore and show empty state
* Unknown parameter type: render UI_ParameterSlider as fallback with console warning
* Very long parameter list: make inspector panel scrollable; do not truncate parameters

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify parameter changes in inspector update STATE_PatchStore.parameters immediately (no delay)
    * ARC_FUNC_02: Verify correct control widget is rendered for each parameter type (FLOAT→dial, ENUM→select, BOOL→toggle)
    * ARC_FUNC_03: Verify ADSR parameters are grouped and rendered as UI_ADSREnvelopeControl
    * ARC_FUNC_04: Verify frequency parameters use UI_FrequencyDial with logarithmic scale
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify inspecting a deleted block ID clears state and shows empty state instead of crashing
    * ARC_VAL_02: Verify parameter values are clamped to min/max before dispatching to STATE_PatchStore
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify unknown ParameterType renders fallback slider with console.warn rather than throwing
    * ARC_ERR_02: Verify SVC_BlockRegistry lookup failure for inspected block shows error message in inspector panel

## 8. Notes & Considerations
* The inspector is the most-used UI panel; performance matters — avoid re-rendering all parameter widgets on every STATE_PatchStore change; use React.memo and selector subscription per parameter
* UTIL_BindingMapper integration allows parameters to display a CV binding icon when a CV input is routed to them; clicking the icon opens the binding configuration
* HOOK_ParameterShortcuts: when inspector has focus, arrow keys nudge the focused parameter by a defined step amount; Shift+Arrow for coarse adjustments
* Consider grouping parameters by group field in ParameterDefinition for cleaner inspector layout (e.g., "Oscillator", "Envelope", "Filter" sub-sections)
