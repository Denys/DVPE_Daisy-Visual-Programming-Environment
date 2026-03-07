# Node Specification: UI_PropertyEditor - Element Property Editor

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Right panel in the Block UI Designer showing editable properties of the currently selected UI element. Properties include: position (x, y), size (width, height), label text, color overrides, value range (min, max, default). All edits are committed immediately to STATE_BlockDesignerStore, keeping the canvas in sync.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_BlockDesignerStore
* **Input Data/State:** Selected UIElement from STATE_BlockDesignerStore (selectedElementId + elements map); element type to determine which properties are applicable

## 3. Interfaces
* **Outputs / Results:** Dispatches property update actions to STATE_BlockDesignerStore; changes are reflected immediately on UI_DesignCanvas
* **File Location:** src/components/BlockDesigner/PropertyEditor.tsx

## 4. Core Logic & Processing Steps
1. Subscribe to STATE_BlockDesignerStore.selectedElementId and elements map
2. If no element selected, render empty state message "Select an element to edit its properties"
3. Resolve selected UIElement from elements map using selectedElementId
4. Render a form with field groups based on element type:
   - **Position**: x, y numeric inputs (px)
   - **Size**: width, height numeric inputs (px) with minimum validation
   - **Appearance**: label text input, color picker (if element supports color)
   - **Value Range**: min, max, defaultValue numeric inputs (for knobs, sliders, encoders)
   - **Display Options**: type-specific toggles (e.g., show label, show value)
5. On any field change: dispatch update to STATE_BlockDesignerStore for the specific element property
6. Position and size changes should mirror interaction feedback from UI_DesignCanvas (two-way binding)

## 5. Data Structures
* `UIElement.properties` — type-specific property bag; schema varies per element type
* Common property keys: `label`, `min`, `max`, `defaultValue`, `color`, `showLabel`, `showValue`

## 6. Error Handling & Edge Cases
* Numeric inputs validate that min < max for range properties
* Width and height inputs enforce minimum values matching UI_DesignCanvas minimums (16px)
* Non-applicable properties for a given element type are hidden (not shown as disabled)
* If selectedElementId points to an element that no longer exists in the store (race condition), show empty state

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify changing the label text field updates the element's label property in STATE_BlockDesignerStore and the label re-renders on UI_DesignCanvas
    * ARC_FUNC_02: Verify changing the x/y position fields moves the element on the canvas
    * ARC_FUNC_03: Verify min/max value fields are only shown for element types that support value ranges (RotaryKnob, HorizontalSlider, RotaryEncoder)
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify min value cannot be set greater than or equal to max value
    * ARC_VAL_02: Verify width/height inputs reject values below the minimum size threshold
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify empty state is shown when no element is selected rather than crashing on null access

## 8. Notes & Considerations
* Two-way sync with UI_DesignCanvas: dragging on the canvas should update PropertyEditor position fields and vice versa
* Consider debouncing text input updates slightly to avoid excessive STATE_BlockDesignerStore dispatches during typing
