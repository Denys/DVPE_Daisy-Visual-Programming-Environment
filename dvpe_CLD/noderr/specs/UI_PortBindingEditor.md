# Node Specification: UI_PortBindingEditor - Port Binding Editor

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** UI for binding a designer element to a block port (input or output). Used when a UI element should visually represent or label a port connection point on the custom block. Complements UI_BindingEditor which handles parameter bindings.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_BlockDesignerStore, TYPES_CustomBlock
* **Input Data/State:** Selected UIElement from STATE_BlockDesignerStore, available PortDefinition list (exposed ports) from the target CustomBlockDefinition, existing port binding on the element (if any)

## 3. Interfaces
* **Outputs / Results:** Updates UIElement.portBinding in STATE_BlockDesignerStore with the resolved port ID; allows Inspector or canvas to render port-linked UI elements correctly
* **File Location:** src/components/BlockDesigner/PortBindingEditor.tsx

## 4. Core Logic & Processing Steps
1. Subscribe to STATE_BlockDesignerStore.selectedElementId and retrieve the selected UIElement
2. Fetch the CustomBlockDefinition's exposedPorts list from STATE_BlockDesignerStore or STATE_CustomBlockStore
3. If no element is selected, render empty state "Select an element to configure its port binding"
4. Render a dropdown or list of available ports, grouped by direction (Inputs / Outputs)
5. Each port entry shows: port name, signal type (AUDIO / CV / TRIGGER) with color coding
6. If the element already has a portBinding, pre-select the matching port
7. On port selection: validate compatibility between element type and port signal type (e.g., LEDIndicator is appropriate for TRIGGER ports)
8. Commit port ID to UIElement.portBinding in STATE_BlockDesignerStore
9. Provide a "Clear Port Binding" button to remove an existing binding

## 5. Data Structures
* `UIElement.portBinding` — string port ID referencing an entry in CustomBlockDefinition.exposedPorts
* `PortDefinition` — id, name, direction (INPUT/OUTPUT), signalType (AUDIO/CV/TRIGGER)
* `ExposedPort` — wraps PortDefinition with optional display label override

## 6. Error Handling & Edge Cases
* If the block exposes no ports, show "No ports available for binding"
* Incompatible element-to-port bindings (e.g., RotaryKnob bound to an OUTPUT port) should show a warning; output ports are read-only and cannot be controlled via knobs
* If a previously saved portBinding no longer exists in the block's exposedPorts list, flag as broken

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify selecting a port from the dropdown stores its ID in UIElement.portBinding in STATE_BlockDesignerStore
    * ARC_FUNC_02: Verify ports are grouped and labeled by direction (Inputs / Outputs)
    * ARC_FUNC_03: Verify signal type is displayed with correct color coding for each port entry
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify binding a RotaryKnob to an OUTPUT port shows a type-mismatch warning
    * ARC_VAL_02: Verify broken portBinding (orphaned port ID) is visually flagged
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify empty port list renders an informative message rather than an empty dropdown

## 8. Notes & Considerations
* Port bindings are secondary to parameter bindings; most UI elements will use UI_BindingEditor instead
* Signal type color coding should match the color system used in UI_ConnectionEdge (AUDIO=cyan, CV=yellow, TRIGGER=orange)
* Consider combining UI_PortBindingEditor and UI_BindingEditor into a unified tabbed binding panel in a future refactor
