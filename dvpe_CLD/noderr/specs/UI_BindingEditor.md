# Node Specification: UI_BindingEditor - Parameter Binding Editor

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** UI for binding a designer element to a specific block parameter. The user selects which ParameterDefinition (from the block's parameter list) the selected UI element should control. UTIL_BindingMapper is used to resolve and validate binding paths. The resulting binding is stored on the UIElement and used by the Inspector to connect the control to live block state.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** UTIL_BindingMapper, STATE_BlockDesignerStore, TYPES_BlockDefinition
* **Input Data/State:** Selected UIElement from STATE_BlockDesignerStore, available ParameterDefinition list from the target CustomBlockDefinition, existing binding on the selected element (if any)

## 3. Interfaces
* **Outputs / Results:** Updates UIElement.binding in STATE_BlockDesignerStore with the resolved binding path string (e.g., "parameterId"); enables the Inspector to read/write the correct parameter when this UI element is interacted with
* **File Location:** src/components/BlockDesigner/BindingEditor.tsx

## 4. Core Logic & Processing Steps
1. Subscribe to STATE_BlockDesignerStore.selectedElementId and retrieve the selected UIElement
2. Fetch the target block's ParameterDefinition list from STATE_BlockDesignerStore or STATE_CustomBlockStore
3. If no element selected, render empty state "Select an element to configure its binding"
4. Render a dropdown or searchable list of available parameters from the block definition
5. If the selected element already has a binding, pre-select the matching parameter in the dropdown
6. On parameter selection: call UTIL_BindingMapper.resolve(blockId, parameterId) to validate the binding path
7. If resolution succeeds: store the binding path on UIElement.binding in STATE_BlockDesignerStore
8. If resolution fails: show an inline error message describing why the binding is invalid
9. Provide a "Clear Binding" button to remove an existing binding from the element

## 5. Data Structures
* `UIElement.binding` — string path: "parameterId" or "portId" identifying the target
* `ParameterDefinition` — id, name, type, min, max, default (from TYPES_BlockDefinition)
* `BindingValidationResult` — valid: boolean, resolvedPath: string, error?: string

## 6. Error Handling & Edge Cases
* If the block has no parameters defined, show a message "This block has no parameters to bind"
* If a previously saved binding no longer matches any current parameter (e.g., parameter was renamed), highlight the binding as broken and prompt re-selection
* Binding a ToggleSwitch or LEDIndicator to a float parameter should show a type mismatch warning (but not block the binding)

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify selecting a parameter from the dropdown and confirming stores the binding path on UIElement.binding in STATE_BlockDesignerStore
    * ARC_FUNC_02: Verify that a bound knob element in the Inspector reflects live changes to the bound parameter when the block is active
    * ARC_FUNC_03: Verify UTIL_BindingMapper is called to validate the binding before it is committed
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify broken binding (orphaned reference) is visually flagged with an error state
    * ARC_VAL_02: Verify type mismatch between UI element type and parameter type shows a warning
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify UTIL_BindingMapper resolution failure shows an inline error without crashing the editor

## 8. Notes & Considerations
* Binding to ports (rather than parameters) is handled by the sibling UI_PortBindingEditor component
* Future enhancement: visual connector lines from UI elements to parameter slots in a split-view
* The binding path format must be consistent with what UI_Inspector expects when rendering live controls
