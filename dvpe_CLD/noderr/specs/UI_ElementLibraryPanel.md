# Node Specification: UI_ElementLibraryPanel - UI Element Type Library

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Left panel in the Block UI Designer listing all available UI element types. Each element type (RotaryKnob, HorizontalSlider, RotaryEncoder, LEDIndicator, NumericDisplay, TextLabel, ToggleSwitch, Dropdown, GroupBox) is displayed with a thumbnail preview and is draggable onto UI_DesignCanvas to instantiate it.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_UILayout
* **Input Data/State:** Static list of registered UIElement type descriptors (type name, thumbnail, default size, default properties)

## 3. Interfaces
* **Outputs / Results:** HTML5 DnD drag events carrying element type identifier as dataTransfer payload; consumed by UI_DesignCanvas to create new UIElement instances
* **File Location:** src/components/BlockDesigner/ElementLibraryPanel.tsx

## 4. Core Logic & Processing Steps
1. Define or import the static registry of available UIElement types with their metadata (type key, display name, thumbnail/icon, default width, default height)
2. Render a scrollable vertical list grouped by category (Controls, Indicators, Layout)
3. For each element type, render a draggable tile with thumbnail and label
4. On dragstart: set dataTransfer with element type key (e.g., `application/dvpe-ui-element` + type string)
5. Visual feedback: highlight tile during drag; show drag ghost image of the element thumbnail

## 5. Data Structures
* `UIElementDescriptor` — type: string, displayName: string, icon: ReactNode | string, defaultSize: {width, height}, defaultProperties: Record<string, unknown>
* Available types: `RotaryKnob`, `HorizontalSlider`, `RotaryEncoder`, `LEDIndicator`, `NumericDisplay`, `TextLabel`, `ToggleSwitch`, `Dropdown`, `GroupBox`

## 6. Error Handling & Edge Cases
* Panel is read-only; no user-editable state; no error conditions beyond rendering failures
* If the element type registry is empty or fails to load, render an error message in the panel

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify all 9 element types are rendered in the panel
    * ARC_FUNC_02: Verify dragging an element tile sets the correct type key in the dataTransfer object
    * ARC_FUNC_03: Verify dropping a tile onto UI_DesignCanvas creates a UIElement of the expected type
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify the panel is not interactive (no click-to-select behavior outside of drag initiation)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify graceful rendering if any element type descriptor is missing its icon (fallback to generic icon)

## 8. Notes & Considerations
* Thumbnails should be small SVG previews or CSS-rendered mini-components to accurately represent the element appearance
* Grouping by category (Controls, Indicators, Layout) improves discoverability as the element library grows
* Future: allow custom element types registered by plugins
