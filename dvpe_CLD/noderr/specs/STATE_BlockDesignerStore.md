# Node Specification: STATE_BlockDesignerStore - Block Designer State

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Zustand store managing all state for the Block UI Designer tool — the visual editor that lets users create custom block faces. Tracks the list of placed UI elements on the design canvas, their positions, sizes, and properties, their bindings to block parameters or ports, and the currently selected element.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_UILayout
* **Input Data/State:** User interactions in the Block Designer modal (drag-place elements, resize, select, configure properties, set bindings); `loadLayout` called when editing an existing custom block

## 3. Interfaces
* **Outputs / Results:** State consumed by `UI_BlockUIDesigner` (element list rendering), `UI_DesignCanvas` (drag/drop canvas), `UI_PropertyEditor` (element properties panel), `UI_BindingEditor` (parameter/port binding UI); serialized `UILayout` output to `CustomBlockDefinition.uiLayout`
* **File Location:** `src/stores/blockDesignerStore.ts`

## 4. Core Logic & Processing Steps
1. Store `elements: UIElement[]` — all UI elements placed on the design canvas (knobs, sliders, labels, LCDs, buttons, etc.)
2. Store `selectedElementId: string | null` — currently selected element (for property editing)
3. Store `designTarget: CustomBlockDefinition | null` — the custom block being designed (provides available parameters/ports for binding)
4. `addElement(type: UIElementType, position: Position)`:
   - Create new `UIElement` with generated ID, specified type, given position, and default size/properties for that type
   - Push to `elements` array; auto-select the new element
5. `updateElement(id: string, updates: Partial<UIElement>)`:
   - Merge updates into the specified element (position, size, style properties)
   - Used by drag, resize, and property editor interactions
6. `removeElement(id: string)`:
   - Remove element from array; clear `selectedElementId` if it was the removed element
7. `selectElement(id: string | null)`:
   - Set `selectedElementId`; null deselects
8. `setBinding(elementId: string, binding: Binding | null)`:
   - Set or clear the parameter/port binding for an element
   - Validate that `binding.targetId` references an existing parameter or port on `designTarget`
9. `saveLayout()`:
   - Serialize current `elements` array to `UILayout` object and return it (for embedding in `CustomBlockDefinition`)
10. `loadLayout(layout: UILayout, target: CustomBlockDefinition)`:
    - Restore `elements` from serialized layout; set `designTarget`
    - Handle unknown element types gracefully (warn, skip)
11. `clearDesigner()`:
    - Reset all state for a fresh design session

## 5. Data Structures
* `UIElement { id: string, type: UIElementType, position: { x: number, y: number }, size: { width: number, height: number }, properties: Record<string, unknown>, binding: Binding | null }`
* `Binding { type: "parameter" | "port", targetId: string }` — links element to a specific parameter ID or port ID on the block
* `UIElementType` — enum of `"knob" | "slider" | "label" | "lcd" | "button" | "led" | "meter"`
* `UILayout { elements: UIElement[], canvasSize: { width: number, height: number } }` — serializable layout

## 6. Error Handling & Edge Cases
* **Overlapping elements:** Allowed (designer is free-form); visually indicate overlap with a warning outline but do not prevent it
* **Binding to non-existent parameter/port:** `setBinding` validates against `designTarget`; reject with validation error if `targetId` not found in the target's parameters or ports
* **`loadLayout` with unknown element types:** Skip unrecognized types with a console warning; do not fail the entire load
* **`updateElement` with invalid position (e.g., negative coords or outside canvas bounds):** Clamp to canvas bounds

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: `addElement("knob", { x: 10, y: 10 })` creates a `UIElement` of type `"knob"` with correct default size and auto-selects it
    * ARC_FUNC_02: `setBinding(elementId, { type: "parameter", targetId: "frequency" })` correctly stores the binding on the specified element and it is included in `saveLayout()` output
* **Input Validation Criteria:**
    * (Covered by error handling criteria)
* **Error Handling Criteria:**
    * ARC_ERR_01: `loadLayout()` with an element of an unknown type logs a warning and skips that element rather than throwing an error or corrupting the rest of the layout

## 8. Notes & Considerations
* TECH DEBT: Complex state with nested objects — needs comprehensive unit test coverage; all CRUD operations and binding logic should be covered
* The designer is a modal tool; `clearDesigner()` should be called when the modal closes to avoid stale state on next open
* `saveLayout()` is called by `SVC_CustomBlockManager` when the user commits the design; the result is embedded in `CustomBlockDefinition.uiLayout`
* Future: multi-select for elements, copy/paste within designer
